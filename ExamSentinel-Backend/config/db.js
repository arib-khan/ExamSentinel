/**
 * Supabase (PostgreSQL) drop-in replacement for the old mysql2 pool.
 *
 * The rest of the app still calls pool.query("... ?", [...]) and expects
 * mysql2-style results ([rows] / [{ insertId, affectedRows }]). This file
 * translates those calls to PostgreSQL so no model/route has to change.
 *
 * Needs in .env:   DATABASE_URL=postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres
 */
const { Pool, types } = require("pg");
require("dotenv").config();

// bigint (COUNT(*), BIGINT columns) -> JS number, like mysql2
types.setTypeParser(20, (v) => Number(v));

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env (Supabase connection string)");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
pool.on("error", (e) => console.error("PG pool error:", e.message));

// lower-case -> original-case column names (written by the migration script)
let columnCase = {};
try {
  columnCase = require("./columnCase.json");
} catch (_) {}

const q = (name) => '"' + String(name).toLowerCase().replace(/"/g, '""') + '"';

/* ---------- value helpers ---------- */
function normalizeValue(v) {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof Date || Buffer.isBuffer(v) || v === null) return v;
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

function escape(v) {
  v = normalizeValue(v);
  if (v === null) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Buffer.isBuffer(v)) return `'\\x${v.toString("hex")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

/* ---------- primary key / conflict target lookup ---------- */
const keyCache = new Map();
async function getKeyCols(table) {
  if (keyCache.has(table)) return keyCache.get(table);
  let cols = [];
  try {
    const r = await pool.query(
      `SELECT a.attname FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       WHERE i.indexrelid = (
         SELECT indexrelid FROM pg_index
         WHERE indrelid = $1::regclass AND indisunique
         ORDER BY indisprimary DESC, indexrelid LIMIT 1)
       ORDER BY array_position(i.indkey::int2[], a.attnum)`,
      [q(table)]
    );
    cols = r.rows.map((x) => x.attname);
  } catch (_) {}
  keyCache.set(table, cols);
  return cols;
}

/* ---------- SQL rewriting: MySQL -> PostgreSQL ---------- */
function rewriteKeywords(sql) {
  // only touch text outside '...' string literals
  return sql
    .split(/('(?:[^'\\]|\\.|'')*')/)
    .map((seg, i) => {
      if (i % 2 === 1) return seg;
      return seg
        .replace(/`([^`]*)`/g, (_, n) => q(n))
        .replace(/\b(from|join|into|update)\s+user\b/gi, '$1 "user"')
        .replace(/\buser\.(?=\w)/gi, '"user".')
        .replace(/\bIFNULL\s*\(/gi, "COALESCE(")
        .replace(/\bCURDATE\s*\(\s*\)/gi, "CURRENT_DATE")
        .replace(/\bTRUE\b/gi, "1")
        .replace(/\bFALSE\b/gi, "0")
        .replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)/gi, "LIMIT $2 OFFSET $1");
    })
    .join("");
}

async function prepare(sqlIn, paramsIn) {
  let params = paramsIn === undefined ? [] : Array.isArray(paramsIn) ? paramsIn : [paramsIn];
  let sql = sqlIn;

  let ignore = false;
  if (/^\s*insert\s+ignore\s+into/i.test(sql)) {
    ignore = true;
    sql = sql.replace(/^\s*insert\s+ignore\s+into/i, "INSERT INTO");
  }
  sql = rewriteKeywords(sql);

  const isInsert = /^\s*insert\b/i.test(sql);
  const tm = isInsert && sql.match(/^\s*insert\s+into\s+("?)([\w.]+)\1/i);
  const table = tm ? tm[2].toLowerCase() : null;
  const keyCols = table ? await getKeyCols(table) : [];

  const values = [];
  let out = "";
  let pi = 0;
  let bulk = false;
  let hasSetInsert = false;
  let insertCols = [];

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (ch === "'" || ch === '"') {
      // copy quoted text as-is
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "\\" && ch === "'") { j += 2; continue; }
        if (sql[j] === ch) { if (sql[j + 1] === ch) { j += 2; continue; } break; }
        j++;
      }
      out += sql.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      const j = sql.indexOf("\n", i);
      const end = j === -1 ? sql.length : j;
      out += sql.slice(i, end);
      i = end - 1;
      continue;
    }
    if (ch === "/" && sql[i + 1] === "*") {
      const j = sql.indexOf("*/", i + 2);
      const end = j === -1 ? sql.length : j + 2;
      out += sql.slice(i, end);
      i = end - 1;
      continue;
    }
    if (ch !== "?") { out += ch; continue; }

    const tail = out.slice(-40);

    if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\s*$/i.test(tail)) {
      const obj = params[pi++] || {};
      if (!keyCols.length) throw new Error(`ON DUPLICATE KEY: no primary/unique key found on "${table}"`);
      const sets = Object.keys(obj).filter((k) => !keyCols.includes(k.toLowerCase()))
        .map((k) => `${q(k)} = EXCLUDED.${q(k)}`);
      out = out.replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\s*$/i, "");
      out += sets.length
        ? `ON CONFLICT (${keyCols.map(q).join(", ")}) DO UPDATE SET ${sets.join(", ")}`
        : `ON CONFLICT (${keyCols.map(q).join(", ")}) DO NOTHING`;
    } else if (/\bSET\s*$/i.test(tail)) {
      const obj = params[pi++] || {};
      const keys = Object.keys(obj);
      if (isInsert) {
        hasSetInsert = true;
        insertCols = keys;
        out = out.replace(/\bSET\s*$/i, "");
        const ph = keys.map((k) => { values.push(normalizeValue(obj[k])); return "$" + values.length; });
        out += `(${keys.map(q).join(", ")}) VALUES (${ph.join(", ")})`;
      } else {
        out += keys.map((k) => { values.push(normalizeValue(obj[k])); return `${q(k)} = $${values.length}`; }).join(", ");
      }
    } else if (/\bVALUES\s*$/i.test(tail) && Array.isArray(params[pi])) {
      bulk = true;
      const rows = params[pi++];
      out += rows.map((row) =>
        "(" + row.map((v) => { values.push(normalizeValue(v)); return "$" + values.length; }).join(", ") + ")"
      ).join(", ");
    } else {
      const v = params[pi++];
      if (Array.isArray(v)) {           // mysql2 expands arrays: IN (?) -> IN (1,2,3)
        if (!v.length) out += "NULL";
        else out += v.map((x) => { values.push(normalizeValue(x)); return "$" + values.length; }).join(", ");
      } else {
        values.push(normalizeValue(v));
        out += "$" + values.length;
      }
    }
  }

  if (ignore) out = out.replace(/;?\s*$/, "") + " ON CONFLICT DO NOTHING";

  // ask Postgres for the generated key so we can return insertId
  let returningKey = null;
  if (isInsert && !bulk && keyCols.length && !/\bRETURNING\b/i.test(out)) {
    returningKey = keyCols[0];
    out = out.replace(/;?\s*$/, "") + ` RETURNING ${q(returningKey)}`;
  }

  // aliases written with capitals (AS userName) -> give them back their case
  const aliasCase = {};
  for (const m of sqlIn.matchAll(/\bAS\s+`?([A-Za-z_]\w*)`?/gi)) {
    if (m[1] !== m[1].toLowerCase()) aliasCase[m[1].toLowerCase()] = m[1];
  }

  return { text: out, values, returningKey, aliasCase };
}

function remapRows(rows, aliasCase) {
  const map = { ...columnCase, ...aliasCase };
  if (!Object.keys(map).length || !rows.length) return rows;
  return rows.map((r) => {
    const o = {};
    for (const k of Object.keys(r)) o[map[k] || k] = r[k];
    return o;
  });
}

function mapError(err, sql) {
  if (err && typeof err.code === "string" && /^[0-9A-Z]{5}$/.test(err.code)) {
    err.pgCode = err.code;
    const isWrite = /^\s*(delete|update)/i.test(sql);
    const m = {
      "23505": "ER_DUP_ENTRY",
      "23503": isWrite ? "ER_ROW_IS_REFERENCED_2" : "ER_NO_REFERENCED_ROW_2",
      "42P01": "ER_NO_SUCH_TABLE",
      "42703": "ER_BAD_FIELD_ERROR",
      "22P02": "ER_TRUNCATED_WRONG_VALUE",
    };
    if (m[err.code]) err.code = m[err.code];
    err.sqlMessage = err.message;
  }
  return err;
}

const MAX_PARAMS = 60000;

async function run(executor, sql, params) {
  // very large bulk inserts: split into chunks (Postgres allows 65535 params)
  if (/\bVALUES\s*\?/i.test(sql) && Array.isArray(params) && params.length === 1 &&
      Array.isArray(params[0]) && params[0].length && Array.isArray(params[0][0])) {
    const rows = params[0];
    const per = Math.max(1, Math.floor(MAX_PARAMS / (rows[0].length || 1)));
    if (rows.length > per) {
      let affected = 0;
      for (let i = 0; i < rows.length; i += per) {
        const [h] = await run(executor, sql, [rows.slice(i, i + per)]);
        affected += h.affectedRows;
      }
      return [{ fieldCount: 0, affectedRows: affected, changedRows: affected, insertId: 0, warningStatus: 0 }, undefined];
    }
  }

  let p;
  try {
    p = await prepare(sql, params);
    const res = await executor.query(p.text, p.values);
    const kw = (sql.match(/^\s*(\w+)/) || [])[1]?.toLowerCase();

    if (["select", "with", "show", "explain", "values"].includes(kw)) {
      return [remapRows(res.rows, p.aliasCase), res.fields];
    }
    let insertId = 0;
    if (p.returningKey && res.rows[0]) {
      const v = res.rows[0][p.returningKey];
      insertId = typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v;
    }
    return [{
      fieldCount: 0,
      affectedRows: res.rowCount || 0,
      changedRows: res.rowCount || 0,
      insertId,
      warningStatus: 0,
    }, undefined];
  } catch (err) {
    throw mapError(err, sql);
  }
}

/* ---------- public API (mysql2/promise compatible) ---------- */
const db = {
  query: (sql, params) => run(pool, sql, params),
  execute: (sql, params) => run(pool, sql, params),
  escape,
  async getConnection() {
    const client = await pool.connect();
    return {
      query: (sql, params) => run(client, sql, params),
      execute: (sql, params) => run(client, sql, params),
      beginTransaction: () => client.query("BEGIN"),
      commit: () => client.query("COMMIT"),
      rollback: () => client.query("ROLLBACK"),
      release: () => client.release(),
      escape,
    };
  },
  end: () => pool.end(),
  _pg: pool,
  _prepare: prepare, // exposed for tests
};

(async () => {
  try {
    const c = await pool.connect();
    await c.query("SELECT 1");
    c.release();
    console.log("✅ Supabase (PostgreSQL) Connected");
  } catch (e) {
    console.error("❌ Supabase Connection Failed:", e.message);
    try { // show WHAT the app is actually using (password never printed) so a wrong host/user is obvious
      const u = new URL(process.env.DATABASE_URL);
      console.error(`   using host=${u.hostname} port=${u.port || 5432} user=${decodeURIComponent(u.username)} (loaded from ${process.env.DATABASE_URL_SOURCE || ".env or the shell environment"})`);
    } catch (_) {}
    if (/tenant\/user .* not found|Tenant or user not found/i.test(e.message)) {
      console.error("   -> Wrong pooler HOST or project ref. Supabase dashboard > Connect > copy the URI exactly (don't type aws-0/aws-1 yourself). Run: node scripts/check-db-connection.js");
    }
  }
})();

module.exports = db;

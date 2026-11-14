#!/usr/bin/env node
/**
 * Copies your local MySQL database (schema + data) into Supabase Postgres.
 *
 *   node scripts/migrate-mysql-to-supabase.js              # schema + data
 *   node scripts/migrate-mysql-to-supabase.js --drop       # drop existing tables first, then migrate
 *   node scripts/migrate-mysql-to-supabase.js --schema-only  # only write scripts/supabase-schema.generated.sql
 *   node scripts/migrate-mysql-to-supabase.js --data-only    # tables already exist (you ran the .sql), copy rows
 *
 * Reads from MySQL (defaults match your old config/db.js):
 *   MYSQL_HOST=localhost MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=root MYSQL_DATABASE=onlinexam
 * Writes to Supabase:  DATABASE_URL=postgresql://...
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { Client } = require("pg");

const args = new Set(process.argv.slice(2));
const SCHEMA_ONLY = args.has("--schema-only");
const DATA_ONLY = args.has("--data-only");
const DROP = args.has("--drop");

const MYSQL_DB = process.env.MYSQL_DATABASE || "onlinexam";
const q = (n) => '"' + String(n).toLowerCase().replace(/"/g, '""') + '"';
const lit = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const short = (s) => (s.length > 60 ? s.slice(0, 60) : s);

/* ---------------- type mapping ---------------- */
function pgType(c) {
  const dt = c.data_type.toLowerCase();
  const unsigned = c.column_type.toLowerCase().includes("unsigned");
  switch (dt) {
    case "tinyint": return "smallint";            // kept numeric (0/1) so the JS code behaves the same
    case "smallint": return unsigned ? "integer" : "smallint";
    case "mediumint": return "integer";
    case "int": case "integer": return unsigned ? "bigint" : "integer";
    case "bigint": return unsigned ? "numeric(20,0)" : "bigint";
    case "decimal": case "numeric": return `numeric(${c.numeric_precision},${c.numeric_scale})`;
    case "float": return "real";
    case "double": return "double precision";
    case "varchar": return `varchar(${c.character_maximum_length})`;
    case "char": return `char(${c.character_maximum_length})`;
    case "tinytext": case "text": case "mediumtext": case "longtext": return "text";
    case "date": return "date";
    case "datetime": case "timestamp": return "timestamp";
    case "time": return "time";
    case "year": return "smallint";
    case "json": return "jsonb";
    case "tinyblob": case "blob": case "mediumblob": case "longblob":
    case "binary": case "varbinary": return "bytea";
    case "bit": return "smallint";
    case "enum": case "set": return "text";
    default: return "text";
  }
}

function pgDefault(c, type) {
  const extra = (c.extra || "").toLowerCase();
  let d = c.column_default;
  if (extra.includes("auto_increment")) return "";
  if (d === null || d === undefined || String(d).toUpperCase() === "NULL") return "";
  d = String(d);
  if (/^(current_timestamp|now\(\))/i.test(d)) return " DEFAULT CURRENT_TIMESTAMP";
  if (extra.includes("default_generated")) return "";               // expression defaults: add by hand
  const numeric = ["smallint", "integer", "bigint", "real", "double precision"].includes(type) || type.startsWith("numeric");
  if (numeric) return /^-?\d+(\.\d+)?$/.test(d) ? ` DEFAULT ${d}` : (/^b'([01]+)'$/i.test(d) ? ` DEFAULT ${parseInt(d.slice(2, -1), 2)}` : "");
  d = d.replace(/^'(.*)'$/s, "$1").replace(/\\'/g, "'");
  if (["date", "timestamp", "time"].includes(type) && /^0000/.test(d)) return "";
  return ` DEFAULT ${lit(d)}`;
}

/* ---------------- introspection ---------------- */
async function introspect(my) {
  const [tables] = await my.query(
    `SELECT TABLE_NAME AS table_name FROM information_schema.tables
     WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name`, [MYSQL_DB]);
  const out = [];
  for (const { table_name } of tables) {
    const [columns] = await my.query(
      `SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type, COLUMN_TYPE AS column_type,
              IS_NULLABLE AS is_nullable, COLUMN_DEFAULT AS column_default, EXTRA AS extra,
              CHARACTER_MAXIMUM_LENGTH AS character_maximum_length,
              NUMERIC_PRECISION AS numeric_precision, NUMERIC_SCALE AS numeric_scale
       FROM information_schema.columns WHERE table_schema = ? AND table_name = ?
       ORDER BY ordinal_position`, [MYSQL_DB, table_name]);
    const [stats] = await my.query(
      `SELECT INDEX_NAME AS index_name, NON_UNIQUE AS non_unique, COLUMN_NAME AS column_name,
              SEQ_IN_INDEX AS seq, INDEX_TYPE AS index_type
       FROM information_schema.statistics WHERE table_schema = ? AND table_name = ?
       ORDER BY index_name, seq_in_index`, [MYSQL_DB, table_name]);
    const [fks] = await my.query(
      `SELECT k.CONSTRAINT_NAME AS name, k.COLUMN_NAME AS column_name,
              k.REFERENCED_TABLE_NAME AS ref_table, k.REFERENCED_COLUMN_NAME AS ref_column,
              r.DELETE_RULE AS delete_rule, r.UPDATE_RULE AS update_rule
       FROM information_schema.key_column_usage k
       JOIN information_schema.referential_constraints r
         ON r.constraint_schema = k.constraint_schema AND r.constraint_name = k.constraint_name
        AND r.table_name = k.table_name
       WHERE k.table_schema = ? AND k.table_name = ? AND k.referenced_table_name IS NOT NULL
       ORDER BY k.constraint_name, k.ordinal_position`, [MYSQL_DB, table_name]);

    const idx = {};
    for (const s of stats) (idx[s.index_name] ||= { unique: !s.non_unique, type: s.index_type, cols: [] }).cols.push(s.column_name);
    const pk = idx.PRIMARY ? idx.PRIMARY.cols : [];
    delete idx.PRIMARY;

    const fk = {};
    for (const f of fks) (fk[f.name] ||= { ref_table: f.ref_table, del: f.delete_rule, upd: f.update_rule, cols: [], refs: [] }).cols.push(f.column_name) && fk[f.name].refs.push(f.ref_column);

    out.push({ name: table_name, columns, pk, indexes: idx, fks: fk });
  }
  return out;
}

/* ---------------- DDL generation ---------------- */
function buildDDL(tables) {
  const ddl = { drop: [], create: [], indexes: [], fks: [], rls: [], triggers: [] };
  const caseMap = {};

  for (const t of tables) {
    const tn = q(t.name);
    ddl.drop.push(`DROP TABLE IF EXISTS ${tn} CASCADE;`);
    const cols = t.columns.map((c) => {
      const type = pgType(c);
      const auto = (c.extra || "").toLowerCase().includes("auto_increment");
      if (c.column_name !== c.column_name.toLowerCase()) caseMap[c.column_name.toLowerCase()] = c.column_name;
      let line = `  ${q(c.column_name)} ${type}`;
      if (auto) line += " GENERATED BY DEFAULT AS IDENTITY";
      else {
        if (c.is_nullable === "NO") line += " NOT NULL";
        line += pgDefault(c, type);
      }
      if ((c.extra || "").toLowerCase().includes("on update current_timestamp")) {
        const fn = q(short(`${t.name}_${c.column_name}_on_update`));
        ddl.triggers.push(
          `CREATE OR REPLACE FUNCTION ${fn}() RETURNS trigger AS $$ BEGIN NEW.${q(c.column_name)} = CURRENT_TIMESTAMP; RETURN NEW; END $$ LANGUAGE plpgsql;`,
          `CREATE TRIGGER ${fn} BEFORE UPDATE ON ${tn} FOR EACH ROW EXECUTE FUNCTION ${fn}();`);
      }
      return line;
    });
    if (t.pk.length) cols.push(`  PRIMARY KEY (${t.pk.map(q).join(", ")})`);
    ddl.create.push(`CREATE TABLE ${tn} (\n${cols.join(",\n")}\n);`);

    for (const [name, ix] of Object.entries(t.indexes)) {
      if (/fulltext|spatial/i.test(ix.type)) continue;
      ddl.indexes.push(`CREATE ${ix.unique ? "UNIQUE " : ""}INDEX ${q(short(`${t.name}_${name}`))} ON ${tn} (${ix.cols.map(q).join(", ")});`);
    }
    for (const [name, f] of Object.entries(t.fks)) {
      const rule = (r) => (r === "RESTRICT" ? "NO ACTION" : r);
      ddl.fks.push(`ALTER TABLE ${tn} ADD CONSTRAINT ${q(short(`${t.name}_${name}`))} FOREIGN KEY (${f.cols.map(q).join(", ")}) REFERENCES ${q(f.ref_table)} (${f.refs.map(q).join(", ")}) ON DELETE ${rule(f.del)} ON UPDATE ${rule(f.upd)};`);
    }
    // Supabase exposes public tables through its REST API; with RLS on and no policies the
    // anon key can't read them, while your backend (postgres role) is unaffected.
    ddl.rls.push(`ALTER TABLE ${tn} ENABLE ROW LEVEL SECURITY;`);
  }
  return { ddl, caseMap };
}

/* ---------------- data copy ---------------- */
function fixValue(v, col) {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && /^(date|datetime|timestamp)$/i.test(col.data_type) && /^0000-00-00|-00(\s|$)/.test(v)) return null;
  if (Buffer.isBuffer(v)) return col.data_type === "bit" ? parseInt(v.toString("hex") || "0", 16) : v;
  if (typeof v === "object" && !(v instanceof Date)) return JSON.stringify(v);
  return v;
}

function loadOrder(tables) {
  const names = new Set(tables.map((t) => t.name));
  const deps = new Map(tables.map((t) => [t.name, new Set(Object.values(t.fks).map((f) => f.ref_table).filter((r) => r !== t.name && names.has(r)))]));
  const order = []; const done = new Set();
  while (order.length < tables.length) {
    let progressed = false;
    for (const t of tables) {
      if (done.has(t.name)) continue;
      if ([...deps.get(t.name)].every((d) => done.has(d))) { order.push(t); done.add(t.name); progressed = true; }
    }
    if (!progressed) for (const t of tables) if (!done.has(t.name)) { order.push(t); done.add(t.name); }
  }
  return order;
}

async function copyTable(my, pg, t) {
  const [[{ n }]] = await my.query(`SELECT COUNT(*) AS n FROM \`${t.name}\``);
  if (!n) { console.log(`   ${t.name}: 0 rows`); return 0; }
  const colNames = t.columns.map((c) => c.column_name);
  const batch = Math.max(1, Math.min(1000, Math.floor(60000 / colNames.length)));
  const orderBy = t.pk.length ? ` ORDER BY ${t.pk.map((c) => `\`${c}\``).join(", ")}` : "";
  let done = 0;
  for (let off = 0; off < n; off += batch) {
    const [rows] = await my.query(`SELECT * FROM \`${t.name}\`${orderBy} LIMIT ? OFFSET ?`, [batch, off]);
    if (!rows.length) break;
    const params = [];
    const tuples = rows.map((r) => "(" + t.columns.map((c) => { params.push(fixValue(r[c.column_name], c)); return "$" + params.length; }).join(", ") + ")");
    await pg.query(`INSERT INTO ${q(t.name)} (${colNames.map(q).join(", ")}) VALUES ${tuples.join(", ")}`, params);
    done += rows.length;
  }
  console.log(`   ${t.name}: ${done} rows`);
  return done;
}

async function optional(pg, sql, label, warnings) {
  await pg.query("SAVEPOINT opt");
  try { await pg.query(sql); await pg.query("RELEASE SAVEPOINT opt"); }
  catch (e) { await pg.query("ROLLBACK TO SAVEPOINT opt"); warnings.push(`${label}: ${e.message}`); }
}

/* ---------------- main ---------------- */
(async () => {
  const my = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD ?? "root",
    database: MYSQL_DB,
    dateStrings: true,         // keep DATETIME values exactly as stored (no timezone shifting)
    multipleStatements: false,
  });
  console.log(`📖 Reading MySQL database "${MYSQL_DB}" ...`);
  const tables = await introspect(my);
  console.log(`   found ${tables.length} tables`);

  const { ddl, caseMap } = buildDDL(tables);
  const sqlFile = path.join(__dirname, "supabase-schema.generated.sql");
  fs.writeFileSync(sqlFile, [
    "-- Generated from MySQL. Run in Supabase > SQL Editor (or let the migration script run it).",
    "-- Add -- DROP lines below only if you want to recreate tables.",
    ...ddl.create, "", ...ddl.indexes, "", ...ddl.fks, "", ...ddl.triggers, "", ...ddl.rls, "",
  ].join("\n"));
  console.log(`📝 Wrote ${path.relative(process.cwd(), sqlFile)}`);

  const casePath = path.join(__dirname, "..", "config", "columnCase.json");
  fs.writeFileSync(casePath, JSON.stringify(caseMap, null, 2));
  console.log(`📝 Wrote config/columnCase.json (${Object.keys(caseMap).length} mixed-case column names, e.g. ${Object.values(caseMap).slice(0, 3).join(", ") || "none"})`);

  if (SCHEMA_ONLY) { await my.end(); return console.log("Done (schema only)."); }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set in .env");

  const pg = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false } });
  await pg.connect();
  const warnings = [];

  // reserved-word column names would need quoting in hand-written SQL
  const kw = (await pg.query("SELECT word FROM pg_get_keywords() WHERE catcode = 'R'")).rows.map((r) => r.word);
  for (const t of tables) for (const c of t.columns)
    if (kw.includes(c.column_name.toLowerCase())) warnings.push(`column ${t.name}.${c.column_name} is a Postgres reserved word - queries must quote it ("${c.column_name.toLowerCase()}")`);

  try {
    await pg.query("BEGIN");
    if (!DATA_ONLY) {
      if (DROP) for (const s of ddl.drop) await pg.query(s);
      console.log("🏗  Creating tables ...");
      for (const s of ddl.create) await pg.query(s);
    }
    console.log("📦 Copying data ...");
    for (const t of loadOrder(tables)) await copyTable(my, pg, t);

    // keep auto-increment counters ahead of the copied ids
    for (const t of tables) for (const c of t.columns) {
      if (!(c.extra || "").toLowerCase().includes("auto_increment")) continue;
      await pg.query(
        `SELECT setval(pg_get_serial_sequence($1, $2), GREATEST(COALESCE((SELECT MAX(${q(c.column_name)}) FROM ${q(t.name)}), 0), 1),
                (SELECT MAX(${q(c.column_name)}) FROM ${q(t.name)}) IS NOT NULL)`,
        [q(t.name), c.column_name.toLowerCase()]);
    }
    if (!DATA_ONLY) {
      console.log("🔗 Indexes, foreign keys, triggers, RLS ...");
      for (const s of ddl.indexes) await optional(pg, s, "index", warnings);
      for (const s of ddl.fks) await optional(pg, s, "foreign key", warnings);
      for (const s of ddl.triggers) await optional(pg, s, "trigger", warnings);
      for (const s of ddl.rls) await pg.query(s);
    }
    await pg.query("COMMIT");
    console.log("✅ Migration complete");
  } catch (e) {
    await pg.query("ROLLBACK").catch(() => {});
    console.error("❌ Migration failed, nothing was changed:", e.message);
    process.exitCode = 1;
  } finally {
    if (warnings.length) { console.log("\n⚠️  Warnings:"); warnings.forEach((w) => console.log("  - " + w)); }
    await pg.end(); await my.end();
  }
})().catch((e) => { console.error("❌", e.message); process.exit(1); });

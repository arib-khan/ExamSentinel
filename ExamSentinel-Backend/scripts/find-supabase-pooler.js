#!/usr/bin/env node
/**
 * Finds the correct Supabase pooler host for your project by trying every known one.
 *
 *   node scripts/find-supabase-pooler.js
 *
 * Uses the project ref + password already in DATABASE_URL (.env). Nothing is changed or stored;
 * the password is only sent to Supabase's own pooler hosts, exactly like a normal connection.
 *
 * How it decides (per host):   "Tenant or user not found"   -> your project is not on this host
 *                              "password authentication failed" -> RIGHT host, wrong password
 *                              connected                     -> RIGHT host and password
 */
require("dotenv").config();
const { Client } = require("pg");

const raw = process.env.DATABASE_URL;
if (!raw) { console.log("❌ DATABASE_URL is not set in .env"); process.exit(1); }
const u = new URL(raw);
const user = decodeURIComponent(u.username);
const password = decodeURIComponent(u.password);
const dbname = u.pathname.slice(1) || "postgres";
const m = user.match(/^postgres\.([a-z0-9]+)$/);
if (!m && !process.env.POOLER_HOSTS) { console.log(`❌ Username must look like postgres.<project-ref>, yours is "${user}"`); process.exit(1); }
const ref = m ? m[1] : "";

const REGIONS = ["ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ca-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-central-2", "eu-north-1", "sa-east-1"];
const hosts = process.env.POOLER_HOSTS
  ? process.env.POOLER_HOSTS.split(",")
  : REGIONS.flatMap((r) => [0, 1, 2].map((n) => `aws-${n}-${r}.pooler.supabase.com`));

async function tryHost(host) {
  const c = new Client({ host, port: Number(process.env.POOLER_PORT || 5432), user, password, database: dbname,
    ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false }, connectionTimeoutMillis: 7000 });
  c.on("error", () => {});
  try { await c.connect(); await c.end(); return { host, state: "connected" }; }
  catch (e) {
    const msg = String(e.message || e);
    if (/tenant\/user .* not found|Tenant or user not found/i.test(msg)) return { host, state: "not-here" };
    if (/password authentication failed/i.test(msg)) return { host, state: "wrong-password" };
    if (e.code === "ENOTFOUND" && !/tenant/i.test(msg)) return { host, state: "no-dns" };
    return { host, state: "error", msg };
  }
}

(async () => {
  console.log(`Project ref: ${ref || "(custom)"} | trying ${hosts.length} pooler hosts (session mode, port 5432)...\n`);
  const results = []; let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => { while (i < hosts.length) { const r = await tryHost(hosts[i++]); results.push(r); process.stdout.write(r.state === "not-here" || r.state === "no-dns" ? "." : r.state === "error" ? "?" : "!"); } }));
  console.log("\n");
  const hit = results.filter((r) => r.state === "connected" || r.state === "wrong-password");
  if (hit.length) {
    for (const h of hit) {
      console.log(h.state === "connected" ? `✅ FOUND and connected: ${h.host}` : `⚠️  RIGHT HOST (${h.host}) but the PASSWORD is wrong. Reset it: Supabase > Project Settings > Database > Reset database password.`);
    }
    const best = hit[0];
    const enc = encodeURIComponent(password);
    console.log(`\nPut this in .env, then restart the backend:\n\nDATABASE_URL=postgresql://${user}:${best.state === "connected" ? enc : "<NEW-PASSWORD-URL-ENCODED>"}@${best.host}:5432/${dbname}\n`);
    return;
  }
  const errs = results.filter((r) => r.state === "error");
  console.log("❌ No pooler host knows this project.");
  if (errs.length) console.log("   Other errors seen (first 3):", errs.slice(0, 3).map((e) => e.host + ": " + e.msg).join(" | "));
  console.log(`\nSo it is one of:
  1. The project is PAUSED -> dashboard: click "Restore project", wait 2 minutes, run this again.
  2. The project ref "${ref}" is wrong -> compare with dashboard > Project Settings > General > Reference ID.
  3. Your network blocks port 5432 -> try POOLER_PORT=6543 (PowerShell: $env:POOLER_PORT="6543").
  4. The project was deleted/never finished provisioning -> create a new project and copy its Connect > Session pooler URI.`);
})();

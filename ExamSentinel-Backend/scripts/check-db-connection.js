#!/usr/bin/env node
/**
 * Checks DATABASE_URL and explains, in plain words, why the Supabase connection fails.
 *   node scripts/check-db-connection.js
 */
require("dotenv").config();
const { Client } = require("pg");

const raw = process.env.DATABASE_URL;
if (!raw) { console.log("❌ DATABASE_URL is not set in .env"); process.exit(1); }

let u;
try { u = new URL(raw); } catch {
  console.log("❌ DATABASE_URL is not a valid URL. If your password contains @ : / ? # % put it through encodeURIComponent (e.g. @ -> %40).");
  process.exit(1);
}
const host = u.hostname, user = decodeURIComponent(u.username), port = u.port || "5432";
console.log("Host     :", host);
console.log("Port     :", port, port === "6543" ? "(transaction pooler)" : port === "5432" ? "" : "(unusual)");
console.log("User     :", user);
console.log("Database :", u.pathname.slice(1) || "(none)");
console.log("Password :", u.password ? `${decodeURIComponent(u.password).length} characters` : "MISSING");
if (/\[YOUR-PASSWORD\]|\[PASSWORD\]|<password>|<pw>/i.test(raw)) console.log("⚠️  The placeholder [YOUR-PASSWORD] is still in the URL. Replace it with your real database password.");
if (/^db\..+\.supabase\.co$/.test(host)) console.log("⚠️  Direct host (db.<ref>.supabase.co) is IPv6-only and often fails on home networks. Use the Session pooler host instead.");
if (/pooler\.supabase\.com$/.test(host) && !/^postgres\.[a-z0-9]{20}$/.test(user)) console.log("⚠️  On the pooler the user must look like postgres.<project-ref> (yours: " + user + ").");
console.log("");

const ssl = process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false };
const c = new Client({ connectionString: raw, ssl, connectionTimeoutMillis: 10000 });
c.connect().then(async () => {
  const r = await c.query("select current_database() db, current_user usr, version() v");
  console.log("✅ Connected:", r.rows[0].db, "as", r.rows[0].usr);
  const t = await c.query("select to_regclass('public.live_interviews') as interviews, to_regclass('public.\"user\"') as usr");
  console.log(t.rows[0].interviews ? "✅ live interview tables exist" : "ℹ️  live interview tables not created yet: run migrations/live-interview/001_live_interview_schema.sql");
  console.log(t.rows[0].usr ? "✅ \"user\" table exists" : "⚠️  \"user\" table missing: run the MySQL -> Supabase migration first (docs/SUPABASE-MIGRATION.md)");
  await c.end();
}).catch((e) => {
  const m = String(e.message || e);
  console.log("❌ Connection failed:", m, "\n");
  if (/tenant\/user .* not found|Tenant or user not found/i.test(m)) {
    console.log("MEANING: the pooler server answered, but it has no project with that name on THIS host.\nMost common causes (in this order):\n  1. Wrong pooler host / region. Newer projects use aws-1-<region>.pooler.supabase.com, older ones aws-0-... and the region must be YOUR project's region.\n  2. The project is paused (free projects pause after inactivity): open the dashboard and click Restore.\n  3. Typo in the project ref in the username.\nFIX: Supabase dashboard -> your project -> Connect (top bar) -> 'Session pooler' -> copy the URI EXACTLY and paste it into DATABASE_URL (only replace [YOUR-PASSWORD]).");
  } else if (/password authentication failed/i.test(m)) {
    console.log("MEANING: host and user are right, the password is wrong.\nFIX: Supabase -> Project Settings -> Database -> Reset database password, then update .env (URL-encode special characters).");
  } else if (/ENOTFOUND|getaddrinfo/i.test(m) && e.code === "ENOTFOUND") {
    console.log("MEANING: the host name does not exist / cannot be resolved (typo, or IPv6-only direct host).\nFIX: use the Session pooler URI from Supabase -> Connect.");
  } else if (/ECONNREFUSED|ETIMEDOUT|timeout/i.test(m)) {
    console.log("MEANING: the server cannot be reached (firewall, VPN, wrong port).\nFIX: use port 5432 on the Session pooler host; try another network or disable the VPN.");
  } else if (/SSL|certificate/i.test(m)) {
    console.log("MEANING: SSL problem. Supabase needs SSL (default). Only set PG_SSL=false for a LOCAL Postgres.");
  }
  process.exit(1);
});

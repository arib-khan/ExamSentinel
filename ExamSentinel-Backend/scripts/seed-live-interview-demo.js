#!/usr/bin/env node
/**
 * Demo data for the LIVE video interview module.
 *
 *   node scripts/seed-live-interview-demo.js            create demo candidates + 5 interviews (safe to re-run)
 *   node scripts/seed-live-interview-demo.js --reset    delete the demo interviews, then create them again (times are relative to NOW)
 *   node scripts/seed-live-interview-demo.js --remove   delete demo interviews AND demo candidate accounts
 *
 * Needs: migrations/live-interview/001_*.sql and 002_*.sql  (Supabase SQL Editor).
 * The interviewer (host) is your admin account.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const svc = require("../services/liveInterview/liveInterviewService");
const LI = require("../models/liveInterview/LiveInterview");
const Events = require("../models/liveInterview/LiveInterviewEvent");

const OWNER = "demo-seed";
const PASSWORD = "Candidate@123";
const USERS = [
  { user_id: "candidate1@examsentinel.test", user_name: "Aarav Sharma", phone: "+91 90000 00001" },
  { user_id: "candidate2@examsentinel.test", user_name: "Diya Patel", phone: "+91 90000 00002" },
  { user_id: "candidate3@examsentinel.test", user_name: "Rohan Verma", phone: "+91 90000 00003" },
];
const [C1, C2, C3] = USERS.map((u) => u.user_id);
const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const log = console.log;
const q = async (sql, p) => (await pool.query(sql, p))[0];

async function ready() {
  try { await q("SELECT 1 FROM live_interviews LIMIT 1"); }
  catch { throw new Error("Live interview tables not found. Run migrations/live-interview/001_live_interview_schema.sql in the Supabase SQL Editor first."); }
  const r = await q("SELECT user_role_id FROM user_roles WHERE user_role_name = 'Candidate'");
  if (!r.length) throw new Error("The 'Candidate' role does not exist. Run migrations/live-interview/002_live_interview_permissions.sql first.");
  return Number(r[0].user_role_id);
}
async function pickHost() {
  const a = await q("SELECT user_id FROM user WHERE user_id = 'Admin@sysassist.com'");
  if (a.length) return a[0].user_id;
  const any = await q("SELECT user_id FROM user WHERE user_role_id = 1 LIMIT 1");
  if (!any.length) throw new Error("No admin user found to act as the interviewer.");
  return any[0].user_id;
}
async function ensureUsers(roleId) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  for (const u of USERS) {
    const ex = await q("SELECT user_id, user_role_id FROM user WHERE user_id = ?", [u.user_id]);
    if (ex.length) { log(Number(ex[0].user_role_id) === roleId ? `•  user exists: ${u.user_id}` : `⚠️  ${u.user_id} exists but is not a Candidate`); continue; }
    await pool.query("INSERT INTO user SET ?", { user_id: u.user_id, user_name: u.user_name, user_password: hash, user_role_id: roleId, user_inst_id: null });
    log(`✅ candidate account created: ${u.user_id}`);
  }
}
async function remove(withUsers) {
  const [r] = await pool.query("DELETE FROM live_interviews WHERE created_by = ?", [OWNER]);
  log(`🧹 removed ${r.affectedRows} demo interviews`);
  if (withUsers) { const [u] = await pool.query("DELETE FROM user WHERE user_id IN (?)", [USERS.map((x) => x.user_id)]); log(`🧹 removed ${u.affectedRows} demo candidates`); }
}

(async () => {
  const flags = new Set(process.argv.slice(2));
  try {
    const roleId = await ready();
    if (flags.has("--remove")) { await remove(true); return; }
    if (flags.has("--reset")) await remove(false);
    await ensureUsers(roleId);
    const host = await pickHost();
    const actor = { id: host, canManage: true, canHost: true, isAdmin: true, canJoin: false };
    const existing = await q("SELECT title FROM live_interviews WHERE created_by = ?", [OWNER]);
    const have = new Set(existing.map((r) => r.title));
    const at = (ms) => new Date(Date.now() + ms).toISOString();
    const make = async (title, cand, start, dur, extra = {}) => {
      if (have.has(title)) { log(`•  interview exists: ${title}`); return null; }
      const u = USERS.find((x) => x.user_id === cand);
      const iv = await svc.create({ title, candidate_id: cand, candidate_name: u.user_name, candidate_email: cand, candidate_phone: u.phone, scheduled_start: start, duration_minutes: dur, ...extra }, actor);
      await q("UPDATE live_interviews SET created_by = ? WHERE id = ?", [OWNER, iv.id]);
      log(`✅ ${title}  (${u.user_name}, code ${iv.meeting_code}, starts ${new Date(start).toLocaleString()})`);
      return iv;
    };

    await make("HR Round – Backend Developer", C1, at(3 * MIN), 30, { description: "Introduction, motivation and culture fit. Joinable right now: the room opens 10 minutes before the start." });
    await make("Technical Round – Frontend Developer", C2, at(DAY + 2 * HOUR), 45, { description: "Live discussion of React, CSS and browser fundamentals." });
    await make("Final Round – Product Manager", C3, at(3 * DAY), 60, { description: "Final conversation with the hiring manager." });
    const cancelled = await make("Intro Call (cancelled)", C2, at(2 * DAY), 20);
    if (cancelled) await svc.cancel(cancelled.id, actor);

    // a finished interview (inserted directly: the API refuses to schedule in the past)
    const doneTitle = "Screening Call (completed)";
    if (have.has(doneTitle)) log(`•  interview exists: ${doneTitle}`);
    else {
      const start = new Date(Date.now() - DAY - 3 * HOUR), end = new Date(start.getTime() + 30 * MIN);
      const id = await LI.create({
        meeting_code: "DEMO-DONE", room_name: "es-demo-completed-" + Date.now(), title: doneTitle, description: "A finished interview kept for the history view.",
        host_id: host, candidate_id: C1, candidate_name: USERS[0].user_name, candidate_email: C1, candidate_phone: USERS[0].phone,
        scheduled_start: start, duration_minutes: 30, scheduled_end: end, status: "ended", monitoring_required: 1,
        started_at: new Date(start.getTime() + 2 * MIN), ended_at: new Date(start.getTime() + 27 * MIN), end_reason: "ended_by_host", created_by: OWNER,
      }).catch(async (e) => { if (e.code === "ER_DUP_ENTRY") { await q("DELETE FROM live_interviews WHERE meeting_code = 'DEMO-DONE'"); return null; } throw e; });
      if (id) {
        for (const ev of ["created", "token_issued", "interview_started", "interview_ended"]) await Events.add(id, host, "host", ev, null);
        log(`✅ ${doneTitle}`);
      } else log("•  re-run to create the completed demo interview");
    }

    log("\n──────────────────────────  DEMO LOGINS  ──────────────────────────");
    for (const u of USERS) log(`  Candidate : ${u.user_id.padEnd(32)} password: ${PASSWORD}   (${u.user_name})`);
    log(`  HR / Admin: ${host.padEnd(32)} (your existing admin password)`);
    log("────────────────────────────────────────────────────────────────────");
    log("  HR  -> /admin/live-interviews : 5 interviews (1 joinable now, 2 upcoming, 1 completed, 1 cancelled)");
    log("  candidate1 -> /candidate/live-interviews : 'HR Round' has a Join button (opens 10 min before start)\n");
  } catch (e) {
    console.error("\n❌ " + e.message);
    process.exitCode = 1;
  } finally { await pool.end(); }
})();

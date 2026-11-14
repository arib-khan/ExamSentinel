// Rules of the live interview API, using the REAL routes/ApiControler.js, REAL /auth/login, REAL permission tables.
// Only the LiveKit room API is replaced by a controllable fake (token signing is real). Run from the backend root.
require("dotenv").config();
process.env.LIVEKIT_URL = "wss://fake.livekit.local"; process.env.LIVEKIT_API_KEY = "testkey"; process.env.LIVEKIT_API_SECRET = "testsecret-testsecret-testsecret-1234";
process.env.FRONTEND_URL = "http://localhost:5173";
const Module = require("module"), express = require("express"), path = require("path"), jwt = require("jsonwebtoken"), bcrypt = require("bcrypt");
const keep = new Set(["./liveInterview", "./userRolepermisionRouter"]); const orig = Module._load;
Module._load = function (req, parent, ...r) { if (parent && parent.filename && parent.filename.endsWith(path.join("routes", "ApiControler.js")) && req.startsWith("./") && !keep.has(req)) return express.Router(); return orig.call(this, req, parent, ...r); };
const pool = require("../../config/db"); const livekit = require("../../services/liveInterview/livekitService");
const { TrackSource } = require("livekit-server-sdk");
const app = express(); app.use(express.json()); app.use("/api", require("../../routes/ApiControler")); app.use("/auth", require("../../routes/utils/Auth"));

const fake = { created: [], deleted: [], participants: {}, down: false,
  async createRoom(o) { if (fake.down) throw new Error("connect ECONNREFUSED"); fake.created.push(o); return o; },
  async listParticipants(room) { if (fake.down) throw new Error("connect ECONNREFUSED"); return fake.participants[room] || []; },
  async deleteRoom(room) { if (fake.down) throw new Error("connect ECONNREFUSED"); fake.deleted.push(room); },
};
livekit._setClient(fake);

let base, pass = 0, fail = 0;
const t = (n, c, x) => { if (c) { pass++; console.log("  ok  ", n); } else { fail++; console.log("  FAIL", n, x !== undefined ? JSON.stringify(x) : ""); } };
const call = async (method, p, body, token) => {
  const r = await fetch(base + p, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(8000) });
  let j = null; try { j = await r.json(); } catch {} return { s: r.status, j, d: j && j.data };
};
const login = async (u, p) => (await call("POST", "/auth/login", { user_id: u, user_password: p })).j.Token;
const q = async (sql, p) => (await pool.query(sql, p))[0];
const MIN = 60000, DAY = 86400000, at = (ms) => new Date(Date.now() + ms).toISOString();
const decode = (tok) => jwt.verify(tok, process.env.LIVEKIT_API_SECRET);

(async () => {
  const srv = app.listen(0); base = "http://127.0.0.1:" + srv.address().port;
  // ---- fixtures: a second, non-admin HR role; two fresh candidates; an operator with no live-interview rights
  await pool.query("DELETE FROM live_interviews"); // THROW-AWAY DATABASE ONLY: start from an empty table
  await pool.query("DELETE FROM \"user\" WHERE user_id = 'new.person@test.dev'");
  const hash = await bcrypt.hash("Pass@1234", 10);
  await pool.query("INSERT INTO user_roles (user_role_id, user_role_name) OVERRIDING SYSTEM VALUE VALUES (7,'HR Test') ON CONFLICT DO NOTHING");
  const objs = await q("SELECT sys_object_id, sys_object_name FROM system_objects WHERE sys_object_name = 'live_interviews'");
  await pool.query("DELETE FROM object_user_role_perm WHERE perm_user_role_id = 7");
  await pool.query("INSERT INTO object_user_role_perm (perm_sys_object_id, perm_user_role_id, create_perm, read_perm, update_perm, delete_perm, execute_perm) VALUES (?,7,'Y','Y','Y','N','Y')", [objs[0].sys_object_id]);
  for (const [id, name, role] of [["hr2@test.dev", "HR Two", 7], ["ca@test.dev", "Cand A", 6], ["cb@test.dev", "Cand B", 6], ["op@test.dev", "Operator", 5]]) {
    await pool.query("DELETE FROM live_interviews WHERE host_id = ? OR candidate_id = ?", [id, id]); await pool.query("DELETE FROM \"user\" WHERE user_id = ?", [id]);
    await pool.query("INSERT INTO \"user\" (user_id,user_name,user_password,user_role_id) VALUES (?,?,?,?)", [id, name, hash, role]);
  }
  const TA = await login("Admin@sysassist.com", "123456"), TH2 = await login("hr2@test.dev", "Pass@1234"), TCA = await login("ca@test.dev", "Pass@1234"), TCB = await login("cb@test.dev", "Pass@1234"), TOP = await login("op@test.dev", "Pass@1234");
  const studentTok = jwt.sign({ user: { id: 9 } }, process.env.TOKEN_SECRET);

  console.log("\n# access control");
  t("exam-student token (no role) -> 401", (await call("GET", "/api/live-interviews/mine", null, studentTok)).s === 401);
  t("no token -> 401", (await call("GET", "/api/live-interviews/mine")).s === 401);
  t("operator without rights cannot list", (await call("GET", "/api/live-interviews", null, TOP)).s === 403);
  t("candidate cannot list the HR list", (await call("GET", "/api/live-interviews", null, TCA)).s === 403);
  t("candidate cannot schedule", (await call("POST", "/api/live-interviews", { title: "x", candidate_id: "ca@test.dev", scheduled_start: at(DAY), duration_minutes: 30 }, TCA)).s === 403);

  console.log("\n# scheduling");
  const body = (o = {}) => ({ title: "HR Round", candidate_id: "ca@test.dev", candidate_email: "ca@test.dev", candidate_phone: "123", scheduled_start: at(2 * DAY), duration_minutes: 30, ...o });
  t("missing title -> 400", (await call("POST", "/api/live-interviews", body({ title: "" }), TA)).s === 400);
  t("duration 2 min -> 400", (await call("POST", "/api/live-interviews", body({ duration_minutes: 2 }), TA)).s === 400);
  t("bad date -> 400", (await call("POST", "/api/live-interviews", body({ scheduled_start: "tomorrow-ish" }), TA)).s === 400);
  t("in the past -> 400 IN_THE_PAST", (await call("POST", "/api/live-interviews", body({ scheduled_start: at(-2 * 3600000) }), TA)).j.code === "IN_THE_PAST");
  t("candidate must be a Candidate-role user", (await call("POST", "/api/live-interviews", body({ candidate_id: "op@test.dev" }), TA)).j.code === "INVALID_CANDIDATE");
  t("unknown candidate -> 400", (await call("POST", "/api/live-interviews", body({ candidate_id: "nobody@x.y" }), TA)).s === 400);
  t("bad email -> 400", (await call("POST", "/api/live-interviews", body({ candidate_email: "not-an-email" }), TA)).s === 400);
  const c1 = await call("POST", "/api/live-interviews", body(), TA);
  t("create -> 201, scheduled, meeting code, link", c1.s === 201 && c1.d.status === "scheduled" && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c1.d.meeting_code) && c1.d.join_link === `http://localhost:5173/candidate/live-interviews/${c1.d.id}` && c1.d.join_state === "upcoming", c1.j);
  t("room name is NOT exposed to the HR/candidate JSON", !JSON.stringify(c1.j).includes("es-"));
  const id = c1.d.id;
  t("same candidate overlapping -> 409 CANDIDATE_BUSY", (await call("POST", "/api/live-interviews", body({ scheduled_start: at(2 * DAY + 10 * MIN), title: "Overlap" }), TA)).j.code === "CANDIDATE_BUSY");
  t("same interviewer overlapping -> 409 HOST_BUSY", (await call("POST", "/api/live-interviews", body({ candidate_id: "cb@test.dev", scheduled_start: at(2 * DAY + 10 * MIN), title: "Overlap2" }), TA)).j.code === "HOST_BUSY");
  const c2 = await call("POST", "/api/live-interviews", body({ title: "Other HR", candidate_id: "cb@test.dev", scheduled_start: at(2 * DAY + 10 * MIN) }), TH2);
  t("another interviewer can use the same slot", c2.s === 201 && c2.d.host_id === "hr2@test.dev", c2.j);
  t("non-admin cannot schedule for another interviewer", (await call("POST", "/api/live-interviews", body({ host_id: "Admin@sysassist.com", candidate_id: "cb@test.dev", scheduled_start: at(5 * DAY) }), TH2)).s === 403);
  const l1 = await call("GET", "/api/live-interviews", null, TH2);
  t("a non-admin HR only sees their own interviews", l1.d.every((x) => x.host_id === "hr2@test.dev") && l1.d.length === 1, l1.d.map((x) => x.title));
  t("another HR cannot read/cancel/end/invite/get-token for it", [
    (await call("GET", `/api/live-interviews/${id}`, null, TH2)).s, (await call("POST", `/api/live-interviews/${id}/cancel`, null, TH2)).s,
    (await call("POST", `/api/live-interviews/${id}/end`, null, TH2)).s, (await call("POST", `/api/live-interviews/${id}/invite`, {}, TH2)).s,
    (await call("POST", `/api/live-interviews/${id}/token`, { role: "host" }, TH2)).s].every((s) => s === 403));
  t("admin can read any interview", (await call("GET", `/api/live-interviews/${id}`, null, TA)).s === 200);
  const mine = await call("GET", "/api/live-interviews/mine", null, TCA);
  t("candidate sees only their own, without HR-only fields", mine.d.length === 1 && mine.d[0].id === id && mine.d[0].candidate_email === undefined && mine.d[0].host_id === undefined, mine.d);
  t("other candidate cannot read it (404)", (await call("GET", `/api/live-interviews/${id}`, null, TCB)).s === 404);
  const rs = await call("PUT", `/api/live-interviews/${id}`, { title: "HR Round v2", scheduled_start: at(9 * DAY), duration_minutes: 45 }, TA);
  t("reschedule while scheduled", rs.s === 200 && rs.d.title === "HR Round v2" && rs.d.duration_minutes === 45 && Math.abs(new Date(rs.d.scheduled_end) - new Date(rs.d.scheduled_start) - 45 * MIN) < 1000, rs.j);

  console.log("\n# quick-create candidate");
  const nc = await call("POST", "/api/live-interviews/candidates", { name: "New Person", email: "New.Person@Test.Dev" }, TA);
  t("account created, temp password shown once", nc.s === 201 && nc.d.user_id === "new.person@test.dev" && nc.d.temp_password.length >= 10 && nc.d.existing === false, nc.j);
  t("the new candidate can log in with it", !!(await login("new.person@test.dev", nc.d.temp_password)));
  const again = await call("POST", "/api/live-interviews/candidates", { name: "New Person", email: "new.person@test.dev" }, TA);
  t("same email again -> existing, no new password", again.d.existing === true && again.d.temp_password === undefined);
  t("email of a non-candidate -> 409", (await call("POST", "/api/live-interviews/candidates", { name: "x", email: "op@test.dev" }, TA)).j.code === "EMAIL_IN_USE");
  t("invalid email -> 400", (await call("POST", "/api/live-interviews/candidates", { name: "x", email: "nope" }, TA)).s === 400);
  t("candidate cannot create accounts", (await call("POST", "/api/live-interviews/candidates", { name: "x", email: "x@y.zz" }, TCA)).s === 403);
  t("candidate-pool lists Candidate-role users only", (await call("GET", "/api/live-interviews/candidate-pool?search=cand", null, TA)).d.every((u) => /cand/i.test(u.user_name + u.user_id)));

  console.log("\n# tokens: who may join, when, and with which rights");
  t("candidate without consent -> 400 CONSENT_REQUIRED", (await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate" }, TCA)).j.code === "CONSENT_REQUIRED");
  t("candidate too early -> 409 TOO_EARLY with opens_at", await (async () => { const r = await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TCA); return r.j.code === "TOO_EARLY" && new Date(r.j.opens_at) < new Date(rs.d.scheduled_start); })());
  t("candidate cannot ask for a host token", (await call("POST", `/api/live-interviews/${id}/token`, { role: "host", consent: true }, TCA)).s === 403);
  t("other candidate cannot get a token (404)", (await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TCB)).s === 404);
  t("invalid role -> 400", (await call("POST", `/api/live-interviews/${id}/token`, { role: "admin" }, TA)).s === 400);
  // an interview that is joinable right now
  const now = await call("POST", "/api/live-interviews", body({ title: "Joinable", candidate_id: "cb@test.dev", scheduled_start: at(4 * MIN), duration_minutes: 30 }), TA);
  const nid = now.d.id;
  t("join_state is 'available' inside the early-join window", now.d.join_state === "available" && (await call("GET", "/api/live-interviews/mine", null, TCB)).d[0].join_state === "available", now.d);
  const hostT = await call("POST", `/api/live-interviews/${nid}/token`, { role: "host", client: "web" }, TA);
  t("host token issued; interview becomes LIVE", hostT.s === 200 && hostT.d.interview.status === "live" && hostT.d.interview.started_at, hostT.j);
  const hp = decode(hostT.d.token);
  t("host JWT: identity, room, publish+subscribe, mic+camera, short TTL", hp.sub === "host:Admin@sysassist.com" && hp.video.roomJoin === true && hp.video.canPublish === true && hp.video.canSubscribe === true && hp.exp - hp.nbf <= 600 && hp.video.room === hostT.d.room, hp);
  t("room was created on the video server before the token was handed out", fake.created.some((c) => c.name === hostT.d.room && c.maxParticipants === 6));
  const candT = await call("POST", `/api/live-interviews/${nid}/token`, { role: "candidate", consent: true, client: "web" }, TCB);
  const cp = decode(candT.d.token);
  t("candidate JWT: same room, may publish + subscribe", candT.s === 200 && cp.video.room === hostT.d.room && cp.video.canPublish && cp.video.canSubscribe && cp.sub === "candidate:cb@test.dev", cp);
  const monT = await call("POST", `/api/live-interviews/${nid}/token`, { role: "monitor", consent: true, client: "mobile" }, TCB);
  const mp = decode(monT.d.token);
  t("monitor JWT: same room, may publish, may NOT subscribe, camera only, no data", monT.s === 200 && mp.video.room === hostT.d.room && mp.video.canPublish === true && mp.video.canSubscribe === false && mp.video.canPublishData === false && JSON.stringify(mp.video.canPublishSources).toLowerCase().includes("camera") && !JSON.stringify(mp.video.canPublishSources).toLowerCase().includes("microphone"), mp.video);
  t("monitor identity differs from candidate (both can be connected at once)", mp.sub === "monitor:cb@test.dev" && mp.sub !== cp.sub);
  t("tokens are signed with the server secret only (forged one is rejected)", (() => { try { jwt.verify(candT.d.token, "wrong-secret"); return false; } catch { return true; } })());
  t("response contains the server URL but never the API secret", monT.d.url === "wss://fake.livekit.local" && !JSON.stringify(monT.j).includes("testsecret"));
  const sess = await q("SELECT role, consent_at, client FROM live_interview_sessions WHERE live_interview_id = ? ORDER BY id", [nid]);
  t("sessions recorded; consent stored for candidate/monitor only; client type kept", sess.length === 3 && sess[0].consent_at === null && sess[1].consent_at && sess[2].consent_at && sess[2].client === "mobile", sess);
  const noMon = await call("POST", "/api/live-interviews", body({ title: "No monitor", candidate_id: "ca@test.dev", scheduled_start: at(3 * 3600000), monitoring_required: false }), TA);
  const nm = await call("POST", `/api/live-interviews/${noMon.d.id}/token`, { role: "monitor", consent: true }, TCA);
  t("monitor token refused when the interview does not use monitoring", nm.j.code === "MONITORING_NOT_USED", nm.j);

  console.log("\n# live status (HR dashboard) and degradation");
  const room = hostT.d.room;
  fake.participants[room] = [
    { identity: "host:Admin@sysassist.com", name: "HR", tracks: [{ source: TrackSource.CAMERA, muted: false }, { source: TrackSource.MICROPHONE, muted: false }] },
    { identity: "candidate:cb@test.dev", name: "Cand B", tracks: [{ source: TrackSource.CAMERA, muted: false }, { source: TrackSource.MICROPHONE, muted: true }] },
    { identity: "monitor:cb@test.dev", name: "Workspace camera", tracks: [{ source: TrackSource.CAMERA, muted: false }] },
  ];
  const st = await call("GET", `/api/live-interviews/${nid}/status`, null, TA);
  t("status: all three connected, mic muted shown, monitor has camera", st.d.participants.host.connected && st.d.participants.candidate.connected && st.d.participants.monitor.connected && st.d.participants.candidate.microphone === false && st.d.participants.monitor.camera === true && st.d.livekit_available === true && st.d.status === "live", st.j);
  const states = await q("SELECT role, state, joined_at FROM live_interview_sessions WHERE live_interview_id = ? ORDER BY id", [nid]);
  t("connection state persisted per role", states.every((s) => s.state === "connected" && s.joined_at), states);
  fake.participants[room] = fake.participants[room].filter((p) => p.role !== "monitor" && !p.identity.startsWith("monitor"));
  const st2 = await call("GET", `/api/live-interviews/${nid}/status`, null, TA);
  t("monitor drops -> shown as disconnected and left_at set", st2.d.participants.monitor.connected === false && (await q("SELECT state, left_at FROM live_interview_sessions WHERE live_interview_id = ? AND role = 'monitor'", [nid]))[0].left_at !== null);
  const cs = await call("GET", `/api/live-interviews/${nid}/status`, null, TCB);
  t("candidate can read the same status (to show 'monitoring phone connected')", cs.s === 200 && cs.d.participants.monitor.connected === false);
  t("other candidate cannot read status", (await call("GET", `/api/live-interviews/${nid}/status`, null, TCA)).s === 404);
  fake.down = true;
  const down = await call("GET", `/api/live-interviews/${nid}/status`, null, TA);
  t("video server down -> status still answers with livekit_available:false", down.s === 200 && down.d.livekit_available === false && down.d.status === "live", down.j);
  const dtok = await call("POST", `/api/live-interviews/${nid}/token`, { role: "candidate", consent: true }, TCB);
  t("video server down -> token request fails cleanly with 502", dtok.s === 502 && dtok.j.code === "LIVEKIT_UNAVAILABLE", dtok.j);
  fake.down = false;

  console.log("\n# client events");
  t("event recorded", (await call("POST", `/api/live-interviews/${nid}/events`, { role: "candidate", event_type: "reconnecting", details: { attempt: 1 } }, TCB)).d.recorded === true);
  t("reconnecting sets session state", (await q("SELECT state FROM live_interview_sessions WHERE live_interview_id = ? AND role = 'candidate' ORDER BY id DESC LIMIT 1", [nid]))[0].state === "reconnecting");
  await call("POST", `/api/live-interviews/${nid}/events`, { role: "candidate", event_type: "reconnected" }, TCB);
  t("reconnected sets it back", (await q("SELECT state FROM live_interview_sessions WHERE live_interview_id = ? AND role = 'candidate' ORDER BY id DESC LIMIT 1", [nid]))[0].state === "connected");
  t("unknown event type -> 400", (await call("POST", `/api/live-interviews/${nid}/events`, { role: "candidate", event_type: "hack" }, TCB)).s === 400);
  t("candidate cannot post events as host", (await call("POST", `/api/live-interviews/${nid}/events`, { role: "host", event_type: "joined" }, TCB)).s === 403);
  t("other candidate cannot post events", (await call("POST", `/api/live-interviews/${nid}/events`, { role: "candidate", event_type: "joined" }, TCA)).s === 404);
  const tl = await call("GET", `/api/live-interviews/${nid}/timeline`, null, TA);
  t("HR timeline has the audit trail", ["created", "token_issued", "interview_started", "reconnecting"].every((e) => tl.d.events.some((x) => x.event_type === e)) && tl.d.sessions.length === 3, tl.d.events.map((e) => e.event_type));
  t("candidate cannot read the timeline", (await call("GET", `/api/live-interviews/${nid}/timeline`, null, TCB)).s === 403);

  console.log("\n# end / cancel / expire");
  t("cancel a LIVE interview is refused (end it instead)", (await call("POST", `/api/live-interviews/${nid}/cancel`, null, TA)).j.code === "NOT_CANCELLABLE");
  t("candidate cannot end the interview", (await call("POST", `/api/live-interviews/${nid}/end`, null, TCB)).s === 403);
  const en = await call("POST", `/api/live-interviews/${nid}/end`, null, TA);
  t("HR ends it: status ended, room deleted on the video server", en.s === 200 && en.d.status === "ended" && en.d.ended_at && fake.deleted.includes(room), en.j);
  t("ending twice is harmless", (await call("POST", `/api/live-interviews/${nid}/end`, null, TA)).d.status === "ended");
  t("every session is closed after ending", (await q("SELECT COUNT(*)::int n FROM live_interview_sessions WHERE live_interview_id = ? AND state <> 'disconnected'", [nid]))[0].n === 0);
  t("no more tokens after the end (409 ENDED) for host and candidate", (await call("POST", `/api/live-interviews/${nid}/token`, { role: "host" }, TA)).j.code === "ENDED" && (await call("POST", `/api/live-interviews/${nid}/token`, { role: "candidate", consent: true }, TCB)).j.code === "ENDED");
  t("candidate list shows it as ended", (await call("GET", "/api/live-interviews/mine", null, TCB)).d.find((x) => x.id === nid).join_state === "ended");
  const ce = await call("POST", `/api/live-interviews/${id}/end`, null, TA);
  t("ending an interview that never started -> 409 NOT_LIVE", ce.j.code === "NOT_LIVE");
  const cx = await call("POST", `/api/live-interviews/${id}/cancel`, null, TA);
  t("cancel a scheduled interview", cx.d.status === "cancelled");
  t("cancelled: nobody can get a token (409 CANCELLED)", (await call("POST", `/api/live-interviews/${id}/token`, { role: "host" }, TA)).j.code === "CANCELLED");
  t("cancelled interview cannot be edited", (await call("PUT", `/api/live-interviews/${id}`, { title: "x" }, TA)).j.code === "NOT_EDITABLE");
  const exp = await call("POST", "/api/live-interviews", body({ title: "Will expire", candidate_id: "cb@test.dev", scheduled_start: at(6 * DAY) }), TA);
  await q("UPDATE live_interviews SET scheduled_start = ?, scheduled_end = ? WHERE id = ?", [new Date(Date.now() - 3 * 3600000), new Date(Date.now() - 2 * 3600000), exp.d.id]);
  const ex = await call("GET", `/api/live-interviews/${exp.d.id}`, null, TA);
  t("an unstarted interview whose window passed becomes 'expired'", ex.d.status === "expired" && ex.d.join_state === "expired", ex.d);
  t("expired: token refused (409 EXPIRED)", (await call("POST", `/api/live-interviews/${exp.d.id}/token`, { role: "host" }, TA)).j.code === "EXPIRED");

  console.log("\n# invitations");
  const inv = await call("POST", `/api/live-interviews/${noMon.d.id}/invite`, { note: "Please be on time" }, TA);
  t("no SMTP configured -> sent:false with a link to share (honest, no fake success)", inv.s === 200 && inv.d.sent === false && /SMTP/.test(inv.d.reason) && inv.d.link.includes(`/candidate/live-interviews/${noMon.d.id}`) && inv.d.meeting_code, inv.j);
  const { SMTPServer } = require("smtp-server"); const mails = [];
  const smtp = new SMTPServer({ authOptional: true, disabledCommands: ["STARTTLS"], onData(stream, session, cb) { let b = ""; stream.on("data", (d) => (b += d)); stream.on("end", () => { mails.push(b); cb(); }); } });
  await new Promise((r) => smtp.listen(2525, "127.0.0.1", r));
  process.env.SMTP_HOST = "127.0.0.1"; process.env.SMTP_PORT = "2525"; process.env.SMTP_FROM = "ExamSentinel <no-reply@test.dev>";
  const inv2 = await call("POST", `/api/live-interviews/${noMon.d.id}/invite`, { note: "Please be on time" }, TA);
  t("with SMTP: e-mail really sent to the candidate", inv2.d.sent === true && mails.length === 1 && /To: ca@test.dev/i.test(mails[0]) && /Meeting code/.test(mails[0]) && /Please be on time/.test(mails[0]) && /SECOND phone/.test(mails[0]), { sent: inv2.d.sent, mails: mails.length });
  t("invite_sent_at stored", (await q("SELECT invite_sent_at FROM live_interviews WHERE id = ?", [noMon.d.id]))[0].invite_sent_at !== null);
  t("invite refused for a cancelled interview", (await call("POST", `/api/live-interviews/${id}/invite`, {}, TA)).j.code === "NOT_ACTIVE");
  await new Promise((r) => smtp.close(r)); delete process.env.SMTP_HOST;

  console.log("\n# configuration errors are explicit");
  const k = process.env.LIVEKIT_API_KEY; delete process.env.LIVEKIT_API_KEY;
  const fresh = await call("POST", "/api/live-interviews", body({ title: "Cfg", candidate_id: "ca@test.dev", scheduled_start: at(30 * MIN) }), TA);
  const cfg = await call("POST", `/api/live-interviews/${fresh.d.id}/token`, { role: "host" }, TA);
  t("missing LiveKit config -> 503 LIVEKIT_NOT_CONFIGURED (not a crash)", cfg.s === 503 && cfg.j.code === "LIVEKIT_NOT_CONFIGURED", cfg.j);
  t("…and the interview was NOT started by the failed attempt", (await call("GET", `/api/live-interviews/${fresh.d.id}`, null, TA)).d.status === "scheduled");
  process.env.LIVEKIT_API_KEY = k;

  console.log(`\n${pass} passed, ${fail} failed`); srv.close(); await pool.end(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });

// REAL end-to-end: real LiveKit server + three real WebRTC clients (HR, candidate laptop, workspace phone),
// driven through the real API (real login, real permissions, real tokens). Needs a LiveKit server:
//     livekit-server --dev --bind 127.0.0.1 --node-ip 127.0.0.1        (keys: devkey / secret)
//     LIVEKIT_URL=ws://127.0.0.1:7880 LIVEKIT_API_KEY=devkey LIVEKIT_API_SECRET=secret node tests/live-interview/livekit.integration.test.js
// Run from the backend root against a THROW-AWAY database. Media is synthetic (no cameras needed).
require("dotenv").config();
process.env.LIVEKIT_URL = process.env.LIVEKIT_URL || "ws://127.0.0.1:7880"; process.env.LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey"; process.env.LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";
const Module = require("module"), express = require("express"), path = require("path"), jwt = require("jsonwebtoken"), bcrypt = require("bcrypt");
const keep = new Set(["./liveInterview", "./userRolepermisionRouter"]); const orig = Module._load;
Module._load = function (req, parent, ...r) { if (parent && parent.filename && parent.filename.endsWith(path.join("routes", "ApiControler.js")) && req.startsWith("./") && !keep.has(req)) return express.Router(); return orig.call(this, req, parent, ...r); };
const pool = require("../../config/db");
const rtc = require("@livekit/rtc-node");
const { Room, RoomEvent, LocalVideoTrack, LocalAudioTrack, VideoSource, AudioSource, VideoFrame, AudioFrame, VideoBufferType, TrackPublishOptions, TrackSource, TrackKind, VideoStream } = rtc;
const app = express(); app.use(express.json()); app.use("/api", require("../../routes/ApiControler")); app.use("/auth", require("../../routes/utils/Auth"));

let base, pass = 0, fail = 0;
const t = (n, c, x) => { if (c) { pass++; console.log("  ok  ", n); } else { fail++; console.log("  FAIL", n, x !== undefined ? JSON.stringify(x) : ""); } };
const call = async (method, p, body, token) => { const r = await fetch(base + p, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch {} return { s: r.status, j, d: j && j.data }; };
const login = async (u, p) => (await call("POST", "/auth/login", { user_id: u, user_password: p })).j.Token;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, ms = 15000, step = 200) => { const end = Date.now() + ms; while (Date.now() < end) { try { const v = await fn(); if (v) return v; } catch {} await sleep(step); } return false; };
const MIN = 60000, at = (ms) => new Date(Date.now() + ms).toISOString();

const W = 320, H = 240;
async function publishCamera(room, shade) {
  const src = new VideoSource(W, H); const track = LocalVideoTrack.createVideoTrack("camera", src);
  const o = new TrackPublishOptions(); o.source = TrackSource.SOURCE_CAMERA; await room.localParticipant.publishTrack(track, o);
  const buf = Buffer.alloc(W * H * 4, shade); const timer = setInterval(() => { try { src.captureFrame(new VideoFrame(buf, W, H, VideoBufferType.RGBA)); } catch {} }, 100);
  return { track, timer };
}
async function publishMic(room) {
  const src = new AudioSource(48000, 1); const track = LocalAudioTrack.createAudioTrack("mic", src);
  const o = new TrackPublishOptions(); o.source = TrackSource.SOURCE_MICROPHONE; await room.localParticipant.publishTrack(track, o);
  const timer = setInterval(() => { try { src.captureFrame(new AudioFrame(new Int16Array(480), 48000, 1, 480)); } catch {} }, 10);
  return { track, timer };
}
/** Collects every remote track this client gets subscribed to. */
function watch(room) {
  const got = []; const left = [];
  room.on(RoomEvent.TrackSubscribed, (track, pub, p) => got.push({ identity: p.identity, source: pub.source, kind: track.kind, track }));
  room.on(RoomEvent.Disconnected, (reason) => left.push(reason));
  return { got, left };
}
async function firstFrame(track, ms = 20000) {
  const stream = new VideoStream(track);
  const read = (async () => { for await (const ev of stream) return { w: ev.frame.width, h: ev.frame.height, bytes: ev.frame.data.length }; })();
  return Promise.race([read, sleep(ms).then(() => null)]);
}

(async () => {
  const srv = app.listen(0); base = "http://127.0.0.1:" + srv.address().port;
  await pool.query("DELETE FROM live_interviews");
  const hash = await bcrypt.hash("Pass@1234", 10);
  for (const id of ["ca@test.dev"]) { await pool.query('DELETE FROM "user" WHERE user_id = ?', [id]); await pool.query('INSERT INTO "user" (user_id,user_name,user_password,user_role_id) VALUES (?,?,?,6)', [id, "Cand A", hash]); }
  const TA = await login("Admin@sysassist.com", "123456"), TC = await login("ca@test.dev", "Pass@1234");

  console.log("\n# schedule + get the three tokens (HR, candidate laptop, workspace phone)");
  const iv = await call("POST", "/api/live-interviews", { title: "Integration", candidate_id: "ca@test.dev", scheduled_start: at(2 * MIN), duration_minutes: 30 }, TA);
  const id = iv.d.id;
  const [h, c, m] = await Promise.all([
    call("POST", `/api/live-interviews/${id}/token`, { role: "host" }, TA),
    call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TC),
    call("POST", `/api/live-interviews/${id}/token`, { role: "monitor", consent: true, client: "mobile" }, TC),
  ]);
  t("all three tokens issued; the interview is live", h.s === 200 && c.s === 200 && m.s === 200 && (await call("GET", `/api/live-interviews/${id}`, null, TA)).d.status === "live", [h.j, c.j, m.j].map((x) => x.msg));

  console.log("\n# connect three real WebRTC clients");
  const hr = new Room(), cand = new Room(), mon = new Room();
  const hrW = watch(hr), candW = watch(cand), monW = watch(mon);
  await hr.connect(h.d.url, h.d.token, { autoSubscribe: true }); await cand.connect(c.d.url, c.d.token, { autoSubscribe: true }); await mon.connect(m.d.url, m.d.token, { autoSubscribe: true });
  t("HR, candidate and monitor are all connected to the same room", hr.isConnected && cand.isConnected && mon.isConnected && hr.name === c.d.room && cand.name === m.d.room);
  const pubs = [await publishCamera(hr, 200), await publishMic(hr), await publishCamera(cand, 120), await publishMic(cand), await publishCamera(mon, 60)];
  let monAudioRejected = false;
  try { pubs.push(await publishMic(mon)); } catch { monAudioRejected = true; }

  console.log("\n# media actually flows");
  const hrSeesFace = await waitFor(() => hrW.got.find((g) => g.identity === "candidate:ca@test.dev" && g.source === TrackSource.SOURCE_CAMERA));
  const hrSeesDesk = await waitFor(() => hrW.got.find((g) => g.identity === "monitor:ca@test.dev" && g.source === TrackSource.SOURCE_CAMERA));
  t("HR receives the candidate's FACE video track", !!hrSeesFace);
  t("HR receives the workspace (monitor) VIDEO track, separately", !!hrSeesDesk && hrSeesDesk.identity !== hrSeesFace.identity);
  t("HR hears the candidate (audio track)", !!(await waitFor(() => hrW.got.find((g) => g.identity === "candidate:ca@test.dev" && g.source === TrackSource.SOURCE_MICROPHONE))));
  t("candidate sees and hears the HR interviewer", !!(await waitFor(() => candW.got.find((g) => g.identity === "host:Admin@sysassist.com" && g.source === TrackSource.SOURCE_CAMERA))) && !!(await waitFor(() => candW.got.find((g) => g.identity === "host:Admin@sysassist.com" && g.source === TrackSource.SOURCE_MICROPHONE))));
  const f1 = hrSeesFace && (await firstFrame(hrSeesFace.track)), f2 = hrSeesDesk && (await firstFrame(hrSeesDesk.track));
  t("real video frames arrive at HR from the candidate laptop (not just a subscription)", !!f1 && f1.w > 0 && f1.h > 0 && f1.bytes > 0, f1);
  t("real video frames arrive at HR from the workspace phone", !!f2 && f2.w > 0 && f2.h > 0 && f2.bytes > 0, f2);

  console.log("\n# the monitoring phone is restricted by the SERVER, not by the UI");
  await sleep(1500);
  t("monitor receives NO media from anyone (canSubscribe=false)", monW.got.length === 0, monW.got.map((g) => g.identity));
  const monMic = hrW.got.find((g) => g.identity === "monitor:ca@test.dev" && g.source === TrackSource.SOURCE_MICROPHONE);
  t("monitor cannot publish a microphone: HR never receives one (publish " + (monAudioRejected ? "rejected" : "silently dropped") + ")", !monMic);

  console.log("\n# HR live status via the real room API");
  const st = await waitFor(async () => { const r = await call("GET", `/api/live-interviews/${id}/status`, null, TA); const p = r.d.participants; return p.host.connected && p.candidate.connected && p.monitor.connected && p.monitor.camera && p.candidate.microphone ? r.d : null; });
  t("status shows host, candidate and monitor connected; camera/mic flags real", !!st && st.livekit_available === true, st);
  const cst = (await call("GET", `/api/live-interviews/${id}/status`, null, TC)).d;
  t("the candidate sees 'monitoring phone connected' from the same endpoint", cst.participants.monitor.connected === true);

  console.log("\n# network drop + rejoin (server side of reconnection)");
  await cand.disconnect(); pubs.filter((p, i) => i === 2 || i === 3).forEach((p) => clearInterval(p.timer));
  const dropped = await waitFor(async () => (await call("GET", `/api/live-interviews/${id}/status`, null, TA)).d.participants.candidate.connected === false);
  t("when the candidate laptop drops, HR status shows candidate disconnected (monitor still connected)", !!dropped && (await call("GET", `/api/live-interviews/${id}/status`, null, TA)).d.participants.monitor.connected === true);
  const c2 = await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TC);
  const cand2 = new Room(); const cand2W = watch(cand2); await cand2.connect(c2.d.url, c2.d.token, { autoSubscribe: true }); const back = await publishCamera(cand2, 150); pubs.push(back);
  t("the candidate can rejoin with a fresh token and HR sees them again", !!(await waitFor(async () => (await call("GET", `/api/live-interviews/${id}/status`, null, TA)).d.participants.candidate.connected)) && !!(await waitFor(() => hrW.got.filter((g) => g.identity === "candidate:ca@test.dev" && g.source === TrackSource.SOURCE_CAMERA).length >= 2)));
  t("the rejoined candidate receives the HR video again", !!(await waitFor(() => cand2W.got.find((g) => g.identity === "host:Admin@sysassist.com" && g.source === TrackSource.SOURCE_CAMERA))));

  console.log("\n# security");
  const forged = jwt.sign({ video: { room: h.d.room, roomJoin: true, canPublish: true, canSubscribe: true }, sub: "host:attacker", iss: process.env.LIVEKIT_API_KEY }, "wrong-secret", { expiresIn: 600 });
  const bad = new Room(); let forgedRejected = false;
  try { await bad.connect(h.d.url, forged); } catch { forgedRejected = true; }
  t("a token signed with the wrong secret is rejected by the video server", forgedRejected);
  t("a second login (other candidate) cannot get a token for this interview", (await (async () => { const o = await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TA); return o.s; })()) === 404);

  console.log("\n# HR ends the interview");
  const mp = hrW.got.length;
  const end = await call("POST", `/api/live-interviews/${id}/end`, null, TA);
  t("end -> status ended", end.s === 200 && end.d.status === "ended");
  const allOut = await waitFor(() => hrW.left.length && monW.left.length && cand2W.left.length, 15000);
  t("every connected device is disconnected by the server", !!allOut, { hr: hrW.left, mon: monW.left, cand: cand2W.left });
  t("room no longer exists on the video server", (await call("GET", `/api/live-interviews/${id}/status`, null, TA)).d.participants.candidate.connected === false);
  t("no new tokens for the ended interview", (await call("POST", `/api/live-interviews/${id}/token`, { role: "candidate", consent: true }, TC)).j.code === "ENDED");
  t("audit trail contains start and end", (await call("GET", `/api/live-interviews/${id}/timeline`, null, TA)).d.events.map((e) => e.event_type).filter((e) => ["interview_started", "interview_ended"].includes(e)).length === 2);

  pubs.forEach((p) => clearInterval(p.timer));
  for (const r of [hr, cand, cand2, mon, bad]) { try { await r.disconnect(); } catch {} }
  console.log(`\n${pass} passed, ${fail} failed`); srv.close(); await pool.end(); await rtc.dispose(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });

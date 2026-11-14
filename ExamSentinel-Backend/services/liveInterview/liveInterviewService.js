/**
 * Live video interview rules: scheduling, who may join and when, token issuing, ending, live status, audit trail.
 * The video itself is carried by LiveKit; this module decides WHO may get a token and with WHAT rights.
 */
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const LI = require("../../models/liveInterview/LiveInterview");
const Sessions = require("../../models/liveInterview/LiveInterviewSession");
const Events = require("../../models/liveInterview/LiveInterviewEvent");
const livekit = require("./livekitService");
const invite = require("./inviteService");
const { validateInterview, EMAIL, str } = require("./validators");
const { bad, forbidden, notFound, conflict } = require("./errors");

const MIN = 60000;
const CANDIDATE_EARLY_MIN = () => Number(process.env.LIVE_JOIN_EARLY_MINUTES || 10);
const HOST_EARLY_MIN = () => Number(process.env.LIVE_HOST_EARLY_MINUTES || 60);
const OVERRUN_MIN = () => Number(process.env.LIVE_OVERRUN_MINUTES || 30);
const TOKEN_TTL = () => Number(process.env.LIVEKIT_TOKEN_TTL || 600); // seconds; short-lived on purpose

/* ------------------------------------------------------------------ time rules */
const opensAt = (row, role) => new Date(new Date(row.scheduled_start).getTime() - (role === "host" ? HOST_EARLY_MIN() : CANDIDATE_EARLY_MIN()) * MIN);
const closesAt = (row) => new Date(new Date(row.scheduled_end).getTime() + OVERRUN_MIN() * MIN);

/** upcoming | available | live | ended | cancelled | expired  (what the Join button should do) */
function joinState(row, role = "candidate", now = new Date()) {
  if (["cancelled", "ended", "expired", "live"].includes(row.status)) return row.status;
  if (now > closesAt(row)) return "expired";
  return now >= opensAt(row, role) ? "available" : "upcoming";
}

/** A scheduled interview whose window passed without the HR ever starting it becomes 'expired'. */
async function refresh(row, now = new Date()) {
  if (row && row.status === "scheduled" && now > closesAt(row)) {
    if (await LI.transition(row.id, ["scheduled"], { status: "expired", end_reason: "not_started" })) {
      await Events.add(row.id, null, null, "expired", { reason: "not_started" });
    }
    row.status = "expired";
  }
  return row;
}

function present(row, viewer = "host", now = new Date()) {
  const base = {
    id: row.id, meeting_code: row.meeting_code, title: row.title, description: row.description,
    scheduled_start: row.scheduled_start, scheduled_end: row.scheduled_end, duration_minutes: row.duration_minutes,
    status: row.status, join_state: joinState(row, viewer, now), opens_at: opensAt(row, viewer).toISOString(),
    monitoring_required: !!row.monitoring_required, started_at: row.started_at, ended_at: row.ended_at,
    host_name: row.host_name || row.host_id, candidate_name: row.candidate_name, join_link: invite.joinLink(row.id),
  };
  if (viewer !== "host") return base;
  return { ...base, host_id: row.host_id, candidate_id: row.candidate_id, candidate_email: row.candidate_email,
    candidate_phone: row.candidate_phone, end_reason: row.end_reason, invite_sent_at: row.invite_sent_at, created_at: row.created_at };
}

/* ------------------------------------------------------------------ access helpers */
async function load(id) {
  const row = await LI.findById(id);
  if (!row) throw notFound("Interview not found");
  return refresh(row);
}
function assertHost(row, actor) {
  if (!actor.canHost) throw forbidden("You do not have permission to host interviews");
  if (!(row.host_id === actor.id || actor.isAdmin)) throw forbidden("Only the interviewer who scheduled this interview (or an administrator) can do this");
}
function assertCandidate(row, actor) {
  if (!actor.canJoin || row.candidate_id !== actor.id) throw notFound("Interview not found"); // do not reveal other people's interviews
}
const code = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const r = crypto.randomBytes(8); return [0, 1].map((h) => Array.from({ length: 4 }, (_, i) => A[r[h * 4 + i] % A.length]).join("")).join("-"); };
const roomName = () => "es-" + crypto.randomBytes(10).toString("hex");

/* ------------------------------------------------------------------ HR: schedule & manage */
async function checkOverlaps(hostId, candidateId, start, end, excludeId = 0) {
  const c = await LI.overlapping("candidate_id", candidateId, start, end, excludeId);
  if (c.length) throw conflict("This candidate already has an interview at that time", "CANDIDATE_BUSY", { conflict_with: c[0].id });
  const h = await LI.overlapping("host_id", hostId, start, end, excludeId);
  if (h.length) throw conflict("The interviewer already has an interview at that time", "HOST_BUSY", { conflict_with: h[0].id });
}

async function create(body, actor) {
  if (!actor.canManage) throw forbidden("You do not have permission to schedule interviews");
  const v = validateInterview(body || {});
  const now = new Date();
  if (v.scheduled_start.getTime() < now.getTime() - 5 * MIN) throw bad("The interview cannot be scheduled in the past", "IN_THE_PAST");
  const cand = await LI.candidateUser(v.candidate_id);
  if (!cand || cand.user_role_name !== "Candidate") throw bad("The candidate must be an existing user with the Candidate role", "INVALID_CANDIDATE");
  let hostId = actor.id;
  if (body.host_id && body.host_id !== actor.id) {
    if (!actor.isAdmin) throw forbidden("Only an administrator can schedule an interview for another interviewer");
    if (!(await LI.userExists(body.host_id))) throw bad("host_id does not exist");
    hostId = body.host_id;
  }
  const end = new Date(v.scheduled_start.getTime() + v.duration_minutes * MIN);
  await checkOverlaps(hostId, v.candidate_id, v.scheduled_start, end);

  const row = {
    title: v.title, description: v.description || null, host_id: hostId, candidate_id: v.candidate_id,
    candidate_name: v.candidate_name || cand.user_name, candidate_email: v.candidate_email || null, candidate_phone: v.candidate_phone || null,
    scheduled_start: v.scheduled_start, duration_minutes: v.duration_minutes, scheduled_end: end,
    monitoring_required: v.monitoring_required === undefined ? 1 : v.monitoring_required,
    status: "scheduled", created_by: actor.id,
  };
  let id;
  for (let i = 0; i < 5; i++) { // meeting codes are random; retry on the (very unlikely) collision
    try { id = await LI.create({ ...row, meeting_code: code(), room_name: roomName() }); break; }
    catch (e) { if (e.code !== "ER_DUP_ENTRY" || i === 4) throw e; }
  }
  await Events.add(id, actor.id, "host", "created", { scheduled_start: v.scheduled_start });
  return present(await LI.findById(id), "host");
}

async function update(id, body, actor) {
  const row = await load(id); assertHost(row, actor);
  if (row.status !== "scheduled") throw conflict("Only a scheduled interview can be changed", "NOT_EDITABLE");
  const v = validateInterview(body || {}, { partial: true });
  delete v.candidate_id;
  const start = v.scheduled_start || new Date(row.scheduled_start);
  const dur = v.duration_minutes || row.duration_minutes;
  const end = new Date(start.getTime() + dur * MIN);
  if (v.scheduled_start && start.getTime() < Date.now() - 5 * MIN) throw bad("The interview cannot be moved into the past", "IN_THE_PAST");
  if (v.scheduled_start || v.duration_minutes) await checkOverlaps(row.host_id, row.candidate_id, start, end, row.id);
  await LI.update(id, { ...v, scheduled_end: end });
  await Events.add(id, actor.id, "host", "updated", { fields: Object.keys(v) });
  return present(await LI.findById(id), "host");
}

async function cancel(id, actor) {
  const row = await load(id); assertHost(row, actor);
  if (row.status === "cancelled") return present(row, "host");
  if (row.status !== "scheduled") throw conflict("Only a scheduled interview can be cancelled (end a live one instead)", "NOT_CANCELLABLE");
  await LI.transition(id, ["scheduled"], { status: "cancelled", cancelled_at: new Date(), end_reason: "cancelled" });
  await Events.add(id, actor.id, "host", "cancelled");
  return present(await LI.findById(id), "host");
}

async function end(id, actor) {
  const row = await load(id); assertHost(row, actor);
  if (row.status === "ended") return present(row, "host");
  if (row.status !== "live") throw conflict("Only a live interview can be ended", "NOT_LIVE");
  await LI.transition(id, ["live"], { status: "ended", ended_at: new Date(), end_reason: "ended_by_host" });
  try { await livekit.deleteRoom(row.room_name); } // kicks everyone out of the room
  catch (e) { await Events.add(id, actor.id, "host", "room_close_failed", { code: e.code }); }
  await Sessions.closeAll(id);
  await Events.add(id, actor.id, "host", "interview_ended");
  return present(await LI.findById(id), "host");
}

async function list(actor, { status } = {}) {
  if (!actor.canManage) throw forbidden();
  let rows = await LI.list({ status });
  if (!actor.isAdmin) rows = rows.filter((r) => r.host_id === actor.id);
  rows = await Promise.all(rows.map((r) => refresh(r)));
  if (status) rows = rows.filter((r) => r.status === status);
  return rows.map((r) => present(r, "host"));
}

async function mine(actor) {
  if (!actor.canJoin) throw forbidden();
  const rows = await Promise.all((await LI.listForCandidate(actor.id)).map((r) => refresh(r)));
  const rank = { live: 0, available: 1, upcoming: 2, ended: 3, expired: 4, cancelled: 5 };
  return rows.map((r) => present(r, "candidate")).sort((a, b) => (rank[a.join_state] - rank[b.join_state]) ||
    (rank[a.join_state] <= 2 ? new Date(a.scheduled_start) - new Date(b.scheduled_start) : new Date(b.scheduled_start) - new Date(a.scheduled_start)));
}

async function get(id, actor) {
  const row = await load(id);
  if (actor.canManage) { assertHost(row, actor); return present(row, "host"); } // HR who is not the host: clear 403
  assertCandidate(row, actor);                                                       // candidates: 404 (never reveal others' interviews)
  return present(row, "candidate");
}

async function candidatePool(actor, search) {
  if (!actor.canManage) throw forbidden();
  return LI.candidatePool(search ? String(search).slice(0, 100) : "");
}

/** HR can create a candidate account on the spot. The temporary password is shown ONCE. */
async function createCandidate(body, actor) {
  if (!actor.canManage) throw forbidden();
  const name = str(body && body.name, "name", 150, true);
  const email = str(body && body.email, "email", 200, true).toLowerCase();
  if (!EMAIL.test(email)) throw bad("email is not a valid email address");
  const roleId = await LI.candidateRoleId();
  if (!roleId) throw conflict("The Candidate role does not exist yet (run migrations/live-interview/002)", "NO_CANDIDATE_ROLE");
  const existing = await LI.userExists(email);
  if (existing) {
    if (Number(existing.user_role_id) !== roleId) throw conflict("That email already belongs to a non-candidate user", "EMAIL_IN_USE");
    return { user_id: email, user_name: name, existing: true };
  }
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; const r = crypto.randomBytes(10);
  const password = Array.from(r, (b) => A[b % A.length]).join("") + "7";
  await LI.insertUser({ user_id: email, user_name: name, user_password: await bcrypt.hash(password, 10), user_role_id: roleId, user_inst_id: null });
  return { user_id: email, user_name: name, existing: false, temp_password: password };
}

/* ------------------------------------------------------------------ join: tokens */
async function issueToken(id, actor, { role, consent, client } = {}) {
  if (!["host", "candidate", "monitor"].includes(role)) throw bad("role must be host, candidate or monitor");
  const row = await load(id);
  if (role === "host") assertHost(row, actor);
  else {
    assertCandidate(row, actor);
    if (consent !== true) throw bad("You must accept the monitoring disclosure before joining", "CONSENT_REQUIRED");
    if (role === "monitor" && !row.monitoring_required) throw conflict("This interview does not use a monitoring camera", "MONITORING_NOT_USED");
  }
  const now = new Date();
  if (row.status === "cancelled") throw conflict("This interview was cancelled", "CANCELLED");
  if (row.status === "ended") throw conflict("This interview has ended", "ENDED");
  if (row.status === "expired") throw conflict("The time for this interview has passed", "EXPIRED");
  if (row.status === "scheduled" && now < opensAt(row, role)) {
    throw conflict("This interview is not open yet", "TOO_EARLY", { opens_at: opensAt(row, role).toISOString() });
  }

  const identity = `${role}:${actor.id}`;
  const name = role === "host" ? `Interviewer ${row.host_name || actor.id}` : role === "monitor" ? "Workspace camera" : row.candidate_name;
  await livekit.ensureRoom(row.room_name, { interview_id: row.id }); // fails early (502) if the video service is down
  const ttl = TOKEN_TTL();
  const { token, url } = await livekit.createAccessToken({
    role, identity, name, room: row.room_name, ttlSeconds: ttl, metadata: { role, interview_id: row.id, user_id: actor.id },
  });
  await Sessions.create({
    live_interview_id: row.id, user_id: actor.id, role, identity, consent_at: role === "host" ? null : now,
    token_expires_at: new Date(now.getTime() + ttl * 1000), client: client === "mobile" ? "mobile" : "web",
  });
  if (role === "host" && row.status === "scheduled") {
    if (await LI.transition(row.id, ["scheduled"], { status: "live", started_at: now })) await Events.add(row.id, actor.id, "host", "interview_started");
  }
  await Events.add(row.id, actor.id, role, "token_issued", { client: client === "mobile" ? "mobile" : "web", consent: role !== "host" });
  const fresh = await LI.findById(row.id);
  return { token, url, identity, room: row.room_name, role, expires_in: ttl, interview: present(fresh, role === "host" ? "host" : "candidate") };
}

/* ------------------------------------------------------------------ live status (polled by the HR dashboard) */
async function liveStatus(id, actor) {
  const row = await load(id);
  let viewer;
  if (actor.canManage) { assertHost(row, actor); viewer = "host"; }
  else { assertCandidate(row, actor); viewer = "candidate"; }

  let parts = [], available = true;
  if (row.status === "live" || row.status === "scheduled") {
    try { parts = await livekit.listParticipants(row.room_name); } catch { available = false; }
  }
  const pick = (r) => { const p = parts.find((x) => x.role === r); return { connected: !!p, camera: !!(p && p.camera), microphone: !!(p && p.microphone) }; };
  const participants = { host: pick("host"), candidate: pick("candidate"), monitor: pick("monitor") };
  if (available && row.status === "live") {
    for (const r of ["host", "candidate", "monitor"]) await Sessions.setStateByRole(row.id, r, participants[r].connected ? "connected" : "disconnected");
  }
  const endAt = row.ended_at ? new Date(row.ended_at) : new Date();
  return {
    status: row.status, join_state: joinState(row, viewer === "host" ? "host" : "candidate"),
    started_at: row.started_at, ended_at: row.ended_at,
    elapsed_seconds: row.started_at ? Math.max(0, Math.floor((endAt - new Date(row.started_at)) / 1000)) : 0,
    scheduled_end: row.scheduled_end, monitoring_required: !!row.monitoring_required,
    livekit_available: available, participants, server_time: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ client-reported events */
const CLIENT_EVENTS = new Set(["joined", "left", "reconnecting", "reconnected", "media_error", "permission_denied",
  "monitor_started", "monitor_stopped", "network_offline", "network_online", "camera_switched"]);

async function recordEvent(id, actor, { event_type, role, details } = {}) {
  if (!["host", "candidate", "monitor"].includes(role)) throw bad("role must be host, candidate or monitor");
  if (!CLIENT_EVENTS.has(event_type)) throw bad("Unknown event_type");
  const row = await load(id);
  if (role === "host") assertHost(row, actor); else assertCandidate(row, actor);
  if ((await Events.count(id)) >= 5000) return { recorded: false };
  const d = details && JSON.stringify(details).length <= 2000 ? details : null;
  await Events.add(id, actor.id, role, event_type, d);
  const state = { joined: "connected", reconnected: "connected", reconnecting: "reconnecting", left: "disconnected", monitor_stopped: role === "monitor" ? "disconnected" : null }[event_type];
  if (state) await Sessions.setState(id, role, actor.id, state);
  return { recorded: true };
}

async function timeline(id, actor) {
  const row = await load(id); assertHost(row, actor);
  return { events: await Events.list(id), sessions: await Sessions.listByInterview(id) };
}

async function sendInvite(id, actor, note) {
  const row = await load(id); assertHost(row, actor);
  if (["cancelled", "ended", "expired"].includes(row.status)) throw conflict("This interview is no longer active", "NOT_ACTIVE");
  const result = await invite.sendInvite(row, row.host_name || row.host_id, note ? String(note).slice(0, 1000) : "");
  if (result.sent) { await LI.setFields(id, { invite_sent_at: new Date() }); await Events.add(id, actor.id, "host", "invite_sent", { to: row.candidate_email }); }
  return result;
}

module.exports = {
  create, update, cancel, end, list, mine, get, candidatePool, createCandidate, issueToken, liveStatus, recordEvent, timeline, sendInvite,
  joinState, opensAt, closesAt, present, refresh,
};

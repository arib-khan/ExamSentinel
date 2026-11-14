import { fakeJwt, ok } from "./helpers.jsx";

export const ADMIN = { user_id: "Admin@sysassist.com", user_name: "Admin" };
export const CAND = { user_id: "candidate1@examsentinel.test", user_name: "Aarav Sharma" };
const all = { create: "Y", read: "Y", update: "Y", delete: "Y", execute: "Y" };
export const HR_PERMS = { live_interviews: all, live_interview_portal: all, dashboard: all };
export const CAND_PERMS = { live_interview_portal: { create: "N", read: "Y", update: "N", delete: "N", execute: "Y" } };
const iso = (ms) => new Date(Date.now() + ms).toISOString();

export const baseInterview = (o = {}) => ({
  id: 5, meeting_code: "K7QM-4TXP", title: "HR Round – Backend Developer", description: "Intro and culture fit",
  scheduled_start: iso(3 * 60000), scheduled_end: iso(33 * 60000), duration_minutes: 30, status: "scheduled", join_state: "available", opens_at: iso(-7 * 60000),
  monitoring_required: true, started_at: null, ended_at: null, host_name: "Admin", candidate_name: "Aarav Sharma",
  join_link: "http://localhost:5173/candidate/live-interviews/5", host_id: ADMIN.user_id, candidate_id: CAND.user_id, candidate_email: CAND.user_id, candidate_phone: "+91 90000 00001", ...o,
});

/** A tiny in-memory backend for ONE interview. Tests mutate `s` to simulate what the server would answer. */
export function backend(overrides = {}) {
  const s = {
    iv: baseInterview(), tokenError: null, tokens: 0,
    status: { status: "scheduled", elapsed_seconds: 0, livekit_available: true, started_at: null, ended_at: null, participants: { host: { connected: false }, candidate: { connected: false }, monitor: { connected: false } } },
    ...overrides,
  };
  const routes = {
    "GET api/live-interviews": () => ok([s.iv]),
    "GET api/live-interviews/mine": () => ok([s.iv]),
    "GET api/live-interviews/5": () => ok(s.iv),
    "GET api/live-interviews/5/status": () => ok(s.status),
    "POST api/live-interviews/5/events": ok({ recorded: true }),
    "POST api/live-interviews/5/token": ({ body }) => {
      s.tokens += 1;
      if (s.tokenError) return { status: false, __status: s.tokenError.status || 409, code: s.tokenError.code, msg: s.tokenError.msg, opens_at: s.tokenError.opens_at };
      const role = body.role;
      if (role === "host") { s.iv = { ...s.iv, status: "live", join_state: "live", started_at: new Date().toISOString() }; s.status = { ...s.status, status: "live" }; }
      const id = role === "host" ? ADMIN.user_id : CAND.user_id;
      return ok({ token: fakeJwt(`${role}:${id}`, "es-testroom", role === "host" ? "Interviewer Admin" : role === "monitor" ? "Workspace camera" : "Aarav Sharma"), url: "wss://video.test", identity: `${role}:${id}`, room: "es-testroom", role, expires_in: 600, interview: s.iv });
    },
    "POST api/live-interviews/5/end": () => { s.iv = { ...s.iv, status: "ended", join_state: "ended", ended_at: new Date().toISOString() }; s.status = { ...s.status, status: "ended" }; return ok(s.iv); },
  };
  return { s, routes };
}

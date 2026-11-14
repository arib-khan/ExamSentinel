// Runs the app's REAL api/ code (client.ts + liveInterviews.ts) against a running backend + LiveKit server.
//   EXPO_PUBLIC_API_URL=http://127.0.0.1:3001 npm run test:api     (use a throw-away database; needs the demo candidate + an admin)
import { request, setToken, setUnauthorizedHandler, ApiError } from "../src/api/client";
import { liveApi } from "../src/api/liveInterviews";

let pass = 0, fail = 0;
const t = (n: string, c: boolean, x?: unknown) => { c ? pass++ : fail++; console.log(c ? "  ok  " : "  FAIL", n, c ? "" : JSON.stringify(x)); };
const jwtPayload = (tok: string) => JSON.parse(Buffer.from(tok.split(".")[1], "base64url").toString());
const at = (ms: number) => new Date(Date.now() + ms).toISOString();
const login = (u: string, p: string) => request<any>("POST", "/auth/login", { user_id: u, user_password: p }, { auth: false });

(async () => {
  let unauthorized = 0; setUnauthorizedHandler(() => { unauthorized++; });
  const adminLogin = await login("Admin@sysassist.com", "123456");
  setToken(adminLogin.Token);
  const api = <T,>(m: string, p: string, b?: unknown) => request<{ data: T }>(m, p, b).then((r) => r.data);
  const soon = await api<any>("POST", "/api/live-interviews", { title: "Mobile contract", candidate_id: "candidate1@examsentinel.test", scheduled_start: at(3 * 60000), duration_minutes: 30 });
  const later = await api<any>("POST", "/api/live-interviews", { title: "Far future", candidate_id: "candidate1@examsentinel.test", scheduled_start: at(5 * 86400000), duration_minutes: 30 });

  // ---- the app logs in exactly like AuthContext.signIn
  const bad = await login("candidate1@examsentinel.test", "wrong").catch((e) => e);
  t("wrong password -> ApiError 401 and NOT treated as an expired session", bad instanceof ApiError && bad.status === 401 && unauthorized === 0, bad);
  const lg = await login("candidate1@examsentinel.test", "Candidate@123");
  t("login: token + role 6, no password hash", !!lg.Token && lg.result.user_role_id === 6 && lg.result.user_password === undefined, lg);
  setToken(lg.Token);

  // ---- candidate screens
  const mine = await liveApi.mine();
  const m = mine.find((x) => x.id === soon.id)!, far = mine.find((x) => x.id === later.id)!;
  t("mine(): own interviews with typed join states", !!m && m.join_state === "available" && far.join_state === "upcoming" && typeof m.opens_at === "string" && m.monitoring_required === true, mine.map((x) => [x.title, x.join_state]));
  t("candidate view hides HR-only data", (m as any).candidate_email === undefined && (m as any).host_id === undefined && (m as any).room_name === undefined);
  const one = await liveApi.get(soon.id);
  t("get(): details", one.meeting_code === soon.meeting_code && one.host_name.length > 0 && one.duration_minutes === 30, one);

  // ---- joining: consent, early, rights
  const noConsent = await liveApi.token(soon.id, "monitor", false).catch((e) => e);
  t("monitor token without consent -> 400 CONSENT_REQUIRED (error.code reaches the app)", noConsent instanceof ApiError && noConsent.status === 400 && noConsent.code === "CONSENT_REQUIRED", noConsent);
  const early = await liveApi.token(later.id, "candidate", true).catch((e) => e);
  t("too early -> 409 TOO_EARLY with opens_at for the screen", early instanceof ApiError && early.code === "TOO_EARLY" && !!early.body?.opens_at, early);
  const host = await liveApi.token(soon.id, "candidate" as any, true); // candidate device token
  const mon = await liveApi.token(soon.id, "monitor", true);          // workspace phone token
  const mp = jwtPayload(mon.token), cp = jwtPayload(host.token);
  t("candidate token: publish + subscribe, identity candidate:<id>, 10-minute life", cp.video.canPublish === true && cp.video.canSubscribe === true && cp.sub.startsWith("candidate:") && cp.exp - cp.nbf <= 600, cp);
  t("monitor token: camera-only publish, CANNOT subscribe, no data channel, same room", mp.video.canPublish === true && mp.video.canSubscribe === false && mp.video.canPublishData === false && mp.video.room === cp.video.room && mp.sub.startsWith("monitor:"), mp.video);
  t("server URL is returned, API secret is NOT in anything the app receives", mon.url.length > 0 && !JSON.stringify(mon).includes(process.env.LIVEKIT_API_SECRET || "secret-never-present"));
  const hr = await request<any>("POST", `/api/live-interviews/${soon.id}/token`, { role: "host" }).catch((e) => e);
  t("a candidate cannot obtain a HOST token (403)", hr instanceof ApiError && hr.status === 403, hr);

  // ---- status + events used by the room screen
  const st = await liveApi.status(soon.id);
  t("status(): shape used by the candidate banner", typeof st.participants.monitor.connected === "boolean" && typeof st.livekit_available === "boolean", st);
  await liveApi.event(soon.id, "monitor", "monitor_started", { client: "mobile" });
  const bogus = await liveApi.event(soon.id, "candidate", "hack").catch((e) => e);
  t("events accepted for known types, rejected for unknown (400)", bogus instanceof ApiError && bogus.status === 400);
  const asHost = await liveApi.event(soon.id, "candidate", "joined").then(() => "ok").catch(() => "err");
  t("candidate may report as candidate", asHost === "ok");

  // ---- the interviewer ends it -> the app learns it from the same endpoints
  setToken(adminLogin.Token); await api("POST", `/api/live-interviews/${soon.id}/token`, { role: "host" }); await api("POST", `/api/live-interviews/${soon.id}/end`);
  setToken(lg.Token);
  const ended = await liveApi.token(soon.id, "candidate", true).catch((e) => e);
  t("after the interviewer ends it: 409 ENDED (the app shows the ended screen)", ended instanceof ApiError && ended.code === "ENDED", ended);
  t("details now say ended", (await liveApi.get(soon.id)).join_state === "ended");

  // ---- session handling
  setToken("garbage");
  const exp = await liveApi.mine().catch((e) => e);
  t("expired/invalid token -> 401 triggers the app's sign-out handler", exp instanceof ApiError && exp.status === 401 && unauthorized === 1, { unauthorized });
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });

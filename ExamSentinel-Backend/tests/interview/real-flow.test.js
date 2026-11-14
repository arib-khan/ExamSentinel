// Uses the REAL routes/ApiControler.js (patched), REAL routes/utils/Auth.js, REAL config/Tokenmanage.js and the REAL
// permission route. Only the unrelated Exam routers are replaced by empty routers (they need Redis, xlsx, ...).
require("dotenv").config();
const Module = require("module"); const express = require("express"); const path = require("path");
const keep = new Set(["./interview", "./userRolepermisionRouter"]);
const orig = Module._load;
Module._load = function (req, parent, ...r) {
  if (parent && parent.filename && parent.filename.endsWith(path.join("routes", "ApiControler.js")) && req.startsWith("./") && !keep.has(req)) return express.Router();
  return orig.call(this, req, parent, ...r);
};
const jwt = require("jsonwebtoken"); const pool = require("../../config/db");
const app = express(); app.use(express.json());
app.use("/api", require("../../routes/ApiControler")); app.use("/auth", require("../../routes/utils/Auth"));

let base, pass = 0, fail = 0;
const t = (n, c, x) => { if (c) { pass++; console.log("  ok  ", n); } else { fail++; console.log("  FAIL", n, x !== undefined ? JSON.stringify(x) : ""); } };
const call = async (method, p, body, token) => {
  const r = await fetch(base + p, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(5000) });
  let j = null; try { j = await r.json(); } catch {} return { s: r.status, j, d: j && j.data };
};
const login = async (u, p) => call("POST", "/auth/login", { user_id: u, user_password: p });
const PW = "Candidate@123", E = (n) => `candidate${n}@examsentinel.test`;

(async () => {
  const srv = app.listen(0); base = "http://127.0.0.1:" + srv.address().port;

  console.log("\n# login (real /auth/login)");
  const l1 = await login(E(1), PW), l2 = await login(E(2), PW), l3 = await login(E(3), PW), la = await login("Admin@sysassist.com", "123456");
  t("candidate1 logs in", l1.s === 200 && l1.j.Token && l1.j.result.user_role_id === 6, l1.j);
  t("login response has NO password hash", !JSON.stringify(l1.j).includes("$2") && l1.j.result.user_password === undefined);
  t("admin logs in (existing account)", la.s === 200 && la.j.result.user_role_id === 1);
  t("wrong password -> 401", (await login(E(1), "nope")).s === 401);
  t("unknown user -> 401 immediately (used to hang)", (await login("ghost@x.y", "x")).s === 401);
  t("missing fields -> 400", (await call("POST", "/auth/login", {})).s === 400);
  const T1 = l1.j.Token, T2 = l2.j.Token, T3 = l3.j.Token, TA = la.j.Token;

  console.log("\n# permissions the web app loads (/api/userpermision/list)");
  const pc = await call("GET", "/api/userpermision/list", null, T1);
  const P = pc.d.permissionsData;
  t("candidate gets interview_portal read+execute", P.interview_portal && P.interview_portal.read === "Y" && P.interview_portal.execute === "Y", P);
  t("candidate gets NO management/evaluation permission", !P.interviews && !P.interview_evaluations);
  const pa = (await call("GET", "/api/userpermision/list", null, TA)).d.permissionsData;
  t("admin gets interviews + evaluations + portal", ["interviews", "interview_evaluations", "interview_portal"].every((k) => pa[k] && pa[k].create === "Y" && pa[k].execute === "Y"));

  console.log("\n# auth edge cases on interview APIs");
  const studentTok = jwt.sign({ user: { id: 5 } }, process.env.TOKEN_SECRET);
  t("exam-student token -> 401", (await call("GET", "/api/interviews/mine", null, studentTok)).s === 401);
  t("no token -> 401", (await call("GET", "/api/interviews/mine")).s === 401);
  t("candidate cannot open admin list", (await call("GET", "/api/interviews", null, T1)).s === 403);
  t("candidate cannot create", (await call("POST", "/api/interviews", { title: "x", duration_minutes: 5 }, T1)).s === 403);
  t("candidate cannot see evaluation APIs", (await call("GET", "/api/interviews/1/results", null, T1)).s === 403);

  console.log("\n# candidate dashboards from demo data");
  const cat = (r) => Object.fromEntries(r.d.map((x) => [x.title, x.category]));
  const m1 = cat(await call("GET", "/api/interviews/mine", null, T1)), m2 = cat(await call("GET", "/api/interviews/mine", null, T2)), m3 = cat(await call("GET", "/api/interviews/mine", null, T3));
  t("candidate1: tech available, hr available, quiz completed, frontend upcoming; draft hidden",
    m1["Backend Developer – Technical Round"] === "available" && m1["HR Screening Round"] === "available" && m1["General Aptitude Quiz"] === "completed" && m1["Frontend Developer – Upcoming Round"] === "upcoming" && Object.keys(m1).length === 4, m1);
  t("candidate2: tech completed, hr available (1 of 2 attempts used)", m2["Backend Developer – Technical Round"] === "completed" && m2["HR Screening Round"] === "available" && Object.keys(m2).length === 2, m2);
  t("candidate3: tech completed, quiz available, frontend upcoming", m3["Backend Developer – Technical Round"] === "completed" && m3["General Aptitude Quiz"] === "available" && m3["Frontend Developer – Upcoming Round"] === "upcoming", m3);

  console.log("\n# results the candidate is allowed to see");
  const mine = async (T) => (await call("GET", "/api/interviews/mine", null, T)).d;
  const lastAttempt = (rows, title) => rows.find((r) => r.title === title).last_attempt_id;
  const quiz = (await call("GET", `/api/interview-attempts/${lastAttempt(await mine(T1), "General Aptitude Quiz")}/result`, null, T1)).d;
  t("quiz result released: 8/10, 80%, passed", quiz.result_visible && quiz.score === 8 && quiz.total_marks === 10 && quiz.percentage === 80 && quiz.passed === true, quiz);
  const tech3 = (await call("GET", `/api/interview-attempts/${lastAttempt(await mine(T3), "Backend Developer – Technical Round")}/result`, null, T3)).d;
  t("candidate3 technical: evaluated 23/30, passed, evaluator comment", tech3.result_visible && tech3.score === 23 && tech3.total_marks === 30 && tech3.passed === true && /Strong fundamentals/.test(tech3.comments), tech3);
  const tech2 = (await call("GET", `/api/interview-attempts/${lastAttempt(await mine(T2), "Backend Developer – Technical Round")}/result`, null, T2)).d;
  t("candidate2 technical: pending review -> NO score shown", tech2.result_visible === false && tech2.score === undefined && /pending manual review/i.test(tech2.message), tech2);
  const hr2 = (await call("GET", `/api/interview-attempts/${lastAttempt(await mine(T2), "HR Screening Round")}/result`, null, T2)).d;
  t("HR result not released to candidate", hr2.result_visible === false && hr2.score === undefined, hr2);
  t("candidate1 cannot read candidate3's attempt", (await call("GET", `/api/interview-attempts/${lastAttempt(await mine(T3), "Backend Developer – Technical Round")}/result`, null, T1)).s === 404);

  console.log("\n# admin screens from demo data");
  const list = (await call("GET", "/api/interviews", null, TA)).d;
  t("5 interviews: 4 published + 1 draft", list.length === 5 && list.filter((i) => i.status === "published").length === 4 && list.filter((i) => i.status === "draft").length === 1, list.map((i) => [i.title, i.status]));
  const tech = list.find((i) => i.title.startsWith("Backend"));
  t("technical: 7 questions, 30 marks, 3 candidates, 2 attempts", tech.question_count === 7 && tech.total_marks === 30 && tech.candidate_count === 3 && tech.attempt_count === 2, tech);
  const res = (await call("GET", `/api/interviews/${tech.interview_id}/results`, null, TA)).d;
  t("results summary: 2 attempts, 1 pending, 1 evaluated, avg 76.67, 1 passed", res.summary.attempts === 2 && res.summary.pending_review === 1 && res.summary.evaluated === 1 && res.summary.average_percentage === 76.67 && res.summary.passed === 1, res.summary);
  const att = (await call("GET", `/api/interviews/${tech.interview_id}/attempts`, null, TA)).d;
  const a2 = att.find((a) => a.candidate_id === E(2));
  t("candidate2 attempt: pending review, 3 flagged events, ~27 min", a2.evaluation_status === "pending_manual_review" && a2.flagged_events === 3 && a2.duration_seconds === 1620, a2);
  const ev = (await call("GET", `/api/interview-attempts/${a2.attempt_id}/evaluation`, null, TA)).d;
  t("evaluation view: 3 answers need review; MCQ auto-graded; events listed", ev.items.filter((i) => i.needs_review).length === 3 && ev.items.filter((i) => i.auto_gradable && i.answer && i.answer.marks_awarded != null).length === 4 && ev.events.length === 3, { n: ev.items.filter((i) => i.needs_review).length, e: ev.events.length });
  const times = ev.events.map((e) => new Date(e.occurred_at).getTime());
  t("events happen inside the attempt window (back-dated correctly)", times.every((x) => x > new Date(ev.attempt.start_time).getTime() && x < new Date(ev.attempt.end_time).getTime()));

  console.log("\n# live flow with a demo account: candidate1 takes the Technical round");
  const T = (await mine(T1)).find((r) => r.title.startsWith("Backend"));
  const st = await call("POST", `/api/interviews/${T.interview_id}/start`, null, T1);
  t("start ok", st.s === 201, st.j);
  const view = (await call("GET", `/api/interview-attempts/${st.d.attempt_id}`, null, T1)).d;
  t("7 questions, ~30 min on the server clock, no answers leaked", view.questions.length === 7 && view.attempt.remaining_seconds > 1790 && !JSON.stringify(view).includes("correct_option") && !JSON.stringify(view).includes("expected_answer"));
  const up = (await mine(T1)).find((r) => r.title.startsWith("Frontend"));
  t("cannot start the Upcoming round early", (await call("POST", `/api/interviews/${up.interview_id}/start`, null, T1)).j.code === "NOT_STARTED");
  const mcqs = view.questions.filter((q) => q.question_type === "mcq");
  const sv = await call("PUT", `/api/interview-attempts/${st.d.attempt_id}/answers`, { answers: mcqs.map((q) => ({ question_id: q.question_id, selected_option: "B" })) }, T1);
  t("answers saved", sv.s === 200 && sv.d.saved === 4, sv.j);
  const sub = await call("POST", `/api/interview-attempts/${st.d.attempt_id}/submit`, {}, T1);
  t("submit -> pending manual review (written questions left blank still need no review)", sub.d.status === "submitted" && ["auto_evaluated", "pending_manual_review"].includes(sub.d.evaluation_status), sub.d);

  console.log(`\n${pass} passed, ${fail} failed`); srv.close(); await pool.end(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });

process.env.TOKEN_SECRET = "test-secret";
const express = require("express"); const jwt = require("jsonwebtoken");
const pool = require("../../config/db");
const iv = require("../../routes/interview");
const attemptsSvc = require("../../services/interview/attemptService");

// same auth contract as routes/ApiControler.js: Bearer JWT -> req.user = payload.user
const app = express(); app.use(express.json());
app.use((req, res, next) => {
  const t = (req.headers.authorization || "").split(" ")[1];
  if (!t) return res.status(401).json({ status: false });
  jwt.verify(t, process.env.TOKEN_SECRET, (e, d) => { if (e) return res.status(401).json({ status: false }); req.user = d.user; next(); });
});
app.use("/interviews", iv.interviews); app.use("/interview-attempts", iv.attempts);

const tok = (user) => jwt.sign({ user }, process.env.TOKEN_SECRET);
const T = { admin: tok({ id: "Admin@sysassist.com", role_id: 1 }), c1: tok({ id: "cand1", role_id: 6 }), c2: tok({ id: "cand2", role_id: 6 }),
  op: tok({ id: "op1", role_id: 5 }), student: tok({ id: 7 }) };
let base, pass = 0, fail = 0;
const call = async (who, method, path, body) => {
  const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + T[who] }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch {} return { s: r.status, j, d: j && j.data };
};
const t = (name, cond, extra) => { if (cond) { pass++; console.log("  ok  ", name); } else { fail++; console.log("  FAIL", name, extra !== undefined ? JSON.stringify(extra) : ""); } };
const q = async (sql, p) => (await pool.query(sql, p))[0];

(async () => {
  const server = app.listen(0); base = "http://127.0.0.1:" + server.address().port;
  console.log("\n# access control");
  t("student JWT (no role_id) -> 401", (await call("student", "GET", "/interviews/mine")).s === 401);
  t("operator (no interview perms) -> 403", (await call("op", "GET", "/interviews")).s === 403);
  t("candidate cannot list admin list", (await call("c1", "GET", "/interviews")).s === 403);
  t("candidate cannot create", (await call("c1", "POST", "/interviews", { title: "x", duration_minutes: 10 })).s === 403);
  t("no token -> 401", (await fetch(base + "/interviews")).status === 401);

  console.log("\n# admin: create / questions / publish");
  const types = await call("admin", "GET", "/interviews/types");
  t("types: technical/hr/general seeded", ["technical", "hr", "general"].every((c) => types.d.interview_types.some((x) => x.type_code === c)));
  t("bad duration -> 400", (await call("admin", "POST", "/interviews", { title: "A", duration_minutes: 0 })).s === 400);
  t("bad type -> 400", (await call("admin", "POST", "/interviews", { title: "A", duration_minutes: 30, interview_type: "nope" })).s === 400);
  const c = await call("admin", "POST", "/interviews", { title: "Backend Engineer", interview_type: "technical", duration_minutes: 30, passing_percentage: 50, instructions: "Be honest" });
  t("create -> 201 draft", c.s === 201 && c.d.status === "draft" && c.d.created_by === "Admin@sysassist.com", c);
  const id = c.d.interview_id;
  t("publish with 0 questions -> 409", (await call("admin", "POST", `/interviews/${id}/publish`)).s === 409);
  t("mcq without correct_option -> 400", (await call("admin", "POST", `/interviews/${id}/questions`, { question: "2+2?", question_type: "mcq", options: [{ key: "A", text: "3" }, { key: "B", text: "4" }] })).s === 400);
  const q1 = await call("admin", "POST", `/interviews/${id}/questions`, { question: "2+2?", question_type: "mcq", marks: 2, options: [{ key: "A", text: "3" }, { key: "B", text: "4" }], correct_option: "B", expected_answer: "SECRET-EXPECTED" });
  const q2 = await call("admin", "POST", `/interviews/${id}/questions`, { question: "Explain indexing", question_type: "subjective", marks: 8, expected_answer: "b-trees" });
  t("questions created with auto order", q1.s === 201 && q2.s === 201 && q2.d.display_order === 2, [q1.j, q2.j]);
  const ro = await call("admin", "PUT", `/interviews/${id}/questions/reorder`, { order: [q2.d.question_id, q1.d.question_id] });
  t("reorder works", ro.s === 200 && ro.d[0].question_id === q2.d.question_id && ro.d[1].display_order === 2, ro.j);
  t("reorder with missing id -> 400", (await call("admin", "PUT", `/interviews/${id}/questions/reorder`, { order: [q2.d.question_id] })).s === 400);
  t("publish ok", (await call("admin", "POST", `/interviews/${id}/publish`)).d.status === "published");
  const detail = await call("admin", "GET", `/interviews/${id}`);
  t("counts: 2 questions, total 10 marks", detail.d.question_count === 2 && detail.d.total_marks === 10, detail.d);

  console.log("\n# assignment");
  t("assign non-candidate -> 400", (await call("admin", "POST", `/interviews/${id}/candidates`, { candidate_ids: ["op1"] })).s === 400);
  const a1 = await call("admin", "POST", `/interviews/${id}/candidates`, { candidate_ids: ["cand1"], max_attempts: 1 });
  t("assign cand1", a1.s === 201 && a1.d.added === 1, a1.j);
  const a2 = await call("admin", "POST", `/interviews/${id}/candidates`, { candidate_ids: ["cand1"] });
  t("duplicate assign skipped", a2.d.added === 0 && a2.d.already_assigned === 1, a2.j);
  const pool_ = await call("admin", "GET", "/interviews/candidate-pool?search=CAND");
  t("candidate pool (case-insens search)", pool_.d.length === 2, pool_.d);
  const mine = await call("c1", "GET", "/interviews/mine");
  t("cand1 sees it as available", mine.d.length === 1 && mine.d[0].category === "available", mine.d);
  t("cand2 sees nothing", (await call("c2", "GET", "/interviews/mine")).d.length === 0);
  t("cand2 detail -> 404 (not assigned)", (await call("c2", "GET", `/interviews/${id}`)).s === 404);
  t("cand2 start -> 404", (await call("c2", "POST", `/interviews/${id}/start`)).s === 404);
  const cd = await call("c1", "GET", `/interviews/${id}`);
  t("cand detail hides internals", cd.s === 200 && cd.d.title && cd.d.created_by === undefined && cd.d.attempts_used === 0, cd.d);

  console.log("\n# attempt: start / view / answer / events");
  const st = await call("c1", "POST", `/interviews/${id}/start`);
  t("start -> 201", st.s === 201 && st.d.resumed === false, st.j);
  const aid = st.d.attempt_id;
  const st2 = await call("c1", "POST", `/interviews/${id}/start`);
  t("start again resumes same attempt", st2.s === 200 && st2.d.attempt_id === aid && st2.d.resumed === true, st2.j);
  const view = await call("c1", "GET", `/interview-attempts/${aid}`);
  const raw = JSON.stringify(view.j);
  t("view: remaining ~30min from SERVER", view.d.attempt.remaining_seconds > 1790 && view.d.attempt.remaining_seconds <= 1800, view.d.attempt.remaining_seconds);
  t("view: no correct_option / expected_answer leaked", !raw.includes("correct_option") && !raw.includes("SECRET-EXPECTED") && !raw.includes("b-trees"));
  t("view: questions in admin-defined order", view.d.questions[0].question_id === q2.d.question_id);
  t("other candidate cannot read attempt", (await call("c2", "GET", `/interview-attempts/${aid}`)).s === 403);
  t("other candidate cannot answer", (await call("c2", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: q1.d.question_id, selected_option: "B" }] })).s === 404);
  t("invalid mcq option -> 400", (await call("c1", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: q1.d.question_id, selected_option: "Z" }] })).s === 400);
  t("foreign question -> 400", (await call("c1", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: 999999, selected_option: "A" }] })).s === 400);
  const sv = await call("c1", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: q1.d.question_id, selected_option: "A" }, { question_id: q2.d.question_id, answer_text: "Indexes speed up reads" }] });
  t("save answers", sv.s === 200 && sv.d.saved === 2, sv.j);
  const sv2 = await call("c1", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: q1.d.question_id, selected_option: "B" }] });
  t("re-save (update, not duplicate)", sv2.s === 200);
  t("exactly 2 answer rows", (await q("select count(*)::int n from interview_answers where attempt_id=?", [aid]))[0].n === 2);
  const v2 = await call("c1", "GET", `/interview-attempts/${aid}`);
  t("saved answers restored on reload", v2.d.answers.find((a) => a.question_id === q1.d.question_id).selected_option === "B");
  t("event recorded", (await call("c1", "POST", `/interview-attempts/${aid}/events`, { event_type: "tab_switch", details: { n: 1 } })).d.recorded === true);
  t("unknown event -> 400", (await call("c1", "POST", `/interview-attempts/${aid}/events`, { event_type: "hax" })).s === 400);
  t("result while in progress -> 409", (await call("c1", "GET", `/interview-attempts/${aid}/result`)).s === 409);

  console.log("\n# submit / grading");
  const sub = await call("c1", "POST", `/interview-attempts/${aid}/submit`, {});
  t("submit -> submitted + pending_manual_review", sub.d.status === "submitted" && sub.d.evaluation_status === "pending_manual_review", sub.j);
  t("submit again is idempotent", (await call("c1", "POST", `/interview-attempts/${aid}/submit`, {})).d.status === "submitted");
  t("answer after submit -> 409", (await call("c1", "PUT", `/interview-attempts/${aid}/answers`, { answers: [{ question_id: q1.d.question_id, selected_option: "A" }] })).j.code === "ATTEMPT_CLOSED");
  t("start again -> no attempts left", (await call("c1", "POST", `/interviews/${id}/start`)).j.code === "NO_ATTEMPTS_LEFT");
  const row = (await q("select * from interview_attempts where attempt_id=?", [aid]))[0];
  t("MCQ auto-graded 2/10 and percentage still NULL (no invented score)", Number(row.score) === 2 && row.percentage === null && Number(row.total_marks) === 10, row);
  const r1 = await call("c1", "GET", `/interview-attempts/${aid}/result`);
  t("candidate result hidden by default", r1.d.result_visible === false && r1.d.score === undefined, r1.d);

  console.log("\n# evaluation");
  t("candidate cannot evaluate", (await call("c1", "GET", `/interview-attempts/${aid}/evaluation`)).s === 403);
  const ev = await call("admin", "GET", `/interview-attempts/${aid}/evaluation`);
  t("evaluator sees expected answer + needs_review", JSON.stringify(ev.j).includes("b-trees") && ev.d.items.find((i) => i.question.question_id === q2.d.question_id).needs_review === true);
  t("evaluator sees tab_switch event", ev.d.events.some((e) => e.event_type === "tab_switch"));
  t("finalize before grading -> 409", (await call("admin", "POST", `/interview-attempts/${aid}/evaluation/finalize`, {})).j.code === "GRADES_PENDING");
  t("marks above max -> 400", (await call("admin", "PUT", `/interview-attempts/${aid}/evaluation`, { grades: [{ question_id: q2.d.question_id, marks: 9 }] })).s === 400);
  t("cannot override auto-graded MCQ", (await call("admin", "PUT", `/interview-attempts/${aid}/evaluation`, { grades: [{ question_id: q1.d.question_id, marks: 1 }] })).s === 400);
  t("grade saved", (await call("admin", "PUT", `/interview-attempts/${aid}/evaluation`, { grades: [{ question_id: q2.d.question_id, marks: 6, comment: "Good" }], comments: "Solid" })).s === 200);
  const fin = await call("admin", "POST", `/interview-attempts/${aid}/evaluation/finalize`, { comments: "Hire" });
  t("finalize: 2 + 6 = 8/10 = 80%", fin.s === 200 && fin.d.attempt.score === 8 && fin.d.attempt.percentage === 80 && fin.d.attempt.evaluation_status === "evaluated", fin.d && fin.d.attempt);
  t("finalize twice -> 409", (await call("admin", "POST", `/interview-attempts/${aid}/evaluation/finalize`, {})).s === 409);
  t("grading after finalize -> 409", (await call("admin", "PUT", `/interview-attempts/${aid}/evaluation`, { grades: [] })).s === 409);
  await call("admin", "PUT", `/interviews/${id}`, { show_result_to_candidate: true });
  const r2 = await call("c1", "GET", `/interview-attempts/${aid}/result`);
  t("released result: 8/10, 80%, passed", r2.d.result_visible && r2.d.score === 8 && r2.d.percentage === 80 && r2.d.passed === true && r2.d.comments === "Hire", r2.d);
  const res = await call("admin", "GET", `/interviews/${id}/results`);
  t("results summary", res.d.summary.attempts === 1 && res.d.summary.evaluated === 1 && res.d.summary.average_percentage === 80 && res.d.summary.passed === 1, res.d.summary);
  t("attempts list has candidate name + flagged events", (await call("admin", "GET", `/interviews/${id}/attempts`)).d[0].candidate_name === "Cand One");

  console.log("\n# integrity locks");
  t("cannot add question after attempts", (await call("admin", "POST", `/interviews/${id}/questions`, { question: "x", question_type: "hr" })).j.code === "HAS_ATTEMPTS");
  t("cannot delete interview with attempts", (await call("admin", "DELETE", `/interviews/${id}`)).j.code === "HAS_ATTEMPTS");
  t("cannot remove candidate with attempts", (await call("admin", "DELETE", `/interviews/${id}/candidates/cand1`)).j.code === "HAS_ATTEMPTS");
  t("cannot change duration after attempts", (await call("admin", "PUT", `/interviews/${id}`, { duration_minutes: 99 })).j.code === "HAS_ATTEMPTS");

  console.log("\n# server-side timer");
  const mk = async (extra) => {
    const i = (await call("admin", "POST", "/interviews", { title: "Quiz", duration_minutes: 1, interview_type: "general", ...extra })).d.interview_id;
    const qa = (await call("admin", "POST", `/interviews/${i}/questions`, { question: "Pick", question_type: "mcq", marks: 5, options: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correct_option: "A" })).d.question_id;
    await call("admin", "POST", `/interviews/${i}/publish`); await call("admin", "POST", `/interviews/${i}/candidates`, { candidate_ids: ["cand1", "cand2"] });
    return { i, qa };
  };
  const z = await mk({});
  const za = (await call("c1", "POST", `/interviews/${z.i}/start`)).d.attempt_id;
  await call("c1", "PUT", `/interview-attempts/${za}/answers`, { answers: [{ question_id: z.qa, selected_option: "A" }] });
  await q("update interview_attempts set expires_at = now() - interval '2 minutes' where attempt_id=?", [za]);
  const late = await call("c1", "PUT", `/interview-attempts/${za}/answers`, { answers: [{ question_id: z.qa, selected_option: "B" }] });
  t("late save rejected with ATTEMPT_EXPIRED", late.s === 409 && late.j.code === "ATTEMPT_EXPIRED", late.j);
  const za2 = await q("select * from interview_attempts where attempt_id=?", [za]);
  t("attempt auto_submitted; answer kept as saved before expiry; auto-graded 5/5=100%", za2[0].status === "auto_submitted" && Number(za2[0].score) === 5 && Number(za2[0].percentage) === 100 && za2[0].evaluation_status === "auto_evaluated", za2[0]);
  t("end_time clamped to deadline (duration <= 60s)", za2[0].duration_seconds <= 60, za2[0].duration_seconds);
  // sweeper: candidate vanishes
  const zb = (await call("c2", "POST", `/interviews/${z.i}/start`)).d.attempt_id;
  await q("update interview_attempts set expires_at = now() - interval '1 minute' where attempt_id=?", [zb]);
  const swept = await attemptsSvc.sweepExpired();
  t("sweeper closes abandoned attempt", swept >= 1 && (await q("select status from interview_attempts where attempt_id=?", [zb]))[0].status === "auto_submitted");
  // expired mode (auto_submit_on_expiry = 0)
  const y = await mk({ auto_submit_on_expiry: false });
  const ya = (await call("c1", "POST", `/interviews/${y.i}/start`)).d.attempt_id;
  await q("update interview_attempts set expires_at = now() - interval '1 minute' where attempt_id=?", [ya]);
  await call("c1", "GET", `/interview-attempts/${ya}`);
  const yr = (await q("select status, submission_time from interview_attempts where attempt_id=?", [ya]))[0];
  t("auto_submit_on_expiry=0 -> status 'expired', no submission_time", yr.status === "expired" && yr.submission_time === null, yr);
  // scheduling window
  const w = await mk({ scheduled_start: new Date(Date.now() + 3600e3).toISOString() });
  const ws = await call("c1", "POST", `/interviews/${w.i}/start`);
  t("start before scheduled_start -> 409 NOT_STARTED", ws.j.code === "NOT_STARTED", ws.j);
  t("listed as upcoming", (await call("c1", "GET", "/interviews/mine")).d.find((x) => x.interview_id === w.i).category === "upcoming");
  const w2 = await mk({ duration_minutes: 120, scheduled_start: new Date(Date.now() - 60e3).toISOString(), scheduled_end: new Date(Date.now() + 5 * 60e3).toISOString() });
  const wa = (await call("c1", "POST", `/interviews/${w2.i}/start`)).d;
  const left = (new Date(wa.expires_at) - Date.now()) / 1000;
  t("deadline capped by scheduled_end (120min interview, window closes in 5min)", left > 200 && left <= 300, left);

  console.log("\n# concurrency");
  const k = await mk({ duration_minutes: 10 });
  const rs = await Promise.all([1, 2, 3, 4, 5, 6].map(() => call("c2", "POST", `/interviews/${k.i}/start`)));
  const n = (await q("select count(*)::int n from interview_attempts where interview_id=? and candidate_id='cand2'", [k.i]))[0].n;
  t("6 parallel starts -> exactly 1 attempt row", n === 1 && rs.every((r) => r.s === 200 || r.s === 201), { n, statuses: rs.map((r) => r.s) });

  console.log("\n# retakes + self-healing");
  const rt = await mk({});
  const ra = (await call("c1", "POST", `/interviews/${rt.i}/start`)).d.attempt_id;
  await call("c1", "POST", `/interview-attempts/${ra}/submit`, {});
  t("no attempts left after submit", (await call("c1", "POST", `/interviews/${rt.i}/start`)).j.code === "NO_ATTEMPTS_LEFT");
  t("candidate cannot grant themselves attempts", (await call("c1", "PUT", `/interviews/${rt.i}/candidates/cand1`, { max_attempts: 5 })).s === 403);
  t("cannot lower below attempts already used", (await call("admin", "PUT", `/interviews/${rt.i}/candidates/cand1`, { max_attempts: 0 })).s === 400);
  const up = await call("admin", "PUT", `/interviews/${rt.i}/candidates/cand1`, { max_attempts: 2 });
  t("admin grants a 2nd attempt", up.s === 200 && up.d.max_attempts === 2 && up.d.attempts_used === 1, up.j);
  const again = await call("c1", "POST", `/interviews/${rt.i}/start`);
  t("candidate can retake; attempt_no = 2", again.s === 201 && (await q("select attempt_no from interview_attempts where attempt_id=?", [again.d.attempt_id]))[0].attempt_no === 2, again.j);
  // simulate a crash between "close" and "grade"
  await q("update interview_attempts set evaluation_status='not_submitted', score=null, percentage=null where attempt_id=?", [ra]);
  await attemptsSvc.sweepExpired();
  const healed = (await q("select evaluation_status from interview_attempts where attempt_id=?", [ra]))[0];
  t("sweeper re-grades a closed-but-ungraded attempt", healed.evaluation_status !== "not_submitted", healed);

  console.log(`\n${pass} passed, ${fail} failed`);
  server.close(); await pool.end(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });

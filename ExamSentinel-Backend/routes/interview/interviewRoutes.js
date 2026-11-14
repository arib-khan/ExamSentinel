/** /api/interviews/*  -- management (admin) + candidate listing/start. Exam routes are untouched. */
const express = require("express");
const router = express.Router();
const { requireUser, requirePermission, can } = require("../../middleware/interviewAuth");
const svc = require("../../services/interview/interviewService");
const attempts = require("../../services/interview/attemptService");
const Interview = require("../../models/interview/Interview");
const Question = require("../../models/interview/InterviewQuestion");
const Candidate = require("../../models/interview/InterviewCandidate");
const Attempt = require("../../models/interview/InterviewAttempt");
const { parseId } = require("../../services/interview/validators");
const { forbidden, notFound } = require("../../services/interview/errors");
const { ok, ah } = require("./_util");

router.use(requireUser);

const P = (m, a) => requirePermission(m, a);

/* ---------- static paths first (before /:id) ---------- */
router.get("/types", ah(async (req, res) => ok(res, await Interview.types())));

router.get("/mine", P("interview_portal", "read"), ah(async (req, res) => {
  const rows = await Interview.listForCandidate(req.interviewUser.id);
  const now = new Date();
  const data = rows.map((r) => {
    const start = r.scheduled_start && new Date(r.scheduled_start);
    const end = r.scheduled_end && new Date(r.scheduled_end);
    const running = r.last_attempt_status === "in_progress" && new Date(r.last_attempt_expires_at) > now;
    let category;
    if (running) category = "active";
    else if (r.attempts_used >= r.max_attempts) category = "completed";
    else if (end && now >= end) category = r.attempts_used > 0 ? "completed" : "missed";
    else if (start && now < start) category = "upcoming";
    else category = "available";
    return { ...r, category };
  });
  ok(res, data);
}));

router.get("/candidate-pool", P("interviews", "execute"), ah(async (req, res) =>
  ok(res, await Candidate.pool(req.query.search ? String(req.query.search).slice(0, 100) : ""))));

/* ---------- interviews ---------- */
router.get("/", P("interviews", "read"), ah(async (req, res) =>
  ok(res, await Interview.list({ status: req.query.status, type: req.query.type }))));

router.post("/", P("interviews", "create"), ah(async (req, res) =>
  ok(res, await svc.createInterview(req.body || {}, req.interviewUser.id), "Interview created", 201)));

router.get("/:id", ah(async (req, res) => {
  const id = parseId(req.params.id);
  if (await can(req, "interviews", "read")) {
    const i = await Interview.findById(id);
    if (!i) throw notFound("Interview not found");
    return ok(res, i);
  }
  if (await can(req, "interview_portal", "read")) return ok(res, await svc.candidateInterviewDetail(id, req.interviewUser.id));
  throw forbidden("Forbidden");
}));

router.put("/:id", P("interviews", "update"), ah(async (req, res) =>
  ok(res, await svc.updateInterview(parseId(req.params.id), req.body || {}), "Interview updated")));

router.delete("/:id", P("interviews", "delete"), ah(async (req, res) => {
  await svc.deleteInterview(parseId(req.params.id));
  ok(res, null, "Interview deleted");
}));

router.post("/:id/publish", P("interviews", "execute"), ah(async (req, res) =>
  ok(res, await svc.publish(parseId(req.params.id)), "Interview published")));
router.post("/:id/unpublish", P("interviews", "execute"), ah(async (req, res) =>
  ok(res, await svc.unpublish(parseId(req.params.id), req.body && req.body.status), "Interview unpublished")));

/* ---------- questions ---------- */
router.get("/:id/questions", P("interviews", "read"), ah(async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Interview.findById(id))) throw notFound("Interview not found");
  ok(res, await Question.listByInterview(id));
}));
router.post("/:id/questions", P("interviews", "update"), ah(async (req, res) =>
  ok(res, await svc.addQuestion(parseId(req.params.id), req.body || {}), "Question added", 201)));
router.put("/:id/questions/reorder", P("interviews", "update"), ah(async (req, res) =>
  ok(res, await svc.reorderQuestions(parseId(req.params.id), req.body && req.body.order), "Questions reordered")));
router.put("/:id/questions/:qid", P("interviews", "update"), ah(async (req, res) =>
  ok(res, await svc.updateQuestion(parseId(req.params.id), parseId(req.params.qid, "question id"), req.body || {}), "Question updated")));
router.delete("/:id/questions/:qid", P("interviews", "update"), ah(async (req, res) => {
  await svc.deleteQuestion(parseId(req.params.id), parseId(req.params.qid, "question id"));
  ok(res, null, "Question deleted");
}));

/* ---------- candidates ---------- */
router.get("/:id/candidates", P("interviews", "read"), ah(async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Interview.findById(id))) throw notFound("Interview not found");
  ok(res, await Candidate.list(id));
}));
router.post("/:id/candidates", P("interviews", "execute"), ah(async (req, res) => {
  const b = req.body || {};
  ok(res, await svc.assignCandidates(parseId(req.params.id), b.candidate_ids, b.max_attempts, req.interviewUser.id), "Candidates assigned", 201);
}));
router.put("/:id/candidates/:candidateId", P("interviews", "execute"), ah(async (req, res) =>
  ok(res, await svc.updateCandidateAttempts(parseId(req.params.id), String(req.params.candidateId), req.body && req.body.max_attempts), "Attempts updated")));
router.delete("/:id/candidates/:candidateId", P("interviews", "execute"), ah(async (req, res) => {
  await svc.removeCandidate(parseId(req.params.id), String(req.params.candidateId));
  ok(res, null, "Candidate removed");
}));

/* ---------- attempts & results (evaluator/admin view) ---------- */
router.get("/:id/attempts", P("interview_evaluations", "read"), ah(async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Interview.findById(id))) throw notFound("Interview not found");
  await attempts.sweepExpired(); // make sure overdue attempts are closed before listing
  ok(res, await Attempt.listByInterview(id));
}));

router.get("/:id/results", P("interview_evaluations", "read"), ah(async (req, res) => {
  const id = parseId(req.params.id);
  const interview = await Interview.findById(id);
  if (!interview) throw notFound("Interview not found");
  await attempts.sweepExpired();
  const rows = await Attempt.listByInterview(id);
  const done = rows.filter((r) => r.evaluation_status === "evaluated" || r.evaluation_status === "auto_evaluated");
  const pct = done.map((r) => r.percentage).filter((v) => v != null);
  const pass = interview.passing_percentage;
  ok(res, {
    interview: { interview_id: interview.interview_id, title: interview.title, passing_percentage: pass, total_marks: interview.total_marks },
    summary: {
      attempts: rows.length,
      in_progress: rows.filter((r) => r.status === "in_progress").length,
      pending_review: rows.filter((r) => r.evaluation_status === "pending_manual_review").length,
      evaluated: done.length,
      average_percentage: pct.length ? Math.round((pct.reduce((a, b) => a + b, 0) / pct.length) * 100) / 100 : null,
      passed: pass == null ? null : done.filter((r) => r.percentage != null && r.percentage >= pass).length,
    },
    results: rows.map((r) => ({
      attempt_id: r.attempt_id, candidate_id: r.candidate_id, candidate_name: r.candidate_name, attempt_no: r.attempt_no,
      status: r.status, evaluation_status: r.evaluation_status, score: r.score, total_marks: r.total_marks,
      percentage: r.percentage, passed: pass == null || r.percentage == null ? null : r.percentage >= pass,
      submission_time: r.submission_time, duration_seconds: r.duration_seconds, flagged_events: r.flagged_events,
    })),
  });
}));

/* ---------- candidate: start ---------- */
router.post("/:id/start", P("interview_portal", "execute"), ah(async (req, res) => {
  const { attempt, resumed } = await attempts.startAttempt(parseId(req.params.id), req.interviewUser.id);
  ok(res, { attempt_id: attempt.attempt_id, expires_at: attempt.expires_at, resumed }, resumed ? "Attempt resumed" : "Attempt started", resumed ? 200 : 201);
}));

module.exports = router;

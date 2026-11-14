/** /api/interview-attempts/*  -- answering (candidate) and evaluation (evaluator/admin). */
const express = require("express");
const router = express.Router();
const { requireUser, requirePermission, can } = require("../../middleware/interviewAuth");
const attempts = require("../../services/interview/attemptService");
const evaluation = require("../../services/interview/evaluationService");
const Attempt = require("../../models/interview/InterviewAttempt");
const { parseId } = require("../../services/interview/validators");
const { forbidden, notFound } = require("../../services/interview/errors");
const { ok, ah } = require("./_util");

router.use(requireUser);
const P = (m, a) => requirePermission(m, a);

/* Candidate gets the question paper + saved answers + server clock; evaluator gets the grading view. */
router.get("/:id", ah(async (req, res) => {
  const id = parseId(req.params.id);
  const attempt = await Attempt.findById(id);
  if (!attempt) throw notFound("Attempt not found");
  if (attempt.candidate_id === req.interviewUser.id && (await can(req, "interview_portal", "read")))
    return ok(res, await attempts.getAttemptView(id, req.interviewUser.id));
  if (await can(req, "interview_evaluations", "read")) return ok(res, await evaluation.getForEvaluation(id));
  throw forbidden("Forbidden");
}));

router.put("/:id/answers", P("interview_portal", "execute"), ah(async (req, res) => {
  const b = req.body || {};
  ok(res, await attempts.saveAnswers(parseId(req.params.id), req.interviewUser.id, b.answers), "Answers saved");
}));

router.post("/:id/submit", P("interview_portal", "execute"), ah(async (req, res) => {
  const a = await attempts.submitAttempt(parseId(req.params.id), req.interviewUser.id, req.body && req.body.answers);
  ok(res, { attempt_id: a.attempt_id, status: a.status, evaluation_status: a.evaluation_status }, "Interview submitted");
}));

router.post("/:id/events", P("interview_portal", "execute"), ah(async (req, res) =>
  ok(res, await attempts.recordEvent(parseId(req.params.id), req.interviewUser.id, req.body || {}, req.body && req.body.source))));

router.get("/:id/result", P("interview_portal", "read"), ah(async (req, res) =>
  ok(res, await attempts.getResultForCandidate(parseId(req.params.id), req.interviewUser.id))));

/* ---------- evaluator / admin ---------- */
router.get("/:id/evaluation", P("interview_evaluations", "read"), ah(async (req, res) =>
  ok(res, await evaluation.getForEvaluation(parseId(req.params.id)))));

router.put("/:id/evaluation", P("interview_evaluations", "update"), ah(async (req, res) => {
  const b = req.body || {};
  ok(res, await evaluation.gradeAnswers(parseId(req.params.id), req.interviewUser.id, b.grades || [], b.comments), "Evaluation saved");
}));

router.post("/:id/evaluation/finalize", P("interview_evaluations", "execute"), ah(async (req, res) => {
  const b = req.body || {};
  ok(res, await evaluation.finalize(parseId(req.params.id), req.interviewUser.id, b.comments), "Evaluation finalized");
}));

router.get("/:id/events", P("interview_evaluations", "read"), ah(async (req, res) =>
  ok(res, await Attempt.listEvents(parseId(req.params.id)))));

module.exports = router;

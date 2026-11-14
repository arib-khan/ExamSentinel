/**
 * Interview module :: Attempts router  (mounted at /api/interview-attempts)
 *
 * Candidate: fetch attempt state, save answers, submit, view result.
 * Staff: evaluation view, manual scoring, security events.
 *
 * SERVER-SIDE TIMING: every candidate request re-validates the deadline;
 * an expired attempt is auto-closed and auto-evaluated (MCQ only).
 */
const express = require("express");
const router = express.Router();

const InterviewAttempt = require("../../models/interview/InterviewAttempt");
const InterviewAnswer = require("../../models/interview/InterviewAnswer");
const InterviewQuestion = require("../../models/interview/InterviewQuestion");
const InterviewEvaluation = require("../../models/interview/InterviewEvaluation");
const InterviewEvent = require("../../models/interview/InterviewEvent");
const EvaluationService = require("../../services/interview/evaluationService");
const {
  requireStaffRoles,
  requireCandidate,
  requireCandidateOrStaff,
  STAFF_EVALUATE_ROLES,
} = require("./middleware/interviewAuth");

const EVALUATE = requireStaffRoles(STAFF_EVALUATE_ROLES);

/** Load attempt + enforce candidate ownership (staff bypass). */
async function loadAttemptForRequest(req, res) {
  const attempt = await InterviewAttempt.getById(Number(req.params.id));
  if (!attempt) {
    res.status(404).json({ status: false, msg: "Attempt not found" });
    return null;
  }
  if (req.studentId && Number(attempt.ia_student_id) !== Number(req.studentId)) {
    res.status(403).json({ status: false, msg: "This attempt belongs to another candidate" });
    return null;
  }
  return attempt;
}

/* ================================================================
 * ATTEMPT STATE (candidate or staff)
 * ================================================================ */

// ✅ Attempt state: questions (answers hidden), saved answers,
//    server-remaining seconds. Auto-expires when past deadline.
router.get("/:id", requireCandidateOrStaff, async (req, res) => {
  try {
    const attempt = await loadAttemptForRequest(req, res);
    if (!attempt) return;

    if (InterviewAttempt.isExpired(attempt)) {
      await InterviewAttempt.close(attempt, "EXPIRED");
      await EvaluationService.processAttempt(attempt.ia_id);
      attempt.ia_status = "EXPIRED";
    }

    const [questions, answers, evaluation] = await Promise.all([
      InterviewQuestion.FindByInterviewId(attempt.ia_interview_id, { hideAnswers: true }),
      InterviewAnswer.listByAttempt(attempt.ia_id),
      InterviewEvaluation.findByAttemptId(attempt.ia_id),
    ]);

    res.json({
      status: true,
      data: {
        attempt: {
          ia_id: attempt.ia_id,
          ia_interview_id: attempt.ia_interview_id,
          ia_status: attempt.ia_status,
          ia_start_time: attempt.ia_start_time,
          ia_deadline: attempt.ia_deadline,
          ia_score: attempt.ia_score,
          ia_percentage: attempt.ia_percentage,
          ia_submission_time: attempt.ia_submission_time,
          iv_title: attempt.iv_title,
          iv_total_marks: attempt.iv_total_marks,
          remaining_seconds: InterviewAttempt.remainingSeconds(attempt),
        },
        questions: questions.data,
        answers,
        evaluation_status: evaluation ? evaluation.ie_status : null,
      },
      msg: "Attempt fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * CANDIDATE: ANSWERS + SUBMIT
 * ================================================================ */

// ✅ Save an answer - body { question_id, selected_option?, answer_text?, time_spent_seconds? }
router.post("/:id/answers", requireCandidate, async (req, res) => {
  try {
    const attempt = await loadAttemptForRequest(req, res);
    if (!attempt) return;

    if (InterviewAttempt.isExpired(attempt)) {
      await InterviewAttempt.close(attempt, "EXPIRED");
      await EvaluationService.processAttempt(attempt.ia_id);
      return res.status(410).json({ status: false, msg: "Interview time has expired" });
    }
    if (attempt.ia_status !== "IN_PROGRESS") {
      return res.status(400).json({ status: false, msg: `Attempt already ${attempt.ia_status}` });
    }

    const { question_id, selected_option, answer_text, time_spent_seconds } = req.body;
    if (!question_id) {
      return res.status(400).json({ status: false, msg: "question_id is required" });
    }
    const question = await InterviewQuestion.FindByID(Number(question_id));
    if (!question.status || question.data.iq_interview_id !== Number(attempt.ia_interview_id)) {
      return res.status(400).json({ status: false, msg: "Question does not belong to this interview" });
    }

    await InterviewAnswer.save(attempt.ia_id, Number(question_id), {
      selected_option,
      answer_text,
      time_spent_seconds,
    });

    res.json({
      status: true,
      data: { remaining_seconds: InterviewAttempt.remainingSeconds(attempt) },
      msg: "Answer saved",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Submit - auto-scores MCQs, leaves manual review PENDING
router.post("/:id/submit", requireCandidate, async (req, res) => {
  try {
    const attempt = await loadAttemptForRequest(req, res);
    if (!attempt) return;

    if (attempt.ia_status !== "IN_PROGRESS") {
      return res.status(400).json({ status: false, msg: `Attempt already ${attempt.ia_status}` });
    }

    const expiry = InterviewAttempt.isExpired(attempt);
    await InterviewAttempt.close(attempt, expiry ? "EXPIRED" : "SUBMITTED");
    const summary = await EvaluationService.processAttempt(attempt.ia_id);
    await InterviewEvent.log({
      attempt_id: attempt.ia_id,
      interview_id: attempt.ia_interview_id,
      student_id: attempt.ia_student_id,
      event_type: expiry ? "INTERVIEW_AUTO_SUBMITTED" : "INTERVIEW_SUBMITTED",
      ip_address: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
    });

    res.json({
      status: true,
      data: { ...summary, attempt_status: expiry ? "EXPIRED" : "SUBMITTED" },
      msg: expiry
        ? "Time was over - interview auto-submitted"
        : "Interview submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Result - available only after submit/expiry/evaluation
router.get("/:id/result", requireCandidateOrStaff, async (req, res) => {
  try {
    const attempt = await loadAttemptForRequest(req, res);
    if (!attempt) return;

    if (attempt.ia_status === "IN_PROGRESS") {
      return res.status(400).json({ status: false, msg: "Interview is still in progress" });
    }

    const [answers, evaluation] = await Promise.all([
      InterviewAnswer.listForEvaluation(attempt.ia_id),
      InterviewEvaluation.findByAttemptId(attempt.ia_id),
    ]);

    const evaluationCompleted = evaluation?.ie_status === "COMPLETED";

    res.json({
      status: true,
      data: {
        attempt: {
          ia_id: attempt.ia_id,
          ia_status: attempt.ia_status,
          ia_score: attempt.ia_score,
          ia_percentage: attempt.ia_percentage,
          ia_submission_time: attempt.ia_submission_time,
          ia_duration_seconds: attempt.ia_duration_seconds,
          iv_title: attempt.iv_title,
          iv_total_marks: attempt.iv_total_marks,
        },
        // per-question marks; expected answers stay hidden from candidates
        questions: answers.map((a) => ({
          ians_id: a.ians_id,
          iq_id: a.ians_question_id,
          iq_question: a.iq_question,
          iq_question_type: a.iq_question_type,
          iq_marks: a.iq_marks,
          iq_order: a.iq_order,
          ians_selected_option: a.ians_selected_option,
          ians_answer_text: a.ians_answer_text,
          ians_marks_awarded: a.ians_marks_awarded,
          ians_is_auto_evaluated: a.ians_is_auto_evaluated,
          ians_evaluator_comment: evaluationCompleted ? a.ians_evaluator_comment : null,
        })),
        evaluation: evaluation
          ? {
              ie_status: evaluation.ie_status,
              ie_remarks: evaluationCompleted ? evaluation.ie_remarks : null,
              ie_evaluated_at: evaluation.ie_evaluated_at,
            }
          : null,
        pending_manual_review:
          !evaluationCompleted &&
          answers.some(
            (a) =>
              a.iq_question_type !== "MCQ" &&
              (a.ians_marks_awarded === null || a.ians_marks_awarded === undefined)
          ),
      },
      msg: "Result fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * STAFF: EVALUATION
 * ================================================================ */

// ✅ Evaluation view - full detail incl. expected answers + events
router.get("/:id/evaluation", EVALUATE, async (req, res) => {
  try {
    const attempt = await InterviewAttempt.getById(Number(req.params.id));
    if (!attempt) return res.status(404).json({ status: false, msg: "Attempt not found" });

    const [answers, evaluation, events] = await Promise.all([
      InterviewAnswer.listForEvaluation(attempt.ia_id),
      InterviewEvaluation.ensureForAttempt(attempt.ia_id),
      InterviewEvent.listByAttempt(attempt.ia_id),
    ]);

    res.json({
      status: true,
      data: {
        attempt: {
          ia_id: attempt.ia_id,
          ia_interview_id: attempt.ia_interview_id,
          ia_student_id: attempt.ia_student_id,
          ia_status: attempt.ia_status,
          ia_start_time: attempt.ia_start_time,
          ia_submission_time: attempt.ia_submission_time,
          ia_score: attempt.ia_score,
          ia_percentage: attempt.ia_percentage,
          iv_title: attempt.iv_title,
          iv_total_marks: attempt.iv_total_marks,
        },
        answers,
        evaluation,
        events,
      },
      msg: "Evaluation data fetched",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Save evaluation - body { decisions: [{ ians_id, marks, comment? }], remarks?, finalize? }
router.post("/:id/evaluation", EVALUATE, async (req, res) => {
  try {
    const attempt = await InterviewAttempt.getById(Number(req.params.id));
    if (!attempt) return res.status(404).json({ status: false, msg: "Attempt not found" });
    if (attempt.ia_status === "IN_PROGRESS") {
      return res.status(400).json({ status: false, msg: "Attempt is still in progress" });
    }

    const { decisions, remarks, finalize } = req.body || {};
    if (finalize && !Array.isArray(decisions)) {
      return res.status(400).json({ status: false, msg: "decisions array is required to finalize" });
    }

    const summary = await EvaluationService.applyManualScoring(attempt.ia_id, decisions || [], {
      finalize: Boolean(finalize),
      evaluatorId: req.staffId,
      remarks,
    });

    res.json({ status: true, data: summary, msg: finalize ? "Evaluation finalized" : "Evaluation saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * SECURITY / PROCTORING EVENTS
 * (reuses the existing audit vocabulary; linked to interview_attempt_id)
 * ================================================================ */

// ✅ Candidate client logs a security event (tab switch, fullscreen exit, ...)
router.post("/:id/events", requireCandidate, async (req, res) => {
  try {
    const attempt = await loadAttemptForRequest(req, res);
    if (!attempt) return;

    const { event_type, event_details } = req.body || {};
    if (!event_type) return res.status(400).json({ status: false, msg: "event_type is required" });

    const result = await InterviewEvent.log({
      attempt_id: attempt.ia_id,
      interview_id: attempt.ia_interview_id,
      student_id: attempt.ia_student_id,
      event_type,
      event_details,
      ip_address: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Staff reviews security events
router.get("/:id/events", EVALUATE, async (req, res) => {
  try {
    const rows = await InterviewEvent.listByAttempt(Number(req.params.id));
    res.json({ status: true, data: rows, msg: "Events fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

module.exports = router;

/**
 * Interview module :: Interviews router  (mounted at /api/interviews)
 *
 * Staff management (create/edit/publish/questions/candidates/attempts)
 * plus the candidate-facing endpoints (mine / start).
 *
 * All requests already passed the global JWT middleware in ApiControler;
 * interview-specific authorization happens here via interviewAuth.
 */
const express = require("express");
const router = express.Router();

const Interview = require("../../models/interview/Interview");
const InterviewQuestion = require("../../models/interview/InterviewQuestion");
const InterviewCandidate = require("../../models/interview/InterviewCandidate");
const InterviewAttempt = require("../../models/interview/InterviewAttempt");
const InterviewEvent = require("../../models/interview/InterviewEvent");
const EvaluationService = require("../../services/interview/evaluationService");
const {
  requireStaffRoles,
  requireCandidate,
  STAFF_MANAGE_ROLES,
  STAFF_DELETE_ROLES,
  STAFF_EVALUATE_ROLES,
} = require("./middleware/interviewAuth");

const MANAGE = requireStaffRoles(STAFF_MANAGE_ROLES);
const DELETE_ONLY = requireStaffRoles(STAFF_DELETE_ROLES);
const READ_ONLY = requireStaffRoles(STAFF_EVALUATE_ROLES);

/* ================================================================
 * CANDIDATE ENDPOINTS
 * ================================================================ */

// ✅ Candidate dashboard: interviews assigned to the logged-in candidate
router.get("/mine", requireCandidate, async (req, res) => {
  try {
    const result = await Interview.getForStudent(req.studentId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Candidate: interview details + instructions (questions NOT exposed)
router.get("/:id/details", requireCandidate, async (req, res) => {
  try {
    const interviewId = Number(req.params.id);
    const assigned = await InterviewCandidate.isAssigned(interviewId, req.studentId);
    if (!assigned) {
      return res
        .status(403)
        .json({ status: false, msg: "This interview is not assigned to you" });
    }
    const interview = await Interview.getById(interviewId);
    if (!interview.status) return res.status(404).json(interview);

    const attempt = await InterviewAttempt.findByInterviewAndStudent(
      interviewId,
      req.studentId
    );
    if (attempt && InterviewAttempt.isExpired(attempt)) {
      await InterviewAttempt.close(attempt, "EXPIRED");
      await EvaluationService.processAttempt(attempt.ia_id);
      attempt.ia_status = "EXPIRED";
    }

    res.json({
      status: true,
      data: {
        interview: {
          iv_id: interview.data.iv_id,
          iv_title: interview.data.iv_title,
          iv_type: interview.data.iv_type,
          iv_description: interview.data.iv_description,
          iv_instructions: interview.data.iv_instructions,
          iv_duration_minutes: interview.data.iv_duration_minutes,
          iv_total_marks: interview.data.iv_total_marks,
          iv_status: interview.data.iv_status,
          iv_schedule_start: interview.data.iv_schedule_start,
          iv_schedule_end: interview.data.iv_schedule_end,
        },
        question_count: (await InterviewQuestion.FindByInterviewId(interviewId)).data.length,
        attempt: attempt
          ? {
              ia_id: attempt.ia_id,
              ia_status: attempt.ia_status,
              remaining_seconds: InterviewAttempt.remainingSeconds(attempt),
            }
          : null,
      },
      msg: "Interview details fetched",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Candidate: start (or resume) an attempt.
//    Deadline is computed SERVER-side; the response also carries the
//    questions (without answers/expected answers).
router.get("/:id/start", requireCandidate, async (req, res) => {
  try {
    const interviewId = Number(req.params.id);
    const interview = await Interview.getById(interviewId);
    if (!interview.status) return res.status(404).json(interview);
    const iv = interview.data;

    const assigned = await InterviewCandidate.isAssigned(interviewId, req.studentId);
    if (!assigned) {
      return res
        .status(403)
        .json({ status: false, msg: "This interview is not assigned to you" });
    }

    const existing = await InterviewAttempt.findByInterviewAndStudent(
      interviewId,
      req.studentId
    );
    if (!existing) {
      if (iv.iv_status !== "PUBLISHED") {
        return res
          .status(400)
          .json({ status: false, msg: `Interview is not available (status: ${iv.iv_status})` });
      }
      const now = new Date();
      if (iv.iv_schedule_start && now < new Date(iv.iv_schedule_start)) {
        return res.status(400).json({ status: false, msg: "Interview is not open yet" });
      }
      if (iv.iv_schedule_end && now > new Date(iv.iv_schedule_end)) {
        return res.status(400).json({ status: false, msg: "Interview window has closed" });
      }
    }

    const { attempt, resumed } = await InterviewAttempt.start(iv, req.studentId);

    if (attempt.ia_status !== "IN_PROGRESS") {
      return res.json({
        status: true,
        data: {
          attempt,
          resumed: false,
          closed: true,
          msg: `This attempt is already ${attempt.ia_status}`,
        },
        msg: `This attempt is already ${attempt.ia_status}`,
      });
    }

    if (!resumed) {
      await InterviewEvent.log({
        attempt_id: attempt.ia_id,
        interview_id: interviewId,
        student_id: req.studentId,
        event_type: "INTERVIEW_STARTED",
        ip_address: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      });
    }

    const questions = await InterviewQuestion.FindByInterviewId(interviewId, {
      hideAnswers: true,
    });

    res.json({
      status: true,
      data: {
        attempt,
        resumed,
        remaining_seconds: InterviewAttempt.remainingSeconds(attempt),
        questions: questions.data,
      },
      msg: resumed ? "Interview resumed" : "Interview started",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * STAFF: INTERVIEW CRUD
 * ================================================================ */

// ✅ List (Client role sees only own institute)
router.get("/", MANAGE, async (req, res) => {
  try {
    const result = await Interview.getAll(req.roleId === 1 ? null : req.clientId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Create
router.post("/", MANAGE, async (req, res) => {
  try {
    const { iv_title, iv_type, iv_description, iv_instructions, iv_duration_minutes, iv_schedule_start, iv_schedule_end } = req.body;
    if (!iv_title || !iv_title.trim()) {
      return res.status(400).json({ status: false, msg: "Interview title is required" });
    }
    const result = await Interview.Add({
      iv_title: iv_title.trim(),
      iv_type: iv_type || "GENERAL",
      iv_description,
      iv_instructions,
      iv_duration_minutes: Number(iv_duration_minutes) > 0 ? Number(iv_duration_minutes) : 30,
      iv_schedule_start: iv_schedule_start || null,
      iv_schedule_end: iv_schedule_end || null,
      iv_status: "DRAFT",
      iv_inst_id: req.clientId ?? null,
      iv_created_by: req.staffId,
    });
    res.status(result.status ? 201 : 400).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Read one (staff)
router.get("/:id", MANAGE, async (req, res) => {
  try {
    const result = await Interview.getById(Number(req.params.id));
    if (!result.status) return res.status(404).json(result);
    if (req.roleId !== 1 && req.clientId && result.data.iv_inst_id !== req.clientId) {
      return res.status(403).json({ status: false, msg: "Out of your institute scope" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Update
router.put("/:id", MANAGE, async (req, res) => {
  try {
    const existing = await Interview.getById(Number(req.params.id));
    if (!existing.status) return res.status(404).json(existing);
    if (req.roleId !== 1 && req.clientId && existing.data.iv_inst_id !== req.clientId) {
      return res.status(403).json({ status: false, msg: "Out of your institute scope" });
    }
    const allowed = [
      "iv_title", "iv_type", "iv_description", "iv_instructions",
      "iv_duration_minutes", "iv_schedule_start", "iv_schedule_end",
    ];
    const data = {};
    for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k];
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ status: false, msg: "Nothing to update" });
    }
    const result = await Interview.updateById(Number(req.params.id), data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Delete (Admin only)
router.delete("/:id", DELETE_ONLY, async (req, res) => {
  try {
    const result = await Interview.deleteById(Number(req.params.id));
    res.status(result.status ? 200 : 404).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Publish / unpublish / close
router.patch("/:id/publish", MANAGE, async (req, res) => {
  try {
    const result = await Interview.setStatus(Number(req.params.id), "PUBLISHED");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

router.patch("/:id/unpublish", MANAGE, async (req, res) => {
  try {
    const result = await Interview.setStatus(Number(req.params.id), "DRAFT");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

router.patch("/:id/close", MANAGE, async (req, res) => {
  try {
    const result = await Interview.setStatus(Number(req.params.id), "CLOSED");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * STAFF: QUESTIONS
 * ================================================================ */

// ✅ List questions (full detail incl. expected answers)
router.get("/:id/questions", READ_ONLY, async (req, res) => {
  try {
    const result = await InterviewQuestion.FindByInterviewId(Number(req.params.id));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Add question(s) - body = object or array of objects
router.post("/:id/questions", MANAGE, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const invalid = items.find((q) => !q.iq_question || !String(q.iq_question).trim());
    if (invalid) return res.status(400).json({ status: false, msg: "Question text is required" });

    const badType = items.find((q) => q.iq_question_type && !InterviewQuestion.getTypes().includes(q.iq_question_type));
    if (badType) {
      return res.status(400).json({
        status: false,
        msg: `Invalid question type. Allowed: ${InterviewQuestion.getTypes().join(", ")}`,
      });
    }

    const result = await InterviewQuestion.AddMany(Number(req.params.id), items);
    res.status(result.status ? 201 : 400).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Reorder questions - body [{ iq_id, iq_order }]
router.put("/:id/questions/reorder", MANAGE, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: false, msg: "items: [{ iq_id, iq_order }] required" });
    }
    const result = await InterviewQuestion.reorder(items);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Update one question
router.put("/:id/questions/:questionId", MANAGE, async (req, res) => {
  try {
    const existing = await InterviewQuestion.FindByID(Number(req.params.questionId));
    if (!existing.status || existing.data.iq_interview_id !== Number(req.params.id)) {
      return res.status(404).json({ status: false, msg: "Question not found in this interview" });
    }
    const allowed = [
      "iq_question", "iq_question_type", "iq_category", "iq_difficulty",
      "iq_marks", "iq_expected_answer", "iq_options", "iq_correct_option", "iq_order",
    ];
    const data = {};
    for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k];
    const result = await InterviewQuestion.update(Number(req.params.questionId), data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Delete one question
router.delete("/:id/questions/:questionId", MANAGE, async (req, res) => {
  try {
    const existing = await InterviewQuestion.FindByID(Number(req.params.questionId));
    if (!existing.status || existing.data.iq_interview_id !== Number(req.params.id)) {
      return res.status(404).json({ status: false, msg: "Question not found in this interview" });
    }
    const result = await InterviewQuestion.delete(Number(req.params.questionId));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * STAFF: CANDIDATE ASSIGNMENT
 * ================================================================ */

// ✅ View candidates
router.get("/:id/candidates", READ_ONLY, async (req, res) => {
  try {
    const result = await InterviewCandidate.listByInterview(Number(req.params.id));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Available students for assignment (interview-module query; the legacy
//    /api/student/list belongs to the exam module and is not reused here)
router.get("/:id/candidates/available", READ_ONLY, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const like = `%${search}%`;
    const rows = await InterviewCandidate.query(
      `SELECT s.id, s.roll_number, s.name, s.email
       FROM students s
       WHERE s.id NOT IN (
               SELECT ic_student_id FROM interview_candidates WHERE ic_interview_id = ?
             )
         AND ( ? = '%%' OR s.name ILIKE ? OR s.roll_number ILIKE ? OR s.email ILIKE ? )
       ORDER BY s.name ASC
       LIMIT 200`,
      [Number(req.params.id), like, like, like, like]
    );
    res.json({ status: true, data: rows, msg: "Available students fetched" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Assign candidates - body { student_ids: number[] }
router.post("/:id/candidates", MANAGE, async (req, res) => {
  try {
    const studentIds = req.body?.student_ids;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ status: false, msg: "student_ids array is required" });
    }
    const result = await InterviewCandidate.assign(
      Number(req.params.id),
      studentIds.map(Number),
      req.staffId
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// ✅ Unassign a candidate
router.delete("/:id/candidates/:studentId", MANAGE, async (req, res) => {
  try {
    const result = await InterviewCandidate.unassign(
      Number(req.params.id),
      Number(req.params.studentId)
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

/* ================================================================
 * STAFF: ATTEMPTS
 * ================================================================ */

// ✅ View all attempts of an interview (with evaluation state)
router.get("/:id/attempts", READ_ONLY, async (req, res) => {
  try {
    const rows = await InterviewAttempt.listByInterview(Number(req.params.id));
    res.json({ status: true, data: rows, msg: "Attempts fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

module.exports = router;

/**
 * Candidate-side interview flow: start -> save answers -> submit, with server-authoritative timing.
 */
const Interview = require("../../models/interview/Interview");
const Question = require("../../models/interview/InterviewQuestion");
const Candidate = require("../../models/interview/InterviewCandidate");
const Attempt = require("../../models/interview/InterviewAttempt");
const Evaluation = require("../../models/interview/InterviewEvaluation");
const { gradeAttempt } = require("./gradingService");
const { GRACE_MS, computeExpiry, remainingSeconds, isExpired } = require("./timerService");
const { bad, forbidden, notFound, conflict } = require("./errors");

const EVENT_TYPES = new Set([
  "tab_switch", "window_blur", "fullscreen_exit", "copy_paste", "right_click", "devtools_open",
  "app_background", "camera_denied", "face_not_detected", "multiple_faces", "network_offline",
  "network_online", "heartbeat", "other",
]);
const CRITICAL = new Set(["devtools_open", "multiple_faces", "face_not_detected"]);
const MAX_EVENTS_PER_ATTEMPT = 1000;

/** Question as a candidate may see it: never the expected answer or the correct option. */
const candidateQuestion = (q) => ({
  question_id: q.question_id, question: q.question, question_type: q.question_type,
  category: q.category, difficulty: q.difficulty, marks: q.marks, options: q.options, display_order: q.display_order,
});

async function loadOwned(attemptId, userId) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt || attempt.candidate_id !== userId) throw notFound("Attempt not found");
  return attempt;
}

/** Close an attempt (submitted by the candidate, or by the clock). Idempotent. */
async function finalizeAttempt(attempt, interview, { byCandidate }) {
  const at = new Date();
  const expired = isExpired(attempt, at);
  let status = "submitted";
  if (expired) status = interview.auto_submit_on_expiry ? "auto_submitted" : "expired";
  const endTime = expired ? new Date(attempt.expires_at) : at;
  const duration = Math.max(0, Math.round((endTime.getTime() - new Date(attempt.start_time).getTime()) / 1000));
  const changed = await Attempt.closeIfOpen(attempt.attempt_id, {
    status, end_time: endTime, submission_time: status === "expired" ? null : at, duration_seconds: duration,
  });
  if (changed) await gradeAttempt(attempt.attempt_id);
  return Attempt.findById(attempt.attempt_id);
}

/** Lazily close an attempt whose time ran out. Returns the (possibly updated) attempt. */
async function expireIfNeeded(attempt) {
  if (attempt.status === "in_progress" && isExpired(attempt, new Date(), GRACE_MS)) {
    const interview = await Interview.findById(attempt.interview_id);
    return finalizeAttempt(attempt, interview, { byCandidate: false });
  }
  return attempt;
}

async function startAttempt(interviewId, userId) {
  const interview = await Interview.findById(interviewId);
  const assignment = interview && (await Candidate.find(interviewId, userId));
  if (!interview || interview.status !== "published" || !assignment) throw notFound("Interview not found");

  const now = new Date();
  if (interview.scheduled_start && now < new Date(interview.scheduled_start))
    throw conflict("This interview has not started yet", "NOT_STARTED", { scheduled_start: interview.scheduled_start });
  if (interview.scheduled_end && now >= new Date(interview.scheduled_end))
    throw conflict("This interview window has closed", "WINDOW_CLOSED");
  if (!interview.question_count) throw conflict("This interview has no questions yet", "NO_QUESTIONS");

  // resume a running attempt (closing it first if the clock already ran out)
  let open = await Attempt.findOpen(interviewId, userId);
  if (open) {
    open = await expireIfNeeded(open);
    if (open.status === "in_progress") return { attempt: open, resumed: true };
  }

  const used = await Attempt.count(interviewId, userId);
  if (used >= assignment.max_attempts) throw conflict("No attempts left for this interview", "NO_ATTEMPTS_LEFT");

  const expires = computeExpiry(now, interview.duration_minutes, interview.scheduled_end);
  try {
    const id = await Attempt.create({
      interview_id: interviewId, candidate_id: userId, attempt_no: used + 1,
      start_time: now, expires_at: expires, total_marks: interview.total_marks, status: "in_progress",
    });
    return { attempt: await Attempt.findById(id), resumed: false };
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") { // two start clicks raced; the unique partial index let one win
      const existing = await Attempt.findOpen(interviewId, userId);
      if (existing) return { attempt: existing, resumed: true };
    }
    throw e;
  }
}

async function getAttemptView(attemptId, userId) {
  let attempt = await loadOwned(attemptId, userId);
  attempt = await expireIfNeeded(attempt);
  const interview = await Interview.findById(attempt.interview_id);
  const questions = await Question.listByInterview(attempt.interview_id);
  const answers = await Attempt.listAnswers(attemptId);
  const now = new Date();
  return {
    attempt: { ...attempt, remaining_seconds: attempt.status === "in_progress" ? remainingSeconds(attempt, now) : 0 },
    interview: {
      interview_id: interview.interview_id, title: interview.title, instructions: interview.instructions,
      interview_type: interview.interview_type, duration_minutes: interview.duration_minutes,
      proctoring_enabled: interview.proctoring_enabled, show_result_to_candidate: interview.show_result_to_candidate,
    },
    questions: questions.map(candidateQuestion),
    answers: answers.map((a) => ({ question_id: a.question_id, answer_text: a.answer_text, selected_option: a.selected_option })),
    server_time: now.toISOString(),
  };
}

async function saveAnswers(attemptId, userId, payload) {
  let attempt = await loadOwned(attemptId, userId);
  if (attempt.status !== "in_progress")
    throw conflict("This attempt is already closed", "ATTEMPT_CLOSED", { status: attempt.status });
  if (isExpired(attempt, new Date(), GRACE_MS)) {
    attempt = await expireIfNeeded(attempt);
    throw conflict("Time is up; the interview was submitted automatically", "ATTEMPT_EXPIRED", { status: attempt.status });
  }
  if (!Array.isArray(payload) || !payload.length) throw bad("answers must be a non-empty array");
  if (payload.length > 500) throw bad("Too many answers in one request");

  const questions = await Question.listByInterview(attempt.interview_id);
  const byId = new Map(questions.map((q) => [q.question_id, q]));
  for (const a of payload) {
    const q = byId.get(Number(a.question_id));
    if (!q) throw bad(`question ${a.question_id} does not belong to this interview`);
    if (q.question_type === "mcq") {
      const keys = (q.options || []).map((o) => String(o.key));
      if (a.selected_option != null && a.selected_option !== "" && !keys.includes(String(a.selected_option)))
        throw bad(`Invalid option for question ${q.question_id}`);
    }
    if (a.answer_text != null && String(a.answer_text).length > 20000) throw bad("Answer is too long");
  }
  for (const a of payload) {
    const q = byId.get(Number(a.question_id));
    await Attempt.saveAnswer(attemptId, q.question_id, {
      answer_text: q.question_type === "mcq" ? null : (a.answer_text ?? null),
      selected_option: q.question_type === "mcq" ? (a.selected_option || null) : null,
    });
  }
  return { saved: payload.length, remaining_seconds: remainingSeconds(attempt) };
}

async function submitAttempt(attemptId, userId, finalAnswers) {
  let attempt = await loadOwned(attemptId, userId);
  if (attempt.status === "in_progress") {
    if (Array.isArray(finalAnswers) && finalAnswers.length && !isExpired(attempt, new Date(), GRACE_MS)) {
      await saveAnswers(attemptId, userId, finalAnswers);
    }
    const interview = await Interview.findById(attempt.interview_id);
    attempt = await finalizeAttempt(attempt, interview, { byCandidate: true });
  }
  return attempt; // already closed -> idempotent
}

async function recordEvent(attemptId, userId, evt, source) {
  const attempt = await loadOwned(attemptId, userId);
  if (attempt.status !== "in_progress") throw conflict("This attempt is already closed", "ATTEMPT_CLOSED");
  const type = String(evt && evt.event_type);
  if (!EVENT_TYPES.has(type)) throw bad("Unknown event_type");
  if ((await Attempt.countEvents(attemptId)) >= MAX_EVENTS_PER_ATTEMPT) return { recorded: false };
  const details = evt.details && JSON.stringify(evt.details).length <= 2000 ? evt.details : null;
  const severity = CRITICAL.has(type) ? "critical" : type === "heartbeat" || type === "network_online" ? "info" : "warning";
  await Attempt.addEvent(attemptId, { event_type: type, severity, details, source: source === "mobile" ? "mobile" : "web" });
  return { recorded: true };
}

/** What a candidate may learn about the outcome. Never exposes unfinished/unreleased scores. */
async function getResultForCandidate(attemptId, userId) {
  let attempt = await loadOwned(attemptId, userId);
  attempt = await expireIfNeeded(attempt);
  if (attempt.status === "in_progress") throw conflict("The interview is still in progress", "IN_PROGRESS");
  const interview = await Interview.findById(attempt.interview_id);
  const base = {
    attempt_id: attempt.attempt_id, interview_title: interview.title, status: attempt.status,
    submitted_at: attempt.submission_time || attempt.end_time, duration_seconds: attempt.duration_seconds,
    evaluation_status: attempt.evaluation_status,
  };
  if (!interview.show_result_to_candidate) return { ...base, result_visible: false, message: "Your responses were submitted. Results are not released to candidates for this interview." };
  if (attempt.evaluation_status === "pending_manual_review") return { ...base, result_visible: false, message: "Your responses are pending manual review." };
  const evaluation = await Evaluation.findByAttempt(attemptId);
  const passed = interview.passing_percentage == null || attempt.percentage == null ? null : attempt.percentage >= interview.passing_percentage;
  return {
    ...base, result_visible: true, score: attempt.score, total_marks: attempt.total_marks,
    percentage: attempt.percentage, passed, comments: evaluation ? evaluation.comments : null,
  };
}

/** Background safety net: close every attempt whose deadline passed even if the candidate vanished. */
async function sweepExpired() {
  const ids = await Attempt.expiredOpen();
  for (const id of ids) {
    try { const a = await Attempt.findById(id); if (a) await expireIfNeeded(a); }
    catch (e) { console.error("interview sweep failed for attempt", id, e.message); }
  }
  // self-heal: closed but never graded
  for (const id of await Attempt.closedUngraded()) {
    try { await gradeAttempt(id); }
    catch (e) { console.error("interview regrade failed for attempt", id, e.message); }
  }
  return ids.length;
}

let sweeperStarted = false;
function startExpirySweeper(intervalMs = 60000) {
  if (sweeperStarted) return;
  sweeperStarted = true;
  const t = setInterval(() => sweepExpired().catch((e) => console.error("interview sweeper:", e.message)), intervalMs);
  if (t.unref) t.unref();
}

module.exports = {
  startAttempt, getAttemptView, saveAnswers, submitAttempt, recordEvent, getResultForCandidate,
  finalizeAttempt, expireIfNeeded, sweepExpired, startExpirySweeper, candidateQuestion,
};

/** Interview management (admin side) + the candidate-safe interview detail. */
const Interview = require("../../models/interview/Interview");
const Question = require("../../models/interview/InterviewQuestion");
const Candidate = require("../../models/interview/InterviewCandidate");
const Attempt = require("../../models/interview/InterviewAttempt");
const { validateInterview, validateQuestion, assertQuestionConsistent, parseId } = require("./validators");
const { bad, notFound, conflict } = require("./errors");

async function mustGet(id) {
  const i = await Interview.findById(id);
  if (!i) throw notFound("Interview not found");
  return i;
}

async function createInterview(body, userId) {
  const { interview_types } = await Interview.types();
  const data = validateInterview(body, { validTypes: interview_types.map((t) => t.type_code) });
  const id = await Interview.create(data, userId);
  return Interview.findById(id);
}

async function updateInterview(id, body) {
  const current = await mustGet(id);
  const { interview_types } = await Interview.types();
  const data = validateInterview(body, { partial: true, validTypes: interview_types.map((t) => t.type_code) });
  const start = data.scheduled_start !== undefined ? data.scheduled_start : current.scheduled_start;
  const end = data.scheduled_end !== undefined ? data.scheduled_end : current.scheduled_end;
  if (start && end && new Date(end) <= new Date(start)) throw bad("scheduled_end must be after scheduled_start");
  if (current.attempt_count > 0 && data.duration_minutes !== undefined && data.duration_minutes !== current.duration_minutes)
    throw conflict("Duration cannot change after candidates have started attempts", "HAS_ATTEMPTS");
  await Interview.update(id, data);
  return Interview.findById(id);
}

async function deleteInterview(id) {
  const i = await mustGet(id);
  if (i.attempt_count > 0)
    throw conflict("This interview has attempts and cannot be deleted. Archive it instead.", "HAS_ATTEMPTS");
  await Interview.remove(id);
}

async function publish(id) {
  const i = await mustGet(id);
  if (i.status === "published") return i;
  const questions = await Question.listByInterview(id);
  if (!questions.length) throw conflict("Add at least one question before publishing", "NO_QUESTIONS");
  const typeMap = await Question.typeMap();
  for (const q of questions) assertQuestionConsistent(q, typeMap);
  await Interview.setStatus(id, "published");
  return Interview.findById(id);
}

async function unpublish(id, status = "draft") {
  await mustGet(id);
  await Interview.setStatus(id, status === "archived" ? "archived" : "draft");
  return Interview.findById(id);
}

/* ---------- questions ---------- */
async function guardQuestionEdit(id) {
  const i = await mustGet(id);
  if (i.attempt_count > 0)
    throw conflict("Questions are locked because candidates already attempted this interview", "HAS_ATTEMPTS");
  return i;
}

async function addQuestion(interviewId, body) {
  await guardQuestionEdit(interviewId);
  const typeMap = await Question.typeMap();
  const data = validateQuestion({ difficulty: "medium", marks: 1, ...body }, typeMap);
  assertQuestionConsistent(data, typeMap);
  if (!typeMap[data.question_type].requires_options) { data.options = null; data.correct_option = null; }
  const qid = await Question.create(interviewId, data);
  return Question.findById(interviewId, qid);
}

async function updateQuestion(interviewId, questionId, body) {
  await guardQuestionEdit(interviewId);
  const existing = await Question.findById(interviewId, questionId);
  if (!existing) throw notFound("Question not found");
  const typeMap = await Question.typeMap();
  const data = validateQuestion(body, typeMap, { partial: true });
  const merged = { ...existing, ...data };
  assertQuestionConsistent(merged, typeMap);
  if (!typeMap[merged.question_type].requires_options) { data.options = null; data.correct_option = null; }
  await Question.update(interviewId, questionId, data);
  return Question.findById(interviewId, questionId);
}

async function deleteQuestion(interviewId, questionId) {
  await guardQuestionEdit(interviewId);
  if (!(await Question.remove(interviewId, questionId))) throw notFound("Question not found");
}

async function reorderQuestions(interviewId, orderedIds) {
  await guardQuestionEdit(interviewId);
  if (!Array.isArray(orderedIds)) throw bad("order must be an array of question ids");
  const ids = orderedIds.map((v) => parseId(v, "question id"));
  const current = (await Question.listByInterview(interviewId)).map((q) => q.question_id).sort((a, b) => a - b);
  if (JSON.stringify([...ids].sort((a, b) => a - b)) !== JSON.stringify(current))
    throw bad("order must contain every question of the interview exactly once");
  await Question.reorder(interviewId, ids);
  return Question.listByInterview(interviewId);
}

/* ---------- candidates ---------- */
async function assignCandidates(interviewId, candidateIds, maxAttempts, assignedBy) {
  await mustGet(interviewId);
  if (!Array.isArray(candidateIds) || !candidateIds.length) throw bad("candidate_ids must be a non-empty array");
  const ids = [...new Set(candidateIds.map(String))];
  const max = maxAttempts === undefined ? 1 : Number(maxAttempts);
  if (!Number.isInteger(max) || max < 1 || max > 20) throw bad("max_attempts must be between 1 and 20");
  const valid = await Candidate.validCandidateIds(ids);
  const invalid = ids.filter((x) => !valid.includes(x));
  if (invalid.length) throw bad("Some users do not exist or do not have the Candidate role", "INVALID_CANDIDATES", { invalid });
  const added = await Candidate.assign(interviewId, ids, max, assignedBy);
  return { added, already_assigned: ids.length - added };
}

async function updateCandidateAttempts(interviewId, candidateId, maxAttempts) {
  await mustGet(interviewId);
  const max = Number(maxAttempts);
  if (!Number.isInteger(max) || max < 1 || max > 20) throw bad("max_attempts must be between 1 and 20");
  const a = await Candidate.find(interviewId, candidateId);
  if (!a) throw notFound("Candidate is not assigned");
  const used = await Attempt.count(interviewId, candidateId);
  if (max < used) throw conflict(`This candidate already used ${used} attempt(s)`, "BELOW_ATTEMPTS_USED");
  await Candidate.updateMaxAttempts(interviewId, candidateId, max);
  return { candidate_id: candidateId, max_attempts: max, attempts_used: used };
}

async function removeCandidate(interviewId, candidateId) {
  await mustGet(interviewId);
  if ((await Attempt.count(interviewId, candidateId)) > 0)
    throw conflict("This candidate already has attempts and cannot be removed", "HAS_ATTEMPTS");
  if (!(await Candidate.remove(interviewId, candidateId))) throw notFound("Candidate is not assigned");
}

/** Interview detail for a candidate: only if published AND assigned; never reveals answers. */
async function candidateInterviewDetail(interviewId, userId) {
  const i = await Interview.findById(interviewId);
  const a = i && (await Candidate.find(interviewId, userId));
  if (!i || i.status !== "published" || !a) throw notFound("Interview not found");
  const used = await Attempt.count(interviewId, userId);
  const open = await Attempt.findOpen(interviewId, userId);
  return {
    interview_id: i.interview_id, title: i.title, description: i.description, instructions: i.instructions,
    interview_type: i.interview_type, duration_minutes: i.duration_minutes, scheduled_start: i.scheduled_start,
    scheduled_end: i.scheduled_end, question_count: i.question_count, total_marks: i.total_marks,
    proctoring_enabled: i.proctoring_enabled, max_attempts: a.max_attempts, attempts_used: used,
    open_attempt_id: open ? open.attempt_id : null,
  };
}

module.exports = {
  createInterview, updateInterview, deleteInterview, publish, unpublish,
  addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
  assignCandidates, updateCandidateAttempts, removeCandidate, candidateInterviewDetail,
};

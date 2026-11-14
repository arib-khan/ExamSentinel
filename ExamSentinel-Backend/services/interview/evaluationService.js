/** Manual evaluation by an authorized evaluator/admin. */
const Interview = require("../../models/interview/Interview");
const Question = require("../../models/interview/InterviewQuestion");
const Attempt = require("../../models/interview/InterviewAttempt");
const Evaluation = require("../../models/interview/InterviewEvaluation");
const { hasContent, round2 } = require("./gradingService");
const { expireIfNeeded } = require("./attemptService");
const { bad, notFound, conflict } = require("./errors");

async function loadAttempt(attemptId) {
  let attempt = await Attempt.findById(attemptId);
  if (!attempt) throw notFound("Attempt not found");
  attempt = await expireIfNeeded(attempt);
  return attempt;
}

async function getForEvaluation(attemptId) {
  const attempt = await loadAttempt(attemptId);
  const interview = await Interview.findById(attempt.interview_id);
  const questions = await Question.listByInterview(attempt.interview_id);
  const answers = await Attempt.listAnswers(attemptId);
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const typeMap = await Question.typeMap();
  const events = await Attempt.listEvents(attemptId);
  const user = await require("../../models/interview/_base").query(
    "SELECT user_id, user_name FROM user WHERE user_id = ?", [attempt.candidate_id]);
  return {
    attempt,
    interview: { interview_id: interview.interview_id, title: interview.title, interview_type: interview.interview_type, passing_percentage: interview.passing_percentage },
    candidate: user[0] || { user_id: attempt.candidate_id, user_name: null },
    evaluation: await Evaluation.findByAttempt(attemptId),
    items: questions.map((q) => {
      const a = byQ.get(q.question_id) || null;
      return {
        question: q, // evaluators see expected_answer + correct_option
        auto_gradable: !!(typeMap[q.question_type] && typeMap[q.question_type].auto_gradable),
        answer: a && { answer_id: a.answer_id, answer_text: a.answer_text, selected_option: a.selected_option,
          marks_awarded: a.marks_awarded, is_auto_graded: !!a.is_auto_graded, evaluator_comment: a.evaluator_comment },
        needs_review: !!(a && hasContent(a) && !(typeMap[q.question_type] && typeMap[q.question_type].auto_gradable)),
      };
    }),
    events,
  };
}

async function gradeAnswers(attemptId, evaluatorId, grades, comments) {
  const attempt = await loadAttempt(attemptId);
  if (attempt.status === "in_progress") throw conflict("The candidate has not finished this interview", "IN_PROGRESS");
  const evaluation = await Evaluation.ensure(attemptId, { status: "pending" });
  if (evaluation.status === "finalized") throw conflict("Evaluation is already finalized", "ALREADY_FINALIZED");
  if (!Array.isArray(grades)) throw bad("grades must be an array");

  const questions = await Question.listByInterview(attempt.interview_id);
  const qById = new Map(questions.map((q) => [q.question_id, q]));
  const typeMap = await Question.typeMap();
  const answers = await Attempt.listAnswers(attemptId);
  const aByQ = new Map(answers.map((a) => [a.question_id, a]));

  for (const g of grades) { // validate everything first, then write
    const q = qById.get(Number(g.question_id));
    if (!q) throw bad(`question ${g.question_id} is not part of this interview`);
    if (typeMap[q.question_type] && typeMap[q.question_type].auto_gradable)
      throw bad(`question ${q.question_id} is auto-graded and cannot be changed manually`);
    const a = aByQ.get(q.question_id);
    if (!a) throw bad(`question ${q.question_id} was not answered by the candidate`);
    const m = Number(g.marks);
    if (g.marks === null || g.marks === "" || Number.isNaN(m) || m < 0 || m > q.marks)
      throw bad(`marks for question ${q.question_id} must be between 0 and ${q.marks}`);
  }
  for (const g of grades) {
    const a = aByQ.get(Number(g.question_id));
    await Attempt.setAnswerGrade(a.answer_id, round2(Number(g.marks)), false, g.comment ?? null);
  }
  const fields = { status: "in_progress", evaluator_id: evaluatorId };
  if (comments !== undefined) fields.comments = comments;
  await Evaluation.update(attemptId, fields);
  return getForEvaluation(attemptId);
}

async function finalize(attemptId, evaluatorId, comments) {
  const attempt = await loadAttempt(attemptId);
  if (attempt.status === "in_progress") throw conflict("The candidate has not finished this interview", "IN_PROGRESS");
  const detail = await getForEvaluation(attemptId);
  const pending = detail.items.filter((i) => i.needs_review && (!i.answer || i.answer.marks_awarded == null))
    .map((i) => i.question.question_id);
  if (pending.length) throw conflict("Some answers still need a grade", "GRADES_PENDING", { pending_question_ids: pending });

  const score = round2(await Attempt.sumMarks(attemptId));
  const total = detail.items.reduce((s, i) => s + i.question.marks, 0);
  const percentage = total > 0 ? round2((score / total) * 100) : 0;
  const changed = await Evaluation.finalizeOnce(attemptId, {
    status: "finalized", total_score: score, evaluator_id: evaluatorId, finalized_at: new Date(),
    ...(comments !== undefined ? { comments } : {}),
  });
  if (!changed) throw conflict("Evaluation is already finalized", "ALREADY_FINALIZED");
  await Attempt.update(attemptId, { score, total_marks: total, percentage, evaluation_status: "evaluated" });
  return getForEvaluation(attemptId);
}

module.exports = { getForEvaluation, gradeAnswers, finalize };

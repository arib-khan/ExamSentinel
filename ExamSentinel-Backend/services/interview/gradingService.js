/**
 * Grading rules (no invented scores):
 *  - MCQ questions are scored automatically (full marks for the correct option, else 0).
 *  - Any other question type that the candidate actually answered needs a human grade.
 *    -> attempt.evaluation_status = 'pending_manual_review', percentage stays NULL.
 *  - If nothing needs a human (all MCQ, or manual questions left blank = 0) the attempt is auto_evaluated.
 */
const Question = require("../../models/interview/InterviewQuestion");
const Attempt = require("../../models/interview/InterviewAttempt");
const Evaluation = require("../../models/interview/InterviewEvaluation");

const hasContent = (a) => !!(a && ((a.answer_text && String(a.answer_text).trim()) || a.selected_option));
const round2 = (n) => Math.round(n * 100) / 100;

async function gradeAttempt(attemptId) {
  const attempt = await Attempt.findById(attemptId);
  const questions = await Question.listByInterview(attempt.interview_id);
  const answers = await Attempt.listAnswers(attemptId);
  const typeMap = await Question.typeMap();
  const byQ = new Map(answers.map((a) => [a.question_id, a]));

  let total = 0, autoScore = 0, needsManual = false;
  for (const q of questions) {
    total += q.marks;
    const ans = byQ.get(q.question_id);
    if (typeMap[q.question_type] && typeMap[q.question_type].auto_gradable) {
      if (ans) {
        const ok = q.correct_option && ans.selected_option === q.correct_option;
        const m = ok ? q.marks : 0;
        await Attempt.setAnswerGrade(ans.answer_id, m, true);
        autoScore += m;
      }
    } else if (hasContent(ans)) {
      needsManual = true;
    }
  }

  if (!needsManual) {
    const score = round2(autoScore);
    const percentage = total > 0 ? round2((score / total) * 100) : 0;
    await Attempt.update(attemptId, { score, total_marks: total, percentage, evaluation_status: "auto_evaluated" });
    await Evaluation.ensure(attemptId, { status: "finalized", total_score: score, finalized_at: new Date() });
  } else {
    await Attempt.update(attemptId, {
      score: round2(autoScore), total_marks: total, percentage: null, evaluation_status: "pending_manual_review",
    });
    await Evaluation.ensure(attemptId, { status: "pending" });
  }
  return { total, autoScore, needsManual };
}

module.exports = { gradeAttempt, hasContent, round2 };

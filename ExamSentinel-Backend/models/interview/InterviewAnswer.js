/**
 * Interview module :: InterviewAnswer model
 * (answers stored separately from attempts; one row per question)
 */
const pool = require("../../config/db");

class InterviewAnswer {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error("InterviewAnswer DB Error:", err);
      throw err;
    }
  }

  // ✅ Save/upsert an answer. Read-then-write because the db shim's
  // ON DUPLICATE KEY translation always conflicts on the primary key;
  // the natural conflict target here is (attempt, question).
  static async save(attemptId, questionId, { selected_option, answer_text, time_spent_seconds }) {
    const existing = await this.findByAttemptAndQuestion(attemptId, questionId);
    const now = new Date();
    if (existing) {
      await this.query("UPDATE interview_answers SET ? WHERE ians_id = ?", [
        {
          ians_selected_option: selected_option ?? existing.ians_selected_option,
          ians_answer_text: answer_text ?? existing.ians_answer_text,
          ians_time_spent_seconds: time_spent_seconds ?? existing.ians_time_spent_seconds,
          ians_updated_at: now,
        },
        existing.ians_id,
      ]);
      return { created: false };
    }
    await this.query("INSERT INTO interview_answers SET ?", {
      ians_attempt_id: attemptId,
      ians_question_id: questionId,
      ians_selected_option: selected_option ?? null,
      ians_answer_text: answer_text ?? null,
      ians_time_spent_seconds: time_spent_seconds || 0,
    });
    return { created: true };
  }

  static async findByAttemptAndQuestion(attemptId, questionId) {
    const rows = await this.query(
      "SELECT * FROM interview_answers WHERE ians_attempt_id = ? AND ians_question_id = ?",
      [attemptId, questionId]
    );
    return rows.length ? rows[0] : null;
  }

  // ✅ Candidate view: answers only (no expected answer / marks)
  static async listByAttempt(attemptId) {
    return this.query(
      "SELECT ians_id, ians_attempt_id, ians_question_id, ians_selected_option, ians_answer_text, ians_time_spent_seconds, ians_marks_awarded, ians_evaluator_comment FROM interview_answers WHERE ians_attempt_id = ?",
      [attemptId]
    );
  }

  // ✅ Evaluator view: answers joined with the full question
  static async listForEvaluation(attemptId) {
    return this.query(
      `SELECT ans.*, q.iq_question, q.iq_question_type, q.iq_category, q.iq_difficulty,
              q.iq_marks, q.iq_expected_answer, q.iq_options, q.iq_correct_option, q.iq_order
       FROM interview_answers ans
       INNER JOIN interview_questions q ON q.iq_id = ans.ians_question_id
       WHERE ans.ians_attempt_id = ?
       ORDER BY q.iq_order ASC, q.iq_id ASC`,
      [attemptId]
    );
  }

  // ✅ Award marks + comment for one answer (manual evaluation)
  static async awardMarks(answerId, marks, comment) {
    await this.query("UPDATE interview_answers SET ? WHERE ians_id = ?", [
      {
        ians_marks_awarded: marks,
        ians_evaluator_comment: comment ?? null,
        ians_updated_at: new Date(),
      },
      answerId,
    ]);
  }

  // ✅ Auto-evaluation writes (MCQ scoring handled by evaluationService)
  static async setAutoResult(answerId, marks) {
    await this.query("UPDATE interview_answers SET ? WHERE ians_id = ?", [
      { ians_marks_awarded: marks, ians_is_auto_evaluated: 1, ians_updated_at: new Date() },
      answerId,
    ]);
  }
}

module.exports = InterviewAnswer;

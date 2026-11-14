const { pool, query, num } = require("./_base");

const shape = (r) => r && ({
  ...r, score: num(r.score), total_marks: num(r.total_marks), percentage: num(r.percentage),
  attempt_id: num(r.attempt_id), interview_id: num(r.interview_id),
});

class InterviewAttempt {
  /* ---------- attempts ---------- */
  static async findById(id) {
    const rows = await query("SELECT * FROM interview_attempts WHERE attempt_id = ?", [id]);
    return shape(rows[0]) || null;
  }

  static async findOpen(interviewId, candidateId) {
    const rows = await query(
      "SELECT * FROM interview_attempts WHERE interview_id = ? AND candidate_id = ? AND status = 'in_progress'",
      [interviewId, candidateId]);
    return shape(rows[0]) || null;
  }

  static async count(interviewId, candidateId) {
    const rows = await query(
      "SELECT COUNT(*) AS n FROM interview_attempts WHERE interview_id = ? AND candidate_id = ?", [interviewId, candidateId]);
    return Number(rows[0].n);
  }

  static async create(row) {
    const [res] = await pool.query("INSERT INTO interview_attempts SET ?", row);
    return res.insertId;
  }

  /** Close an attempt only if it is still running. Returns affected rows (0 = someone else already closed it). */
  static async closeIfOpen(id, fields) {
    const [res] = await pool.query(
      "UPDATE interview_attempts SET ? WHERE attempt_id = ? AND status = 'in_progress'", [fields, id]);
    return res.affectedRows;
  }

  static async update(id, fields) {
    const [res] = await pool.query("UPDATE interview_attempts SET ? WHERE attempt_id = ?", [fields, id]);
    return res.affectedRows;
  }

  static async listByInterview(interviewId) {
    const rows = await query(
      `SELECT a.*, u.user_name AS candidate_name,
              (SELECT COUNT(*) FROM interview_events e WHERE e.attempt_id = a.attempt_id AND e.severity <> 'info') AS flagged_events
         FROM interview_attempts a LEFT JOIN user u ON u.user_id = a.candidate_id
        WHERE a.interview_id = ? ORDER BY a.attempt_id DESC`, [interviewId]);
    return rows.map((r) => ({ ...shape(r), flagged_events: num(r.flagged_events) }));
  }

  static async expiredOpen(limit = 200) {
    const rows = await query(
      "SELECT attempt_id FROM interview_attempts WHERE status = 'in_progress' AND expires_at < ? ORDER BY expires_at LIMIT ?",
      [new Date(Date.now() - 5000), limit]); // 5 s grace, same as answer saving
    return rows.map((r) => Number(r.attempt_id));
  }

  /** Closed attempts that never got graded (e.g. the server stopped between closing and grading). */
  static async closedUngraded(limit = 200) {
    const rows = await query(
      "SELECT attempt_id FROM interview_attempts WHERE status <> 'in_progress' AND evaluation_status = 'not_submitted' ORDER BY attempt_id LIMIT ?", [limit]);
    return rows.map((r) => Number(r.attempt_id));
  }

  /* ---------- answers ---------- */
  static async listAnswers(attemptId) {
    const rows = await query("SELECT * FROM interview_answers WHERE attempt_id = ? ORDER BY question_id", [attemptId]);
    return rows.map((r) => ({ ...r, marks_awarded: num(r.marks_awarded), question_id: num(r.question_id), answer_id: num(r.answer_id) }));
  }

  /** Insert-or-update one answer (UPDATE first; INSERT if nothing matched; retry once on a concurrent insert). */
  static async saveAnswer(attemptId, questionId, { answer_text, selected_option }) {
    const vals = [answer_text ?? null, selected_option ?? null, new Date(), attemptId, questionId];
    const upd = () => pool.query(
      `UPDATE interview_answers SET answer_text = ?, selected_option = ?, answered_at = ?
        WHERE attempt_id = ? AND question_id = ?`, vals);
    let [res] = await upd();
    if (res.affectedRows > 0) return;
    try {
      await pool.query("INSERT INTO interview_answers SET ?", {
        attempt_id: attemptId, question_id: questionId,
        answer_text: answer_text ?? null, selected_option: selected_option ?? null,
      });
    } catch (e) {
      if (e.code !== "ER_DUP_ENTRY") throw e;
      await upd();
    }
  }

  static async setAnswerGrade(answerId, marks, auto, comment) {
    const fields = { marks_awarded: marks, is_auto_graded: auto ? 1 : 0 };
    if (comment !== undefined) fields.evaluator_comment = comment;
    await pool.query("UPDATE interview_answers SET ? WHERE answer_id = ?", [fields, answerId]);
  }

  static async sumMarks(attemptId) {
    const rows = await query(
      "SELECT COALESCE(SUM(marks_awarded), 0) AS s FROM interview_answers WHERE attempt_id = ?", [attemptId]);
    return Number(rows[0].s);
  }

  /* ---------- proctoring / security events ---------- */
  static async addEvent(attemptId, { event_type, severity, details, source }) {
    await pool.query("INSERT INTO interview_events SET ?", {
      attempt_id: attemptId, event_type, severity: severity || "info",
      details: details ? JSON.stringify(details) : null, source: source || "web",
    });
  }
  static async countEvents(attemptId) {
    const rows = await query("SELECT COUNT(*) AS n FROM interview_events WHERE attempt_id = ?", [attemptId]);
    return Number(rows[0].n);
  }
  static async listEvents(attemptId) {
    return query("SELECT * FROM interview_events WHERE attempt_id = ? ORDER BY occurred_at, event_id", [attemptId]);
  }
}
module.exports = InterviewAttempt;

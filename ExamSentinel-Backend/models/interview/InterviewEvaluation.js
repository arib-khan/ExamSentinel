const { pool, query, num } = require("./_base");

const shape = (r) => r && ({ ...r, total_score: num(r.total_score) });

class InterviewEvaluation {
  static async findByAttempt(attemptId) {
    const rows = await query("SELECT * FROM interview_evaluations WHERE attempt_id = ?", [attemptId]);
    return shape(rows[0]) || null;
  }

  /** Create the evaluation row for an attempt if it does not exist yet. */
  static async ensure(attemptId, fields) {
    const existing = await this.findByAttempt(attemptId);
    if (existing) return existing;
    try {
      await pool.query("INSERT INTO interview_evaluations SET ?", { attempt_id: attemptId, ...fields });
    } catch (e) { if (e.code !== "ER_DUP_ENTRY") throw e; }
    return this.findByAttempt(attemptId);
  }

  static async update(attemptId, fields) {
    const [res] = await pool.query("UPDATE interview_evaluations SET ? WHERE attempt_id = ?", [fields, attemptId]);
    return res.affectedRows;
  }

  /** Finalize exactly once (returns 0 if it was already finalized). */
  static async finalizeOnce(attemptId, fields) {
    const [res] = await pool.query(
      "UPDATE interview_evaluations SET ? WHERE attempt_id = ? AND status <> 'finalized'", [fields, attemptId]);
    return res.affectedRows;
  }
}
module.exports = InterviewEvaluation;

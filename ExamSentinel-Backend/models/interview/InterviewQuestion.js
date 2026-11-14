const { pool, query, num, pick } = require("./_base");

const FIELDS = ["question", "question_type", "category", "difficulty", "marks", "expected_answer",
  "options", "correct_option", "display_order"];

const shape = (r) => r && ({ ...r, marks: num(r.marks) });

class InterviewQuestion {
  static async listByInterview(interviewId) {
    const rows = await query(
      "SELECT * FROM interview_questions WHERE interview_id = ? ORDER BY display_order, question_id", [interviewId]);
    return rows.map(shape);
  }

  static async findById(interviewId, questionId) {
    const rows = await query(
      "SELECT * FROM interview_questions WHERE interview_id = ? AND question_id = ?", [interviewId, questionId]);
    return shape(rows[0]) || null;
  }

  static async nextOrder(interviewId) {
    const rows = await query(
      "SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM interview_questions WHERE interview_id = ?", [interviewId]);
    return Number(rows[0].n);
  }

  static async create(interviewId, data) {
    const row = { ...pick(data, FIELDS), interview_id: interviewId };
    if (row.options !== undefined && row.options !== null) row.options = JSON.stringify(row.options);
    if (row.display_order === undefined) row.display_order = await this.nextOrder(interviewId);
    const [res] = await pool.query("INSERT INTO interview_questions SET ?", row);
    return res.insertId;
  }

  static async update(interviewId, questionId, data) {
    const row = pick(data, FIELDS);
    if (row.options !== undefined && row.options !== null) row.options = JSON.stringify(row.options);
    if (!Object.keys(row).length) return 0;
    const [res] = await pool.query(
      "UPDATE interview_questions SET ? WHERE interview_id = ? AND question_id = ?", [row, interviewId, questionId]);
    return res.affectedRows;
  }

  static async remove(interviewId, questionId) {
    const [res] = await pool.query(
      "DELETE FROM interview_questions WHERE interview_id = ? AND question_id = ?", [interviewId, questionId]);
    return res.affectedRows;
  }

  /** orderedIds = full list of question ids in the new order. */
  static async reorder(interviewId, orderedIds) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < orderedIds.length; i++) {
        await conn.query(
          "UPDATE interview_questions SET display_order = ? WHERE interview_id = ? AND question_id = ?",
          [i + 1, interviewId, orderedIds[i]]);
      }
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  }

  static async typeMap() {
    const rows = await query("SELECT type_code, auto_gradable, requires_options FROM interview_question_types");
    const m = {};
    for (const r of rows) m[r.type_code] = { auto_gradable: !!r.auto_gradable, requires_options: !!r.requires_options };
    return m;
  }
}
module.exports = InterviewQuestion;

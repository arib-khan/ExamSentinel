const { query, num, pick } = require("./_base");

const FIELDS = ["title", "description", "instructions", "interview_type", "duration_minutes",
  "scheduled_start", "scheduled_end", "passing_percentage", "auto_submit_on_expiry",
  "show_result_to_candidate", "proctoring_enabled"];

const shape = (r) => r && ({
  ...r,
  question_count: num(r.question_count), candidate_count: num(r.candidate_count),
  attempt_count: num(r.attempt_count), total_marks: num(r.total_marks),
  passing_percentage: num(r.passing_percentage),
});

const COUNTS = `
  (SELECT COUNT(*) FROM interview_questions q WHERE q.interview_id = i.interview_id) AS question_count,
  (SELECT COALESCE(SUM(q.marks), 0) FROM interview_questions q WHERE q.interview_id = i.interview_id) AS total_marks,
  (SELECT COUNT(*) FROM interview_candidates c WHERE c.interview_id = i.interview_id) AS candidate_count,
  (SELECT COUNT(*) FROM interview_attempts a WHERE a.interview_id = i.interview_id) AS attempt_count`;

class Interview {
  static async list({ status, type } = {}) {
    const where = []; const params = [];
    if (status) { where.push("i.status = ?"); params.push(status); }
    if (type) { where.push("i.interview_type = ?"); params.push(type); }
    const rows = await query(
      `SELECT i.*, ${COUNTS} FROM interviews i ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY i.created_at DESC`, params);
    return rows.map(shape);
  }

  static async findById(id) {
    const rows = await query(`SELECT i.*, ${COUNTS} FROM interviews i WHERE i.interview_id = ?`, [id]);
    return shape(rows[0]) || null;
  }

  static async create(data, createdBy) {
    const row = { ...pick(data, FIELDS), created_by: createdBy, status: "draft" };
    const [res] = await require("./_base").pool.query("INSERT INTO interviews SET ?", row);
    return res.insertId;
  }

  static async update(id, data) {
    const row = pick(data, FIELDS);
    if (!Object.keys(row).length) return 0;
    const [res] = await require("./_base").pool.query("UPDATE interviews SET ? WHERE interview_id = ?", [row, id]);
    return res.affectedRows;
  }

  static async setStatus(id, status) {
    const [res] = await require("./_base").pool.query(
      "UPDATE interviews SET status = ? WHERE interview_id = ?", [status, id]);
    return res.affectedRows;
  }

  static async remove(id) {
    const [res] = await require("./_base").pool.query("DELETE FROM interviews WHERE interview_id = ?", [id]);
    return res.affectedRows;
  }

  static async types() {
    return {
      interview_types: await query("SELECT type_code, label FROM interview_types WHERE is_active = 1 ORDER BY label"),
      question_types: await query(
        "SELECT type_code, label, auto_gradable, requires_options FROM interview_question_types WHERE is_active = 1 ORDER BY label"),
    };
  }

  /** Interviews assigned to a candidate (published only) with their attempt summary. */
  static async listForCandidate(candidateId) {
    const rows = await query(
      `SELECT i.interview_id, i.title, i.description, i.interview_type, i.duration_minutes,
              i.scheduled_start, i.scheduled_end, i.status, i.show_result_to_candidate, ic.max_attempts,
              (SELECT COUNT(*) FROM interview_attempts a WHERE a.interview_id = i.interview_id AND a.candidate_id = ic.candidate_id) AS attempts_used,
              (SELECT a.attempt_id FROM interview_attempts a WHERE a.interview_id = i.interview_id AND a.candidate_id = ic.candidate_id ORDER BY a.attempt_id DESC LIMIT 1) AS last_attempt_id,
              (SELECT a.status FROM interview_attempts a WHERE a.interview_id = i.interview_id AND a.candidate_id = ic.candidate_id ORDER BY a.attempt_id DESC LIMIT 1) AS last_attempt_status,
              (SELECT a.expires_at FROM interview_attempts a WHERE a.interview_id = i.interview_id AND a.candidate_id = ic.candidate_id ORDER BY a.attempt_id DESC LIMIT 1) AS last_attempt_expires_at
         FROM interview_candidates ic
         JOIN interviews i ON i.interview_id = ic.interview_id
        WHERE ic.candidate_id = ? AND i.status = 'published'
        ORDER BY i.scheduled_start NULLS LAST, i.interview_id DESC`, [candidateId]);
    return rows.map((r) => ({ ...r, attempts_used: num(r.attempts_used) }));
  }
}
module.exports = Interview;

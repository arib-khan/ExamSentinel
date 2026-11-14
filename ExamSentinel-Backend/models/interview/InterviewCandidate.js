const { pool, query, num } = require("./_base");

class InterviewCandidate {
  static async list(interviewId) {
    const rows = await query(
      `SELECT ic.*, u.user_name AS candidate_name,
              (SELECT COUNT(*) FROM interview_attempts a WHERE a.interview_id = ic.interview_id AND a.candidate_id = ic.candidate_id) AS attempts_used
         FROM interview_candidates ic
         LEFT JOIN user u ON u.user_id = ic.candidate_id
        WHERE ic.interview_id = ? ORDER BY ic.assigned_at DESC`, [interviewId]);
    return rows.map((r) => ({ ...r, attempts_used: num(r.attempts_used) }));
  }

  static async find(interviewId, candidateId) {
    const rows = await query(
      "SELECT * FROM interview_candidates WHERE interview_id = ? AND candidate_id = ?", [interviewId, candidateId]);
    return rows[0] || null;
  }

  /** Assign many; already-assigned candidates are skipped. Returns how many were newly added. */
  static async assign(interviewId, candidateIds, maxAttempts, assignedBy) {
    const rows = candidateIds.map((id) => [interviewId, id, maxAttempts, assignedBy]);
    const [res] = await pool.query(
      "INSERT IGNORE INTO interview_candidates (interview_id, candidate_id, max_attempts, assigned_by) VALUES ?", [rows]);
    return res.affectedRows;
  }

  static async updateMaxAttempts(interviewId, candidateId, maxAttempts) {
    const [res] = await pool.query(
      "UPDATE interview_candidates SET max_attempts = ? WHERE interview_id = ? AND candidate_id = ?",
      [maxAttempts, interviewId, candidateId]);
    return res.affectedRows;
  }

  static async remove(interviewId, candidateId) {
    const [res] = await pool.query(
      "DELETE FROM interview_candidates WHERE interview_id = ? AND candidate_id = ?", [interviewId, candidateId]);
    return res.affectedRows;
  }

  /** Users that hold the Candidate role (the pool an admin can assign from). */
  static async pool(search) {
    const params = ["Candidate"]; let extra = "";
    if (search) { extra = " AND (u.user_id ILIKE ? OR u.user_name ILIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    return query(
      `SELECT u.user_id, u.user_name FROM user u
         JOIN user_roles r ON r.user_role_id = u.user_role_id
        WHERE r.user_role_name = ?${extra} ORDER BY u.user_name LIMIT 200`, params);
  }

  static async validCandidateIds(ids) {
    if (!ids.length) return [];
    const rows = await query(
      `SELECT u.user_id FROM user u JOIN user_roles r ON r.user_role_id = u.user_role_id
        WHERE r.user_role_name = 'Candidate' AND u.user_id IN (?)`, [ids]);
    return rows.map((r) => r.user_id);
  }
}
module.exports = InterviewCandidate;

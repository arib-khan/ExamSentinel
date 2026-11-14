const { pool, query, num } = require("./_base");

const BASE = `SELECT li.*, hu.user_name AS host_name
                FROM live_interviews li LEFT JOIN user hu ON hu.user_id = li.host_id`;
const shape = (r) => r && { ...r, id: num(r.id), duration_minutes: num(r.duration_minutes) };
const FIELDS = ["title", "description", "host_id", "candidate_id", "candidate_name", "candidate_email", "candidate_phone",
  "scheduled_start", "duration_minutes", "scheduled_end", "monitoring_required"];

class LiveInterview {
  static async findById(id) {
    const rows = await query(`${BASE} WHERE li.id = ?`, [id]);
    return shape(rows[0]) || null;
  }
  static async list({ status } = {}) {
    const rows = status ? await query(`${BASE} WHERE li.status = ? ORDER BY li.scheduled_start DESC`, [status])
                        : await query(`${BASE} ORDER BY li.scheduled_start DESC`);
    return rows.map(shape);
  }
  static async listForCandidate(userId) {
    const rows = await query(`${BASE} WHERE li.candidate_id = ? ORDER BY li.scheduled_start ASC`, [userId]);
    return rows.map(shape);
  }
  /** Interviews of a user (as host or candidate) that overlap [start, end) and are still active. */
  static async overlapping(column, userId, start, end, excludeId = 0) {
    const col = column === "host_id" ? "host_id" : "candidate_id";
    const rows = await query(
      `SELECT id, title, scheduled_start FROM live_interviews
        WHERE ${col} = ? AND status IN ('scheduled','live') AND scheduled_start < ? AND scheduled_end > ? AND id <> ?`,
      [userId, end, start, excludeId]);
    return rows;
  }
  static async create(row) {
    const [res] = await pool.query("INSERT INTO live_interviews SET ?", row);
    return res.insertId;
  }
  static async update(id, fields) {
    const row = {}; for (const k of FIELDS) if (fields[k] !== undefined) row[k] = fields[k];
    if (!Object.keys(row).length) return 0;
    const [res] = await pool.query("UPDATE live_interviews SET ? WHERE id = ?", [row, id]);
    return res.affectedRows;
  }
  /** Status change that only applies when the row is still in one of `from` (race-safe). */
  static async transition(id, from, fields) {
    const [res] = await pool.query(
      `UPDATE live_interviews SET ? WHERE id = ? AND status IN (${from.map(() => "?").join(",")})`, [fields, id, ...from]);
    return res.affectedRows;
  }
  static async setFields(id, fields) {
    const [res] = await pool.query("UPDATE live_interviews SET ? WHERE id = ?", [fields, id]);
    return res.affectedRows;
  }
  static async candidatePool(search) {
    const params = ["Candidate"]; let extra = "";
    if (search) { extra = " AND (u.user_id ILIKE ? OR u.user_name ILIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    return query(
      `SELECT u.user_id, u.user_name FROM user u JOIN user_roles r ON r.user_role_id = u.user_role_id
        WHERE r.user_role_name = ?${extra} ORDER BY u.user_name LIMIT 200`, params);
  }
  static async candidateUser(userId) {
    const rows = await query(
      `SELECT u.user_id, u.user_name, r.user_role_name FROM user u JOIN user_roles r ON r.user_role_id = u.user_role_id WHERE u.user_id = ?`, [userId]);
    return rows[0] || null;
  }
  static async userExists(userId) {
    return (await query("SELECT user_id, user_role_id FROM user WHERE user_id = ?", [userId]))[0] || null;
  }
  static async insertUser(row) {
    await pool.query("INSERT INTO user SET ?", row);
  }
  static async candidateRoleId() {
    const r = await query("SELECT user_role_id FROM user_roles WHERE user_role_name = 'Candidate'");
    return r[0] ? Number(r[0].user_role_id) : null;
  }
}
module.exports = LiveInterview;

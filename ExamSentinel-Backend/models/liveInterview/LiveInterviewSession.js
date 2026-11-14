const { pool, query, num } = require("./_base");

class LiveInterviewSession {
  static async create(row) {
    const [res] = await pool.query("INSERT INTO live_interview_sessions SET ?", row);
    return res.insertId;
  }
  static async latest(interviewId, role) {
    const rows = await query(
      "SELECT * FROM live_interview_sessions WHERE live_interview_id = ? AND role = ? ORDER BY id DESC LIMIT 1", [interviewId, role]);
    return rows[0] || null;
  }
  /** Update the most recent session of a role. */
  static async setState(interviewId, role, userId, state) {
    const now = new Date();
    const fields = { state, last_seen_at: now };
    if (state === "connected") { fields.left_at = null; }
    if (state === "disconnected") { fields.left_at = now; }
    const latest = await query(
      "SELECT id, joined_at FROM live_interview_sessions WHERE live_interview_id = ? AND role = ? AND user_id = ? ORDER BY id DESC LIMIT 1",
      [interviewId, role, userId]);
    if (!latest[0]) return 0;
    if (state === "connected" && !latest[0].joined_at) fields.joined_at = now;
    const [res] = await pool.query("UPDATE live_interview_sessions SET ? WHERE id = ?", [fields, latest[0].id]);
    return res.affectedRows;
  }
  /** Set the state of the most recent session of a role (whoever owns it). */
  static async setStateByRole(interviewId, role, state) {
    const latest = await query(
      "SELECT id, joined_at, state FROM live_interview_sessions WHERE live_interview_id = ? AND role = ? ORDER BY id DESC LIMIT 1", [interviewId, role]);
    if (!latest[0] || latest[0].state === state) { if (latest[0]) await pool.query("UPDATE live_interview_sessions SET last_seen_at = ? WHERE id = ?", [new Date(), latest[0].id]); return 0; }
    const now = new Date(); const f = { state, last_seen_at: now };
    if (state === "connected") { f.left_at = null; if (!latest[0].joined_at) f.joined_at = now; }
    if (state === "disconnected") f.left_at = now;
    const [res] = await pool.query("UPDATE live_interview_sessions SET ? WHERE id = ?", [f, latest[0].id]);
    return res.affectedRows;
  }
  static async closeAll(interviewId) {
    const now = new Date();
    await pool.query("UPDATE live_interview_sessions SET state = 'disconnected', left_at = COALESCE(left_at, ?), last_seen_at = ? WHERE live_interview_id = ? AND state <> 'disconnected'", [now, now, interviewId]);
  }
  static async listByInterview(interviewId) {
    const rows = await query("SELECT * FROM live_interview_sessions WHERE live_interview_id = ? ORDER BY id", [interviewId]);
    return rows.map((r) => ({ ...r, id: num(r.id) }));
  }
}
module.exports = LiveInterviewSession;

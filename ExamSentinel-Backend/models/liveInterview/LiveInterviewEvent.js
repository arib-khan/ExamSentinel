const { pool, query, num } = require("./_base");

class LiveInterviewEvent {
  static async add(interviewId, userId, role, eventType, details) {
    await pool.query("INSERT INTO live_interview_events SET ?", {
      live_interview_id: interviewId, user_id: userId || null, role: role || null, event_type: eventType,
      details: details ? JSON.stringify(details) : null,
    });
  }
  static async list(interviewId, limit = 200) {
    const rows = await query("SELECT * FROM live_interview_events WHERE live_interview_id = ? ORDER BY id DESC LIMIT ?", [interviewId, limit]);
    return rows.map((r) => ({ ...r, id: num(r.id) })).reverse();
  }
  static async count(interviewId) {
    return Number((await query("SELECT COUNT(*) AS n FROM live_interview_events WHERE live_interview_id = ?", [interviewId]))[0].n);
  }
}
module.exports = LiveInterviewEvent;

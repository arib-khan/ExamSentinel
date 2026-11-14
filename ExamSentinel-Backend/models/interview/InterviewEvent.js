/**
 * Interview module :: InterviewEvent model
 *
 * Interview-specific security/proctoring event log, linked to the
 * interview attempt (separate from exam_activity_log). Events are written
 * through the same backend as the exam proctoring events, so web + mobile
 * clients reuse one integration point.
 */
const pool = require("../../config/db");

class InterviewEvent {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error("InterviewEvent DB Error:", err);
      throw err;
    }
  }

  // ✅ Log an event (event_type conventions follow the existing
  // exam_activity_log vocabulary: TAB_SWITCH, FULLSCREEN_EXIT,
  // USER_IDLE_START, INTERVIEW_STARTED, INTERVIEW_SUBMITTED, ...)
  static async log({ attempt_id, interview_id, student_id, event_type, event_details, ip_address }) {
    try {
      const result = await this.query("INSERT INTO interview_events SET ?", {
        iev_attempt_id: attempt_id ?? null,
        iev_interview_id: interview_id ?? null,
        iev_student_id: student_id ?? null,
        iev_event_type: event_type,
        iev_event_details: event_details ?? null,
        iev_ip_address: ip_address ?? null,
      });
      return { status: true, data: result, msg: "Event logged" };
    } catch (err) {
      return { status: false, error: err, msg: "Failed to log event" };
    }
  }

  // ✅ All events for an attempt (staff/security review)
  static async listByAttempt(attemptId) {
    return this.query(
      "SELECT * FROM interview_events WHERE iev_attempt_id = ? ORDER BY iev_created_at ASC",
      [attemptId]
    );
  }

  // ✅ All events for an interview
  static async listByInterview(interviewId) {
    return this.query(
      "SELECT * FROM interview_events WHERE iev_interview_id = ? ORDER BY iev_created_at ASC",
      [interviewId]
    );
  }
}

module.exports = InterviewEvent;

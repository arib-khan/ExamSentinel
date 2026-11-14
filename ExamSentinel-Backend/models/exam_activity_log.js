const pool = require("../config/db");

class ExamActivity {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async Add(data) {
    try {
      const result = await this.query(
        "insert into exam_activity_log SET ?",
        data
      );
      return { status: true, result, msg: "Exam Activity data Saved" };
    } catch (err) {
      throw err;
    }
  }
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM exam_activity_log");
      return { status: true, result, msg: "Exam Activity log data found " };
    } catch (err) {
      throw err;
    }
  }
  static async Byexamid(examid) {
    try {
      const result = await this.query(
        "Select * from exam_activity_log where exam_id = ?",
        [examid]
      );
      return { status: true, result, msg: "Exam Activity log data found " };
    } catch (err) {
      throw err;
    }
  }

  static async Bystudentid_examid(examid) {
    try {
      const result = await this.query(
        "Select * from exam_activity_log where exam_id = ? and student_id=?",
        [examid]
      );
      return { status: true, result, msg: "Exam Activity log data found " };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ExamActivity;

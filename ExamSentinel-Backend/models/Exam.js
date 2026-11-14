const pool = require("../config/db");

class Exam {
  // Base query executor
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // ✅ Create
  static async Add(data) {
    try {
      const result = await this.query("INSERT INTO exams SET ?", data);
      return { status: true, data: result, msg: "Exam added successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, error: err };
    }
  }

  // ✅ Read all
  static async getAll(clientId) {
    try {
      let result;

      if (!clientId) {
        result = await this.query("SELECT * FROM exams");
      } else {
        result = await this.query(
          "SELECT * FROM exams WHERE exam_inst_id = ?",
          [clientId]
        );
      }
      return {
        status: true,
        data: result,
        msg: "Exams retrieved successfully",
      };
    } catch (err) {
      console.error(err);
      return { status: false, error: err };
    }
  }

  // ✅ Read by ID
  static async getById(id) {
    try {
      const result = await this.query("SELECT * FROM exams WHERE exam_id = ?", [
        id,
      ]);
      return result.length
        ? { status: true, data: result[0] }
        : { status: false, msg: "Exam not found" };
    } catch (err) {
      return { status: false, error: err };
    }
  }

  // ✅ Update by ID
  static async updateById(id, data) {
    try {
      const result = await this.query("UPDATE exams SET ? WHERE exam_id = ?", [
        data,
        id,
      ]);
      return { status: true, data: result, msg: "Exam updated successfully" };
    } catch (err) {
      return { status: false, error: err };
    }
  }

  // ✅ Delete by ID
  static async deleteById(id) {
    try {
      const result = await this.query("DELETE FROM exams WHERE exam_id = ?", [
        id,
      ]);
      return { status: true, data: result, msg: "Exam deleted successfully" };
    } catch (err) {
      return { status: false, error: err };
    }
  }

  static async getExamIdByStudentId(studentId) {
    try {
      const result = await this.query(
        `SELECT e.exam_id, e.exam_duration, e.exam_name ,exam_no_questions,exam_instructions,exams_duration_for_pwd
         FROM exams e
         JOIN inst_exam_centre_student_map m ON m.iecsm_exam_id = e.exam_id
         WHERE m.iecsm_student_id = ?`,
        [studentId]
      );
      return result;
    } catch (err) {
      return { status: false, error: err };
    }
  }
}

module.exports = Exam;

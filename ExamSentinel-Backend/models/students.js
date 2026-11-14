const pool = require("../config/db");

class Student {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      throw err;
    }
  }
  static async getAll() {
    try {
      const result = await this.query(`SELECT 
    s.*,
    iecsm.iecsm_seat_num,
    chrrs.center_seat_label,
    sxt.student_image,

    CASE 
        WHEN sxt.student_biometric_capture IS NULL THEN 'N'
        ELSE 'Y'
    END AS student_biometric_captur

FROM students s

LEFT JOIN inst_exam_centre_student_map iecsm
    ON s.id = iecsm.iecsm_student_id

LEFT JOIN center_hall_room_row_seats chrrs
    ON iecsm.iecsm_seat_num = chrrs.center_seat_id

LEFT JOIN student_ext sxt
    ON s.id = sxt.student_id;

`);
      return { status: true, result, msg: "Student list fetched successfully" };
    } catch (err) {
      return { status: false, result: [], msg: err.message };
    }
  }
  static async getAlByExam(examId) {
    try {
      const result = await this.query(
        "SELECT * from students where student_exam_id =?",
        [examId]
      );
      return { status: true, result, msg: "Student list fetched successfully" };
    } catch (err) {
      return { status: false, result: [], msg: err.message };
    }
  }
  static async getById(id) {
    try {
      const result = await this.query("SELECT * FROM students WHERE id = ?", [
        id,
      ]);
      if (result.length === 0)
        return { status: false, msg: "Student not found", result: [] };
      return { status: true, result: result[0] };
    } catch (err) {
      return { status: false, msg: err.message };
    }
  }

  //Create New Student

  static async create(data) {
    try {
      const [result] = await pool.query("INSERT INTO students SET ?", data);
      return {
        status: true,
        insertId: result.insertId,
        msg: "Student added successfully",
      };
    } catch (err) {
      console.error(err);
      return { status: false, msg: err.message };
    }
  }

  static async update(id, data) {
    try {
      const result = await this.query("UPDATE students SET ? WHERE id = ?", [
        data,
        id,
      ]);
      return {
        status: true,
        msg:
          result.affectedRows > 0
            ? "Student updated successfully"
            : "No student found to update",
      };
    } catch (err) {
      console.error(err);
      return { status: false, msg: err.message };
    }
  }

  //Delete Student by ID

  static async delete(id) {
    try {
      const result = await this.query("DELETE FROM students WHERE id = ?", [
        id,
      ]);
      return {
        status: true,
        msg:
          result.affectedRows > 0
            ? "Student deleted successfully"
            : "No student found to delete",
      };
    } catch (err) {
      return { status: false, msg: err.message };
    }
  }

  static async deleteStudentsByExam(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // First delete mappings
      const delMap = await conn.query(
        "DELETE FROM inst_exam_centre_student_map WHERE iecsm_exam_id = ?",
        [id]
      );

      // Then delete students
      const delStudents = await conn.query(
        "DELETE FROM students WHERE student_exam_id = ?",
        [id]
      );

      await conn.commit();

      return {
        status: true,
        msg: "Students and mapping data deleted successfully"
      };
    } catch (err) {
      await conn.rollback();

      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return {
          status: false,
          msg: "Students cannot be deleted because their exam has already started or is finished.",
        };
      }
      return { status: false, msg: err };
    } finally {
      conn.release();
    }
  }

  // 🔐 Login by roll_number
  static async login(roll_number) {
    const result = await this.query(
      "SELECT id, roll_number, password, name , student_exam_id , student_picture , is_disabled FROM students WHERE roll_number = ?",
      [roll_number]
    );
    return result;
  }

  static async FindByRoll(roll_number) {
    const result = await this.query(
      "SELECT id, roll_number,student_exam_id FROM students WHERE roll_number = ?",
      [roll_number]
    );
    return result;
  }
}

module.exports = Student;

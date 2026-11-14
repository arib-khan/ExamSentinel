const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

class InstinstExamCentreStudentMap {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      throw err;
    }
  }
  static async getaLL() {
    try {
      const result = await this.query(
        "SELECT * FROM inst_exam_centre_student_map"
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getaLLByCenter(iecsm_centre_id) {
    try {
      const result = await this.query(
        `SELECT 
    st.id,
    sm.iecsm_exam_id,
    st.roll_number,
    st.name,
    sm.iecsm_room_name,
    sm.iecsm_exam_id,
    sm.iecsm_seat_num,
    sm.iecsm_date,
    sm.iecsm_start_time,
    sm.iecsm_end_time,
    exm.exam_name,
    exm.exam_duration,
    sm.iecsm_student_id,
    sxt.student_image,
      CASE 
    WHEN sxt.student_biometric_capture IS NULL THEN 'N'
    ELSE 'Y'
  END AS student_biometric_capture ,
    CONCAT(
      COUNT(DISTINCT CASE 
        WHEN sa.selected_option IS NOT NULL OR sa.answer_text IS NOT NULL 
        THEN sa.question_id
      END),
      '/',
      COUNT(DISTINCT sa.question_id)
    ) AS attempt_status
FROM inst_exam_centre_student_map sm
left JOIN student_ext sxt 
    ON sm.iecsm_student_id = sxt.student_id
    JOIN students st 
    ON sm.iecsm_student_id = st.id
JOIN exams exm 
    ON sm.iecsm_exam_id = exm.exam_id
LEFT JOIN student_answers sa
    ON sm.iecsm_student_id = sa.student_id
   AND sa.student_exam_id = sm.iecsm_exam_id   -- ✅ ensures answers are only for that exam
GROUP BY 
    st.id, st.roll_number, st.name, sm.iecsm_room_name, sm.iecsm_seat_num,
    sm.iecsm_exam_id,
    sm.iecsm_date, sm.iecsm_start_time, sm.iecsm_end_time,
    sm.iecsm_exam_id,
    exm.exam_name, exm.exam_duration, sm.iecsm_student_id `
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
  static async Add(data) {
    try {
      const result = await this.query(
        "INSERT INTO inst_exam_centre_student_map SET ?",
        data
      );
      return {
        status: true,
        data: result,
        msg: "Mapping added successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        error: err.message,
        msg: "Mapping added successfully",
      };
    }
  }
  static async Update(data, id) {
    try {
      const result = await this.query(
        "UPDATE inst_exam_centre_student_map SET ? WHERE iecsm_student_id = ?",
        [data, id]
      );
      return {
        status: true,
        data: result,
        msg: "Mapping updated successfully",
      };
    } catch (err) {
      console.error("Update error:", err);
      return {
        status: false,
        data: err,
        msg: "Failed to update mapping",
      };
    }
  }
  static async Delete(id) {
    try {
      const result = await this.query(
        "DELETE FROM inst_exam_centre_student_map WHERE iecsm_id = ?",
        [id]
      );
      return {
        status: true,
        data: result,
        msg: "Mapping deleted successfully",
      };
    } catch (err) {
      console.error(err);

      return {
        status: false,
        data: err,
        msg: "Failed to delete mapping",
      };
    }
  }

  static async NotMapedStudent(exam_id, inst_id) {
    try {
      const result = await this.query(
        `SELECT 
      iecs.*, 
      ex.exam_name, 
      s.roll_number, 
      s.name, 
      inst.inst_name 
   FROM inst_exam_centre_student_map iecs 
   JOIN students s
     ON iecs.iecsm_student_id = s.id 
   JOIN institute inst
     ON iecs.iecsm_inst_id = inst.inst_id
   JOIN exams ex
     ON iecs.iecsm_exam_id = ex.exam_id
   WHERE iecsm_centre_id IS NULL 
     AND iecsm_inst_id = ? 
     AND iecsm_exam_id = ?`,
        [inst_id, exam_id]
      );

      console.log("Query Result:", result, exam_id, inst_id);
      return result;
    } catch (error) {
      console.error("Database Query Error:", error);
      throw error;
    }
  }

  static async Center_Update(data) {
    try {
      const result = await this.query(
        `UPDATE inst_exam_centre_student_map 
   SET iecsm_centre_id = ?, 
       iecsm_date = ?, 
       iecsm_start_time = ?, 
       iecsm_end_time = ?
   WHERE iecsm_id = ?`,
        [
          data.iecsm_centre_id,
          data.iecsm_date,
          data.iecsm_start_time,
          data.iecsm_end_time,
          data.iecsm_id,
        ]
      );

      return {
        status: true,
        data: result,
        msg: "center Mapping  successfully",
      };
    } catch (err) {
      console.error("Update error:", err);
      return {
        status: false,
        data: err,
        msg: "Failed to update mapping",
      };
    }
  }

  static async StudentSeatData(studentId) {
    try {
      const result = await this.query(
        "Select * from inst_exam_centre_student_map where  iecsm_student_id =?",
        [studentId]
      );

      return result;
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  // by sunil

static async getExamDetailsByCenter(center_id) {
  try {
    const sql = `
      SELECT 
          ex.exam_id,
          ex.exam_name,
          ex.exam_no_questions,
          ex.exam_duration,

          map.iecsm_date AS exam_date,
          map.iecsm_start_time AS exam_start_time,
          map.iecsm_end_time AS exam_end_time,

          inst.inst_name AS institution_name,
          ctr.centre_name,

          COUNT(DISTINCT st.id) AS total_students,
          COUNT(DISTINCT q.id) AS total_questions

      FROM inst_exam_centre_student_map map
      JOIN exams ex ON map.iecsm_exam_id = ex.exam_id
      JOIN institute inst ON ex.exam_inst_id = inst.inst_id
      JOIN centres ctr ON map.iecsm_centre_id = ctr.centre_id
      LEFT JOIN students st ON st.student_exam_id = ex.exam_id
      LEFT JOIN questions q ON q.ques_exam_id = ex.exam_id
      WHERE map.iecsm_centre_id = ?
      GROUP BY 
          ex.exam_id,
          ex.exam_name,
          ex.exam_no_questions,
          ex.exam_duration,
          map.iecsm_date,
          map.iecsm_start_time,
          map.iecsm_end_time,
          inst.inst_name,
          ctr.centre_name
    `;

    const result = await this.query(sql, [center_id]);
    if (!result.length) return null;

    const examData = result[0];

    // -------------------------------
    // Count images in directories
    // -------------------------------

    // Dynamic Students images directory based on exam_id
    const studentImagesDir = path.join(
      __dirname,
      `../uploads/students_images/image_${examData.exam_id}`
    );
    let studentImageCount = 0;
    if (fs.existsSync(studentImagesDir)) {
      studentImageCount = fs.readdirSync(studentImagesDir).length;
    }

    // Questions images directory (static)
    const questionImagesDir = path.join(
      __dirname,
      "../uploads/Questions_img"
    );
    let questionImageCount = 0;
    if (fs.existsSync(questionImagesDir)) {
      questionImageCount = fs.readdirSync(questionImagesDir).length;
    }

    // Attach counts to response
    examData.student_image_count = studentImageCount;
    examData.question_image_count = questionImageCount;

    return examData;

  } catch (err) {
    console.error("getExamDetailsByCenter error:", err);
    throw err;
  }
}



}




module.exports = InstinstExamCentreStudentMap;

const pool = require("../config/db");

class studentAnswerlog {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getAll() {
    try {
      const result = await this.query("Select * from student_answers_log");
      return { status: true, result, msg: "Student Answers Log Data Found " };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async Add(data) {
    try {
      const result = await this.query(
        "INSERT INTO student_answers_log SET ?",
        data
      );
      return { status: true, result, msq: "StudentAnswers log Saved" };
    } catch (err) {
      throw err;
    }
  }

  static async findByStudentId(student_id) {
    try {
      const result = await this.query("Select * from student_answers_log", [
        student_id,
      ]);
      return { status: true, result, msg: "Student Answers Log Data Found " };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async findByExamId(exam_id) {
    try {
      const result = await this.query(
        `SELECT * ,em.exam_name ,s.roll_number ,s.name
   FROM student_answers_log sal 
   join students s 
   on  sal.student_id = s.id 
   join exams em 
   on sal.exam_id = em.exam_id
   WHERE sal.exam_id = ? 
   ORDER BY student_id`,
        [exam_id]
      );

      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async LastQuestionState(student_id, examId) {
    try {
      const [result] = await this.query(
        `SELECT * 
       FROM student_answers_log 
       WHERE student_id = ? 
         AND exam_id = ? 
         AND to_ques IS NOT NULL 
       ORDER BY id DESC 
       LIMIT 1`,
        [student_id, examId]
      );
      return { status: true, result, msg: "Student Answers Log Data Found" };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // static async findMarkforReview(student_id, exam_id) {
  //   try {
  //     const data = await this.query(
  //       `SELECT a.id, a.question_id  ,a.mark_for_review, b.student_question_id
  //      FROM student_answers_log a
  //      JOIN student_answers b
  //        ON a.question_id = b.question_id
  //      WHERE a.student_id = ?
  //        AND a.exam_id = ?
  //        AND a.mark_for_review IS NOT NULL`,
  //       [student_id, exam_id]
  //     );

  //     return { status: true, data, msg: "All Answer Data Found" };
  //   } catch (err) {
  //     return { status: false, err, msg: err.message };
  //   }
  // }

  static async findMarkforReview(student_id, exam_id) {
    try {
      const data = await this.query(
        `SELECT a.student_id, a.exam_id, a.mark_for_review, b.student_question_id
       FROM student_answers_log a
       JOIN student_answers b 
         ON a.question_id = b.question_id
       WHERE a.student_id = ? 
         AND a.exam_id = ? 
         AND a.mark_for_review IS NOT NULL
         AND a.id = (
           SELECT MAX(id) 
           FROM student_answers_log sal
           WHERE sal.question_id = a.question_id 
             AND sal.student_id = a.student_id 
             AND sal.exam_id = a.exam_id
             AND sal.mark_for_review IS NOT NULL
         )`,
        [student_id, exam_id]
      );

      return { status: true, data, msg: "All Answer Data Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }
}

module.exports = studentAnswerlog;

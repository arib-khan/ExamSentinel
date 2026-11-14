const pool = require("../config/db");
const mysql = require("mysql2");

class studentAnswer {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async Markupdate(id, data) {
    try {
      const result = await this.query(
        "update student_answers set marks=? where id =?",
        [data, id],
      );
      return result;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
  static async FindByStudentsID(student_exam_id) {
    try {
      const result = await this.query(
        `SELECT 
      sa.*, 
      q.id AS ques_id,
      q.correct_option, 
      q.NegativeMark,
      q.Mark
   FROM student_answers sa
   INNER JOIN questions q
     ON sa.question_id = q.id
   WHERE sa.student_exam_id = ?`,
        [student_exam_id],
      );
      return result;
    } catch (err) {
      return err;
    }
  }

  static async FindByStudentid_ExamID(examId, student_id) {
    try {
      const result = await this.query(
        `SELECT 
      sa.*, 
      q.id AS ques_id,
      q.correct_option, 
      q.NegativeMark,
      q.Mark
   FROM student_answers sa
   INNER JOIN questions q
     ON sa.question_id = q.id
   WHERE sa.student_exam_id = ? and student_id =?
    ORDER BY sa.student_question_id ASC`,
        [examId, student_id],
      );
      return result;
    } catch (err) {
      return err;
    }
  }

  static async AddStudents_map_Questions(dataArray) {
    try {
      if (!dataArray.length) return;

      const keys = Object.keys(dataArray[0]);
      const columns = keys.join(", ");

      const values = dataArray
        .map(
          (obj) => `(${keys.map((key) => mysql.escape(obj[key])).join(", ")})`,
        )
        .join(", ");

      const sql = `INSERT INTO student_answers (${columns}) VALUES ${values}`;

      const result = await this.query(sql);
      return result;
    } catch (err) {
      throw err;
    }
  }
  // static async result(examid) {
  //   try {
  //     const result = await this.query(
  //       `SELECT
  //         s.roll_number,
  //         s.name,
  //         COUNT(sa.selected_option) AS attempt,
  //         COUNT(sa.question_id) AS total_questions,
  //         COUNT(sa.question_id) - COUNT(sa.selected_option) AS unattempted,
  //          SUM(sa.marks) AS obtain_marks
  //      FROM student_answers sa
  //      INNER JOIN students s
  //        ON sa.student_id = s.id
  //      WHERE sa.student_exam_id = ?
  //      GROUP BY sa.student_id, sa.student_exam_id, s.roll_number`,
  //       [examid]
  //     );

  //     return result;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  static async submition_result(examid, student_id) {
    try {
      const result = await this.query(
        `SELECT 
          s.roll_number,
          s.name,
          COUNT(sa.selected_option) AS attempt,
          COUNT(sa.question_id) AS total_questions,
          COUNT(sa.question_id) - COUNT(sa.selected_option) AS unattempted,
           SUM(sa.marks) AS obtain_marks
       FROM student_answers sa
       INNER JOIN students s
         ON sa.student_id = s.id
       WHERE sa.student_exam_id = ? and student_id=?
       GROUP BY sa.student_id, sa.student_exam_id, s.roll_number`,
        [examid, student_id],
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  static async Attemptquestion(
    studentid,
    examid,
    question_id,
    selected_option,
    mark_for_review,
    que_seen,
    answer_text,
  ) {
    try {
      const row = await this.query(
        `UPDATE student_answers 
   SET selected_option = ?, que_seen = ?, mark_for_review = ? ,answer_text=?
   WHERE student_id = ? AND student_exam_id = ? AND question_id = ?`,
        [
          selected_option,
          que_seen,
          mark_for_review,
          answer_text,
          studentid,
          examid,
          question_id,
        ],
      );
      return row;
    } catch (err) {
      throw err;
    }
  }

  static async QuestionSeen(studentid, examid, question_id, que_seen) {
    try {
      const row = await this.query(
        `UPDATE student_answers 
   SET que_seen = ?
   WHERE student_id = ? AND student_exam_id = ? AND question_id = ?`,
        [que_seen, studentid, examid, question_id],
      );
      return row;
    } catch (err) {
      throw err;
    }
  }
  static async FindByStudentsmapQuestion(studentid, examid) {
    try {
      const result = await this.query(
        `SELECT student_id,student_exam_id,student_question_id,selected_option
       FROM student_answers 
       WHERE student_id = ? AND student_exam_id = ?`,
        [studentid, examid],
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async FindAttempQuestion(studentid, examid) {
    try {
      const result = await this.query(
        `SELECT * FROM student_answers 
       WHERE (selected_option IS NOT NULL 
              OR mark_for_review IS NOT NULL 
              OR que_seen IS NOT NULL)
         AND student_id = ? 
         AND student_exam_id = ?`,
        [studentid, examid],
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  static async RawResult(student_id) {
    try {
      const result = await this.query(
        `SELECT 
        sa.id,
        sa.student_id,
        sa.question_id,
        sa.student_question_id,
        sa.selected_option,
        sa.sq_map_for_col_A,
        sa.sq_map_for_col_B,
        sa.sq_map_for_col_C,
        sa.sq_map_for_col_D,
        sa.answer_text,
        sa.question_subject,
        sa.section,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d
      
      FROM student_answers sa
      JOIN questions q ON sa.question_id = q.id
      WHERE sa.student_id = ?`,
        [student_id],
      );

      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async RawResultExcel(student_exam_id) {
    try {
      const result = await this.query(
        `SELECT 
        sa.id,
        s.roll_number,
        s.name,
        sa.student_id,
        sa.question_id,
        sa.student_question_id,
        sa.selected_option,
        sa.sq_map_for_col_A,
        sa.sq_map_for_col_B,
        sa.sq_map_for_col_C,
        sa.sq_map_for_col_D,
        sa.answer_text,
        sa.question_subject,
        sa.section,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d
      
      FROM student_answers sa
      JOIN questions q ON sa.question_id = q.id
       JOIN students s ON sa.student_id = s.id
      WHERE sa.student_exam_id = ?`,
        [student_exam_id],
      );

      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
module.exports = studentAnswer;

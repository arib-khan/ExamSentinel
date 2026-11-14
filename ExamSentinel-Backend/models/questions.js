const pool = require("../config/db");

class Questions {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      console.error(err); // Fixed typo from console.err to console.error
      throw err;
    }
  }

  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM questions");
      return {
        status: true,
        result,
        msg: "All questions retrieved successfully",
      };
    } catch (err) {
      return { status: false, error: err, msg: "Failed to retrieve questions" };
    }
  }

  static async Add(data) {
    try {
      const result = await this.query("INSERT INTO questions SET ?", data);
      return { status: true, result, msg: "Question added successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, error: err, msg: "Failed to add question" };
    }
  }

  static async FindByExamId(examId) {
    try {
      const result = await this.query(
        `SELECT q.* , exam_name FROM questions q
         inner join exams e
         on q.ques_exam_id = e.exam_id
         WHERE q.ques_exam_id = ?`,
        [examId]
      );
      return {
        status: true,
        result,
        msg: "Questions by exam ID fetched successfully",
      };
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      return {
        status: false,
        error: err,
        msg: "Failed to fetch questions by exam ID",
      };
    }
  }

  static async FindByID(question_id) {
    try {
      const [result] = await this.query(
        "SELECT * FROM questions WHERE id = ?",
        [question_id]
      );
      if (result.length === 0) {
        return { status: false, msg: "Question not found", result: [] };
      }
      return {
        status: true,
        result,
        msg: "Question fetched by ID successfully",
      };
    } catch (err) {
      return {
        status: false,
        error: err,
        msg: "Failed to fetch question by ID",
      };
    }
  }

  static async delete(question_id) {
    try {
      const result = await this.query("DELETE FROM questions WHERE id = ?", [
        question_id,
      ]);
      let message;
      if (result.affectedRows > 0) {
        message = "Question deleted successfully";
      } else {
        message = "Question Data Not Found ";
      }
      return { status: true, result, msg: message };
    } catch (err) {
      return { status: false, error: err, msg: "Failed to delete question" };
    }
  }

  static async deleteByExamid(exam_id) {
    try {
      const result = await this.query(
        "DELETE FROM questions WHERE ques_exam_id = ?",
        [exam_id]
      );
      let message;
      if (result.affectedRows > 0) {
        message = "All Question deleted successfully";
      } else {
        message = "Question Data Not Found ";
      }
      return { status: true, result, msg: message };
    } catch (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return {
          status: false,
          msg: "Questions cannot be deleted because the exam has already started or is finished",
        };
      } else {
        return { status: false, error: err, msg: "Failed to delete question" };
      }
    }
  }

  static async update(question_id, Data) {
    try {
      const result = await this.query("UPDATE questions SET ? WHERE id = ?", [
        Data,
        question_id,
      ]);
      let message;
      if (result.changedRows > 0) {
        message = "Question updated successfully";
      } else {
        message = "No Change IN Question";
      }
      return { status: true, result, msg: message };
    } catch (err) {
      return { status: false, error: err, msg: "Failed to update question" };
    }
  }

  static async ImageList(examID) {
    try {
      const result = await this.query(
        `SELECT 
      imageRef,
      option_a_image,
      option_b_image,
      option_c_image,
      option_d_image
   FROM questions
   WHERE (
      imageRef IS NOT NULL OR
      option_a_image IS NOT NULL OR
      option_b_image IS NOT NULL OR
      option_c_image IS NOT NULL OR
      option_d_image IS NOT NULL
   )
   AND ques_exam_id = ?`,
        [examID]
      );

      return { status: true, result, msg: "Image data found " };
    } catch (err) {
      console.error(err);
      return { status: false, error: err };
    }
  }
}

module.exports = Questions;

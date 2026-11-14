const express = require("express");
const router = express.Router();
const redisClient = require("../config/radishRouter");
const studentAnswer = require("../models/studentsAnswer");
const Question = require("../models/questions");
const studentAnswerlog = require("../models/student_answers_log");

router.get("/submit", async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentExamKey = `student:${studentId}`;
    const examData = await redisClient.get(studentExamKey);
    const studentdata = JSON.parse(examData);

    const examId = studentdata.examId;
    const result = await studentAnswer.FindByStudentid_ExamID(
      examId,
      studentId
    );

    //const result = await studentAnswer.submition_result(examId, studentId);

    const updatedResult = await Promise.all(
      result.map(async (row) => {
        let key = "sq_map_for_col_" + row.selected_option;
        var iscorrect;
        if (row[key] === row.correct_option) {
          iscorrect = "Y";
          await studentAnswer.Markupdate(row.id, row.Mark);
        } else {
          iscorrect = "N";
          let mark = row.NegativeMark || 0;
          await studentAnswer.Markupdate(row.id, mark);
        }
        return {
          student_id: row.student_id,
          question_id: row.question_id,
          student_question_id: row.student_question_id,
          question_subject: row.question_subject,
          section: row.section,
          selected_option: row[key],
          is_correct: iscorrect,
        };

        return row;
      })
    );

    const statusKey = `exam_status:${studentId}`;
    await redisClient.set(statusKey, "Submitted");

    res.json({
      status: true,
      data: updatedResult,
      msg: "Students Result retrive successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err });
  }
});
router.get("/re_login", async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentExamKey = `student:${studentId}`;
    const examData = await redisClient.get(studentExamKey);
    const studentdata = JSON.parse(examData);
    const examId = studentdata.examId;

    const question = await studentAnswer.FindAttempQuestion(studentId, examId);
    var attemptquestion = [];
    const redisKey = `student_exam:${studentId}:${examId}`;
    let questions = await redisClient.get(redisKey);
    let oldquestions = JSON.parse(questions);

    let lasstatege = await studentAnswerlog.LastQuestionState(
      studentId,
      examId
    );

    let las_question = lasstatege?.result;
    let lastQuestion = null;

    for (let i = 0; i < question.length; i++) {
      const qus = question[i];
      const data = await Question.FindByID(qus.question_id);
      const map_question = data.result;

      const getquestion = {
        question_id: qus.question_id,
        id: qus.student_question_id,
        question: map_question.question,
        option_a: map_question.option_a,
        option_b: map_question.option_b,
        option_c: map_question.option_c,
        option_d: map_question.option_d,
        question_type: map_question.question_type,
        selected_option: qus.selected_option,
        mark_for_review: qus.mark_for_review,
        answer_text: qus.answer_text,
        question_subject: qus.question_subject,
        section: qus.section,
        que_seen: qus.que_seen,
      };
      // console.log("Old Questions:", las_question);
      if (las_question && qus.question_id == las_question.question_id) {
        lastQuestion = getquestion;
      } else {
        attemptquestion.push(getquestion);
      }
    }

    if (lastQuestion) {
      //  console.log("last Questions:", lastQuestion);
      attemptquestion.push(lastQuestion);
    }
    // console.log("Final ordered question list:", attemptquestion);
    res.json({ status: true, data: attemptquestion });
  } catch (err) {
    console.error(err);
    res.json({ status: false, err });
  }
});

router.get("/students_result", async (req, res) => {
  try {
    const { student_exam_id } = req.body;

    const result = await studentAnswer.FindByStudentsID(student_exam_id);

    const updatedResult = await Promise.all(
      result.map(async (row) => {
        let key = "sq_map_for_col_" + row.selected_option;

        if (row[key] === row.correct_option) {
          await studentAnswer.Markupdate(row.id, row.Mark);
        } else {
          let mark = row.NegativeMark || 0;
          await studentAnswer.Markupdate(row.id, mark);
        }
        return {
          ...row,
          selected_option: row[key],
        };

        return row;
      })
    );

    res.json({
      status: true,
      data: updatedResult,
      msg: "Student Answer Data Found",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server Error" });
  }
});
router.post("/students_raw_result", async (req, res) => {
  try {
    const { student_id } = req.body;
    const rows = await studentAnswer.RawResult(student_id);
    const updatedResult = rows.map((row) => {
      const mapQuestion = {
        student_id: row.student_id,

        question: row.question,
        sq_map_for_col_A:
          row[`option_${row.sq_map_for_col_A?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_B:
          row[`option_${row.sq_map_for_col_B?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_C:
          row[`option_${row.sq_map_for_col_C?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_D:
          row[`option_${row.sq_map_for_col_D?.toLowerCase?.() || ""}`] || null,
        selected_option:
          row[`option_${row.selected_option?.toLowerCase?.() || ""}`] || null,
        answer_text: row.answer_text,
        ...(row.question_subject ? { subject: row.question_subject } : {}),

        ...(row.section ? { section: row.section } : {}),
      };
      return mapQuestion;
    });

    res.json({
      status: true,
      data: updatedResult,
      msg: "Student Answer Data Found",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server Error" });
  }
});

module.exports = router;

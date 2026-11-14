const express = require("express");
const Exam = require("../models/Exam");
const studentAnswerlog = require("../models/student_answers_log");
const redisClient = require("../config/radishRouter");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await studentAnswerlog.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Student Answers log Not Found" });
  }
});

router.post("/add", async (req, res) => {
  try {
    let studentdata = await redisClient.get(`student:${req.user.id}`);
    let studentData = JSON.parse(studentdata);
    var exam_id = studentData.examId;
    if (!studentData) {
      const [examRow] = await Exam.getExamIdByStudentId(req.body.student_id);
      exam_id = examRow.exam_id;
    }
    const question = await redisClient.get(
      `student_exam:${req.user.id}:${exam_id}`
    );
    const questionData = JSON.parse(question);

    // console.log("Students Data ", req.body);

    const mappedIndex = req.body.student_question_map - 1;

    console.log("students data map qusetions ", mappedIndex);

    let questions = null;
    if (req.body.question_subject && req.body.from_section) {
      questions =
        questionData[req.body.question_subject]?.[req.body.from_section][
          mappedIndex
        ];
    } else {
      questions = questionData[mappedIndex];
    }
    const result = await studentAnswerlog.Add({
      ...req.body,
      question_id: questions.id,
      exam_id: exam_id,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      err,
      msg: "Studenst Answers Data Not Saved ",
    });
  }
});

router.get("/listbyId/:student_id", async (req, res) => {
  try {
    const result = await studentAnswerlog.findByStudentId(
      req.params.student_id
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Student Answers log Not Found" });
  }
});

module.exports = router;

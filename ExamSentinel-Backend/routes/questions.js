const express = require("express");
const path = require("path");
const router = express.Router();
const pool = require("../config/db");
const redisClient = require("../config/radishRouter");
const Exam = require("../models/Exam");
const StudentsAnswer = require("../models/studentsAnswer");
const Questions = require("../models/questions");

router.post("/questions_add", async (req, res) => {
  const data = req.body;

  for (let i = 0; i < data.length; i++) {
    const question = data[i];
    var response = await Questions.Add(question);
  }
  if (response.status) {
    res.status(201).json(response);
  } else {
    res.status(500).json(response);
  }
});
router.get("/questions_list", async (req, res) => {
  const response = await Questions.getAll();
  if (response.status) {
    res.json(response);
  } else {
    res.status(500).json(response);
  }
});
router.get("/ques_BYid/:id", async (req, res) => {
  const response = await Questions.FindByID(req.params.id);
  if (response.status) {
    res.json(response);
  } else {
    res.status(404).json(response);
  }
});

router.get("/quesByExam/:id", async (req, res) => {
  const response = await Questions.FindByExamId(req.params.id);
  if (response.status) {
    res.json(response);
  } else {
    res.status(404).json(response);
  }
});
router.put("/update/:id", async (req, res) => {
  const response = await Questions.update(req.params.id, req.body);
  if (response.status) {
    res.json(response);
  } else {
    res.status(500).json(response);
  }
});
router.get("/ques_img_list", async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentExamKey = `student:${studentId}`;
    const Data = await redisClient.get(studentExamKey);
    const studentdata = JSON.parse(Data);
    const examID = studentdata.examId;
    const image = await Questions.ImageList(examID);
    res.json(image);
  } catch (err) {
    console.error(err);
    res.json({
      status: true,
      data: err,
      msg: "Image not found",
    });
  }
});

router.post("/ques_img", async (req, res) => {
  try {
    const filename = req.body.filename;
    const file = path.join(__dirname, "../uploads/Questions_img", filename);

    res.sendFile(file);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Error accured in getting file" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const response = await Questions.delete(req.params.id);
  if (response.status) {
    res.json(response);
  } else {
    res.status(500).json(response);
  }
});

router.delete("/deleteByExam/:id", async (req, res) => {
  const response = await Questions.deleteByExamid(req.params.id);
  if (response.status) {
    res.json(response);
  } else {
    res.json(response);
  }
});

// router.get("/question/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const row = await Questions.delete(id);
//     res.json(row);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch questions" });
//   }
// });

router.post("/save_next", async (req, res) => {
  const {
    id,
    selected_option,
    que_seen,
    marked_for_review,
    answer_text,
    subject,
    section,
  } = req.body;
  const studentId = req.user.id;

  try {
    const studentExamKey = `student:${studentId}`;
    const studentDataRaw = await redisClient.get(studentExamKey);
    const studentData = JSON.parse(studentDataRaw);
    const examID = studentData.examId;

    if (!id) return res.status(400).json({ error: "Question ID is required" });

    const redisKey = `student_exam:${studentId}:${examID}`;
    let questions = await redisClient.get(redisKey);
    questions = JSON.parse(questions);

    let currentQuestion;
    if (subject && section) {
      currentQuestion = questions[subject][section][id - 1];
    } else {
      currentQuestion = questions[id - 1];
    }

    if (!currentQuestion)
      return res.status(404).json({ error: "Question not found" });
    await StudentsAnswer.Attemptquestion(
      studentId,
      examID,
      currentQuestion.id,
      selected_option,
      marked_for_review,
      que_seen,
      answer_text
    );

    // Get next question
    let nextQuestion;
    if (subject && section) {
      nextQuestion = questions[subject][section][id] || null;
    } else {
      nextQuestion = questions[id] || null;
    }

    if (!nextQuestion) {
      return res.json({ status: false, msg: "No more questions." });
    }

    res.json({
      id: nextQuestion.id,
      question: nextQuestion.question,
      option_a: nextQuestion.options.A.text,
      option_b: nextQuestion.options.B.text,
      option_c: nextQuestion.options.C.text,
      option_d: nextQuestion.options.D.text,
      imageRef: nextQuestion.imageRef,
      option_a_image: nextQuestion.option_a_image,
      option_b_image: nextQuestion.option_b_image,
      option_c_image: nextQuestion.option_c_image,
      option_d_image: nextQuestion.option_d_image,
      question_type: nextQuestion.question_type,
    });
  } catch (error) {
    console.error("Error in /save_next route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/ques_BYid", async (req, res) => {
  try {
    const index = req.body.id;
    const studentId = req.user.id;
    const { subject, section } = req.body;

    const studentExamKey = `student:${studentId}`;
    const examData = await redisClient.get(studentExamKey);
    if (!examData)
      return res.status(404).json({ msg: "Student exam not found." });

    const studentdata = JSON.parse(examData);
    const examId = studentdata.examId;

    const redisKey = `student_exam:${studentId}:${examId}`;

    let questions = await redisClient.get(redisKey);
    if (!questions) {
      return res.json({ status: true, msg: "Questions not found in Redis." });
    }
    questions = JSON.parse(questions);

    let nextQuestion = null;

    if (subject && section) {
      const sectionQuestions = questions[subject]?.[section];
      if (!sectionQuestions)
        return res.status(404).json({ msg: "Section not found." });
      if (index < 1 || index > sectionQuestions.length)
        return res.status(400).json({ msg: "Index out of bounds." });

      nextQuestion = sectionQuestions[index - 1];
    } else {
      if (!Array.isArray(questions))
        return res.status(400).json({ msg: "Questions data invalid." });
      if (index < 1 || index > questions.length)
        return res.status(400).json({ msg: "Index out of bounds." });

      nextQuestion = questions[index - 1];
    }

    if (!nextQuestion)
      return res.status(404).json({ msg: "Question not found." });

    // Mark as seen
    await StudentsAnswer.QuestionSeen(studentId, examId, nextQuestion.id, true);

    res.json({
      id: nextQuestion.id,
      question: nextQuestion.question,
      option_a: nextQuestion.options.A.text,
      option_b: nextQuestion.options.B.text,
      option_c: nextQuestion.options.C.text,
      option_d: nextQuestion.options.D.text,
      imageRef: nextQuestion.imageRef,
      option_a_image: nextQuestion.option_a_image,
      option_b_image: nextQuestion.option_b_image,
      option_c_image: nextQuestion.option_c_image,
      option_d_image: nextQuestion.option_d_image,
      question_type: nextQuestion.question_type,
    });
  } catch (error) {
    console.error("Error in /ques_BYid route:", error);
    res
      .status(500)
      .json({ status: false, error, msg: "Internal server error" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const student_id = req.user.id;
    let score = 0;
    const result = [];

    const answerRows = await StudentsAnswer.FindByStudentsID(student_id);
    for (const ans of answerRows) {
      const rows = await Questions.FindByID(ans.question_id);
      const question = rows[0];
      if (!question) continue;

      const correct = String(question.correct_option).toUpperCase();
      const selected = String(ans.selected_option).toUpperCase();

      if (selected === c) score++;

      result.push({
        question_id: question.id,
        correct,
        selected,
      });
    }

    res.json({ score, answers: result });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, err, msg: "Failed to submit answers" });
  }
});

module.exports = router;

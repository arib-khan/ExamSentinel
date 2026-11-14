const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const Exam = require("../models/Exam");
const Questions = require("../models/questions");
const redisClient = require("../config/radishRouter");
const path = require("path");
const fs = require("fs");
const student = require("../models/studentsAnswer");
const Student = require("../models/students");
const { fetchAndShuffleQuestions } = require("./utils/questionSuffle");
const {
  fetchAndShuffleSectionsQuestions,
} = require("./utils/SectionsQustionSuffle");
const { broadcastToExam } = require("../sessionTracker/sessionTracker");
// GET /exam/instruction

router.get("/list", async (req, res) => {
  try {
    const clientId = req.user.clientId;

    const result = await Exam.getAll(clientId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err, msg: "Exam Data Not Found" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const result = await Exam.Add(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});

router.post("/instruction_image", async (req, res) => {
  try {
    if (!req.files || !req.files.exam_instructions_image) {
      return res.json({ msg: "No file uploaded." });
    }
    ////console.log"data is ", req.files);

    const uploadedFile = req.files.exam_instructions_image;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads/Exam_instruction");
    const savePath = path.join(uploadPath, fileName);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    await new Promise((resolve, reject) => {
      uploadedFile.mv(savePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({
      status: true,
      fileName: fileName,
      msg: `Instruction  Image Uploaded `,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, msg: "Server error", error: err.message });
  }
});
router.post("/instruction_pic", async (req, res) => {
  try {
    const filename = req.body.exam_instructions_image;
    const file = path.join(__dirname, "../uploads/Exam_instruction", filename);
    //console.logfile);
    res.sendFile(file);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      err,
      msg: "Error accured in getting student picture",
    });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await Exam.updateById(id, data);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await Exam.deleteById(id, data);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
  try {
  } catch (err) {
    console.error(err);
  }
});

router.get("/instruction", async (req, res) => {
  const studentId = req.user.id;

  try {
    const examRow = await Exam.getExamIdByStudentId(studentId);
    if (examRow.length === 0) {
      return res.status(404).json({ error: "No exam found." });
    }

    const exam = examRow[0];
    const examId = exam.exam_id;

    const redisKey = `student_exam:${studentId}:${examId}`;
    const Examsections = `examsection:${examId}`;
    const ExamsectionLanguge = `examlanguage:${examId}`;

    let studentQuestions = await redisClient.get(redisKey);
    let examsection = await redisClient.get(Examsections);
    let uniqueLanguages = await redisClient.get(ExamsectionLanguge);

    if (studentQuestions && uniqueLanguages) {
      studentQuestions = JSON.parse(studentQuestions);
      examsection = JSON.parse(examsection);
      uniqueLanguages = JSON.parse(uniqueLanguages);
    } else {
      const question = await Questions.FindByExamId(examId);

      console.log("api call count", uniqueLanguages);

      if (Array.isArray(question?.result) && question.result.length > 0) {
        if (question.result[0].question_subject) {
          const result = await fetchAndShuffleSectionsQuestions(
            question,
            examId,
            studentId
          );
          studentQuestions = result.studentQuestions;
          examsection = result.examsection;
          uniqueLanguages = result.uniqueLanguages;
        } else {
          const result = await fetchAndShuffleQuestions(
            question,
            examId,
            studentId
          );

          studentQuestions = result.studentQuestions;
          examsection = {};
          uniqueLanguages = result.uniqueLanguages;
        }
      }

      if (!studentQuestions || Object.keys(studentQuestions).length === 0) {
        return res.json({ error: "No questions found." });
      }
    }

    const studentKey = `student:${studentId}`;
    const studentData = await redisClient.get(studentKey);

    if (studentData) {
      var parsed = JSON.parse(studentData);
      parsed.examId = examId;
      await redisClient.set(studentKey, JSON.stringify(parsed));
    }

    res.json({
      exam_id: examId,
      exam_name: exam.exam_name,
      exam_duration:
        parsed.pwd === "Y"
          ? Number(exam.exam_duration) + Number(exam.exams_duration_for_pwd)
          : Number(exam.exam_duration),

      instructions:
        exam.exam_instructions || "Please read all questions carefully.",
      total_questions: exam.exam_no_questions,
      Language: uniqueLanguages,
      examsection,
    });
  } catch (error) {
    console.error("❌ Error in /instruction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.post("/start", async (req, res) => {
//   const studentId = req.user.id;
//   const selectedLanguage = req.body.Languages;
//   ////console.log"selected ", selectedLanguage);

//   try {
//     const studentExamKey = `student:${studentId}`;
//     const examData = await redisClient.get(studentExamKey);
//     const studentdata = JSON.parse(examData);
//     //console.log"data for :", studentdata);
//     const examId = studentdata.examId;

//     if (!examId) return res.status(400).json({ error: "Exam not mapped." });

//     const redisKey = `student_exam:${studentId}:${examId}`;

//     let questions = await redisClient.get(redisKey);

//     if (!questions)
//       return res.status(404).json({ error: "No questions found." });

//     questions = JSON.parse(questions);

//     //console.log"all question", questions);

//     const filteredQuestions = questions.filter((q) => {
//       if (!selectedLanguage) return true;
//       return q.Languages?.toLowerCase() === selectedLanguage.toLowerCase();
//     });

//     if (!filteredQuestions.length)
//       return res.status(404).json({
//         error: `No questions found for language: ${selectedLanguage}`,
//       });

//     await redisClient.set(redisKey, JSON.stringify(filteredQuestions));

//     await redisClient.set(`exam_started_${studentId}`, Date.now());
//     const mappedQuestions = await student.FindByStudentsmapQuestion(
//       studentId,
//       examId
//     );

//     if (mappedQuestions.length === 0) {
//       const dataArray = filteredQuestions.map((q, index) => ({
//         student_id: studentId,
//         student_exam_id: examId,
//         student_question_id: index + 1,
//         question_id: q.id,
//         sq_map_for_col_A: q.options.A.original_key,
//         sq_map_for_col_B: q.options.B.original_key,
//         sq_map_for_col_C: q.options.C.original_key,
//         sq_map_for_col_D: q.options.D.original_key,
//       }));

//       await student.AddStudents_map_Questions(dataArray);
//     }

//     await student.QuestionSeen(
//       studentId,
//       examId,
//       filteredQuestions[0].id,
//       true
//     );
//     // //console.log"All question ", filteredQuestions);

//     const firstQuestion = {
//       id: filteredQuestions[0].id,
//       question: filteredQuestions[0].question,
//       option_a: filteredQuestions[0].options.A.text,
//       option_b: filteredQuestions[0].options.B.text,
//       option_c: filteredQuestions[0].options.C.text,
//       option_d: filteredQuestions[0].options.D.text,
//       imageRef: filteredQuestions[0].imageRef,
//       option_a_image: filteredQuestions[0].option_a_image,
//       option_b_image: filteredQuestions[0].option_b_image,
//       option_c_image: filteredQuestions[0].option_c_image,
//       option_d_image: filteredQuestions[0].option_d_image,
//       question_type: filteredQuestions[0].question_type,
//     };

//     res.json({
//       question: firstQuestion,

//       total_questions: filteredQuestions.length,
//     });
//   } catch (error) {
//     console.error("Error in /start route:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.post("/start", async (req, res) => {
  const studentId = req.user.id;
  const selectedLanguage = req.body.Languages;

  try {
    const studentExamKey = `student:${studentId}`;
    const StudentsData = await redisClient.get(studentExamKey);

    if (!StudentsData) {
      return res.status(404).json({ error: "Student exam data not found." });
    }

    const studentdata = JSON.parse(StudentsData);
    studentdata.exam_started = Date.now();
    await redisClient.set(studentExamKey, JSON.stringify(studentdata));
    const examId = studentdata?.examId;

    if (!examId) {
      return res.status(400).json({ error: "Exam not mapped." });
    }

    const redisKey = `student_exam:${studentId}:${examId}`;
    let questions = await redisClient.get(redisKey);

    if (!questions) {
      return res.status(404).json({ error: "No questions found." });
    }

    questions = JSON.parse(questions);

    let filteredQuestions;
    let flatQuestions = [];

    // 🔹 Condition 1: Nested (subject → section → questions)
    if (typeof questions === "object" && !Array.isArray(questions)) {
      filteredQuestions = {};
      const subjectSectionIndexes = {}; // store counters per subject+section

      for (const subject in questions) {
        filteredQuestions[subject] = {};

        for (const section in questions[subject]) {
          // initialize counter for each subject+section
          if (!subjectSectionIndexes[subject]) {
            subjectSectionIndexes[subject] = {};
          }
          subjectSectionIndexes[subject][section] = 1;

          filteredQuestions[subject][section] = questions[subject][section]
            .filter(
              (q) =>
                !selectedLanguage ||
                q.Languages?.toLowerCase() === selectedLanguage.toLowerCase()
            )
            .map((q) => ({
              ...q,
              student_question_id: subjectSectionIndexes[subject][section]++,
              question_subject: subject,
              section: section,
            }));

          flatQuestions.push(...filteredQuestions[subject][section]);
        }
      }
    } else {
      // 🔹 Condition 2: Flat array
      filteredQuestions = questions.filter((q) => {
        if (!selectedLanguage) return true;
        return q.Languages?.toLowerCase() === selectedLanguage.toLowerCase();
      });
      flatQuestions = filteredQuestions;
    }

    if (!flatQuestions.length) {
      return res.status(404).json({
        error: `No questions found for language: ${selectedLanguage}`,
      });
    }
    // Save filtered questions separately in Redis

    await redisClient.set(
      `${redisKey}:filtered`,
      JSON.stringify(filteredQuestions)
    );

    //console.log"start data", StudentsData);

    const mappedQuestions = await student.FindByStudentsmapQuestion(
      studentId,
      examId
    );

    if (!mappedQuestions.length) {
      const dataArray = flatQuestions.map((q, index) => ({
        student_id: studentId,
        student_exam_id: examId,
        student_question_id: q.student_question_id || index + 1,
        question_id: q.id,
        sq_map_for_col_A: q.options.A.original_key,
        sq_map_for_col_B: q.options.B.original_key,
        sq_map_for_col_C: q.options.C.original_key,
        sq_map_for_col_D: q.options.D.original_key,
        question_subject: q.question_subject,
        section: q.section,
      }));
      //console.log"Data is ", dataArray);
      await student.AddStudents_map_Questions(dataArray);
    }
    ////console.log"Questions Data is ", flatQuestions);
    // 🔹 Pick first question
    let firstQuestionObj = null;

    if (Array.isArray(flatQuestions)) {
      firstQuestionObj = flatQuestions[0];
    } else {
      for (const subject in filteredQuestions) {
        for (const section in filteredQuestions[subject]) {
          if (filteredQuestions[subject][section].length > 0) {
            firstQuestionObj = filteredQuestions[subject][section][0];
            break;
          }
        }
        if (firstQuestionObj) break;
      }
    }

    if (!firstQuestionObj) {
      return res.status(404).json({ error: "No valid question found." });
    }

    // Mark first question as seen
    await student.QuestionSeen(studentId, examId, firstQuestionObj.id, true);

    // Response object
    const firstQuestion = {
      id: firstQuestionObj.id,
      question: firstQuestionObj.question,
      option_a: firstQuestionObj.options.A.text,
      option_b: firstQuestionObj.options.B.text,
      option_c: firstQuestionObj.options.C.text,
      option_d: firstQuestionObj.options.D.text,
      imageRef: firstQuestionObj.imageRef,
      option_a_image: firstQuestionObj.option_a_image,
      option_b_image: firstQuestionObj.option_b_image,
      option_c_image: firstQuestionObj.option_c_image,
      option_d_image: firstQuestionObj.option_d_image,
      question_type: firstQuestionObj.question_type,
    };

    res.json({
      question: firstQuestion,
      total_questions: flatQuestions.length,
    });
  } catch (error) {
    console.error("Error in /start route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.post("/exam_start", (req, res) => {
//   const { examId, time } = req.body;

//   const countNow = broadcastToExam(examId, {
//     type: "examSchedule",
//     message: `Exam will start in ${time} minutes`,
//     exam_start_time: time,
//   });

//   //console.log`Sent exam start message to ${countNow} students`);

//   setTimeout(() => {
//     const countLater = broadcastToExam(examId, {
//       type: "examStarted",
//       message: "Exam has started, please begin!",
//     });
//     //console.log`📢 Sent exam start notification to ${countLater} students`);
//   }, time * 60 * 1000);

//   res.json({
//     success: true,
//     message: "Exam scheduled",
//     notifiedStudents: countNow,
//   });
// });

router.post("/exam_start", async (req, res) => {
  try {
    const { examId, time } = req.body;
    const count = await broadcastToExam(examId, {
      type: "examSchedule",
      message: `Exam will start in ${time} minutes`,
      exam_start_time: time,
    });

    //console.log`✅ Schedule message sent for Exam ${examId}`);
    setTimeout(async () => {
      //console.log`⏰ Time up! Starting Exam ${examId}...`);

      await broadcastToExam(examId, {
        type: "examStarted",
        message: "Exam has started, please begin!",
      });
    }, time * 60 * 1000);

    res.json({
      success: true,
      notifiedStudents: count,
      message: "Exam scheduled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;

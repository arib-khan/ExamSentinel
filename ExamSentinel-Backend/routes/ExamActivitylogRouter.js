const express = require("express");
const Exam = require("../models/Exam");
const Activitylog = require("../models/exam_activity_log");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await Activitylog.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Activity log Data not Found " });
  }
});

router.post("/add", async (req, res) => {
  try {
    const [examRow] = await Exam.getExamIdByStudentId(req.body.student_id);
    // //console.log"student id", req.body);
    // //console.log"exam data", examRow);
    const result = await Activitylog.Add({
      ...req.body,
      exam_id: examRow.exam_id,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: true, err, msg: "Activity Data Not saved" });
  }
});
router.get("/listByExamid/:examid", async (req, res) => {
  try {
    const result = await Activitylog.Byexamid(req.params.examid);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});

router.get("/listByid/:examid/:studentid", async (req, res) => {
  try {
    //console.log"req is comming ", req.params.examid);

    const result = await Activitylog.Byexamid(req.params.examid);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;

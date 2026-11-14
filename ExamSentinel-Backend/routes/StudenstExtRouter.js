const express = require("express");
const StudentExt = require("../models/StudentsExt");
const Student = require("../models/students");
const Seat_plan_arrangement = require("../models/seat_plan_arrangement");
const InstinstExamCentreStudentMap = require("../models/inst_exam_centre_student_map");

const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await StudentExt.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, error: err.message || err, msg: "Server Error" });
  }
});
router.post("/add", async (req, res) => {
  try {
    const result = await StudentExt.Create(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
router.post("/student_pic_capture", async (req, res) => {
  try {
    const studePic = req.files?.cappic;
    const student_id = req.body.student_id;

    if (!studePic || !student_id) {
      return res.status(400).json({
        status: false,
        msg: "Missing file or student_id",
      });
    }

    const SaveDir = path.join(process.cwd(), "uploads", "students_capture_pic");
    fs.mkdirSync(SaveDir, { recursive: true });

    const FileName = `${student_id}_students_capture.jpg`;
    const FilePath = path.join(SaveDir, FileName);

    await studePic.mv(FilePath);

    const data = {
      student_id,
      student_image: FileName,
    };

    const result = await StudentExt.query(
      "INSERT INTO student_ext SET ? ON DUPLICATE KEY UPDATE ?",
      [data, data]
    );

    res.json({
      status: true,
      msg: "Student capture saved successfully",
      result,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      status: false,
      msg: "Server Error",
      error: err.message,
    });
  }
});
// POST method is better for seat allocation
router.post("/seat_Allocation", async (req, res) => {
  try {
    const roll_number = req.body.student_roll;
    if (!roll_number) {
      return res.json({
        status: false,
        msg: "Student roll number is required",
      });
    }

    // 1️⃣ Find student by roll number
    const [result] = await Student.FindByRoll(roll_number);
    if (!result) {
      return res.json({
        status: false,
        msg: "No record found for this roll number",
      });
    }

    const student_id = result.id;

    // 2️⃣ Check if seat is already allocated
    const [allocatedSeat] = await InstinstExamCentreStudentMap.StudentSeatData(
      student_id
    );

    if (allocatedSeat && allocatedSeat.iecsm_seat_num) {
      return res.json({
        status: true,
        data: {
          room: allocatedSeat.iecsm_room_name,
          seat: allocatedSeat.iecsm_seat_num,
        },
        msg: "Seat already allocated",
      });
    }

    // 3️⃣ Allocate seat (will skip already assigned seats)
    const seat = await Seat_plan_arrangement.allocateFinalSeat(
      student_id,
      roll_number
    );

    res.json({
      status: true,
      data: seat.data,
      msg: seat.msg,
    });
  } catch (err) {
    console.error(err);
    res.json({ status: false, msg: err.message });
  }
});

module.exports = router;

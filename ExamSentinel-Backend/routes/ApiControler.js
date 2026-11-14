const express = require("express");
const jwt = require("../config/Tokenmanage");
const router = express.Router();

router.use("/student", require("./student"));

router.use(async (req, res, next) => {
  try {
    const result = await jwt.authenticateToken(req);
    if (result.status) {
      return next();
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error("JWT auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//✅ Protected routes

router.use("/student_seat_plan", require("./seatplanArrangementRouter"));
router.use("/studentext", require("./StudenstExtRouter"));
router.use("/CenterSeat", require("./CenterHallRoomRowSeats"));
router.use("/userRole", require("./userRoleRounter"));
router.use("/user", require("./userRouter"));
router.use("/question", require("./questions"));
router.use("/institute", require("./InstituteRouter"));
router.use("/exam", require("./ExamRouter"));
router.use("/center", require("./centerRouter"));
router.use(
  "/student_exam_map",
  require("./inst_exam_centre_student_map_Router"),
);
router.use("/userpermision", require("./userRolepermisionRouter"));
router.use("/systemobj", require("./SystemobjectRouter"));
router.use("/studentAnswer", require("./studentsAnswerRouter"));
router.use("/activity-log", require("./ExamActivitylogRouter"));
router.use("/extract", require("./uploadFileRouter"));
router.use("/student_answers_log", require("./StudentAnswerslogRouter"));
router.use("/examset", require("./ExamsetRouter"));
router.use("/export", require("./ExcelRouter"));
router.use("/download", require("./downlodDataRouter"));
router.use("/notification", require("./NotificationRouter"));
router.use("/otp", require("./Otp_storeRouter"));
router.use("/client_preferences", require("./clientpreferencesRouter"));

// ---- Live video interview module (isolated: routes/liveInterview, services/liveInterview, models/liveInterview) ----
// Must stay BELOW the JWT middleware above: it needs req.user. The module checks permissions itself.
router.use("/live-interviews", require("./liveInterview"));

module.exports = router;

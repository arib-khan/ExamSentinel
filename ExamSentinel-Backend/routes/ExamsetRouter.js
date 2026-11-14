const express = require("express");
const Examsets = require("../models/exam_sets");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await Examsets.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});

router.post("/add", async (req, res) => {
  try {
    const result = await Examsets.Add(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err.message,
      msg: "Exam Set Data Not Saved",
    });
  }
});

module.exports = router;

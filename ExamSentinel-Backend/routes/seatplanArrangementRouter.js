const express = require("express");
const Seat_plan_arrangement = require("../models/seat_plan_arrangement");

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await Seat_plan_arrangement.getAll();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: true, err, msg: "" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const result = await Seat_plan_arrangement.Add(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Server Error " });
  }
});
module.exports = router;

const express = require("express");
const systemobjects = require("../models/systemObject");
const Optstore = require("../models/otp_store");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await systemobjects.GetAll();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      msg: "Server Error while fetching System object Data",
    });
  }
});

router.post("/Add", async (req, res) => {
  try {
    const result = await systemobjects.Add(req.body);

    res.json({
      status: true,
      result,
      msg: "successfully  Added System object Data",
    });
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      msg: "Server Error while Adding System object Data",
    });
  }
});

module.exports = router;

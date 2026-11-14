const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const data = req.body;
    const password = req.body.user_password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.add({ ...data, user_password: hashedPassword });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      err,
      msg: "Server Error while adding user",
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await User.getAll();
    res.json(result);
  } catch (err) {
    res.json({
      status: false,
      err,
      msg: "Server Error while fetching users",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await User.findById(req.params.id);
    res.json(result);
  } catch (err) {
    res.json({
      status: false,
      err,
      msg: "Server Error while fetching user",
    });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const result = await User.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.json({
      status: false,
      err,
      msg: "Server Error while updating user",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await User.delete(req.params.id);
    res.json(result);
  } catch (err) {
    res.json({
      status: false,
      err,
      msg: "Server Error while deleting user",
    });
  }
});

module.exports = router;

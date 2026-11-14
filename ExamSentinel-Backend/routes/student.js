"use strict";
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const jwt = require("../config/Tokenmanage");
const redisClient = require("../config/radishRouter");
const Students = require("../models/students");
const dotenv = require("dotenv");

dotenv.config();

// Register student (can be batch-uploaded too)

router.post("/register", async (req, res) => {
  const data = req.body;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await Students.create({ ...data, password: hashedPassword });
    res.json({ ...result, password });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/students_image", async (req, res) => {
  try {
    if (!req.files || !req.files.student_picture) {
      return res.json({ msg: "No file uploaded." });
    }
    //console.log("data is ", req.files);
    const uploadedFile = req.files.student_picture;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads/student_image");
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
      filename: fileName,
      msg: `Students Image Uploaded `,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, msg: "Server error", error: err.message });
  }
});

router.post("/students_pic", async (req, res) => {
  try {
    const filename = req.body.student_picture;
    const exam_id = req.body.exam_id;
    const basePath = process.env.STUDENT_IMAGE_PATH;

    const file = path.join(
      __dirname,
      `../${basePath}/image_${exam_id}/`,
      filename
    );
    //console.log(file);
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

router.get("/listByexam", async (req, res) => {
  try {
    const Examid = req.query.exam_id;
    const result = await Students.getAlByExam(Examid);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Student  data Not found" });
  }
});

router.post("/login", async (req, res) => {
  const { roll_number, password } = req.body;
  try {
    const rows = await Students.login(roll_number);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const student = rows[0];

    //console.log("data", rows);

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      console.timeEnd(`LoginTime-${roll_number}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const Token = jwt.generateAccessToken({ id: student.id });
    const sessionKey = `student:${student.id}`;
    const Re_login = `exam_used:${student.id}`;
    const usedTime = await redisClient.get(Re_login);
    const newTime = Number(parseFloat(usedTime).toFixed(3));

    //console.log("data from redis", parsedUsedTime);

    const status = await redisClient.get(`exam_status:${student.id}`);

    if (status === "Submitted") {
      return res.json({
        status: false,
        msg: "Exam already submitted. Login not allowed.",
      });
    }
    if (status === "Active") {
      return res.json({
        status: false,
        msg: "student Already . Login in Other system.",
      });
    }

    //console.log("set data ", student);
    await redisClient.setEx(
      sessionKey,
      300000,
      JSON.stringify({
        id: student.id,
        roll_number: student.roll_number,
        name: student.name,
        token: Token,
        pwd: student.is_disabled,
        examId: student.student_exam_id,
      })
    );

    // totalLogins++;
    // console.log("login student id :", student.id);
    const mins = Math.floor(newTime / 60);
    const secs = newTime % 60;
    const parsedUsedTime = `${mins}.${secs < 10 ? "0" + secs : secs}`;
    res.json({
      success: true,
      data: {
        student_id: student,
        token: Token,
        ...(parsedUsedTime > 0 && { used_Time: parsedUsedTime }),
      },
      msg: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await Students.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err, msg: "Data Not found" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await Students.update(id, data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false });
  }
});
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await Students.delete(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: true, data: err });
  }
});

router.delete("/deleteAllStudens/:id", async (req, res) => {
  try {
    const result = await Students.deleteStudentsByExam(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: true, data: err });
  }
});

router.get("/data", async (req, res) => {
  try {
    const student_id = req.body.student_id;
    const data = await redisClient.get(`student:${student_id}`);
    if (data) {
      const student = JSON.parse(data);
      console.log("🧠 Student from Redis:", student);
    }
    res.json({ status: true, data: data });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;

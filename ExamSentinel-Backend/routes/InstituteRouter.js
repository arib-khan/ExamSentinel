const express = require("express");
const pool = require("../config/db");
const Institiude = require("../models/institude");
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const result = await Institiude.Add(req.body);
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err, msg: "Data not Inserted" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const clientId = req.user.clientId;
    const result = await Institiude.getAll(clientId);
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Data Not found" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(`UPDATE INSTITUTE SET? WHERE inst_id = ?`, [
      { ...req.body },
      id,
    ]);
    res.json({
      status: true,
      data: result,
      msg: "Institute Data Update successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err, msg: "Institude Data Not Update" });
  }
});
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(`delete from INSTITUTE WHERE inst_id = ?`, [
      id,
    ]);
    res.json({
      status: true,
      data: result,
      msg: "Institute Data Deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ status: false, data: err, msg: "Institude Data Not delete" });
  }
});

router.post("/water_image", async (req, res) => {
  try {
    if (!req.files || !req.files.inst_watermark) {
      return res.json({ msg: "No file uploaded." });
    }
    ////console.log"data is ", req.files);
    const uploadedFile = req.files.inst_watermark;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads/Institude_Water_image");
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
      msg: `Water Mark Image Uploaded `,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, msg: "Server error", error: err.message });
  }
});

router.post("/get_watermark_pic", async (req, res) => {
  try {
    const filename = req.body.inst_watermark;
    const file = path.join(
      __dirname,
      "../uploads/Institude_Water_image",
      filename
    );
    //console.logfile);
    res.sendFile(file);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      err,
      msg: "Error accured in getting water Mark picture",
    });
  }
});

module.exports = router;

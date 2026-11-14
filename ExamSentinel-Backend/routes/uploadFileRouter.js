const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const config = require("../config/excelConfig.json");
const Students = require("../models/students");
const Questions = require("../models/questions");
const Exam = require("../models/Exam");
const AdmZip = require("adm-zip");
const CenterHallRoomRowSeats = require("../models/center_hall_room_row_seats");
const InstinstExamCentreStudentMap = require("../models/inst_exam_centre_student_map");

const dotenv = require("dotenv");

dotenv.config();

router.post("/import_excel", async (req, res) => {
  try {
    const exam_id = req.body.ques_exam_id;
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const uploadedFile = req.files.file;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads");
    const savePath = path.join(uploadPath, fileName);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    // Save the file
    await new Promise((resolve, reject) => {
      uploadedFile.mv(savePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const excelPath = path.join(uploadPath, fileName);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log("data", rows);
    const columns = config.columns;
    if (!columns || !columns.question) {
      return res.status(400).json({ msg: "Invalid column config." });
    }

    let inserted = 0;
    let upload_quetion = [];
    for (const excelRow of rows) {
      let newQuestion = {};

      // ✅ Normalize Excel row keys (trim + lowercase)
      const normalizedRow = {};
      for (const key of Object.keys(excelRow)) {
        normalizedRow[key.trim().toLowerCase()] = excelRow[key];
      }

      // ✅ Dynamically map columns from config
      for (const [dbCol, excelCol] of Object.entries(config.columns)) {
        const normalizedExcelCol = excelCol.trim().toLowerCase();
        if (normalizedRow[normalizedExcelCol] !== undefined) {
          newQuestion[dbCol] = normalizedRow[normalizedExcelCol];
        } else {
          newQuestion[dbCol] = null;
        }
      }

      try {
        await Questions.Add({ ...newQuestion, ques_exam_id: exam_id });
        upload_quetion.push(newQuestion);
        inserted++;
      } catch (err) {
        console.warn("Insert failed:", err.message);
      }
    }

    res.json({
      status: true,
      data: upload_quetion,
      msg: `✅ ${inserted} questions inserted from Excel.`,
    });
  } catch (err) {
    console.error("❌ Excel import error:", err);
    res
      .status(500)
      .json({ status: false, msg: "Server error", error: err.message });
  }
});

router.post("/student_data", async (req, res) => {
  try {
    const exam_id = req.body.student_exam_id;
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const uploadedFile = req.files.file;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads");
    const savePath = path.join(uploadPath, fileName);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    await new Promise((resolve, reject) => {
      uploadedFile.mv(savePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const excelPath = path.join(uploadPath, fileName);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
      cellDates: true,
    });

    function formatDOB(d) {
      if (d instanceof Date) {
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}${month}${year}`;
      }
      return String(d).replace(/[^0-9]/g, "");
    }

    const insertdata = [];

    for (let i = 0; i < rows.length; i++) {
      const excelRow = rows[i];
      const client = await Exam.getById(exam_id);
      // Map Excel columns to database columns (reversed the mapping)
      const mapped = {};
      for (const [dbCol, excelCol] of Object.entries(config.studentcolumns)) {
        if (excelRow[excelCol] !== undefined) {
          mapped[dbCol] = excelRow[excelCol];
        }
      }

      const password = formatDOB(mapped.date_of_birth);
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await Students.create({
        ...mapped,
        student_exam_id: exam_id,
        password: hashedPassword,
      });

      const mapdata = {
        iecsm_inst_id: client.exam_inst_id,
        iecsm_exam_id: Number(exam_id),
        iecsm_student_id: result.insertId,
      };
      console.log("data ", mapdata, result);
      if (result.status && result.insertId) {
        const map = await InstinstExamCentreStudentMap.Add(mapdata);
        insertdata.push(mapped);
      } else {
        insertdata.push(result);
      }
    }

    res.json({
      status: true,
      insertdata,
      msg: "students Data uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      error: "Failed to process student data",
      details: err.message,
    });
  }
});

router.post("/centerData", async (req, res) => {
  try {
    const center_id = req.body.center_id;
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const uploadedFile = req.files.file;
    const fileName = uploadedFile.name;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const uploadPath = path.join(__dirname, "../uploads");
    const savePath = path.join(uploadPath, fileName);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    await new Promise((resolve, reject) => {
      uploadedFile.mv(savePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const workbook = xlsx.readFile(savePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const centercolumns = config.centercolumns;
    if (!centercolumns) {
      return res
        .status(400)
        .json({ msg: "❌ Column mapping not found in config." });
    }

    const bulkInsertData = [];

    for (const row of rows) {
      const newCenter = { center_id };

      Object.keys(centercolumns).forEach((dbCol) => {
        const excelCol = centercolumns[dbCol];
        newCenter[dbCol] = row[excelCol] || null;
      });

      newCenter.center_seat_label = [
        newCenter.center_block,
        newCenter.center_floor_number,
        newCenter.center_hall,
        newCenter.center_room,
        newCenter.center_row,
        newCenter.center_seat_number,
      ]
        .filter(Boolean)
        .join("/");

      bulkInsertData.push(newCenter);
    }

    const result = await CenterHallRoomRowSeats.AddBulk(bulkInsertData);

    res.json({
      status: true,
      inserted: bulkInsertData.length,
      msg: `✅ ${bulkInsertData.length} center seats inserted successfully`,
      result,
    });
  } catch (err) {
    console.error("❌ Excel import error:", err);
    res.status(500).json({
      status: false,
      msg: "Server error",
      error: err.message,
    });
  }
});
router.post("/questions_image_zip/:exam_id", async (req, res) => {
  try {
    const { exam_id } = req.params;

    if (!req.files || !req.files.zipfile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const zipFile = req.files.zipfile;

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      `Question_images_zip_${exam_id}`
    );
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const zipFileName = `${exam_id}_question_image.zip`;
    const zipPath = path.join(uploadDir, zipFileName);
    await zipFile.mv(zipPath);

    res.json({
      status: true,
      msg: "question images ZIP file uploaded successfully",
      exam_id,
    });
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      msg: "Failed to upload ZIP file",
    });
  }
});
router.post("/students_image_zip/:exam_id", async (req, res) => {
  try {
    const { exam_id } = req.params;

    if (!req.files || !req.files.zipfile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const zipFile = req.files.zipfile;

    const zipSaveDir = path.join(
      process.cwd(),
      "uploads",
      "students_zip_files"
    );
    fs.mkdirSync(zipSaveDir, { recursive: true });
    // File name → exam_id_timestamp.zip
    const zipFileName = `${exam_id}_students_image.zip`;
    const zipFilePath = path.join(zipSaveDir, zipFileName);

    await zipFile.mv(zipFilePath);

    // 📂 Step 2: Extract ZIP to temporary folder
    const tempExtractDir = path.join(
      process.cwd(),
      "uploads",
      "temp_extract",
      exam_id
    );
    if (!fs.existsSync(tempExtractDir))
      fs.mkdirSync(tempExtractDir, { recursive: true });

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(tempExtractDir, true);

    const baseDir = process.env.STUDENTS_IMAGE_Store_DIR;
    const finalDir = path.join(
      process.cwd(),
      baseDir,
      `image_${exam_id.toString()}`
    );
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

    // Find inside tempExtractDir → usually one folder like "Image" or "Photos"
    const innerItems = fs.readdirSync(tempExtractDir);
    for (const item of innerItems) {
      const srcPath = path.join(tempExtractDir, item);
      const destPath = path.join(finalDir, item);

      // If folder inside zip (e.g., "Image"), copy its contents
      if (fs.statSync(srcPath).isDirectory()) {
        const innerFiles = fs.readdirSync(srcPath);
        for (const file of innerFiles) {
          fs.renameSync(path.join(srcPath, file), path.join(finalDir, file));
        }
      } else {
        fs.renameSync(srcPath, destPath);
      }
    }

    // 🧹 Optional: Clean up temporary extracted folder
    fs.rmSync(tempExtractDir, { recursive: true, force: true });

    // 🧾 Step 4: List all images from finalDir
    const imageFiles = fs
      .readdirSync(finalDir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    const publicImagePaths = imageFiles.map(
      (f) => `/uploads/students_images/${exam_id}/image/${f}`
    );

    const relativeZipPath = `/uploads/students_zip_files/${zipFileName}`;

    res.json({
      status: true,
      msg: "✅ Student ZIP uploaded & extracted successfully",
      exam_id,
      zip_file: relativeZipPath,
      extracted_to: `/uploads/students_images/${exam_id}/image/`,
      total_images: publicImagePaths.length,
      image_paths: publicImagePaths,
    });
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      msg: "❌ Failed to upload or extract ZIP file",
      error: err.message,
    });
  }
});

router.post("/students_image_extract", async (req, res) => {
  try {
    if (!req.files || !req.files.zipfile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const zipFile = req.files.zipfile;

    // Save ZIP
    const zipSaveDir = path.join(
      process.cwd(),
      "uploads",
      "students_zip_files"
    );
    fs.mkdirSync(zipSaveDir, { recursive: true });

    const zipFilePath = path.join(zipSaveDir, zipFile.name);
    await zipFile.mv(zipFilePath);

    // Extract ZIP
    const finalDir = path.join(
      process.cwd(),
      "uploads",
      "students_images",
      `image_${exam_id}`
    );
    fs.mkdirSync(finalDir, { recursive: true });

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(finalDir, true);

    // Cleanup uploaded ZIP
    fs.unlinkSync(zipFilePath);

    res.json({
      status: true,
      msg: "✅ ZIP extracted successfully",
      exam_id,
    });
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      msg: "❌ Failed to upload or extract ZIP",
      error: err.message,
    });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const xlsx = require("xlsx");
// const bcrypt = require("bcrypt");
// const AdmZip = require("adm-zip");
// const dotenv = require("dotenv");

// dotenv.config();

// // =============================
// // 🌍 PATHS FROM ENV
// // =============================
// const BASE_DIR = process.cwd();
// const UPLOADS_BASE = path.join(BASE_DIR, process.env.UPLOADS_BASE);
// const EXCEL_UPLOAD_DIR = path.join(BASE_DIR, process.env.EXCEL_UPLOAD_DIR);
// const QUESTION_IMAGE_ZIP_DIR = path.join(BASE_DIR, process.env.QUESTION_IMAGE_ZIP_DIR);
// const STUDENTS_ZIP_DIR = path.join(BASE_DIR, process.env.STUDENTS_ZIP_DIR);
// const TEMP_EXTRACT_DIR = path.join(BASE_DIR, process.env.TEMP_EXTRACT_DIR);
// const STUDENTS_IMAGE_DIR = path.join(BASE_DIR, process.env.STUDENTS_IMAGE_DIR);
// const EXCEL_CONFIG_PATH = path.join(BASE_DIR, process.env.EXCEL_CONFIG_PATH);

// // ✅ Ensure upload folders exist
// [
//   UPLOADS_BASE,
//   EXCEL_UPLOAD_DIR,
//   QUESTION_IMAGE_ZIP_DIR,
//   STUDENTS_ZIP_DIR,
//   TEMP_EXTRACT_DIR,
//   STUDENTS_IMAGE_DIR,
// ].forEach((dir) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// // =============================
// // 🧩 MODELS
// // =============================
// const config = require(EXCEL_CONFIG_PATH);
// const Students = require("../models/students");
// const Questions = require("../models/questions");
// const CenterHallRoomRowSeats = require("../models/center_hall_room_row_seats");
// const InstinstExamCentreStudentMap = require("../models/inst_exam_centre_student_map");

// // =============================
// // 📘 IMPORT QUESTIONS EXCEL
// // =============================
// router.post("/import_excel", async (req, res) => {
//   try {
//     const exam_id = req.body.ques_exam_id;
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     const uploadedFile = req.files.file;
//     const fileName = uploadedFile.name;
//     const savePath = path.join(EXCEL_UPLOAD_DIR, fileName);

//     await uploadedFile.mv(savePath);

//     const workbook = xlsx.readFile(savePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     const columns = config.columns;
//     if (!columns || !columns.question) {
//       return res.status(400).json({ msg: "Invalid column config." });
//     }

//     let inserted = 0;
//     let upload_question = [];

//     for (const row of rows) {
//       const newQuestion = {
//         question: row[columns.question],
//         option_a: row[columns.option_a] || null,
//         option_b: row[columns.option_b] || null,
//         option_c: row[columns.option_c] || null,
//         option_d: row[columns.option_d] || null,
//         option_e: row[columns.option_e] || null,
//         option_f: row[columns.option_f] || null,
//         ques_exam_id: row[columns.ques_exam_id] || exam_id,
//         imageRef: row[columns.imageRef],
//         correct_option: String(row[columns.correct_option] || "").charAt(0),
//         answer_key_ref: String(row[columns.answer_key_ref] || ""),
//         Language: row[columns.Language] || null,
//         Mark: parseInt(row[columns.Mark]) || null,
//         NegativeMark: parseFloat(row[columns.NegativeMark]) || null,
//         Duration: row[columns.Duration] || null,
//         DifficultyLevel: parseInt(row[columns.DifficultyLevel]) || 1,
//         Reference: parseInt(row[columns.Reference]) || null,
//         RandomizeOption: row[columns.RandomizeOption] || "No",
//         Group_question_No: row[columns.Group_question_No] || null,
//         option_a_image: row[columns.option_a_image] || null,
//         option_b_image: row[columns.option_b_image] || null,
//         option_c_image: row[columns.option_c_image] || null,
//         option_d_image: row[columns.option_d_image] || null,
//       };

//       try {
//         await Questions.Add(newQuestion);
//         upload_question.push(newQuestion);
//         inserted++;
//       } catch (err) {
//         console.warn("Insert failed:", err.message);
//       }
//     }

//     res.json({
//       status: true,
//       data: upload_question,
//       msg: `✅ ${inserted} questions inserted from Excel.`,
//     });
//   } catch (err) {
//     console.error("❌ Excel import error:", err);
//     res.status(500).json({ status: false, msg: "Server error", error: err.message });
//   }
// });

// // =============================
// // 📗 IMPORT STUDENT EXCEL
// // =============================
// router.post("/student_data", async (req, res) => {
//   try {
//     const exam_id = req.body.student_exam_id;
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     const uploadedFile = req.files.file;
//     const fileName = uploadedFile.name;
//     const savePath = path.join(EXCEL_UPLOAD_DIR, fileName);

//     await uploadedFile.mv(savePath);

//     const workbook = xlsx.readFile(savePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet, { raw: false, cellDates: true });

//     function formatDOB(d) {
//       if (d instanceof Date) {
//         const day = String(d.getDate()).padStart(2, "0");
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const year = d.getFullYear();
//         return `${day}${month}${year}`;
//       }
//       return String(d).replace(/[^0-9]/g, "");
//     }

//     const insertdata = [];
//     for (let i = 0; i < rows.length; i++) {
//       const data = rows[i];
//       const password = formatDOB(data.date_of_birth);
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const result = await Students.create({
//         ...data,
//         student_exam_id: exam_id,
//         password: hashedPassword,
//       });

//       const mapdata = {
//         iecsm_inst_id: req.user.clientId,
//         iecsm_exam_id: exam_id,
//         iecsm_student_id: result.insertId,
//       };

//       if (result.status && result.insertId) {
//         await InstinstExamCentreStudentMap.Add(mapdata);
//         insertdata.push(data);
//       } else {
//         insertdata.push(result);
//       }
//     }

//     res.json({
//       status: true,
//       insertdata,
//       msg: "✅ Students data uploaded successfully.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: false, msg: "Server error", error: err.message });
//   }
// });

// // =============================
// // 📘 IMPORT CENTER DATA
// // =============================
// router.post("/centerData", async (req, res) => {
//   try {
//     const center_id = req.body.center_id;
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     const uploadedFile = req.files.file;
//     const fileName = uploadedFile.name;
//     const savePath = path.join(EXCEL_UPLOAD_DIR, fileName);

//     await uploadedFile.mv(savePath);

//     const workbook = xlsx.readFile(savePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     const centercolumns = config.centercolumns;
//     if (!centercolumns) {
//       return res.status(400).json({ msg: "❌ Column mapping not found in config." });
//     }

//     const bulkInsertData = [];

//     for (const row of rows) {
//       const newCenter = { center_id };
//       Object.keys(centercolumns).forEach((dbCol) => {
//         const excelCol = centercolumns[dbCol];
//         newCenter[dbCol] = row[excelCol] || null;
//       });

//       newCenter.center_seat_label = [
//         newCenter.center_block,
//         newCenter.center_floor_number,
//         newCenter.center_hall,
//         newCenter.center_room,
//         newCenter.center_row,
//         newCenter.center_seat_number,
//       ]
//         .filter(Boolean)
//         .join("/");

//       bulkInsertData.push(newCenter);
//     }

//     const result = await CenterHallRoomRowSeats.AddBulk(bulkInsertData);

//     res.json({
//       status: true,
//       inserted: bulkInsertData.length,
//       msg: `✅ ${bulkInsertData.length} center seats inserted successfully.`,
//       result,
//     });
//   } catch (err) {
//     console.error("❌ Center data import error:", err);
//     res.status(500).json({ status: false, msg: "Server error", error: err.message });
//   }
// });

// // =============================
// // 🧩 QUESTION IMAGES ZIP UPLOAD
// // =============================
// router.post("/questions_image_zip/:exam_id", async (req, res) => {
//   try {
//     const { exam_id } = req.params;

//     if (!req.files || !req.files.zipfile) {
//       return res.json({ success: false, message: "No file uploaded" });
//     }

//     const zipFile = req.files.zipfile;
//     const uploadDir = path.join(QUESTION_IMAGE_ZIP_DIR, `exam_${exam_id}`);
//     fs.mkdirSync(uploadDir, { recursive: true });

//     const zipPath = path.join(uploadDir, `${exam_id}_question_image.zip`);
//     await zipFile.mv(zipPath);

//     res.json({
//       status: true,
//       msg: "✅ Question images ZIP file uploaded successfully.",
//       exam_id,
//       saved_at: zipPath,
//     });
//   } catch (err) {
//     console.error(err);
//     res.json({ status: false, msg: "❌ Failed to upload ZIP file", error: err.message });
//   }
// });

// // =============================
// // 🧩 STUDENT IMAGES ZIP UPLOAD & EXTRACT
// // =============================
// router.post("/students_image_zip/:exam_id", async (req, res) => {
//   try {
//     const { exam_id } = req.params;

//     if (!req.files || !req.files.zipfile) {
//       return res.json({ success: false, message: "No file uploaded" });
//     }

//     const zipFile = req.files.zipfile;
//     const zipFileName = `${exam_id}_students_image.zip`;
//     const zipFilePath = path.join(STUDENTS_ZIP_DIR, zipFileName);

//     await zipFile.mv(zipFilePath);

//     // Extract ZIP
//     const tempExtractDir = path.join(TEMP_EXTRACT_DIR, `exam_${exam_id}`);
//     fs.mkdirSync(tempExtractDir, { recursive: true });

//     const zip = new AdmZip(zipFilePath);
//     zip.extractAllTo(tempExtractDir, true);

//     const finalDir = path.join(STUDENTS_IMAGE_DIR, `image_${exam_id}`);
//     fs.mkdirSync(finalDir, { recursive: true });

//     const innerItems = fs.readdirSync(tempExtractDir);
//     for (const item of innerItems) {
//       const srcPath = path.join(tempExtractDir, item);
//       const destPath = path.join(finalDir, item);
//       if (fs.statSync(srcPath).isDirectory()) {
//         const innerFiles = fs.readdirSync(srcPath);
//         for (const file of innerFiles) {
//           fs.renameSync(path.join(srcPath, file), path.join(finalDir, file));
//         }
//       } else {
//         fs.renameSync(srcPath, destPath);
//       }
//     }

//     fs.rmSync(tempExtractDir, { recursive: true, force: true });

//     const imageFiles = fs
//       .readdirSync(finalDir)
//       .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

//     res.json({
//       status: true,
//       msg: "✅ Student ZIP uploaded & extracted successfully.",
//       exam_id,
//       total_images: imageFiles.length,
//       extracted_to: finalDir,
//     });
//   } catch (err) {
//     console.error(err);
//     res.json({ status: false, msg: "❌ Failed to upload/extract ZIP", error: err.message });
//   }
// });

// module.exports = router;

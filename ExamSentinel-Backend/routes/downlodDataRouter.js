const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const Optstore = require("../models/otp_store");
const AdmZip = require("adm-zip");
const { route } = require("./SystemobjectRouter");

router.get("/:centre_id", async (req, res) => {
  const { centre_id } = req.params;

  if (!centre_id) {
    return res.status(400).json({ error: "centre_id is required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const queries = {
      center_hall_room_row_seats: `SELECT * FROM center_hall_room_row_seats WHERE center_id = ?`,
      inst_exam_centre_student_map: `SELECT * FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?`,
      students: `SELECT * FROM students WHERE id IN (SELECT iecsm_student_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
      centres: `SELECT * FROM centres WHERE centre_id = ?`,
      exams: `SELECT * FROM exams WHERE exam_id IN (SELECT iecsm_exam_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
      institute: `SELECT * FROM institute WHERE inst_id IN (SELECT iecsm_inst_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
      // questions: `SELECT * FROM questions WHERE ques_exam_id IN (SELECT iecsm_exam_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
    };
    // Folder to store dumps
    const tempDir = path.join(__dirname, "../dumps");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    // Object to hold all table data
    const combinedData = {};

    // Fetch data for each query

    for (const [table, query] of Object.entries(queries)) {
      const [rows] = await connection.query(query, [centre_id]);
      combinedData[table] = rows;
    }
    const filePath = path.join(tempDir, `centre_${centre_id}_dump.json`);
    fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 2));
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=centre_${centre_id}_dump.json`
    );

    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      } else {
        // Delete file after sending
        // fs.unlink(filePath, (unlinkErr) => {
        //   if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        // });
      }
    });
  } catch (error) {
    console.error("Dump Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

async function bulkInsert(connection, table, rows) {
  if (!rows || rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const values = rows.map((row) => columns.map((col) => row[col]));

  // Use INSERT IGNORE to avoid duplicate key conflicts
  const sql = `INSERT IGNORE INTO ${table} (${columns.join(",")}) VALUES ?`;
  await connection.query(sql, [values]);
}

router.post("/import/:filename", async (req, res) => {
  const { filename } = req.params;

  try {
    // ✅ Ensure file was uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const filePath = path.join(uploadDir, filename);
    await file.mv(filePath);

    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const insertOrder = [
        "institute",
        "centres",
        "exams",
        "questions",
        "students",
        "center_hall_room_row_seats",
        "inst_exam_centre_student_map",
      ];

      for (const table of insertOrder) {
        const data = jsonData[table];
        if (data && data.length > 0) {
          //console.log`🔹 Inserting ${data.length} rows into ${table}...`);
          await bulkInsert(connection, table, data);
        }
      }

      await connection.commit();
      connection.release();
      res.json({ message: "✅ Data imported successfully (bulk insert used)" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Import transaction failed:", error);
      res.status(500).json({ error: "Import failed", details: error.message });
    }
  } catch (error) {
    console.error("Import error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/student_image/:exam_id", async (req, res) => {
  try {
    const { exam_id } = req.params;

    const zipSaveDir = path.join(
      process.cwd(),
      "uploads",
      "students_zip_files"
    );
    const zipFileName = `${exam_id}_students_image.zip`;
    const zipFilePath = path.join(zipSaveDir, zipFileName);
    res.sendFile(zipFilePath);
  } catch (err) {
    console.error(err);
    res.json({ msg: "server Error" });
  }
});

router.get("/question_image/:exam_id", async (req, res) => {
  try {
    const { exam_id } = req.params;

    const zipSaveDir = path.join(
      process.cwd(),
      "uploads",
      `Question_images_zip_${exam_id}`
    );
    const zipFileName = `${exam_id}_question_image.zip`;
    const zipFilePath = path.join(zipSaveDir, zipFileName);
    res.sendFile(zipFilePath);
  } catch (err) {
    console.error(err);
    res.json({ msg: "server Error" });
  }
});

router.post("/students_image_extract/:exam_id", async (req, res) => {
  try {
    const { exam_id } = req.params;

    if (!req.files || !req.files.zipfile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const zipFile = req.files.zipfile;

    // Create extraction folder
    const finalDir = path.join(
      process.cwd(),
      "uploads",
      "students_images",
      `image_${exam_id}`
    );
    fs.mkdirSync(finalDir, { recursive: true });

    const zip = new AdmZip(zipFile.data);
    const zipEntries = zip.getEntries();

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const fileName = path.basename(entry.entryName);
        const filePath = path.join(finalDir, fileName);
        fs.writeFileSync(filePath, entry.getData());
      }
    });

    res.json({
      status: true,
      msg: "✅ ZIP extracted successfully without extra folder",
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

router.post("/question_image_extract", async (req, res) => {
  try {
    if (!req.files || !req.files.zipfile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const zipFile = req.files.zipfile;

    const finalDir = path.join(process.cwd(), "uploads", "Questions_img");
    fs.mkdirSync(finalDir, { recursive: true });

    const zip = new AdmZip(zipFile.data);
    const zipEntries = zip.getEntries();

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const fileName = path.basename(entry.entryName); // Remove folder structure
        const filePath = path.join(finalDir, fileName);
        fs.writeFileSync(filePath, entry.getData());
      }
    });

    res.json({
      status: true,
      msg: "✅ ZIP extracted successfully without extra folder",
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

router.post("/Activate_questions", async (req, res) => {
  //const exam_id = req.params.examid;

  const { center_id, exam_id, otp } = req.body;

  const result = await Optstore.GetByOtp({ center_id, exam_id, otp });

  if (!result || result.otp !== otp) {
    return res.json({ status: false, msg: "Invalid OTP" });
  }

  // if (
  //   String(result.user_id).toLowerCase() !== String(req.user.id).toLowerCase()
  // ) {
  //   return res.json({ status: false, result, msg: "Unauthorized User" });
  // }

  const currentTime = new Date();
  const expiryTime = new Date(result.expires_at);

  // console.log("expiry time :", expiryTime, "current time ", currentTime);
  if (currentTime > expiryTime) {
    return res.json({ status: false, msg: "OTP Expired" });
  }
  //return res.json({ status: true, msg: "OTP Verified Successfully" });
  if (result.otp_verifyed == "Yes") {
    return res.json({ status: false, msg: "OTP Allready Verifyed" });
  }
  // let otp_verifyed = "Yes";
  const resul = await Optstore.verifyedotp(otp_verifyed, otp);
  if (!exam_id) {
    return res.status(400).json({ error: "exam_id is required" });
  }
  let connection;
  try {
    connection = await pool.getConnection();

    const [questions] = await connection.query(
      `SELECT * FROM questions WHERE ques_exam_id = ?`,
      [exam_id]
    );

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: "No questions found for this exam" });
    }

    // Wrap inside an object { questions: [...] }
    const jsonData = {
      questions: questions,
    };

    // Folder create if not exists
    const tempDir = path.join(__dirname, "../uploads/dumps");

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `questions_${exam_id}.json`);

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=questions_${exam_id}.json`
    );
    console.log("Dir ", filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");
// const fs = require("fs");
// const path = require("path");

// router.get("/:centre_id", async (req, res) => {
//   const { centre_id } = req.params;

//   if (!centre_id) {
//     return res.status(400).json({ error: "centre_id is required" });
//   }

//   let connection;
//   try {
//     connection = await pool.getConnection();

//     // ✅ Define all your queries (same as your version)
//     const queries = {
//       centres: `SELECT * FROM centres WHERE centre_id = ?`,
//       center_hall_room_row_seats: `SELECT * FROM center_hall_room_row_seats WHERE center_id = ?`,
//       institute: `SELECT * FROM institute WHERE inst_id IN (SELECT iecsm_inst_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
//       exams: `SELECT * FROM exams WHERE exam_id IN (SELECT iecsm_exam_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
//       students: `SELECT * FROM students WHERE id IN (SELECT iecsm_student_id FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?)`,
//       inst_exam_centre_student_map: `SELECT * FROM inst_exam_centre_student_map WHERE iecsm_centre_id = ?`,
//     };

//     // ✅ Define the desired order of dumping
//     const dumpOrder = [
//       "centres",
//       "center_hall_room_row_seats",
//       "institute",
//       "exams",
//       "students",
//       "inst_exam_centre_student_map",
//     ];

//     // ✅ Ensure dump directory exists
//     const tempDir = path.join(__dirname, "../dumps");
//     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//     const sqlFilePath = path.join(tempDir, `centre_${centre_id}_dump.sql`);
//     const writeStream = fs.createWriteStream(sqlFilePath);

//     writeStream.write(`-- SQL Dump for Centre ID: ${centre_id}\n`);
//     writeStream.write(`-- Generated at: ${new Date().toISOString()}\n\n`);

//     // ✅ Helper to convert rows into INSERT statements
//     const buildInsertSQL = (tableName, rows) => {
//       if (!rows.length) return "";

//       const columns = Object.keys(rows[0]);
//       const insertStatements = rows
//         .map((row) => {
//           const values = columns
//             .map((col) => {
//               const val = row[col];
//               if (val === null) return "NULL";

//               // Format date/datetime
//               if (val instanceof Date)
//                 return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;

//               // Handle GMT-style date strings
//               if (typeof val === "string" && val.includes("GMT")) {
//                 const date = new Date(val);
//                 if (!isNaN(date))
//                   return `'${date
//                     .toISOString()
//                     .slice(0, 19)
//                     .replace("T", " ")}'`;
//               }

//               return typeof val === "number"
//                 ? val
//                 : `'${String(val).replace(/'/g, "''")}'`;
//             })
//             .join(", ");
//           return `INSERT INTO ${tableName} (${columns.join(
//             ", "
//           )}) VALUES (${values});`;
//         })
//         .join("\n");

//       return `-- Dumping data for table: ${tableName}\n${insertStatements}\n\n`;
//     };

//     // ✅ Loop through tables in your defined order
//     for (const table of dumpOrder) {
//       const [rows] = await connection.query(queries[table], [centre_id]);
//       const sqlContent = buildInsertSQL(table, rows);
//       writeStream.write(sqlContent);
//     }

//     writeStream.end();

//     writeStream.on("finish", () => {
//       res.download(sqlFilePath, `centre_${centre_id}_dump.sql`);
//     });
//   } catch (error) {
//     console.error("Dump Error:", error);
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// router.post("/export/:filename", async (req, res) => {
//   const { filename } = req.params;

//   const tempDir = path.join(__dirname, "../uploads");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//   const file = req.files.sqlfile;
//   const sqlFilePath = path.join(tempDir, filename);

//   await file.mv(sqlFilePath); // ✅ move file to actual path

//   if (!fs.existsSync(sqlFilePath)) {
//     return res.status(404).json({ error: "SQL dump file not found." });
//   }

//   let connection;
//   try {
//     connection = await pool.getConnection();

//     const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

//     const queries = sqlContent
//       .split(/;\s*[\r\n]+/)
//       .map((q) => q.trim())
//       .filter((q) => q && !q.startsWith("--"));

//     let executed = 0;

//     for (const query of queries) {
//       try {
//         await connection.query(query);
//         executed++;
//       } catch (err) {
//         console.warn("⚠️ Skipped query:", query.slice(0, 100), err.message);
//       }
//     }

//     res.json({
//       message: `✅ Executed ${executed} queries from ${sqlFilePath}`,
//     });
//   } catch (error) {
//     console.error("Restore Error:", error);
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

module.exports = router;

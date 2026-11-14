const express = require("express");
const ExcelJS = require("exceljs");
const studentAnswer = require("../models/studentsAnswer");
const studentAnswerlog = require("../models/student_answers_log");
const router = express.Router();

router.post("/student-data", async (req, res) => {
  try {
    // Example data (replace with DB fetch result)
    const { student_exam_id } = req.body;
    const rows = await studentAnswer.RawResultExcel(student_exam_id);
    const studentData = rows.map((row) => {
      const mapQuestion = {
        student_question_id: row.student_question_id,
        student_name: row.name,
        student_question_id: row.student_question_id,
        roll_number: row.roll_number,
        question: row.question,
        sq_map_for_col_A:
          row[`option_${row.sq_map_for_col_A?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_B:
          row[`option_${row.sq_map_for_col_B?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_C:
          row[`option_${row.sq_map_for_col_C?.toLowerCase?.() || ""}`] || null,
        sq_map_for_col_D:
          row[`option_${row.sq_map_for_col_D?.toLowerCase?.() || ""}`] || null,
        selected_Answer:
          row[`option_${row.selected_option?.toLowerCase?.() || ""}`] || null,
        selected_option: row.selected_option,
        answer_text: row.answer_text,
        ...(row.question_subject ? { subject: row.question_subject } : {}),

        ...(row.section ? { section: row.section } : {}),
      };

      return mapQuestion;
    });
    // Create workbook and worksheet

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Data");

    // Base columns
    const columns = [
      { header: "Student Roll", key: "roll_number", width: 15 },
      { header: "Student Name", key: "student_name", width: 15 },
      { header: "Student Question ID", key: "student_question_id", width: 20 },
      { header: "Question", key: "question", width: 60 },
      { header: "Option A", key: "sq_map_for_col_A", width: 15 },
      { header: "Option B", key: "sq_map_for_col_B", width: 15 },
      { header: "Option C", key: "sq_map_for_col_C", width: 15 },
      { header: "Option D", key: "sq_map_for_col_D", width: 15 },
      { header: "Selected Answer", key: "selected_Answer", width: 20 },
      { header: "Selected Optionst", key: "selected_option", width: 10 },
      { header: "Answer Text", key: "answer_text", width: 20 },
    ];

    // 👉 Check if subject exists in any row
    if (studentData.some((row) => row.subject)) {
      columns.push({ header: "Subject", key: "subject", width: 20 });
    }

    // 👉 Check if section exists in any row
    if (studentData.some((row) => row.section)) {
      columns.push({ header: "Section", key: "section", width: 15 });
    }

    worksheet.columns = columns;

    // Add rows
    studentData.forEach((row) => {
      worksheet.addRow(row);
    });

    // Style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Send as Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_data.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).send("Error generating Excel");
  }
});

router.post("/student-answers-log", async (req, res) => {
  try {
    const { student_exam_id } = req.body;
    const rows = await studentAnswerlog.findByExamId(student_exam_id);

    //res.status(404).json({ status: false, rows, msg: " data found" });
    if (!rows.length) {
      return res.status(404).json({ status: false, msg: "No data found" });
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Answers Log");
    worksheet.columns = [
      // { header: "ID", key: "id", width: 10 },
      { header: "Student Roll ", key: "roll_number", width: 15 },
      { header: "Student Name", key: "name", width: 15 },
      { header: "Exam Name", key: "exam_name", width: 15 },
      { header: "Question ID", key: "question_id", width: 15 },
      {
        header: "Student Question Map",
        key: "student_question_map",
        width: 20,
      },
      { header: "Selected Option", key: "selected_option", width: 20 },
      { header: "Final Submission", key: "is_final_submission", width: 20 },
      { header: "Timestamp", key: "timestamp", width: 40 },
      { header: "Mark For Review", key: "mark_for_review", width: 20 },
      { header: "Event Type", key: "event_type", width: 20 },
      { header: "From Ques", key: "from_ques", width: 15 },
      { header: "To Ques", key: "to_ques", width: 15 },
      { header: "Question Subject", key: "question_subject", width: 25 },
      { header: "From Section", key: "from_section", width: 20 },
      { header: "To Section", key: "to_section", width: 20 },
    ];
    rows.forEach((row) => {
      row.timestamp = row.timestamp.toLocaleString("en-GB", { hour12: false });
      worksheet.addRow(row);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_answers_log.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ status: false, msg: "Error generating Excel" });
  }
});

router.post("/result", async (req, res) => {
  try {
    const { student_exam_id } = req.body;
    const rows = await studentAnswer.result(student_exam_id);

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ msg: "No Data Found for Excel Generation" });
    }

    // Create workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Exam Result");

    // Define columns
    worksheet.columns = [
      { header: "Student Roll", key: "roll_number", width: 15 },
      { header: "Student Name", key: "name", width: 20 },
      { header: "Total Questions", key: "total_questions", width: 20 },
      { header: "Total Attempt", key: "attempt", width: 20 },
      { header: "Not Attempt", key: "unattempted", width: 15 },
      { header: "Obtain Marks", key: "obtain_marks", width: 18 },
    ];

    // Add rows
    rows.forEach((row) => worksheet.addRow(row));

    // Header style
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Right align obtain marks column
    worksheet.getColumn("obtain_marks").alignment = { horizontal: "right" };

    // Send Excel as File Download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exam_result.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Result Excel Not Generated", error: err });
  }
});

module.exports = router;

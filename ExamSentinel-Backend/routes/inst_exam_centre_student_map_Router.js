const express = require("express");
const InstinstExamCentreStudentMap = require("../models/inst_exam_centre_student_map");
const redisClient = require("../config/radishRouter");
const e = require("express");
const router = express.Router();

/**
 * Add a new mapping
 */
router.post("/add", async (req, res) => {
  try {
    const result = await InstinstExamCentreStudentMap.Add(req.body);

    res.json(result);
  } catch (err) {
    console.error("Add error:", err);
    res.status(500).json({
      status: false,
      data: {
        message: err.message,
        code: err.code,
      },
      msg: "Failed to add mapping",
    });
  }
});

/*
 * List all mappings  iecsm_centre_id
 */

// router.get("/listByCenter", async (req, res) => {
//   try {
//     const iecsm_centre_id = req.query.id;
//     const rows = await InstinstExamCentreStudentMap.getaLLByCenter(
//       iecsm_centre_id
//     );
//     res.json({
//       status: true,
//       data: rows,
//       msg: "Mappings retrieved successfully",
//     });
//   } catch (err) {
//     console.error("List error:", err);
//     res.json({
//       status: false,
//       data: err,
//       msg: "Failed to retrieve mappings",
//     });
//   }
// });

router.get("/listByCenter", async (req, res) => {
  try {
    // const iecsm_centre_id = req.query.id;
    // const iecsm_centre_id = req.query.id;

    const rows = await InstinstExamCentreStudentMap.getaLLByCenter();

    const mapstudent = await Promise.all(
      rows.map(async (row) => {
        let status = await redisClient.get(`exam_status:${row.id}`);
        let usedTime = await redisClient.get(
          `exam_used:${row.iecsm_student_id}`
        );

        usedSec = parseInt(usedTime);

        const examDurationSec = row.exam_duration * 60;
        let formattedLeftTime = examDurationSec - usedSec;
        const leftMinutes = Math.floor(formattedLeftTime / 60);
        const leftSeconds = formattedLeftTime % 60;
        formattedLeftTime = `${leftMinutes}:${
          leftSeconds < 10 ? "0" + leftSeconds : leftSeconds
        }`;

        if (usedTime === "0" && status === "Active") {
          status = "InProgress";
          formattedLeftTime = 0;
        }

        return {
          ...row,
          students_status: status,
          left_time: formattedLeftTime,
        };
      })
    );

    // //console.logmapstudent);

    res.json({
      status: true,
      data: mapstudent,
      msg: "Mappings retrieved successfully",
    });
  } catch (err) {
    console.error("List error:", err);
    res.json({
      status: false,
      data: err,
      msg: "Failed to retrieve mappings",
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const rows = await InstinstExamCentreStudentMap.getaLL();
    res.json({
      status: true,
      data: rows,
      msg: "Mappings retrieved successfully",
    });
  } catch (err) {
    console.error("List error:", err);
    res.json({
      status: false,
      data: err,
      msg: "Failed to retrieve mappings",
    });
  }
});

router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await InstinstExamCentreStudentMap.Update(data, id);
    res.json(result);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: false,
      data: err,
      msg: "Failed to update mapping",
    });
  }
});

/**
 * Delete a mapping by ID
 */
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await InstinstExamCentreStudentMap.Delete(id);

    res.json(result);
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      status: false,
      data: err,
      msg: "server error",
    });
  }
});

router.get("/map_student/:exam_id/:inst_id", async (req, res) => {
  try {
    const { exam_id, inst_id } = req.params;

    const result = await InstinstExamCentreStudentMap.NotMapedStudent(
      exam_id,
      inst_id
    );

    res.json({ status: true, result, msg: "Map Data Found Successfully" });
  } catch (err) {
    console.error(err);
    res.json({
      status: true,
      data: err,
      msg: "Data not found",
    });
  }
});

router.put("/center_map", async (req, res) => {
  try {
    const student = req.body;
    let totalUpdated = 0;
    for (let i = 0; i < student.length; i++) {
      const data = student[i];

      var result = await InstinstExamCentreStudentMap.Center_Update(data);
      //console.logresult);
      if (result?.data?.changedRows > 0) {
        totalUpdated += result.data.affectedRows;
      }
    }
    if (totalUpdated > 0) {
      res.json({ status: true, msg: "Center mapped successfully" });
    } else {
      res.json({ status: false, msg: "No records updated" });
    }
  } catch (err) {
    console.error(err);
    res.json({ status: false, msg: "Something went wrong", err });
  }
});

router.get("/exam_details/:center_id", async (req, res) => {
  try {
    const { center_id } = req.params;

    if (!center_id) {
      return res.status(400).json({
        status: false,
        msg: "Center ID is required",
      });
    }

    const result = await InstinstExamCentreStudentMap.getExamDetailsByCenter(
      center_id
    );

    if (!result) {
      return res.json({
        status: false,
        msg: "No exam details found for this center",
        data: {},
      });
    }

    res.json({
      status: true,
      data: result,
      msg: "Exam details retrieved successfully",
    });
  } catch (err) {
    console.error("Error retrieving exam details:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to retrieve exam details",
      error: err.toString(),
    });
  }
});
module.exports = router;

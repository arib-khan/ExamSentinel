const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const [row] = await pool.query("SELECT * from  centres");
    res.json({
      status: true,
      data: row,
      msg: "Center Data Successfully Retrive  ",
    });
  } catch (err) {
    console.error(err);
    res.json({
      satatus: false,
      error: err.message,
      msg: "Center data not found ",
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    ////console.log"body data", req.body);
    const values = [
      req.body.centre_name,
      req.body.centre_address_line_1,
      req.body.centre_address_line_2,
      req.body.centre_city,
      req.body.centre_state,
      req.body.centre_zipcode,
      req.body.centre_contact_1_name,
      req.body.centre_contact_1_email,
      req.body.centre_contact_1_phone,
      req.body.centre_contact_2_name,
      req.body.centre_contact_2_email,
      req.body.centre_contact_2_phone,
      req.body.centre_email,
      req.body.centre_phone,
    ];

    const result = await pool.query(
      `INSERT INTO centres (
        centre_name,
        centre_address_line_1,
        centre_address_line_2,
        centre_city,
        centre_state,
        centre_zipcode,
        centre_contact_1_name,
        centre_contact_1_email,
        centre_contact_1_phone,
        centre_contact_2_name,
        centre_contact_2_email,
        centre_contact_2_phone,
        centre_email,
        centre_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    res.json({
      status: true,
      data: result,
      msg: "Center Data Added Successfully",
    });
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({
      status: false,
      error: err.message,
      msg: "Center Data NOT Added",
    });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `UPDATE centres SET ? WHERE centre_id = ?`,
      [{ ...req.body }, id]
    );

    res.json({
      status: true,
      data: result,
      msg: "Center data updated successfully",
    });
  } catch (err) {
    console.error("Update error:", err);
    res.json({
      status: false,
      data: err,
      msg: "Center data not updated",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(`DELETE FROM centres WHERE centre_id = ?`, [
      id,
    ]);

    res.json({
      status: true,
      data: result,
      msg: "Center data deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.json({
      status: false,
      data: err,
      msg: "Center data not deleted",
    });
  }
});

module.exports = router;

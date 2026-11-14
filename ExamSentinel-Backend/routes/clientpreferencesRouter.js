const express = require("express");
const router = express.Router();
const ClientPreferences = require("../models/client_preferences");

// GET ALL client preferences
router.get("/list", async (req, res) => {
  try {
    const result = await ClientPreferences.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err,
      msg: "Client Preferences Data Not Found",
    });
  }
});

// GET client preference by ID
router.get("/client_id/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await ClientPreferences.getById(id);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err,
      msg: "Client Preference Not Found",
    });
  }
});

// ADD client preference
router.post("/add", async (req, res) => {
  try {
    const data = req.body;

    const result = await ClientPreferences.create(data);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err,
      msg: "Client Preference Not Saved",
    });
  }
});

// UPDATE client preference
router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const result = await ClientPreferences.update(id, data);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err,
      msg: "Client Preference Not Updated",
    });
  }
});

// DELETE client preference
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await ClientPreferences.delete(id);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      data: err,
      msg: "Client Preference Not Deleted",
    });
  }
});

module.exports = router;

const express = require("express");
const UserRole = require("../models/userRole");

const router = express.Router();

// ✅ Create (Add User Role)
router.post("/add", async (req, res) => {
  try {
    const result = await UserRole.add(req.body);
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Error while adding user role" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await UserRole.getAll();
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Error while fetching user roles" });
  }
});

// ✅ Read (Get Role by ID)
router.get("/:id", async (req, res) => {
  try {
    const result = await UserRole.findById(req.params.id);
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Error while fetching user role" });
  }
});

// ✅ Update Role
router.put("/update/:id", async (req, res) => {
  try {
    const result = await UserRole.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Error while updating user role" });
  }
});

// ✅ Delete Role
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await UserRole.delete(req.params.id);
    res.json(result);
  } catch (err) {
    res.json({ status: false, err, msg: "Error while deleting user role" });
  }
});

module.exports = router;

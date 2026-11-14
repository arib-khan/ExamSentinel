const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("../../config/Tokenmanage");
const User = require("../../models/user");

router.post("/login", async (req, res) => {
  try {
    const { user_id, user_password } = req.body || {};
    if (!user_id || !user_password) {
      return res.status(400).json({ error: "user_id and user_password are required" });
    }

    const result = await User.login(user_id);
    if (result && result.status === false) {
      // database error inside the model
      return res.status(500).json({ error: "Login failed" });
    }
    // unknown user: answer like a wrong password (never hang, never reveal which part was wrong)
    if (!result || !result.user_password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(user_password, result.user_password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const Token = jwt.generateAccessToken({
      id: user_id,
      role_id: result.user_role_id,
      clientId: result.user_inst_id,
    });
    // never send the password hash to the browser / mobile app
    const { user_password: _hash, ...safeUser } = result;
    res.json({ status: true, msg: "User login Successfully", result: safeUser, Token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;

const express = require("express");
const Optstore = require("../models/otp_store");
const otpGenerator = require("otp-generator");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const data = await Optstore.LIST();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.json({ status: true, err, msg: "Server  Error" });
  }
});
router.post("/Add", async (req, res) => {
  try {
    //onst id = req.user.id;
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: true,
      upperCase: true,
      specialChars: false,
    });
    const expires_at = new Date(Date.now() + 5 * 60 * 1000)
      .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }) // IST time
      .replace("T", " ");

    const data = await Optstore.add({
      ...req.body,
      otp: otp,
      expires_at: expires_at,
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.json({ status: true, err, msg: "Server  Error" });
  }
});

router.post("/verify_otp", async (req, res) => {
  try {
    const { center_id, exam_id, otp } = req.body;

    const result = await Optstore.GetByOtp({ center_id, exam_id, otp });

    if (!result || result.otp !== otp) {
      return res.json({ status: false, msg: "Invalid OTP" });
    }
    if (result.user_id !== req.user.id) {
      return res.json({ status: false, result, msg: "Unauthorized User" });
    }
    const currentTime = new Date();
    const expiryTime = new Date(result.expires_at);

    if (currentTime <= expiryTime) {
      return res.json({ status: false, msg: "OTP Expired" });
    }
    return res.json({ status: true, msg: "OTP Verified Successfully" });
  } catch (err) {
    console.error(err);
    res.json({ status: false, msg: "Server Error", err });
  }
});

module.exports = router;

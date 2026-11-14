const express = require("express");
const CenterHallRoomRowSeats = require("../models/center_hall_room_row_seats");

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const result = await CenterHallRoomRowSeats.GetAll();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Center Seat Data Not Found" });
  }
});

router.get("/listByCenter", async (req, res) => {
  try {
    const { id } = req.query;
    const result = await CenterHallRoomRowSeats.GetByCenterId(id);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({ status: false, err, msg: "Center Seat Data Not Found" });
  }
});
module.exports = router;

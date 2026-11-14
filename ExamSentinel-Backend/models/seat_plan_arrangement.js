const pool = require("../config/db");

class Seat_plan_arrangement {
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);

      return rows;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
  static async getAll() {
    try {
      const result = await this.query("Select * from seat_plan_arrangement");

      return {
        status: true,
        result,
        msg: "Seat Plan Data Found Successfully ",
      };
    } catch (err) {
      return { status: false, err, msg: "Error In Retriving Data" };
    }
  }

  static async Add(data) {
    try {
      const result = await this.query(
        "INSERT INTO seat_plan_arrangement SET ?",
        data
      );
      return { status: true, result, msg: "Seat plan Data Added Successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Error  in Adding Data" };
    }
  }

  // static async findStundentsRoom(roll_number) {
  //   try {
  //     const result = await this.query(
  //       `SELECT *
  //      FROM seat_plan_arrangement
  //      WHERE seat_plan_from_student_rollnumber <= ?
  //        AND seat_plan_to_student_roll_number >= ?`,
  //       [roll_number, roll_number]
  //     );

  //     return result;
  //   } catch (err) {
  //     return { status: false, err, msg: "Student room not found" };
  //   }
  // }

  static async allocateFinalSeat(student_id, roll_number) {
    try {
      // 1️⃣ Find room from seat plan
      const [plan] = await this.query(
        `SELECT *
       FROM seat_plan_arrangement
       WHERE seat_plan_from_student_rollnumber <= ?
         AND seat_plan_to_student_roll_number >= ?
       LIMIT 1`,
        [roll_number, roll_number]
      );

      if (!plan) throw new Error("No seat plan found for this roll number");

      const room_number = plan.seat_plan_room_number;

      // 2️⃣ Get all seats in room
      const allSeats = await this.query(
        `SELECT center_seat_number
       FROM center_hall_room_row_seats
       WHERE center_room = ?
       ORDER BY center_row, center_seat_number`,
        [room_number]
      );

      if (!allSeats || allSeats.length === 0)
        throw new Error("No seats defined in this room");

      // 3️⃣ Get already assigned seats in this room
      const assignedSeats = await this.query(
        `SELECT iecsm_seat_num
       FROM inst_exam_centre_student_map
       WHERE iecsm_room_name = ? AND iecsm_seat_num IS NOT NULL`,
        [room_number]
      );

      const assignedSeatNumbers = assignedSeats.map((s) => s.iecsm_seat_num);

      // 4️⃣ Filter unassigned seats
      const availableSeats = allSeats.filter(
        (s) => !assignedSeatNumbers.includes(s.center_seat_number)
      );

      if (availableSeats.length === 0)
        throw new Error("No available seats left in this room");

      const seat_to_assign = availableSeats[0];

      // 5️⃣ Update student record
      await this.query(
        `UPDATE inst_exam_centre_student_map
       SET iecsm_room_name = ?,
           iecsm_seat_num  = ?
       WHERE iecsm_student_id = ?`,
        [room_number, seat_to_assign.center_seat_number, student_id]
      );

      return {
        status: true,
        msg: "Seat allocated successfully",
        data: {
          room: room_number,
          seat: seat_to_assign.center_seat_number,
        },
      };
    } catch (err) {
      return { status: false, msg: err.message };
    }
  }
}

module.exports = Seat_plan_arrangement;

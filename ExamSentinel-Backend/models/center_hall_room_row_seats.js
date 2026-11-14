const pool = require("../config/db");

class CenterHallRoomRowSeats {
  static async quiry(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);

      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async AddBulk(dataArr) {
    try {
      if (!Array.isArray(dataArr) || dataArr.length === 0) {
        return { status: false, msg: "No data to insert" };
      }

      const columns = Object.keys(dataArr[0]);
      const values = dataArr.map((obj) => columns.map((col) => obj[col]));

      const query = `INSERT INTO center_hall_room_row_seats (${columns.join(
        ","
      )}) VALUES ?`;

      const result = await this.quiry(query, [values]);

      return {
        status: true,
        result,
        msg: "Center Seat Data Inserted Successfully",
      };
    } catch (err) {
      return { status: false, err, msg: "Center Seat Data Not Inserted" };
    }
  }

  static async GetAll() {
    try {
      const result = await this.quiry(
        `SELECT chrrs.*
FROM center_hall_room_row_seats chrrs
LEFT JOIN inst_exam_centre_student_map iecsm
    ON chrrs.center_seat_id = iecsm.iecsm_seat_num
WHERE iecsm.iecsm_seat_num IS NULL;

        `
      );
      return {
        status: true,
        result,
        msg: "Center Seat Data Found Successfully",
      };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Center Seat Data Not Found" };
    }
  }

  // READ (get by ID)
  static async GetById(id) {
    try {
      const result = await this.quiry(
        "SELECT * FROM center_hall_room_row_seats WHERE center_seat_id = ?",
        [id]
      );
      const plainResult = JSON.parse(JSON.stringify(result));
      return {
        status: true,
        result: plainResult[0] || null,
        msg: "Data fetched successfully",
      };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data fetch failed" };
    }
  }

  static async GetByCenterId(id) {
    try {
      console.log("id ", id);
      const result = await this.quiry(
        `SELECT chrs.* ,c.centre_name FROM center_hall_room_row_seats chrs
          inner join centres c
              ON chrs.center_id = c.centre_id
          WHERE centre_id = ?`,
        [id]
      );

      return {
        status: true,
        result,
        msg: "Data fetched successfully",
      };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data fetch failed" };
    }
  }

  // UPDATE
  static async Update(id, data) {
    try {
      const result = await this.quiry(
        "UPDATE center_hall_room_row_seats SET ? WHERE center_seat_id = ?",
        [data, id]
      );
      return { status: true, result, msg: "Data updated successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data update failed" };
    }
  }

  // DELETE
  static async Delete(id) {
    try {
      const result = await this.quiry(
        "DELETE FROM center_hall_room_row_seats WHERE center_seat_id = ?",
        [id]
      );
      return { status: true, result, msg: "Data deleted successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data delete failed" };
    }
  }
}

module.exports = CenterHallRoomRowSeats;

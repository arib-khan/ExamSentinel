const pool = require("../config/db");

class StudentExt {
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
      const result = await this.query("SELECT * FROM student_ext");
      return { status: true, result, msg: "Students Data found " };
    } catch (err) {
      console.log(err);
      return { status: false, err, msg: "Students data Not Found" };
    }
  }
  static async Create(Data) {
    try {
      const result = await this.query(
        "INSERT INTO student_ext SET ? ON DUPLICATE KEY UPDATE ?",
        [Data, Data]
      );
      return { status: true, result, msg: "Data Saved Successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data Not Update" };
    }
  }

  static async upadte(id, data) {
    try {
      const result = await this.query(
        "UPDATE student_ext SET ? WHERE student_id = ?",
        [data, id]
      );
      return { status: true, result, msg: "data upadate successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Data Not upadate" };
    }
  }
}

module.exports = StudentExt;

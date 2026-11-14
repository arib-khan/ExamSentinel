const pool = require("../config/db");

class Center {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      throw err;
    }
  }
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM center");
      return { status: true, data: result, msg: "Data" };
    } catch (err) {
      throw err;
    }
  }
  static async Add(data) {
    try {
      const result = await this.query("Insert INTO center SET ?", [data]);
      return { status: true, result, msg: "Center Data Saved " };
    } catch (err) {
      return err;
    }
  }
}

module.exports = Center;

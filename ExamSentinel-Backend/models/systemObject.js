const pool = require("../config/db");

class Systemobj {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async GetAll() {
    try {
      const result = await this.query("SELECT * from system_objects");
      return { status: true, result, msg: "System  object Data found " };
    } catch (err) {
      return { status: false, err, msg: "System  object Data Not found " };
    }
  }
  static async Add(data) {
    try {
      const result = await this.query("INSERT INTO system_objects SET ?", data);
      return result;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}

module.exports = Systemobj;

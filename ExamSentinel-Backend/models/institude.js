const pool = require("../config/db");

class Institude {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(clientId) {
    try {
      let result;
      if (!clientId) {
        result = await this.query("SELECT * FROM institute");
      } else {
        result = await this.query("SELECT * FROM institute WHERE inst_id = ?", [
          clientId,
        ]);
      }

      return {
        status: false,
        result,
        msg: "Institiude data found",
      };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Institude Data not Found " };
    }
  }
  static async Add(Data) {
    try {
      const result = await this.query("INSERT INTO institute SET ?", Data);
      return { status: true, result, msg: "Institude Data saved " };
    } catch (err) {
      console.error(err);
      return res.json({ status: false, err, msg: err.message });
    }
  }
  static async FindByExamid(examid) {
    try {
      const [result] = await this.query(
        "SELECT * FROM institute where inst_id = ?",
        examid
      );
      return result;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = Institude;

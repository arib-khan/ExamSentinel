const pool = require("../config/db");

class Examsets {
  static async query(sql, params = []) {
    try {
      const [row] = await pool.query(sql, params);
      return row;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM exam_sets");
      return { status: true, result, msg: "SET Data Found successfully" };
    } catch (err) {
      return { status: false, err, msg: "Sets Data Not Found" };
    }
  }

  static async Add(Data) {
    try {
      const result = await this.query("INSERT INTO exam_sets SET ?", Data);

      return { status: true, result, msg: "Set Data Saved Successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Sets Data Not Saved" };
    }
  }

  static async Update(Data, id) {
    try {
      const result = await this.query(
        "UPDATE exam_sets SET ? where ex_sets_id = ?",
        [Data, id]
      );

      return { status: true, result, msg: "Set Data Updaed Successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Sets Data Not Saved" };
    }
  }

  static async Delete(id) {
    try {
      const result = await this.query(
        "delete from exam_sets where ex_sets_id = ?",
        [id]
      );

      return { status: true, result, msg: "Set Data Updaed Successfully" };
    } catch (err) {
      console.error(err);
      return { status: false, err, msg: "Sets Data Not Saved" };
    }
  }
}

module.exports = Examsets;

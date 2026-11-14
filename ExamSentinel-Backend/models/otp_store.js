const pool = require("../config/db");
const { param } = require("../routes/SystemobjectRouter");

class Optstore {
  static async query(sql, params = []) {
    try {
      const [result] = await pool.query(sql, params);
      return result;
    } catch (err) {
      throw err;
    }
  }
  static async add(data) {
    try {
      const row = await this.query("INSERT INTO otp_store SET ?", data);
      if (row.insertId > 0) {
        const result = await this.query(
          "select * from otp_store where id=?",
          row.insertId
        );
        return { status: true, result, msg: "OTP Generated successfully " };
      }
    } catch (err) {
      return { status: true, err, msg: "OTP Not store " };
    }
  }
  static async LIST() {
    try {
      const result = await this.query(`
  SELECT
    otp.id,
    otp.user_id,
    otp.otp,
    otp.expires_at,
    otp.createdAt,
    otp.otp_verifyed,
    cs.centre_name,
    ex.exam_name
  FROM otp_store otp
  INNER JOIN centres cs
    ON otp.center_id = cs.centre_id
    inner join exams ex
    on otp.exam_id = ex.exam_id 
  ORDER BY otp.id DESC
`);

      return { status: true, result, msg: "OTP Data Found successfully" };
    } catch (err) {
      return { status: false, err, msg: "OTP Data Not found" };
    }
  }

  static async GetByOtp({ center_id, exam_id, otp }) {
    try {
      const rows = await this.query(
        "SELECT * FROM otp_store WHERE center_id = ? AND exam_id = ? AND otp = ? LIMIT 1",
        [center_id, exam_id, otp]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async verifyedotp(otp_verifyed, otp) {
    try {
      const rows = await this.query(
        "update otp_store  SET otp_verifyed = ? WHERE otp = ?",
        [otp_verifyed, otp]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

module.exports = Optstore;

const pool = require("../config/db");

class User {
  // Common query executor
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error("DB Error:", err);
      throw err;
    }
  }

  // Get all users
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM user");
      return { status: true, result, msg: "All Users Data Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  static async findById(user_id) {
    try {
      const result = await this.query("SELECT * FROM user WHERE user_id= ?", [
        user_id,
      ]);
      return { status: true, result, msg: "User Data Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Add new user
  static async add(data) {
    try {
      const result = await this.query("INSERT INTO user SET ?", data);
      return { status: true, result, msg: "User Saved Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  static async update(user_id, data) {
    try {
      const result = await this.query("UPDATE user SET ? WHERE user_id = ?", [
        data,
        user_id,
      ]);
      return { status: true, result, msg: "User Updated Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Delete user by ID
  static async delete(user_id) {
    try {
      const result = await this.query("DELETE FROM user WHERE user_id = ?", [
        user_id,
      ]);
      return { status: true, result, msg: "User Deleted Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  static async login(user_id) {
    try {
      const [result] = await this.query(
        "select * from user  WHERE user_id = ?",
        [user_id]
      );
      return result;
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }
}

module.exports = User;

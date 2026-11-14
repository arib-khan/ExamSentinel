const pool = require("../config/db");

class UserRole {
  // Common query
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error("DB Error:", err);
      throw err;
    }
  }

  // Get all roles
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM user_roles");
      return { status: true, result, msg: "All User Roles Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Get role by ID
  static async findById(user_role_id) {
    try {
      const result = await this.query(
        "SELECT * FROM user_roles WHERE user_role_id = ?",
        [user_role_id]
      );
      return { status: true, result, msg: "User Role Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Add role
  static async add(data) {
    try {
      const result = await this.query("INSERT INTO user_roles SET ?", data);
      return { status: true, result, msg: "User Role Added Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Update role
  static async update(user_role_id, data) {
    try {
      const result = await this.query(
        "UPDATE user_roles SET ? WHERE user_role_id = ?",
        [data, user_role_id]
      );
      return { status: true, result, msg: "User Role Updated Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Delete role
  static async delete(user_role_id) {
    try {
      const result = await this.query(
        "DELETE FROM user_roles WHERE user_role_id = ?",
        [user_role_id]
      );
      return { status: true, result, msg: "User Role Deleted Successfully" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }
}

module.exports = UserRole;

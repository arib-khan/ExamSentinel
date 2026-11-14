const pool = require("../config/db");

class ClientPreferences {
  // Common query function
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // CREATE
  static async create(data) {
    try {
      console.log("data is ", data);
      const result = await this.query(
        "INSERT INTO client_preferences SET ?",
        data,
      );
      return {
        status: true,
        result,
        msg: "Client preference created successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        err,
        msg: err.message,
      };
    }
  }

  // READ ALL
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM client_preferences");
      return {
        status: true,
        result,
        msg: "Client preferences fetched successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        err,
        msg: err.message,
      };
    }
  }

  // READ BY ID
  static async getById(id) {
    try {
      const result = await this.query(
        "SELECT * FROM client_preferences WHERE client_preferences_id = ?",
        [id],
      );

      return {
        status: true,
        result: result[0],
        msg: "Client preference found",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        err,
        msg: err.message,
      };
    }
  }

  // UPDATE
  static async update(id, data) {
    try {
      const result = await this.query(
        "UPDATE client_preferences SET ? WHERE id = ?",
        [data, id],
      );

      return {
        status: true,
        result,
        msg: "Client preference updated successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        err,
        msg: err.message,
      };
    }
  }

  // DELETE
  static async delete(id) {
    try {
      const result = await this.query(
        "DELETE FROM client_preferences WHERE id = ?",
        [id],
      );

      return {
        status: true,
        result,
        msg: "Client preference deleted successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        err,
        msg: err.message,
      };
    }
  }
}

module.exports = ClientPreferences;

const pool = require("../config/db");

class ObjectUserRolePerm {
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

  // Get all permissions
  static async getAll() {
    try {
      const result = await this.query("SELECT * FROM object_user_role_perm");
      return { status: true, result, msg: "All Permission Records Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Get all permissions with object names + role IDs
static async getAllWithObjects() {
  try {
    const result = await this.query(
      `SELECT 
  o.perm_user_role_id,
  r.user_role_name,
  o.perm_sys_object_id,
  s.sys_object_name,
  o.create_perm,
  o.read_perm,
  o.update_perm,
  o.delete_perm,
  o.execute_perm
FROM object_user_role_perm o
JOIN system_objects s 
  ON o.perm_sys_object_id = s.sys_object_id
JOIN user_roles r 
  ON o.perm_user_role_id = r.user_role_id
ORDER BY o.perm_user_role_id, o.perm_sys_object_id;

`
    );

    return { status: true, result };
  } catch (err) {
    return { status: false, err, msg: err.message };
  }
}


  // Get specific record by composite PK
  static async findByRoleID(perm_user_role_id) {
    try {
      const result = await this.query(
        `SELECT o.*  , s.sys_object_name FROM object_user_role_perm o 
        join system_objects s 
        on   o.perm_sys_object_id = s.sys_object_id 
        WHERE perm_user_role_id = ?`,
        [perm_user_role_id]
      );
      return result; //{ status: true, result, msg: "Permission Record Found" };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Add new record
  static async add(data) {
    try {
      const result = await this.query(
        "INSERT INTO object_user_role_perm SET ?",
        data
      );
      return {
        status: true,
        result,
        msg: "Permission Record Saved Successfully",
      };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  static async getObjectIdByName(objectName) {
  const rows = await this.query(
    "SELECT sys_object_id FROM system_objects WHERE sys_object_name = ?",
    [objectName]
  );
  return rows.length ? rows[0].sys_object_id : null;
}


  // Update existing record
  static async update(perm_sys_object_id, perm_user_role_id, data) {
    try {
      const result = await this.query(
        "UPDATE object_user_role_perm SET ? WHERE perm_sys_object_id = ? AND perm_user_role_id = ?",
        [data, perm_sys_object_id, perm_user_role_id]
      );
      return {
        status: true,
        result,
        msg: "Permission Record Updated Successfully",
      };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }

  // Delete record by composite PK
  static async delete(perm_sys_object_id, perm_user_role_id) {
    try {
      const result = await this.query(
        "DELETE FROM object_user_role_perm WHERE perm_sys_object_id = ? AND perm_user_role_id = ?",
        [perm_sys_object_id, perm_user_role_id]
      );
      return {
        status: true,
        result,
        msg: "Permission Record Deleted Successfully",
      };
    } catch (err) {
      return { status: false, err, msg: err.message };
    }
  }
}

module.exports = ObjectUserRolePerm;

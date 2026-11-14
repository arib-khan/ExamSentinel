const express = require("express");
const userRolepermision = require("../models/UserRolePermision");
const router = express.Router();

function formatPermissions(rows) {
  const permissionsData = {};
  rows.forEach((row) => {
    const name = row.sys_object_name; // sys_object_name from join
    permissionsData[name] = {
      create: row.create_perm || "N",
      read: row.read_perm || "N",
      update: row.update_perm || "N",
      delete: row.delete_perm || "N",
      execute: row.execute_perm || "N",
    };
  });
  return permissionsData;
}
router.get("/list", async (req, res) => {
  try {
    const roleID = req.user.role_id;
    console.log("", roleID);
    const rows = await userRolepermision.findByRoleID(roleID);
    const permissionsData = formatPermissions(rows);
    res.json({
      status: true,
      data: { permissionsData },
      msg: "Permissions data found",
    });
  } catch (err) {
    console.error(err);
  }
});

// by Sunil Dharawat
router.get("/all", async (req, res) => {
  try {
    const { status, result } = await userRolepermision.getAllWithObjects();

    if (!status) {
      return res.status(500).json({
        status: false,
        msg: "Failed to fetch permissions",
      });
    }

  const roles = {};

result.forEach(row => {
  const roleId = row.perm_user_role_id;
  const roleName = row.user_role_name;
  const objName = row.sys_object_name;

  if (!roles[roleId]) {
    roles[roleId] = {
      roleName,
      objects: {}
    };
  }

  roles[roleId].objects[objName] = {
    create: row.create_perm || "N",
    read: row.read_perm || "N",
    update: row.update_perm || "N",
    delete: row.delete_perm || "N",
    execute: row.execute_perm || "N",
  };
});


    res.json({
      status: true,
      data: { roles },
      msg: "All role permissions fetched successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Server error",
    });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { role_id, objects } = req.body;

    if (!role_id || !objects) {
      return res.status(400).json({
        status: false,
        msg: "role_id and objects are required",
      });
    }

    // Loop through each object in the payload
    for (const [objectName, perms] of Object.entries(objects)) {
      
      // Get sys_object_id from name
      const sysObjectId = await userRolepermision.getObjectIdByName(objectName);

      if (!sysObjectId) {
        console.log(`Object not found: ${objectName}`);
        continue; // skip invalid objects
      }

      // Prepare data for update
      const updateData = {
        create_perm: perms.create,
        read_perm: perms.read,
        update_perm: perms.update,
        delete_perm: perms.delete,
        execute_perm: perms.execute
      };

      await userRolepermision.update(sysObjectId, role_id, updateData);
    }

    res.json({
      status: true,
      msg: "Permissions updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server Error" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { role_id, objects } = req.body;

    if (!role_id || !objects) {
      return res.status(400).json({
        status: false,
        msg: "role_id and objects are required",
      });
    }

    // Loop through each object in the payload
    for (const [objectName, perms] of Object.entries(objects)) {

      // Get sys_object_id from name
      const sysObjectId = await userRolepermision.getObjectIdByName(objectName);

      if (!sysObjectId) {
        console.log(`Object not found: ${objectName}`);
        continue; // skip invalid objects
      }

      // Prepare data for insertion
      const insertData = {
        perm_user_role_id: role_id,
        perm_sys_object_id: sysObjectId,
        create_perm: perms.create || "N",
        read_perm: perms.read || "N",
        update_perm: perms.update || "N",
        delete_perm: perms.delete || "N",
        execute_perm: perms.execute || "N",
      };

      await userRolepermision.add(insertData);
    }

    res.json({
      status: true,
      msg: "Permissions added successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Server Error" });
  }
});




module.exports = router;

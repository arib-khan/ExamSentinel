/**
 * Interview authorization (backend-enforced).
 *
 * Authentication is done by the existing JWT middleware in routes/ApiControler.js, which sets
 * req.user = { id, role_id, clientId } for staff/candidate logins (/auth/login).
 * NOTE: exam *students* (/api/student/login) also get a JWT, but with only { id } and no role_id.
 * Those tokens are rejected here, so a student token can never reach an Interview API.
 *
 * Permissions come from the existing tables  system_objects + object_user_role_perm
 * (the same ones the "Object Permission" screen edits), flags 'Y'/'N' per create/read/update/delete/execute.
 */
const pool = require("../config/db");

const TTL_MS = 15000;
const cache = new Map(); // roleId -> { at, perms }

async function loadPerms(roleId) {
  const hit = cache.get(roleId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.perms;
  const [rows] = await pool.query(
    `SELECT s.sys_object_name, o.create_perm, o.read_perm, o.update_perm, o.delete_perm, o.execute_perm
       FROM object_user_role_perm o
       JOIN system_objects s ON o.perm_sys_object_id = s.sys_object_id
      WHERE o.perm_user_role_id = ?`,
    [roleId]
  );
  const perms = {};
  for (const r of rows) {
    perms[r.sys_object_name] = {
      create: r.create_perm === "Y", read: r.read_perm === "Y", update: r.update_perm === "Y",
      delete: r.delete_perm === "Y", execute: r.execute_perm === "Y",
    };
  }
  cache.set(roleId, { at: Date.now(), perms });
  return perms;
}

function requireUser(req, res, next) {
  const u = req.user;
  if (!u || typeof u !== "object" || u.id == null || u.role_id == null) {
    return res.status(401).json({ status: false, msg: "Interview APIs require a user login" });
  }
  req.interviewUser = { id: String(u.id), roleId: Number(u.role_id), clientId: u.clientId ?? null };
  next();
}

async function can(req, module, action) {
  const perms = await loadPerms(req.interviewUser.roleId);
  return !!(perms[module] && perms[module][action]);
}

function requirePermission(module, action) {
  return async (req, res, next) => {
    try {
      if (await can(req, module, action)) return next();
      return res.status(403).json({ status: false, msg: `Forbidden: ${module}.${action} permission required` });
    } catch (err) {
      console.error("interview permission check failed:", err);
      return res.status(500).json({ status: false, msg: "Permission check failed" });
    }
  };
}

const clearPermissionCache = () => cache.clear();

module.exports = { requireUser, requirePermission, can, clearPermissionCache };

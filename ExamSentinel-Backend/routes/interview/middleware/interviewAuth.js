/**
 * Interview module :: authorization middleware
 *
 * Reuses the EXISTING ExamSentinel JWT (verified by ApiControler) and the
 * EXISTING roles. Interview authorization is validated separately on top:
 *
 *   Staff token  (/auth/login)      -> { id: user_id, role_id, clientId }
 *   Candidate token (/api/student/login) -> { id: students.id }  (no role_id)
 *
 * Roles: 1=Admin, 2=Client, 3=Class Invigilator, 4=Student, 5=Operator
 */
const pool = require("../../../config/db");

const STAFF_MANAGE_ROLES = [1, 2]; // create / edit / publish / assign
const STAFF_DELETE_ROLES = [1];    // delete
const STAFF_EVALUATE_ROLES = [1, 2, 3]; // view attempts / evaluate

function requireStaffRoles(allowedRoles) {
  return (req, res, next) => {
    const roleId = req.user?.role_id;
    if (!roleId) {
      return res.status(403).json({ status: false, msg: "Candidate accounts cannot access staff APIs" });
    }
    if (!allowedRoles.includes(Number(roleId))) {
      return res.status(403).json({ status: false, msg: "You are not authorized for this action" });
    }
    req.staffId = req.user.id;
    req.roleId = Number(roleId);
    req.clientId = req.user.clientId ?? null;
    next();
  };
}

/**
 * Candidate requests: student token (no role_id -> students.id) or a
 * role-4 user whose user_student_id links to students.id.
 */
async function requireCandidate(req, res, next) {
  try {
    const roleId = req.user?.role_id;

    if (!roleId) {
      const studentId = Number(req.user?.id);
      if (!studentId || Number.isNaN(studentId)) {
        return res.status(403).json({ status: false, msg: "Invalid candidate session" });
      }
      req.studentId = studentId;
      return next();
    }

    if (Number(roleId) === 4) {
      const [rows] = await pool.query(
        'SELECT user_student_id FROM "user" WHERE user_id = ?',
        [req.user.id]
      );
      const studentId = rows.length ? Number(rows[0].user_student_id) : null;
      if (!studentId) {
        return res.status(403).json({ status: false, msg: "No candidate profile linked to this account" });
      }
      req.studentId = studentId;
      return next();
    }

    return res.status(403).json({ status: false, msg: "Staff accounts cannot attempt interviews" });
  } catch (err) {
    console.error("requireCandidate error:", err);
    return res.status(500).json({ status: false, msg: "Internal server error" });
  }
}

/** Candidate OR authorized staff may read an attempt (handler checks scope). */
function requireCandidateOrStaff(req, res, next) {
  const roleId = req.user?.role_id;
  if (!roleId) {
    return requireCandidate(req, res, next);
  }
  return requireStaffRoles(STAFF_EVALUATE_ROLES)(req, res, next);
}

module.exports = {
  requireStaffRoles,
  requireCandidate,
  requireCandidateOrStaff,
  STAFF_MANAGE_ROLES,
  STAFF_DELETE_ROLES,
  STAFF_EVALUATE_ROLES,
};

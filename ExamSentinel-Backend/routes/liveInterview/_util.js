const { ServiceError } = require("../../services/liveInterview/errors");
const { can } = require("../../middleware/liveInterviewAuth");

const ok = (res, data, msg = "OK", code = 200) => res.status(code).json({ status: true, data, msg });

/** ServiceError -> proper HTTP status + { status:false, msg, code }. Anything else -> 500 (details only in the server log). */
const ah = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    if (err instanceof ServiceError) return res.status(err.status).json({ status: false, msg: err.message, code: err.code, ...(err.extra || {}) });
    console.error("[live-interview]", req.method, req.originalUrl, err);
    res.status(500).json({ status: false, msg: "Internal server error" });
  });
};

/** What the logged-in user may do (from the existing permission tables). */
async function actorOf(req) {
  const [canManage, canHost, isAdmin, canJoin] = await Promise.all([
    can(req, "live_interviews", "read"), can(req, "live_interviews", "execute"), can(req, "live_interviews", "delete"), can(req, "live_interview_portal", "execute"),
  ]);
  return { id: req.liveUser.id, canManage, canHost, isAdmin, canJoin };
}
module.exports = { ok, ah, actorOf };

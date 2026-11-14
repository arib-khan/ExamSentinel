const { ServiceError } = require("../../services/interview/errors");

const ok = (res, data, msg = "OK", code = 200) => res.status(code).json({ status: true, data, msg });

/** Wrap an async handler: ServiceError -> proper HTTP status + { status:false, msg, code }. */
const ah = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ status: false, msg: err.message, code: err.code, ...(err.extra || {}) });
    }
    console.error("[interview]", req.method, req.originalUrl, err);
    res.status(500).json({ status: false, msg: "Internal server error" });
  });
};
module.exports = { ok, ah };

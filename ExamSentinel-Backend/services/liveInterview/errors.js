class ServiceError extends Error {
  constructor(status, message, code, extra) {
    super(message);
    this.status = status; this.code = code; this.extra = extra;
  }
}
const bad = (m, c, x) => new ServiceError(400, m, c, x);
const forbidden = (m, c) => new ServiceError(403, m || "Forbidden", c);
const notFound = (m, c) => new ServiceError(404, m || "Not found", c);
const conflict = (m, c, x) => new ServiceError(409, m, c, x);
module.exports = { ServiceError, bad, forbidden, notFound, conflict };

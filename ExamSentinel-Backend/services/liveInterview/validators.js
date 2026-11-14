const { bad } = require("./errors");

const parseId = (v, name = "id") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw bad(`Invalid ${name}`);
  return n;
};
const flag = (v) => (v === true || v === 1 || v === "1" || v === "true" ? 1 : 0);
const toDate = (v, name) => {
  const d = new Date(v);
  if (v === undefined || v === null || v === "" || Number.isNaN(d.getTime())) throw bad(`${name} is not a valid date`);
  return d;
};
const str = (v, name, max, required = false) => {
  const s = v === undefined || v === null ? "" : String(v).trim();
  if (required && !s) throw bad(`${name} is required`);
  if (s.length > max) throw bad(`${name} must be at most ${max} characters`);
  return s || null;
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validated interview fields. partial=true (update) only returns what was supplied. */
function validateInterview(body, { partial = false } = {}) {
  const out = {}; const has = (k) => body[k] !== undefined;
  if (!partial || has("title")) out.title = str(body.title, "title", 200, true);
  if (has("description")) out.description = str(body.description, "description", 4000);
  if (!partial || has("scheduled_start")) out.scheduled_start = toDate(body.scheduled_start, "scheduled_start");
  if (!partial || has("duration_minutes")) {
    const d = Number(body.duration_minutes);
    if (!Number.isInteger(d) || d < 5 || d > 480) throw bad("duration_minutes must be a whole number between 5 and 480");
    out.duration_minutes = d;
  }
  if (has("monitoring_required")) out.monitoring_required = flag(body.monitoring_required);
  if (has("candidate_email")) {
    out.candidate_email = str(body.candidate_email, "candidate_email", 200);
    if (out.candidate_email && !EMAIL.test(out.candidate_email)) throw bad("candidate_email is not a valid email address");
  }
  if (has("candidate_phone")) out.candidate_phone = str(body.candidate_phone, "candidate_phone", 40);
  if (has("candidate_name")) out.candidate_name = str(body.candidate_name, "candidate_name", 150, true);
  if (!partial) out.candidate_id = str(body.candidate_id, "candidate_id", 100, true);
  return out;
}

module.exports = { parseId, validateInterview, flag, EMAIL, str };

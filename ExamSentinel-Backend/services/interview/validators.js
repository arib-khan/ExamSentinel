const { bad } = require("./errors");

const parseId = (v, name = "id") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw bad(`Invalid ${name}`);
  return n;
};
const flag = (v) => (v === true || v === 1 || v === "1" || v === "true" ? 1 : 0);
const toDate = (v, name) => {
  if (v === null || v === "" || v === undefined) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw bad(`${name} is not a valid date`);
  return d;
};

/** Returns a clean object containing only the fields that were supplied (partial=true for updates). */
function validateInterview(body, { partial = false, validTypes = [] } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has("title")) {
    const t = String(body.title ?? "").trim();
    if (!t) throw bad("title is required");
    if (t.length > 200) throw bad("title must be at most 200 characters");
    out.title = t;
  }
  if (has("description")) out.description = body.description ? String(body.description) : null;
  if (has("instructions")) out.instructions = body.instructions ? String(body.instructions) : null;
  if (!partial || has("interview_type")) {
    const t = String(body.interview_type ?? "general");
    if (validTypes.length && !validTypes.includes(t)) throw bad(`interview_type must be one of: ${validTypes.join(", ")}`);
    out.interview_type = t;
  }
  if (!partial || has("duration_minutes")) {
    const d = Number(body.duration_minutes);
    if (!Number.isInteger(d) || d < 1 || d > 600) throw bad("duration_minutes must be a whole number between 1 and 600");
    out.duration_minutes = d;
  }
  if (has("scheduled_start")) out.scheduled_start = toDate(body.scheduled_start, "scheduled_start");
  if (has("scheduled_end")) out.scheduled_end = toDate(body.scheduled_end, "scheduled_end");
  if (out.scheduled_start && out.scheduled_end && out.scheduled_end <= out.scheduled_start)
    throw bad("scheduled_end must be after scheduled_start");
  if (has("passing_percentage")) {
    if (body.passing_percentage === null || body.passing_percentage === "") out.passing_percentage = null;
    else {
      const p = Number(body.passing_percentage);
      if (!(p >= 0 && p <= 100)) throw bad("passing_percentage must be between 0 and 100");
      out.passing_percentage = p;
    }
  }
  for (const k of ["auto_submit_on_expiry", "show_result_to_candidate", "proctoring_enabled"])
    if (has(k)) out[k] = flag(body[k]);
  return out;
}

function validateQuestion(body, typeMap, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has("question")) {
    const q = String(body.question ?? "").trim();
    if (!q) throw bad("question text is required");
    out.question = q;
  }
  if (!partial || has("question_type")) {
    const t = String(body.question_type ?? "");
    if (!typeMap[t]) throw bad(`question_type must be one of: ${Object.keys(typeMap).join(", ")}`);
    out.question_type = t;
  }
  if (has("category")) out.category = body.category ? String(body.category).slice(0, 100) : null;
  if (has("difficulty")) {
    if (!["easy", "medium", "hard"].includes(body.difficulty)) throw bad("difficulty must be easy, medium or hard");
    out.difficulty = body.difficulty;
  }
  if (has("marks")) {
    const m = Number(body.marks);
    if (!(m >= 0) || m > 9999) throw bad("marks must be a non-negative number");
    out.marks = m;
  }
  if (has("expected_answer")) out.expected_answer = body.expected_answer ? String(body.expected_answer) : null;
  if (has("display_order")) {
    const o = Number(body.display_order);
    if (!Number.isInteger(o) || o < 0) throw bad("display_order must be a non-negative integer");
    out.display_order = o;
  }
  if (has("options")) out.options = body.options;
  if (has("correct_option")) out.correct_option = body.correct_option ? String(body.correct_option) : null;
  return out;
}

/** MCQ consistency check on the *final* merged question object. */
function assertQuestionConsistent(q, typeMap) {
  const meta = typeMap[q.question_type];
  if (meta && meta.requires_options) {
    const opts = q.options;
    if (!Array.isArray(opts) || opts.length < 2) throw bad("MCQ questions need at least 2 options");
    const keys = opts.map((o) => String(o && o.key));
    if (opts.some((o) => !o || !o.key || !String(o.text ?? "").trim())) throw bad("Each option needs a key and text");
    if (new Set(keys).size !== keys.length) throw bad("Option keys must be unique");
    if (!q.correct_option || !keys.includes(String(q.correct_option))) throw bad("correct_option must match one of the option keys");
  }
}

module.exports = { parseId, validateInterview, validateQuestion, assertQuestionConsistent, flag };

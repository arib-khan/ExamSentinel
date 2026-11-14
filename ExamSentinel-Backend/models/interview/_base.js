// Thin DB helper for the Interview module. Uses the shared pool (config/db.js) like every other model.
const pool = require("../../config/db");

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
const num = (v) => (v === null || v === undefined ? null : Number(v));
const pick = (obj, fields) => {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
  return out;
};
module.exports = { pool, query, num, pick };

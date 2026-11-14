/**
 * ExamSentinel :: Interview module migration runner
 *
 * Executes scripts/interview_module_migration.sql directly against the
 * existing Supabase/PostgreSQL database using the raw pg pool (NOT the
 * mysql2-compat shim - this file is plain PostgreSQL).
 *
 * Usage:  node scripts/run-interview-migration.js
 *
 * Idempotent: every statement uses IF NOT EXISTS / ON CONFLICT DO NOTHING,
 * so re-running never duplicates or destroys data.
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing in .env");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "interview_module_migration.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("⏳ Running interview module migration ...");
    await pool.query(sql);
    console.log("✅ Interview tables created / verified:");

    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name LIKE 'interview%'
       ORDER BY table_name`
    );
    rows.forEach((r) => console.log("   -", r.table_name));

    const perms = await pool.query(
      `SELECT r.user_role_name, p.create_perm, p.read_perm, p.update_perm, p.delete_perm, p.execute_perm
       FROM object_user_role_perm p
       JOIN system_objects o ON o.sys_object_id = p.perm_sys_object_id
       JOIN user_roles r ON r.user_role_id = p.perm_user_role_id
       WHERE o.sys_object_name = 'interviews'
       ORDER BY r.user_role_id`
    );
    if (perms.rows.length) {
      console.log("✅ Role permissions registered:");
      perms.rows.forEach((p) =>
        console.log(
          `   - ${p.user_role_name}: create=${p.create_perm} read=${p.read_perm} update=${p.update_perm} delete=${p.delete_perm} execute=${p.execute_perm}`
        )
      );
    } else {
      console.log("⚠️ No interview permissions found (check system_objects insert)");
    }
    console.log("🎉 Interview module migration finished");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

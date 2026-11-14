#!/usr/bin/env node
/**
 * Demo data for the Interview module.
 *
 *   node scripts/seed-interview-demo.js            create demo users + interviews + sample attempts (safe to re-run)
 *   node scripts/seed-interview-demo.js --reset    delete the demo data, then create it again
 *   node scripts/seed-interview-demo.js --remove   delete the demo data only
 *
 * Needs (run once, in Supabase SQL Editor):  migrations/interview/001_*.sql and 002_*.sql
 *
 * Everything is created through the SAME services the app uses (validation, grading, timer rules),
 * so the demo data behaves exactly like real data. Demo rows are tagged created_by = 'demo-seed'.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const svc = require("../services/interview/interviewService");
const attempts = require("../services/interview/attemptService");
const evaluation = require("../services/interview/evaluationService");

const OWNER = "demo-seed";
const PASSWORD = "Candidate@123";
const USERS = [
  { user_id: "candidate1@examsentinel.test", user_name: "Aarav Sharma" },
  { user_id: "candidate2@examsentinel.test", user_name: "Diya Patel" },
  { user_id: "candidate3@examsentinel.test", user_name: "Rohan Verma" },
];
const [C1, C2, C3] = USERS.map((u) => u.user_id);
const DAY = 24 * 3600 * 1000;

const opt = (...texts) => texts.map((text, i) => ({ key: String.fromCharCode(65 + i), text }));
const mcq = (question, options, correct, marks, category, difficulty) =>
  ({ question, question_type: "mcq", options: opt(...options), correct_option: correct, marks, category, difficulty });

/* ------------------------------------------------------------------ interview definitions */
const INTERVIEWS = [
  {
    key: "tech",
    title: "Backend Developer – Technical Round",
    interview_type: "technical", duration_minutes: 30, passing_percentage: 50,
    show_result_to_candidate: true, proctoring_enabled: true,
    description: "Core backend knowledge: HTTP, databases, Node.js and one coding task.",
    instructions: "1. Answer all questions.\n2. Multiple-choice questions are scored automatically; written and coding answers are reviewed by an evaluator.\n3. Do not switch tabs or leave full screen; this is recorded.\n4. The timer runs on the server and the interview submits itself when time is up.",
    candidates: [C1, C2, C3], max_attempts: 1,
    questions: [
      mcq("Which HTTP status code means the requested resource was not found?", ["200", "404", "500", "301"], "B", 2, "HTTP", "easy"),
      mcq("Which SQL clause filters rows AFTER they have been grouped?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], "B", 2, "Databases", "medium"),
      mcq("In Node.js, which built-in module is used to work with file paths?", ["fs", "http", "path", "os"], "C", 2, "Node.js", "medium"),
      mcq("Which statement about the Node.js event loop is TRUE?",
        ["It runs your JavaScript on many threads by default", "Callbacks run on the main thread once the call stack is empty", "setTimeout(fn, 0) runs fn immediately", "Promises block the event loop"], "B", 2, "Concurrency", "hard"),
      { question: "Explain what a database index is, and give one trade-off of adding too many indexes.", question_type: "subjective", marks: 6, category: "Databases", difficulty: "medium",
        expected_answer: "A data structure (e.g. B-tree) that speeds up lookups/sorting on a column. Trade-off: slower writes and extra storage because every insert/update must maintain the index." },
      { question: "A REST API endpoint is slow under load. List the steps you would take to find and fix the bottleneck.", question_type: "technical", marks: 6, category: "System design", difficulty: "hard",
        expected_answer: "Measure first (logs/APM/profiling), check slow queries and missing indexes, N+1 queries, add caching, pagination, connection pooling, async/queue heavy work, then load-test again." },
      { question: "Write a function isPalindrome(str) that returns true if a string reads the same forwards and backwards, ignoring case and non-alphanumeric characters.", question_type: "coding", marks: 10, category: "Algorithms", difficulty: "medium",
        expected_answer: "const clean = s.toLowerCase().replace(/[^a-z0-9]/g, ''); return clean === [...clean].reverse().join('');" },
    ],
  },
  {
    key: "hr",
    title: "HR Screening Round",
    interview_type: "hr", duration_minutes: 20, passing_percentage: 40,
    show_result_to_candidate: false, proctoring_enabled: false,
    description: "A short conversation-style screening about motivation and teamwork.",
    instructions: "Answer honestly in your own words. There are no trick questions. Results are shared by the HR team, not shown here.",
    candidates: [C1, C2], max_attempts: 2,
    questions: [
      { question: "Tell us about yourself and why you applied for this role.", question_type: "hr", marks: 5, category: "Motivation", difficulty: "easy", expected_answer: "Clear, concise summary; relevant experience; genuine reasons for the role and company." },
      { question: "Describe a time you disagreed with a teammate. How did you handle it and what was the outcome?", question_type: "hr", marks: 5, category: "Behavioral", difficulty: "medium", expected_answer: "Uses a real example (STAR); listens, stays professional, reaches a resolution; shows learning." },
      { question: "What is your notice period / earliest joining date?", question_type: "short_answer", marks: 2, category: "Logistics", difficulty: "easy" },
      mcq("What is the BEST first step when you receive unclear instructions from a manager?", ["Guess and proceed", "Ask clarifying questions", "Wait for someone else to notice", "Ignore the task"], "B", 2, "Situational", "easy"),
    ],
  },
  {
    key: "quiz",
    title: "General Aptitude Quiz",
    interview_type: "general", duration_minutes: 15, passing_percentage: 60,
    show_result_to_candidate: true, proctoring_enabled: false,
    description: "Five quick aptitude questions. Scored instantly.",
    instructions: "Choose one option per question. Each question carries 2 marks. Results appear immediately after you submit.",
    candidates: [C1, C3], max_attempts: 1,
    questions: [
      mcq("What is 15% of 200?", ["20", "25", "30", "35"], "C", 2, "Maths", "easy"),
      mcq("Find the next number in the series: 2, 6, 12, 20, ?", ["28", "30", "32", "26"], "B", 2, "Series", "medium"),
      mcq("All Bloops are Razzies and all Razzies are Lazzies. Are all Bloops definitely Lazzies?", ["Yes", "No", "Cannot say"], "A", 2, "Logic", "medium"),
      mcq("A train travels 120 km in 2 hours. What is its average speed?", ["40 km/h", "50 km/h", "60 km/h", "80 km/h"], "C", 2, "Maths", "easy"),
      mcq("Which one is the odd one out?", ["Apple", "Banana", "Carrot", "Mango"], "C", 2, "Reasoning", "easy"),
    ],
  },
  {
    key: "upcoming",
    title: "Frontend Developer – Upcoming Round",
    interview_type: "technical", duration_minutes: 25, passing_percentage: 50,
    show_result_to_candidate: true, proctoring_enabled: true,
    scheduled_start: new Date(Date.now() + 3 * DAY).toISOString(),
    scheduled_end: new Date(Date.now() + 4 * DAY).toISOString(),
    description: "Scheduled round. It opens in three days, so candidates see it as Upcoming.",
    instructions: "Be ready 5 minutes early. You need a stable connection and a quiet room.",
    candidates: [C1, C3], max_attempts: 1,
    questions: [
      mcq("Which React hook is used to run a side effect after render?", ["useState", "useEffect", "useMemo", "useRef"], "B", 3, "React", "easy"),
      mcq("What does the CSS property 'display: flex' do?", ["Hides the element", "Creates a flex container", "Makes text bold", "Adds a border"], "B", 3, "CSS", "easy"),
      { question: "Explain the difference between props and state in React.", question_type: "subjective", marks: 4, category: "React", difficulty: "medium",
        expected_answer: "Props are read-only inputs passed from a parent; state is internal data owned by the component and updated with setters." },
    ],
  },
  {
    key: "draft",
    title: "Product Manager Interview (Draft)",
    interview_type: "general", duration_minutes: 40, passing_percentage: 50,
    show_result_to_candidate: false, proctoring_enabled: false, publish: false,
    description: "A draft interview that is not yet published, so no candidate can see it.",
    instructions: "Draft: instructions to be finalised.",
    candidates: [],
    questions: [
      { question: "How would you prioritise a backlog of 30 feature requests?", question_type: "subjective", marks: 10, category: "Product", difficulty: "medium", expected_answer: "Frameworks (RICE/MoSCoW), impact vs effort, stakeholder input, data." },
      { question: "Describe a product you admire and what you would improve.", question_type: "subjective", marks: 10, category: "Product", difficulty: "easy" },
    ],
  },
];

/* ------------------------------------------------------------------ helpers */
const log = (...a) => console.log(...a);
const q = async (sql, p) => (await pool.query(sql, p))[0];

async function assertReady() {
  try { await q("SELECT 1 FROM interviews LIMIT 1"); }
  catch { throw new Error("Interview tables not found. Run migrations/interview/001_interview_schema.sql in the Supabase SQL Editor first."); }
  const r = await q("SELECT user_role_id FROM user_roles WHERE user_role_name = 'Candidate'");
  if (!r.length) throw new Error("The 'Candidate' role does not exist. Run migrations/interview/002_interview_permissions.sql first.");
  return r[0].user_role_id;
}

async function removeDemo() {
  const [r1] = await pool.query("DELETE FROM interviews WHERE created_by = ?", [OWNER]); // cascades questions/attempts/answers/events
  const [r2] = await pool.query("DELETE FROM user WHERE user_id IN (?)", [USERS.map((u) => u.user_id)]);
  log(`🧹 removed ${r1.affectedRows} demo interviews and ${r2.affectedRows} demo users`);
}

async function ensureUsers(roleId) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  for (const u of USERS) {
    const ex = await q("SELECT user_id, user_role_id FROM user WHERE user_id = ?", [u.user_id]);
    if (ex.length) {
      if (Number(ex[0].user_role_id) !== Number(roleId)) log(`⚠️  ${u.user_id} exists but is not a Candidate (role ${ex[0].user_role_id})`);
      else log(`•  user exists: ${u.user_id}`);
      continue;
    }
    await pool.query("INSERT INTO user SET ?", { user_id: u.user_id, user_name: u.user_name, user_password: hash, user_role_id: roleId, user_inst_id: null });
    log(`✅ user created: ${u.user_id}`);
  }
}

async function createInterview(def) {
  const ex = await q("SELECT interview_id FROM interviews WHERE title = ? AND created_by = ?", [def.title, OWNER]);
  if (ex.length) { log(`•  interview exists: ${def.title}`); return { id: ex[0].interview_id, existed: true }; }
  const iv = await svc.createInterview({
    title: def.title, description: def.description, instructions: def.instructions, interview_type: def.interview_type,
    duration_minutes: def.duration_minutes, passing_percentage: def.passing_percentage,
    show_result_to_candidate: def.show_result_to_candidate, proctoring_enabled: def.proctoring_enabled,
    scheduled_start: def.scheduled_start, scheduled_end: def.scheduled_end,
  }, OWNER);
  for (const qu of def.questions) await svc.addQuestion(iv.interview_id, qu);
  if (def.candidates.length) await svc.assignCandidates(iv.interview_id, def.candidates, def.max_attempts || 1, OWNER);
  if (def.publish !== false) await svc.publish(iv.interview_id);
  log(`✅ interview created: ${def.title}  (${def.questions.length} questions, ${def.candidates.length} candidates${def.publish === false ? ", draft" : ""})`);
  return { id: iv.interview_id, existed: false };
}

/** Run a whole attempt through the real services, then back-date it so it looks like it happened earlier. */
async function sampleAttempt({ interviewId, userId, pick, minutesUsed, daysAgo, events = [] }) {
  const questions = await q("SELECT question_id, question_type, correct_option, options FROM interview_questions WHERE interview_id = ? ORDER BY display_order, question_id", [interviewId]);
  const { attempt } = await attempts.startAttempt(interviewId, userId);
  const answers = questions.map((qu, i) => ({ question_id: Number(qu.question_id), ...pick(qu, i) })).filter((a) => a.selected_option !== undefined || a.answer_text !== undefined);
  if (answers.length) await attempts.saveAnswers(attempt.attempt_id, userId, answers);
  for (const e of events) await attempts.recordEvent(attempt.attempt_id, userId, e, "web");
  await attempts.submitAttempt(attempt.attempt_id, userId);

  // back-date: start -> events -> end
  const row = (await q("SELECT i.duration_minutes FROM interview_attempts a JOIN interviews i ON i.interview_id = a.interview_id WHERE a.attempt_id = ?", [attempt.attempt_id]))[0];
  const start = new Date(Date.now() - daysAgo * DAY);
  const end = new Date(start.getTime() + minutesUsed * 60000);
  await pool.query("UPDATE interview_attempts SET ? WHERE attempt_id = ?", [{
    start_time: start, expires_at: new Date(start.getTime() + row.duration_minutes * 60000),
    end_time: end, submission_time: end, duration_seconds: minutesUsed * 60,
  }, attempt.attempt_id]);
  const evs = await q("SELECT event_id FROM interview_events WHERE attempt_id = ? ORDER BY event_id", [attempt.attempt_id]);
  for (let i = 0; i < evs.length; i++) {
    await pool.query("UPDATE interview_events SET occurred_at = ? WHERE event_id = ?", [new Date(start.getTime() + (3 + i * 4) * 60000), evs[i].event_id]);
  }
  return attempt.attempt_id;
}

const right = (qu) => ({ selected_option: qu.correct_option });
const wrong = (qu) => ({ selected_option: opt0(qu) });
const opt0 = (qu) => { const keys = (qu.options || []).map((o) => o.key); return keys.find((k) => k !== qu.correct_option) || keys[0]; };

async function seedAttempts(ids) {
  const has = async (iid, uid) => Number((await q("SELECT COUNT(*) AS n FROM interview_attempts WHERE interview_id = ? AND candidate_id = ?", [iid, uid]))[0].n) > 0;

  // 1) Aptitude quiz, candidate1: 4/5 correct -> auto-evaluated 80% (released to the candidate)
  if (ids.quiz && !ids.quiz.existed && !(await has(ids.quiz.id, C1))) {
    await sampleAttempt({ interviewId: ids.quiz.id, userId: C1, minutesUsed: 9, daysAgo: 2, pick: (qu, i) => (i === 1 ? wrong(qu) : right(qu)) });
    log("✅ sample attempt: Aptitude Quiz / candidate1 (auto-evaluated, 8/10)");
  }

  // 2) Technical round, candidate2: submitted, WAITING for manual review, with security flags
  if (ids.tech && !ids.tech.existed && !(await has(ids.tech.id, C2))) {
    await sampleAttempt({
      interviewId: ids.tech.id, userId: C2, minutesUsed: 27, daysAgo: 1,
      events: [{ event_type: "tab_switch", details: { n: 1 } }, { event_type: "tab_switch", details: { n: 2 } }, { event_type: "fullscreen_exit" }],
      pick: (qu, i) => {
        if (qu.question_type === "mcq") return i % 2 === 0 ? right(qu) : wrong(qu);
        if (qu.question_type === "subjective") return { answer_text: "An index is like a book's table of contents: it makes searching a column faster. Too many indexes make INSERT and UPDATE slower and use more disk." };
        if (qu.question_type === "technical") return { answer_text: "1) Reproduce under load. 2) Check logs/metrics. 3) Look for slow SQL and missing indexes. 4) Add caching/pagination. 5) Re-test." };
        return { answer_text: "function isPalindrome(s){\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return c === c.split('').reverse().join('');\n}" };
      },
    });
    log("✅ sample attempt: Technical Round / candidate2 (pending manual review, 3 security flags)");
  }

  // 3) Technical round, candidate3: fully evaluated by the admin
  if (ids.tech && !ids.tech.existed && !(await has(ids.tech.id, C3))) {
    const aid = await sampleAttempt({
      interviewId: ids.tech.id, userId: C3, minutesUsed: 24, daysAgo: 3,
      pick: (qu, i) => {
        if (qu.question_type === "mcq") return i === 3 ? wrong(qu) : right(qu);
        if (qu.question_type === "subjective") return { answer_text: "A B-tree structure that lets the database find rows without scanning the table. Trade-off: every write must also update the index, so writes slow down and storage grows." };
        if (qu.question_type === "technical") return { answer_text: "Profile first, find the slowest queries, add indexes, cache hot reads, paginate, move heavy work to a queue, then load-test." };
        return { answer_text: "const isPalindrome = (s) => {\n  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  for (let i = 0, j = t.length - 1; i < j; i++, j--) if (t[i] !== t[j]) return false;\n  return true;\n};" };
      },
    });
    const qs = await q("SELECT question_id, question_type FROM interview_questions WHERE interview_id = ? ORDER BY display_order, question_id", [ids.tech.id]);
    const by = (t) => Number(qs.find((x) => x.question_type === t).question_id);
    await evaluation.gradeAnswers(aid, OWNER, [
      { question_id: by("subjective"), marks: 5, comment: "Correct and clear; could mention covering indexes." },
      { question_id: by("technical"), marks: 4, comment: "Good process; missing connection pooling and monitoring." },
      { question_id: by("coding"), marks: 8, comment: "Correct and efficient two-pointer solution." },
    ], "Strong fundamentals. Recommended for the next round.");
    await evaluation.finalize(aid, OWNER, "Strong fundamentals. Recommended for the next round.");
    log("✅ sample attempt: Technical Round / candidate3 (finalized: 23/30)");
  }

  // 4) HR round, candidate2: submitted, waiting for review (candidate has 1 more attempt left)
  if (ids.hr && !ids.hr.existed && !(await has(ids.hr.id, C2))) {
    await sampleAttempt({
      interviewId: ids.hr.id, userId: C2, minutesUsed: 14, daysAgo: 1,
      pick: (qu) => {
        if (qu.question_type === "mcq") return right(qu);
        if (qu.question_type === "short_answer") return { answer_text: "30 days" };
        return { answer_text: "I enjoy building reliable products with a team. I applied because this role matches my experience, and I like how the company values learning." };
      },
    });
    log("✅ sample attempt: HR Screening / candidate2 (pending manual review)");
  }
}

/* ------------------------------------------------------------------ main */
(async () => {
  const flag = new Set(process.argv.slice(2));
  try {
    const roleId = await assertReady();
    if (flag.has("--reset") || flag.has("--remove")) await removeDemo();
    if (flag.has("--remove")) return;

    await ensureUsers(roleId);
    const ids = {};
    for (const def of INTERVIEWS) ids[def.key] = await createInterview(def);
    await seedAttempts(ids);

    log("\n──────────────────────────  DEMO LOGINS  ──────────────────────────");
    for (const u of USERS) log(`  Candidate : ${u.user_id.padEnd(32)} password: ${PASSWORD}   (${u.user_name})`);
    log("  Admin     : Admin@sysassist.com               password: 123456  (your existing admin)");
    log("────────────────────────────────────────────────────────────────────");
    log("  candidate1 -> fresh: can start Technical + HR; has a finished Quiz; sees an Upcoming round");
    log("  candidate2 -> Technical + HR already submitted (pending review: log in as admin to grade)");
    log("  candidate3 -> Technical already evaluated; Quiz + Upcoming still to take");
    log("  Admin      -> /admin/interviews : 5 interviews (4 published, 1 draft), attempts, results, evaluation\n");
  } catch (e) {
    console.error("\n❌ " + e.message);
    if (/null value in column|violates/.test(e.message)) console.error("   Your \"user\" table may have extra NOT NULL columns; add them in ensureUsers().");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

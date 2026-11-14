import { createServer } from "vite";
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const React = (await import("react")).default;
const { renderToString } = await import("react-dom/server");
const { MemoryRouter } = await import("react-router-dom");
const load = (p) => vite.ssrLoadModule(p).then((m) => m.default);
const [Q, R, E, C, I, T] = await Promise.all(["InterviewQuestion","InterviewResult","InterviewEvaluation","InterviewCard","InterviewInstructions","InterviewTimer"].map((n) => load(`/src/components/interview/${n}.jsx`)));
const h = React.createElement; let ok = 0;
const check = (n, html0, ...needles) => { const html = html0.replace(/<!-- -->/g, ""); for (const s of needles) if (!html.includes(s)) throw new Error(n + " missing " + s); ok++; console.log("  ok", n); };
const mcq = { question_id: 1, question: "2+2?", question_type: "mcq", marks: 2, options: [{ key: "A", text: "3" }, { key: "B", text: "4" }] };
check("MCQ question", renderToString(h(Q, { question: mcq, index: 0, total: 3, value: { selected_option: "B" }, onChange() {} })), "Question 1 of 3", "4", "checked");
check("coding question", renderToString(h(Q, { question: { ...mcq, question_type: "coding", options: null }, index: 1, total: 3, value: { answer_text: "x=1" }, onChange() {} })), "Write your code", "x=1");
check("result hidden", renderToString(h(R, { result: { interview_title: "T", status: "submitted", result_visible: false, evaluation_status: "pending_manual_review", message: "pending manual review." } })), "pending manual review");
check("result visible", renderToString(h(R, { result: { interview_title: "T", status: "submitted", result_visible: true, score: 8, total_marks: 10, percentage: 80, passed: true } })), "8 / 10", "80%", "Passed");
const detail = { attempt: { status: "submitted", evaluation_status: "pending_manual_review", score: 2, total_marks: 10, percentage: null }, interview: { title: "BE" }, candidate: { user_id: "c1", user_name: "Cand" }, evaluation: { status: "pending" }, events: [{ event_id: 1, event_type: "tab_switch", severity: "warning", source: "web", occurred_at: new Date() }],
  items: [{ question: { ...mcq, correct_option: "B" }, auto_gradable: true, answer: { selected_option: "A", marks_awarded: 0 }, needs_review: false },
          { question: { question_id: 2, question: "Explain", question_type: "subjective", marks: 8, expected_answer: "b-trees" }, auto_gradable: false, answer: { answer_id: 5, answer_text: "reads", marks_awarded: null }, needs_review: true }] };
check("evaluation", renderToString(h(E, { detail, onSave() {}, onFinalize() {}, busy: false })), "b-trees", "auto-graded", "1 answer(s) still need marks", "tab switch", "pending");
check("card", renderToString(h(C, { interview: { interview_id: 1, title: "Backend", interview_type: "technical", category: "available", duration_minutes: 30, attempts_used: 0, max_attempts: 1 }, onOpen() {} })), "Backend", "View &amp; start", "30 minutes");
check("instructions", renderToString(h(I, { interview: { title: "X", duration_minutes: 20, question_count: 5, total_marks: 10, proctoring_enabled: 1 }, onStart() {} })), "Proctored", "server", "Start interview");
check("timer", renderToString(h(T, { remainingSeconds: 125, syncKey: 0 })), "02:05");
console.log(ok + " component smoke checks passed"); await vite.close();

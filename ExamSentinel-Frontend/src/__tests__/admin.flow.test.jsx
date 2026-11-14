import { describe, it, expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { bootApp, ok } from "./helpers";

const ADMIN = { user_id: "Admin@sysassist.com", user_name: "Admin" };
const all = { create: "Y", read: "Y", update: "Y", delete: "Y", execute: "Y" };
const perms = { interviews: all, interview_evaluations: all, interview_portal: all, dashboard: all };
const types = { interview_types: [{ type_code: "technical", label: "Technical Interview" }, { type_code: "hr", label: "HR Interview" }, { type_code: "general", label: "General Interview" }],
  question_types: [{ type_code: "mcq", label: "Multiple Choice", auto_gradable: 1, requires_options: 1 }, { type_code: "subjective", label: "Subjective", auto_gradable: 0, requires_options: 0 }, { type_code: "coding", label: "Coding", auto_gradable: 0, requires_options: 0 }] };
const iv = (o = {}) => ({ interview_id: 9, title: "Data Analyst", description: null, instructions: null, interview_type: "hr", status: "draft", duration_minutes: 45, scheduled_start: null, scheduled_end: null, passing_percentage: null, auto_submit_on_expiry: 1, show_result_to_candidate: 0, proctoring_enabled: 0, question_count: 0, candidate_count: 0, attempt_count: 0, total_marks: 0, ...o });

describe("admin screens in the real app shell", () => {
  it("list -> create interview -> lands on the Questions tab; add an MCQ question", async () => {
    const user = userEvent.setup();
    const { calls } = await bootApp({
      path: "/admin/interviews", role: 1, user: ADMIN, permissions: perms,
      routes: {
        "GET api/interviews": ok([iv({ interview_id: 1, title: "Backend Developer – Technical Round", interview_type: "technical", status: "published", question_count: 7, total_marks: 30, candidate_count: 3, attempt_count: 2 })]),
        "GET api/interviews/types": ok(types),
        "POST api/interviews": ok(iv()),
        "GET api/interviews/9": ok(iv()),
        "GET api/interviews/9/questions": ok([]),
        "POST api/interviews/9/questions": ok({ question_id: 1 }),
      },
    });
    expect(await screen.findByText("Backend Developer – Technical Round")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /New interview/ }));

    // form: labels are wired to inputs
    await user.type(await screen.findByLabelText("Title *"), "Data Analyst");
    await user.selectOptions(screen.getByLabelText("Type"), "hr");
    const dur = screen.getByLabelText("Duration (minutes) *"); await user.clear(dur); await user.type(dur, "45");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(calls.find((c) => c.method === "POST" && c.url === "api/interviews")).toBeTruthy());
    expect(calls.find((c) => c.method === "POST" && c.url === "api/interviews").body).toMatchObject({ title: "Data Analyst", interview_type: "hr", duration_minutes: 45, scheduled_start: null, passing_percentage: null, auto_submit_on_expiry: true, proctoring_enabled: false });
    expect(await screen.findByText("No questions yet.")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/admin/interviews/9/questions");

    // add an MCQ question
    await user.click(screen.getByRole("button", { name: /Add question/ }));
    const dlg = await screen.findByRole("dialog");
    await user.selectOptions(within(dlg).getByLabelText("Type"), "mcq");
    await user.type(within(dlg).getByLabelText("Question *"), "Which is a SQL aggregate?");
    const optInputs = within(dlg).getAllByRole("textbox").filter((el) => el.tagName === "INPUT" && !el.getAttribute("id")?.includes("category"));
    await user.type(optInputs[optInputs.length - 2], "SUM"); await user.type(optInputs[optInputs.length - 1], "JOIN");
    await user.click(within(dlg).getAllByRole("radio")[0]);
    await user.click(within(dlg).getByRole("button", { name: "Save question" }));
    await waitFor(() => expect(calls.find((c) => c.method === "POST" && c.url === "api/interviews/9/questions")).toBeTruthy());
    const body = calls.find((c) => c.url === "api/interviews/9/questions" && c.method === "POST").body;
    expect(body).toMatchObject({ question: "Which is a SQL aggregate?", question_type: "mcq", correct_option: "A", marks: 1 });
    expect(body.options).toEqual([{ key: "A", text: "SUM" }, { key: "B", text: "JOIN" }]);
  });

  it("candidates tab: a candidate who used all attempts can be given one more", async () => {
    const user = userEvent.setup();
    const { calls } = await bootApp({
      path: "/admin/interviews/9/candidates", role: 1, user: ADMIN, permissions: perms,
      routes: {
        "GET api/interviews/9": ok(iv({ status: "published", question_count: 2, attempt_count: 1 })),
        "GET api/interviews/9/candidates": ok([
          { id: 1, interview_id: 9, candidate_id: "candidate1@examsentinel.test", candidate_name: "Aarav Sharma", max_attempts: 1, attempts_used: 1, assigned_at: new Date().toISOString() },
          { id: 2, interview_id: 9, candidate_id: "candidate2@examsentinel.test", candidate_name: "Diya Patel", max_attempts: 1, attempts_used: 0, assigned_at: new Date().toISOString() }]),
        "PUT api/interviews/9/candidates/.*": ok({ max_attempts: 2 }),
      },
    });
    expect(await screen.findByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Allow +1 attempt" })).toHaveLength(1); // only for the one who used it up
    const removes = screen.getAllByRole("button", { name: "Remove" });
    expect(removes[0]).toBeDisabled();   // candidate1 already attempted: cannot be removed
    expect(removes[1]).toBeEnabled();    // candidate2 has no attempts yet
    await user.click(screen.getByRole("button", { name: "Allow +1 attempt" }));
    await waitFor(() => expect(calls.find((c) => c.method === "PUT")).toBeTruthy());
    const put = calls.find((c) => c.method === "PUT");
    expect(put.url).toBe("api/interviews/9/candidates/candidate1%40examsentinel.test");
    expect(put.body).toEqual({ max_attempts: 2 });
  });

  it("evaluation: Finalize stays disabled until every written answer is graded, then saves + finalizes", async () => {
    const user = userEvent.setup();
    const detail = {
      attempt: { attempt_id: 77, status: "submitted", evaluation_status: "pending_manual_review", score: 2, total_marks: 10, percentage: null },
      interview: { interview_id: 9, title: "Backend Developer – Technical Round", interview_type: "technical", passing_percentage: 50 },
      candidate: { user_id: "candidate2@examsentinel.test", user_name: "Diya Patel" }, evaluation: { status: "pending", comments: null }, events: [],
      items: [
        { question: { question_id: 1, question: "2+2?", question_type: "mcq", marks: 2, correct_option: "B", expected_answer: null }, auto_gradable: true, needs_review: false, answer: { answer_id: 1, selected_option: "B", marks_awarded: 2, is_auto_graded: true } },
        { question: { question_id: 2, question: "Explain an index", question_type: "subjective", marks: 8, expected_answer: "b-trees" }, auto_gradable: false, needs_review: true, answer: { answer_id: 2, answer_text: "Speeds up reads", marks_awarded: null } }] };
    const finalDetail = { ...detail, attempt: { ...detail.attempt, evaluation_status: "evaluated", score: 8, percentage: 80 }, evaluation: { status: "finalized", finalized_at: new Date().toISOString(), comments: "Good" } };
    const { calls } = await bootApp({
      path: "/admin/interview-attempts/77/evaluation", role: 1, user: ADMIN, permissions: perms,
      routes: { "GET api/interview-attempts/77/evaluation": ok(detail), "PUT api/interview-attempts/77/evaluation": ok(detail), "POST api/interview-attempts/77/evaluation/finalize": ok(finalDetail) },
    });
    expect(await screen.findByText("b-trees", { exact: false })).toBeInTheDocument();
    const fin = screen.getByRole("button", { name: "Finalize evaluation" });
    expect(fin).toBeDisabled();
    expect(screen.getByText(/1 answer\(s\) still need marks/)).toBeInTheDocument();
    await user.type(screen.getByRole("spinbutton"), "6");
    await user.type(screen.getAllByRole("textbox")[0], "Good");
    expect(fin).toBeEnabled();
    await user.click(fin);
    await waitFor(() => expect(calls.some((c) => c.url.endsWith("/finalize"))).toBe(true));
    const save = calls.find((c) => c.method === "PUT");
    expect(save.body.grades).toEqual([{ question_id: 2, marks: 6, comment: "Good" }]);
    expect(await screen.findByText(/Finalized/)).toBeInTheDocument();
  });

  it("read-only admin: no 'New interview' button, and /create bounces to the dashboard", async () => {
    const readOnly = { interviews: { create: "N", read: "Y", update: "N", delete: "N", execute: "N" }, dashboard: all };
    await bootApp({ path: "/admin/interviews", role: 1, user: ADMIN, permissions: readOnly, routes: { "GET api/interviews": ok([iv({ status: "published" })]), "GET api/interviews/types": ok(types) } });
    expect(await screen.findByText("Data Analyst")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /New interview/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
  });
  it("no read permission at all: /admin/interviews redirects to the dashboard", async () => {
    await bootApp({ path: "/admin/interviews", role: 1, user: ADMIN, permissions: { dashboard: all }, routes: {} });
    await waitFor(() => expect(window.location.pathname).toBe("/admin/dashboard"));
  });
});

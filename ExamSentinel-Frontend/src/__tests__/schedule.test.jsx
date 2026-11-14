import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { bootApp, ok } from "./helpers.jsx";
import { ADMIN, CAND, CAND_PERMS, HR_PERMS, baseInterview, backend } from "./fixtures.js";
import * as fake from "./fakeLivekit.js";

vi.mock("livekit-client", async () => await import("./fakeLivekit.js"));
beforeEach(() => { fake.rooms.length = 0; });

describe("HR schedules an interview", () => {
  it("pick a candidate, schedule, get meeting code + link, send the invitation", async () => {
    const user = userEvent.setup();
    const created = baseInterview({ id: 9, meeting_code: "ABCD-2345", title: "Data Analyst Round", join_link: "http://localhost:5173/candidate/live-interviews/9" });
    const { calls } = await bootApp({ path: "/admin/live-interviews/create", role: 1, user: ADMIN, permissions: HR_PERMS, routes: {
      "GET api/live-interviews/candidate-pool": ok([{ user_id: "candidate1@examsentinel.test", user_name: "Aarav Sharma" }, { user_id: "candidate2@examsentinel.test", user_name: "Diya Patel" }]),
      "POST api/live-interviews": ok(created, "Interview scheduled"),
      "POST api/live-interviews/9/invite": ok({ sent: false, reason: "SMTP is not configured on the server; share the link instead", link: created.join_link, meeting_code: "ABCD-2345" }),
    } });
    await user.type(await screen.findByLabelText("Title *"), "Data Analyst Round");
    await screen.findByRole("option", { name: /Diya Patel/ });
    await user.selectOptions(screen.getByLabelText("Candidate"), "candidate2@examsentinel.test");
    expect(screen.getByLabelText("Candidate email (for the invitation)")).toHaveValue("candidate2@examsentinel.test");
    const dur = screen.getByLabelText("Duration (minutes) *"); await user.clear(dur); await user.type(dur, "45");
    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    const card = await screen.findByTestId("created-card");
    expect(within(card).getByText("ABCD-2345")).toBeInTheDocument();
    expect(within(card).getByText(/candidate\/live-interviews\/9/)).toBeInTheDocument();
    const post = calls.find((c) => c.method === "POST" && c.url === "api/live-interviews");
    expect(post.body).toMatchObject({ title: "Data Analyst Round", candidate_id: "candidate2@examsentinel.test", duration_minutes: 45, monitoring_required: true });
    expect(new Date(post.body.scheduled_start).getTime()).toBeGreaterThan(Date.now());           // ISO timestamp in the future
    await user.click(within(card).getByRole("button", { name: /Send e-mail invitation/ }));
    await waitFor(() => expect(calls.some((c) => c.url === "api/live-interviews/9/invite")).toBe(true));
  });

  it("create a brand-new candidate on the spot: temp password shown once, candidate pre-selected", async () => {
    const user = userEvent.setup();
    const { calls } = await bootApp({ path: "/admin/live-interviews/create", role: 1, user: ADMIN, permissions: HR_PERMS, routes: {
      "GET api/live-interviews/candidate-pool": ok([]),
      "POST api/live-interviews/candidates": ok({ user_id: "new.person@test.dev", user_name: "New Person", existing: false, temp_password: "Xk9mPq2LtR7" }, "Candidate ready"),
    } });
    await user.click(await screen.findByRole("button", { name: /New candidate/ }));
    const dlg = await screen.findByRole("dialog");
    expect(within(dlg).getByRole("button", { name: "Create candidate" })).toBeDisabled();
    await user.type(within(dlg).getByLabelText("Full name *"), "New Person");
    await user.type(within(dlg).getByLabelText("Email *"), "new.person@test.dev");
    await user.click(within(dlg).getByRole("button", { name: "Create candidate" }));
    const creds = await screen.findByTestId("credentials");
    expect(creds).toHaveTextContent("User ID: new.person@test.dev"); expect(creds).toHaveTextContent("Password: Xk9mPq2LtR7");
    expect(calls.find((c) => c.url === "api/live-interviews/candidates").body).toEqual({ name: "New Person", email: "new.person@test.dev" });
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Done" }));
    expect(await screen.findByLabelText("Candidate")).toHaveValue("new.person@test.dev");
    expect(screen.getByLabelText("Candidate email (for the invitation)")).toHaveValue("new.person@test.dev");
  });

  it("scheduling conflicts from the server are shown, not swallowed", async () => {
    const user = userEvent.setup();
    await bootApp({ path: "/admin/live-interviews/create", role: 1, user: ADMIN, permissions: HR_PERMS, routes: {
      "GET api/live-interviews/candidate-pool": ok([{ user_id: "candidate1@examsentinel.test", user_name: "Aarav Sharma" }]),
      "POST api/live-interviews": { __status: 409, status: false, code: "CANDIDATE_BUSY", msg: "This candidate already has an interview at that time" },
    } });
    await user.type(await screen.findByLabelText("Title *"), "Clash");
    await screen.findByRole("option", { name: /Aarav/ });
    await user.selectOptions(screen.getByLabelText("Candidate"), "candidate1@examsentinel.test");
    await user.click(screen.getByRole("button", { name: "Schedule interview" }));
    expect((await screen.findAllByText(/already has an interview at that time/)).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("created-card")).not.toBeInTheDocument();
  });

  it("reschedule: the form loads the existing interview and saves with PUT", async () => {
    const user = userEvent.setup();
    const b = backend(); let put;
    const { calls } = await bootApp({ path: "/admin/live-interviews/5/edit", role: 1, user: ADMIN, permissions: HR_PERMS, routes: { ...b.routes, "PUT api/live-interviews/5": ({ body }) => { put = body; return ok({ ...b.s.iv, ...body }); } } });
    const title = await screen.findByLabelText("Title *");
    await waitFor(() => expect(title).toHaveValue("HR Round – Backend Developer")); // the form fills in after the interview loads
    await user.clear(title); await user.type(title, "HR Round v2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(put).toBeTruthy());
    expect(put.title).toBe("HR Round v2"); expect(put.candidate_id).toBeUndefined();   // the candidate cannot be swapped
    expect(calls.some((c) => c.method === "PUT")).toBe(true);
  });
});

describe("candidate login lands on the interview list", () => {
  it("role 6 signs in on /login and sees My Interviews (no questions, no exam UI)", async () => {
    const user = userEvent.setup();
    const b = backend();
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ status: true, msg: "ok", Token: "jwt", result: { user_id: CAND.user_id, user_name: CAND.user_name, user_role_id: 6 } }) })));
    await bootApp({ path: "/login", role: null, user: CAND, permissions: CAND_PERMS, routes: b.routes });
    await user.type(await screen.findByPlaceholderText("e.g. admin01"), "candidate1@examsentinel.test");
    await user.type(screen.getByPlaceholderText("Enter admin password"), "Candidate@123");
    await user.click(screen.getByRole("button", { name: /sign in|login|log in/i }));
    expect(await screen.findByText("My Interviews", { selector: "h1" }, { timeout: 6000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/candidate/live-interviews");
    expect(sessionStorage.getItem("userData")).not.toMatch(/password/i);
    vi.unstubAllGlobals();
  });
});

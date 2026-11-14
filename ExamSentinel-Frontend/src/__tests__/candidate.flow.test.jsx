import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { bootApp } from "./helpers.jsx";
import { CAND, CAND_PERMS, baseInterview, backend } from "./fixtures.js";
import * as fake from "./fakeLivekit.js";

vi.mock("livekit-client", async () => await import("./fakeLivekit.js"));
beforeEach(() => { fake.rooms.length = 0; fake.behaviour.mediaError = null; fake.behaviour.connectError = null; });
const boot = (path, b) => bootApp({ path, role: 6, user: CAND, permissions: CAND_PERMS, routes: b.routes });

describe("candidate: laptop joins the interview", () => {
  it("list -> details -> consent gate -> joins -> sees the interviewer -> monitoring banner -> leave", async () => {
    const user = userEvent.setup();
    const b = backend();
    const { calls } = await boot("/candidate/live-interviews", b);

    expect(await screen.findByRole("heading", { name: "Ready to join" })).toBeInTheDocument();
    expect(screen.getByText("HR Round – Backend Developer")).toBeInTheDocument();
    expect(screen.queryByText(/Question|Answer/i)).not.toBeInTheDocument();   // no Q&A anywhere
    await user.click(screen.getByRole("button", { name: "Join interview" }));

    // details explain the two-device setup and contain no questions
    expect(await screen.findByText("How this interview works")).toBeInTheDocument();
    expect(screen.getAllByText(/second phone/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/nothing to type or answer/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Join interview on this device/ }));

    // consent gate: nothing starts without the tick
    const join = await screen.findByRole("button", { name: "Join interview" });
    expect(join).toBeDisabled();
    expect(screen.getByText(/not recorded/i)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /I understand and agree/ }));
    expect(join).toBeEnabled();
    expect(fake.rooms).toHaveLength(0);
    await user.click(join);
    await waitFor(() => expect(fake.rooms).toHaveLength(1));
    const tok = calls.find((c) => c.url.endsWith("/token"));
    expect(tok.body).toEqual({ role: "candidate", consent: true, client: "web" });
    const room = fake.last();
    expect(room.calls.some((c) => c[0] === "enableCameraAndMicrophone")).toBe(true);

    // in the call: interviewer tile + monitoring status from the server
    await act(async () => { room.addRemote("host:Admin@sysassist.com", "Interviewer Admin"); });
    expect(await screen.findByTestId("tile-Admin")).toBeInTheDocument();
    expect(await screen.findByText(/Workspace camera NOT connected/)).toBeInTheDocument();
    b.s.status = { ...b.s.status, participants: { host: { connected: true }, candidate: { connected: true }, monitor: { connected: true } } };
    expect(await screen.findByText(/Workspace camera is connected/, {}, { timeout: 7000 })).toBeInTheDocument();

    // leaving asks for confirmation
    await user.click(screen.getByRole("button", { name: /Leave/ }));
    await user.click(await screen.findByRole("button", { name: "Leave", hidden: false }).then(() => screen.getAllByRole("button", { name: "Leave" }).pop()));
    await waitFor(() => expect(room.connected).toBe(false));
    await waitFor(() => expect(window.location.pathname).toBe("/candidate/live-interviews"));
    expect(calls.some((c) => c.url.endsWith("/events") && c.body.event_type === "left")).toBe(true);
  }, 30000);

  it("an interview that is not open yet shows when it opens and keeps the buttons disabled", async () => {
    const b = backend();
    b.s.iv = baseInterview({ join_state: "upcoming", opens_at: new Date(Date.now() + 86400000).toISOString(), scheduled_start: new Date(Date.now() + 86400000 + 600000).toISOString() });
    await boot("/candidate/live-interviews/5", b);
    expect(await screen.findByText(/The room opens at/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Join interview on this device/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /monitoring camera/ })).toBeDisabled();
  });

  it("an interview without monitoring does not offer the monitoring camera", async () => {
    const b = backend(); b.s.iv = baseInterview({ monitoring_required: false });
    await boot("/candidate/live-interviews/5", b);
    expect(await screen.findByText("How this interview works")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /monitoring camera/ })).not.toBeInTheDocument();
  });
});

describe("candidate: second phone as the workspace camera (browser version)", () => {
  it("explicit consent, rear camera only, visible MONITORING ACTIVE banner, Stop monitoring", async () => {
    const user = userEvent.setup();
    const b = backend();
    const { calls } = await boot("/candidate/live-interviews/5/monitor", b);
    const start = await screen.findByRole("button", { name: "Start monitoring camera" });
    expect(start).toBeDisabled();
    expect(screen.getAllByText(/rear camera/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No microphone is used/i)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /I understand and agree/ }));
    await user.click(start);
    await waitFor(() => expect(fake.rooms).toHaveLength(1));
    const room = fake.last();
    expect(calls.find((c) => c.url.endsWith("/token")).body).toEqual({ role: "monitor", consent: true, client: "web" });
    expect(room.calls.some((c) => c[0] === "setCameraEnabled" && c[1] === true && c[2]?.facingMode === "environment")).toBe(true);   // REAR camera
    expect(room.calls.some((c) => c[0] === "enableCameraAndMicrophone")).toBe(false);                                                // never the microphone
    expect(await screen.findByTestId("monitoring-banner")).toHaveTextContent("MONITORING ACTIVE");
    await user.click(screen.getByRole("button", { name: /Stop monitoring/ }));
    await waitFor(() => expect(room.connected).toBe(false));
    await waitFor(() => expect(screen.queryByTestId("monitoring-banner")).not.toBeInTheDocument());
    expect(calls.some((c) => c.url.endsWith("/events") && c.body.role === "monitor" && c.body.event_type === "left")).toBe(true);
  });
});

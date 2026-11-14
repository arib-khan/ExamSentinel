import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { bootApp } from "./helpers.jsx";
import { ADMIN, HR_PERMS, backend } from "./fixtures.js";
import * as fake from "./fakeLivekit.js";

vi.mock("livekit-client", async () => await import("./fakeLivekit.js"));
beforeEach(() => { fake.rooms.length = 0; fake.behaviour.mediaError = null; fake.behaviour.connectError = null; });
const joined = (room, who) => act(async () => { room.addRemote(...who); });

describe("HR runs a live interview (real app shell, simulated video service)", () => {
  it("list -> Start -> sees candidate face AND workspace camera -> mute -> end interview", async () => {
    const user = userEvent.setup();
    const { s, routes } = backend();
    const { calls, container } = await bootApp({ path: "/admin/live-interviews", role: 1, user: ADMIN, permissions: HR_PERMS, routes });

    // 1) the HR list shows the scheduled interview with a Start button (room is open)
    expect(await screen.findByText("HR Round – Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("K7QM-4TXP")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    // 2) pre-join: nothing is switched on until HR presses the button
    const startBtn = await screen.findByRole("button", { name: "Start interview" });
    expect(fake.rooms).toHaveLength(0);
    await user.click(startBtn);
    await waitFor(() => expect(fake.rooms).toHaveLength(1));
    const room = fake.last();
    const tok = calls.find((c) => c.url.endsWith("/token"));
    expect(tok.body).toMatchObject({ role: "host", client: "web" });
    expect(room.calls.some((c) => c[0] === "connect" && c[1] === "wss://video.test")).toBe(true);
    expect(room.calls.some((c) => c[0] === "enableCameraAndMicrophone")).toBe(true);

    // 3) dashboard before anyone arrives
    expect(await screen.findByText("ExamSentinel – Live Interview")).toBeInTheDocument();
    expect(screen.getByText(/Waiting for the candidate to join/)).toBeInTheDocument();
    expect(screen.getByText(/Workspace camera not connected/)).toBeInTheDocument();

    // 4) the candidate laptop and the workspace phone join
    await joined(room, ["candidate:candidate1@examsentinel.test", "Aarav Sharma"]);
    await joined(room, ["monitor:candidate1@examsentinel.test", "Workspace camera", { mic: false }]);
    const face = await screen.findByTestId("tile-Aarav Sharma");
    const desk = await screen.findByTestId("tile-Workspace");
    expect(face.querySelector("video")).toBeTruthy(); expect(desk.querySelector("video")).toBeTruthy();
    expect(face).not.toBe(desk);
    const faceTrack = room.remoteParticipants.get("candidate:candidate1@examsentinel.test").pubs.camera.track;
    const deskTrack = room.remoteParticipants.get("monitor:candidate1@examsentinel.test").pubs.camera.track;
    expect(faceTrack.attached.size).toBe(1); expect(deskTrack.attached.size).toBe(1);        // each feed is attached to its own <video>
    expect([...faceTrack.attached][0]).not.toBe([...deskTrack.attached][0]);
    expect(container.querySelectorAll("audio")).toHaveLength(1);                              // only the candidate speaks; the monitor has no mic
    const panel = screen.getByText("Connection status").closest("[data-slot='card']");
    expect(within(panel).getByText("Candidate: connected")).toBeInTheDocument();
    expect(within(panel).getByText("Workspace: connected")).toBeInTheDocument();
    expect(screen.queryByText(/Workspace camera not connected/)).not.toBeInTheDocument();
    expect(screen.getByText("Candidate information")).toBeInTheDocument();
    expect(screen.getByText("+91 90000 00001")).toBeInTheDocument();

    // 5) controls
    await user.click(screen.getByRole("button", { name: /Mute/ }));
    expect(room.calls.some((c) => c[0] === "setMicrophoneEnabled" && c[1] === false)).toBe(true);
    expect(await screen.findByRole("button", { name: /Unmute/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Camera off/ }));
    expect(room.calls.some((c) => c[0] === "setCameraEnabled" && c[1] === false)).toBe(true);

    // 6) the workspace phone drops -> HR sees it immediately
    await act(async () => { room.removeRemote("monitor:candidate1@examsentinel.test"); });
    expect(await screen.findByText("Workspace: not connected")).toBeInTheDocument();

    // 7) end interview needs confirmation, then ends for everyone
    await user.click(screen.getByRole("button", { name: /End interview/ }));
    const dlg = await screen.findByRole("alertdialog");
    expect(calls.some((c) => c.url.endsWith("/end"))).toBe(false);
    await user.click(within(dlg).getByRole("button", { name: "End interview" }));
    expect(await screen.findByTestId("ended-card")).toBeInTheDocument();
    expect(calls.some((c) => c.method === "POST" && c.url === "api/live-interviews/5/end")).toBe(true);
    expect(room.connected).toBe(false);
    expect(s.iv.status).toBe("ended");
  });

  it("elapsed time and start time come from the server", async () => {
    const user = userEvent.setup();
    const { s, routes } = backend({ iv: undefined });
    s.iv = { ...s.iv, status: "live", join_state: "live", started_at: new Date(Date.now() - 125000).toISOString() };
    s.status = { ...s.status, status: "live", elapsed_seconds: 125, started_at: s.iv.started_at, participants: { host: { connected: true }, candidate: { connected: true }, monitor: { connected: true } } };
    await bootApp({ path: "/admin/live-interviews/5/room", role: 1, user: ADMIN, permissions: HR_PERMS, routes });
    await user.click(await screen.findByRole("button", { name: "Rejoin interview" }));
    await waitFor(() => expect(fake.rooms).toHaveLength(1));
    await waitFor(() => expect(Number((screen.getByTestId("elapsed").textContent || "0:0").split(":")[0])).toBeGreaterThanOrEqual(2));
    expect(screen.getByTestId("elapsed").textContent).toMatch(/^02:0\d|^02:1\d/);
  });

  it("interviews that are not open yet cannot be started from the list", async () => {
    const { s, routes } = backend();
    s.iv = { ...s.iv, join_state: "upcoming", scheduled_start: new Date(Date.now() + 5 * 3600000).toISOString() };
    await bootApp({ path: "/admin/live-interviews", role: 1, user: ADMIN, permissions: HR_PERMS, routes });
    expect(await screen.findByRole("button", { name: /Start/ })).toBeDisabled();
  });

  it("a user without the live-interview permission cannot open the HR pages", async () => {
    const { routes } = backend();
    const { calls } = await bootApp({ path: "/admin/live-interviews", role: 1, user: ADMIN, permissions: { dashboard: { create: "Y", read: "Y", update: "Y", delete: "Y", execute: "Y" } }, routes });
    await waitFor(() => expect(window.location.pathname).toBe("/admin/dashboard"));
    expect(calls.some((c) => c.url === "api/live-interviews")).toBe(false);
  });
});

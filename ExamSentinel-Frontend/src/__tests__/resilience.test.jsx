import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { bootApp } from "./helpers.jsx";
import { CAND, CAND_PERMS, backend } from "./fixtures.js";
import * as fake from "./fakeLivekit.js";

vi.mock("livekit-client", async () => await import("./fakeLivekit.js"));
beforeEach(() => { fake.rooms.length = 0; fake.behaviour.mediaError = null; fake.behaviour.connectError = null; });
const boot = (b, path = "/candidate/live-interviews/5/room") => bootApp({ path, role: 6, user: CAND, permissions: CAND_PERMS, routes: b.routes });
const consentAndJoin = async (user) => { await user.click(await screen.findByRole("checkbox", { name: /I understand and agree/ })); await user.click(screen.getByRole("button", { name: /Join interview|Retry/ })); };

describe("failures are explained and recoverable", () => {
  it("camera permission denied -> clear message -> Retry works", async () => {
    const user = userEvent.setup(); const b = backend();
    fake.behaviour.mediaError = Object.assign(new Error("Permission denied"), { name: "NotAllowedError" });
    const { calls } = await boot(b);
    await consentAndJoin(user);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/permission was denied/i);
    expect(fake.last().connected).toBe(false);                       // nothing stays connected without media
    expect(calls.some((c) => c.url.endsWith("/events") && c.body.event_type === "permission_denied")).toBe(true);
    fake.behaviour.mediaError = null;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fake.rooms).toHaveLength(2));
    expect(await screen.findByRole("button", { name: /Leave/ })).toBeInTheDocument();
  });

  it("room not open yet (TOO_EARLY) -> shows when it opens, no room is created", async () => {
    const user = userEvent.setup(); const b = backend();
    b.s.tokenError = { code: "TOO_EARLY", msg: "This interview is not open yet", opens_at: new Date(Date.now() + 3600000).toISOString() };
    await boot(b); await consentAndJoin(user);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Not open yet"); expect(alert).toHaveTextContent(/opens/);
    expect(fake.rooms).toHaveLength(0);
  });

  it("interview already ended / cancelled -> ended screen instead of an error", async () => {
    const user = userEvent.setup(); const b = backend();
    b.s.tokenError = { code: "CANCELLED", msg: "This interview was cancelled" };
    await boot(b); await consentAndJoin(user);
    const card = await screen.findByTestId("ended-card");
    expect(card).toHaveTextContent(/cancelled/i);
  });

  it("video service unreachable (502) -> message + Retry", async () => {
    const user = userEvent.setup(); const b = backend();
    b.s.tokenError = { status: 502, code: "LIVEKIT_UNAVAILABLE", msg: "Cannot reach the video service" };
    await boot(b); await consentAndJoin(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Cannot reach the video service/);
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });

  it("short network drop: 'Reconnecting…' banner appears and disappears by itself", async () => {
    const user = userEvent.setup(); const b = backend();
    await boot(b); await consentAndJoin(user);
    await screen.findByRole("button", { name: /Leave/ });
    const room = fake.last();
    await act(async () => { room.emit("Reconnecting"); });
    expect(await screen.findAllByText("Reconnecting…")).not.toHaveLength(0);
    await act(async () => { room.emit("Reconnected"); });
    await waitFor(() => expect(screen.queryAllByText("Reconnecting…")).toHaveLength(0));
    expect((await screen.findAllByText("Connected")).length).toBeGreaterThan(0);
  });

  it("long outage: unexpected disconnect -> rejoins on its own with a FRESH token", async () => {
    const user = userEvent.setup(); const b = backend();
    await boot(b); await consentAndJoin(user);
    await screen.findByRole("button", { name: /Leave/ });
    expect(b.s.tokens).toBe(1);
    await act(async () => { fake.last().drop("SERVER_SHUTDOWN"); });
    expect((await screen.findAllByText("Reconnecting…")).length).toBeGreaterThan(0);
    await waitFor(() => expect(fake.rooms).toHaveLength(2), { timeout: 8000 });     // first retry after ~2 s
    expect(b.s.tokens).toBe(2);
    expect(fake.last().connected).toBe(true);
    await waitFor(() => expect(screen.queryAllByText("Reconnecting…")).toHaveLength(0));
  }, 20000);

  it("the interviewer ends the call -> candidate gets the 'interview ended' screen", async () => {
    const user = userEvent.setup(); const b = backend();
    await boot(b); await consentAndJoin(user);
    await screen.findByRole("button", { name: /Leave/ });
    await act(async () => { fake.last().drop("ROOM_DELETED"); });
    expect(await screen.findByTestId("ended-card")).toHaveTextContent(/interviewer ended/i);
  });

  it("outage while the interview was ended meanwhile -> ended screen, no pointless rejoin", async () => {
    const user = userEvent.setup(); const b = backend();
    await boot(b); await consentAndJoin(user);
    await screen.findByRole("button", { name: /Leave/ });
    b.s.iv = { ...b.s.iv, status: "ended", join_state: "ended" };
    await act(async () => { fake.last().drop("SERVER_SHUTDOWN"); });
    expect(await screen.findByTestId("ended-card", {}, { timeout: 8000 })).toBeInTheDocument();
    expect(fake.rooms).toHaveLength(1);
  }, 20000);

  it("browser goes offline/online -> reported to the server and shown", async () => {
    const user = userEvent.setup(); const b = backend();
    const { calls } = await boot(b); await consentAndJoin(user);
    await screen.findByRole("button", { name: /Leave/ });
    await act(async () => { window.dispatchEvent(new Event("offline")); });
    expect((await screen.findAllByText("You are offline")).length).toBeGreaterThan(0);
    await act(async () => { window.dispatchEvent(new Event("online")); });
    await waitFor(() => expect(screen.queryAllByText("You are offline")).toHaveLength(0));
    expect(calls.filter((c) => c.url.endsWith("/events")).map((c) => c.body.event_type)).toEqual(expect.arrayContaining(["network_offline", "network_online"]));
  });
});

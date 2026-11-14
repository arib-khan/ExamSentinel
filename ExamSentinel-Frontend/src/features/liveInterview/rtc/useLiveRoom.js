import { useCallback, useEffect, useRef, useState } from "react";
import { DisconnectReason, Room, RoomEvent, Track, VideoPresets } from "livekit-client";
import { liveApi, apiErrorCode, apiErrorData, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";

/**
 * One hook = one device in one live interview room (LiveKit / WebRTC).
 *   role "host"      HR interviewer       (camera + microphone)
 *   role "candidate" the interview device (camera + microphone)
 *   role "monitor"   workspace phone      (rear camera only, receives nothing)
 *
 * The server decides whether we may join and what we may publish (short-lived token).
 * Short network drops are healed by LiveKit itself ("reconnecting"); longer ones by rejoining with a fresh token.
 */
export const roleOf = (identity) => String(identity || "").split(":")[0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FINISHED = ["ENDED", "CANCELLED", "EXPIRED"];

export function describeMediaError(e) {
  const n = e?.name || "";
  if (n === "NotAllowedError" || /permission|denied/i.test(e?.message || "")) return { code: "permission_denied", message: "Camera or microphone permission was denied. Allow access in the browser address bar (lock icon), then press Retry." };
  if (n === "NotFoundError" || n === "OverconstrainedError") return { code: "media_error", message: "No suitable camera or microphone was found on this device." };
  if (n === "NotReadableError") return { code: "media_error", message: "The camera or microphone is being used by another app. Close it and press Retry." };
  if (typeof window !== "undefined" && window.isSecureContext === false) return { code: "media_error", message: "Camera access needs a secure (https) page. Open the site over https." };
  return { code: "media_error", message: e?.message || "Could not start the camera or microphone." };
}

export default function useLiveRoom({ interviewId, role }) {
  const [phase, setPhase] = useState("idle"); // idle | connecting | connected | reconnecting | ended | error
  const [error, setError] = useState(null);   // { message, code, retryable, opensAt }
  const [tiles, setTiles] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [needsAudioClick, setNeedsAudioClick] = useState(false);
  const [endedReason, setEndedReason] = useState(null);

  const roomRef = useRef(null);
  const leaving = useRef(false);
  const consent = useRef(false);
  const recovering = useRef(false);
  const mounted = useRef(true);
  const recoverRef = useRef(null);
  const safe = (fn) => (...a) => { if (mounted.current) fn(...a); };

  const report = useCallback((type, details) => { liveApi.event(interviewId, role, type, details).catch(() => {}); }, [interviewId, role]);

  const snapshot = useCallback((room) => {
    if (!room || !mounted.current) return;
    const parts = [room.localParticipant, ...room.remoteParticipants.values()];
    setTiles(parts.map((p) => {
      const cam = p.getTrackPublication(Track.Source.Camera), mic = p.getTrackPublication(Track.Source.Microphone);
      const local = p === room.localParticipant;
      return {
        identity: p.identity, role: roleOf(p.identity), name: p.name || p.identity, isLocal: local,
        camera: cam?.track || null, microphone: local ? null : mic?.track || null, // never play our own microphone back
        cameraOn: !!cam && !cam.isMuted && !!cam.track, micOn: !!mic && !mic.isMuted,
      };
    }));
    setMicOn(room.localParticipant.isMicrophoneEnabled);
    setCamOn(room.localParticipant.isCameraEnabled);
  }, []);

  const finish = useCallback((reason) => { setEndedReason(reason); setPhase("ended"); }, []);

  const wire = useCallback((room) => {
    const refresh = () => snapshot(room);
    [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackPublished, RoomEvent.TrackUnpublished, RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackMuted, RoomEvent.TrackUnmuted].forEach((ev) => room.on(ev, refresh));
    room.on(RoomEvent.Reconnecting, safe(() => { setPhase("reconnecting"); report("reconnecting"); }));
    room.on(RoomEvent.Reconnected, safe(() => { setPhase("connected"); report("reconnected"); refresh(); }));
    room.on(RoomEvent.AudioPlaybackStatusChanged, safe(() => setNeedsAudioClick(!room.canPlaybackAudio)));
    room.on(RoomEvent.MediaDevicesError, safe((e) => { const d = describeMediaError(e); report(d.code, { message: d.message }); setError({ ...d, retryable: true }); }));
    room.on(RoomEvent.Disconnected, safe((reason) => {
      if (leaving.current) return;
      if (reason === DisconnectReason.ROOM_DELETED) { finish("ended_by_host"); return; }
      if (recoverRef.current) recoverRef.current();
    }));
  }, [snapshot, report, finish]);

  const connect = useCallback(async () => {
    const t = await liveApi.token(interviewId, { role, consent: consent.current, client: "web" });
    const room = new Room({
      adaptiveStream: true, dynacast: true,
      videoCaptureDefaults: { resolution: VideoPresets.h540, facingMode: role === "monitor" ? "environment" : "user" },
    });
    wire(room);
    await room.connect(t.url, t.token);
    roomRef.current = room;
    try {
      if (role === "monitor") await room.localParticipant.setCameraEnabled(true, { facingMode: "environment" });
      else await room.localParticipant.enableCameraAndMicrophone();
    } catch (e) {
      leaving.current = true; await room.disconnect(); leaving.current = false; roomRef.current = null;
      const d = describeMediaError(e); report(d.code, { message: d.message });
      throw Object.assign(new Error(d.message), { media: d });
    }
    setNeedsAudioClick(!room.canPlaybackAudio);
    snapshot(room);
    return room;
  }, [interviewId, role, wire, report, snapshot]);

  const fail = useCallback((e) => {
    const code = apiErrorCode(e);
    if (FINISHED.includes(code)) { finish(code.toLowerCase()); return; }
    const data = apiErrorData(e);
    setError({ message: e.media?.message || apiErrorMessage(e), code: e.media?.code || code, retryable: true, opensAt: data.opens_at });
    setPhase("error");
  }, [finish]);

  /** Start (or restart) the session. Candidate/monitor must pass consent = true. */
  const join = useCallback(async ({ consent: c } = {}) => {
    consent.current = role === "host" ? false : c === true;
    leaving.current = false; setError(null); setPhase("connecting");
    try { await connect(); if (!mounted.current) return; setPhase("connected"); report("joined", { client: "web" }); }
    catch (e) { if (mounted.current) fail(e); }
  }, [connect, role, report, fail]);

  // after an unexpected drop: wait, check the interview is still on, rejoin with a fresh token (up to 6 times)
  recoverRef.current = async () => {
    if (recovering.current) return;
    recovering.current = true; setPhase("reconnecting");
    try {
      for (let i = 0; i < 6 && mounted.current && !leaving.current; i++) {
        await sleep(Math.min(2000 * 2 ** i, 15000));
        if (!mounted.current || leaving.current) return;
        try {
          const iv = await liveApi.get(interviewId);
          if (["ended", "cancelled", "expired"].includes(iv.status)) { finish(iv.status); return; }
          await connect();
          if (!mounted.current) return;
          setPhase("connected"); report("reconnected", { rejoin: true }); return;
        } catch (e) { if (FINISHED.includes(apiErrorCode(e))) { finish(apiErrorCode(e).toLowerCase()); return; } }
      }
      if (mounted.current && !leaving.current) { setError({ message: "Connection lost. Check your internet and press Retry.", code: "connection_lost", retryable: true }); setPhase("error"); }
    } finally { recovering.current = false; }
  };

  const leave = useCallback(async () => {
    leaving.current = true;
    const room = roomRef.current; roomRef.current = null;
    if (room) { try { await room.disconnect(); } catch { /* already gone */ } }
    report("left");
    if (mounted.current) { setTiles([]); setMicOn(false); setCamOn(false); setPhase("idle"); }
  }, [report]);

  const toggleMic = useCallback(async () => {
    const r = roomRef.current; if (!r) return;
    try { await r.localParticipant.setMicrophoneEnabled(!r.localParticipant.isMicrophoneEnabled); snapshot(r); }
    catch (e) { setError({ ...describeMediaError(e), retryable: true }); }
  }, [snapshot]);
  const toggleCam = useCallback(async () => {
    const r = roomRef.current; if (!r) return;
    try { await r.localParticipant.setCameraEnabled(!r.localParticipant.isCameraEnabled, role === "monitor" ? { facingMode: "environment" } : undefined); snapshot(r); }
    catch (e) { setError({ ...describeMediaError(e), retryable: true }); }
  }, [snapshot, role]);
  const enableAudio = useCallback(async () => { const r = roomRef.current; if (r) { await r.startAudio(); setNeedsAudioClick(!r.canPlaybackAudio); } }, []);
  const clearError = useCallback(() => { setError(null); setPhase((p) => (p === "error" ? "idle" : p)); }, []);

  useEffect(() => {
    const on = () => { setOnline(true); report("network_online"); }, off = () => { setOnline(false); report("network_offline"); };
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [report]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; leaving.current = true; const r = roomRef.current; roomRef.current = null; if (r) r.disconnect().catch(() => {}); };
  }, []);

  return { phase, error, tiles, micOn, camOn, online, needsAudioClick, endedReason, join, leave, toggleMic, toggleCam, enableAudio, clearError };
}

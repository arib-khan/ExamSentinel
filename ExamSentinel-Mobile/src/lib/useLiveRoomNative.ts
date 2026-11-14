import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { ApiError } from "../api/client";
import { Role, liveApi } from "../api/liveInterviews";
import { getLiveKit } from "./livekit";

/**
 * One device in one live interview (LiveKit / WebRTC on React Native).
 *   role "candidate": camera (front) + microphone, hears/sees the interviewer
 *   role "monitor"  : REAR camera only, no microphone, receives nothing (the server enforces this in the token)
 * Same recovery logic as the web app: LiveKit heals short drops itself; after a long drop we rejoin with a FRESH token.
 */
export type Phase = "idle" | "connecting" | "connected" | "reconnecting" | "ended" | "error";
export interface Tile { identity: string; role: string; name: string; isLocal: boolean; participant: any; publication: any | null; cameraOn: boolean; micOn: boolean }
export interface RoomError { message: string; code?: string; opensAt?: string; settings?: boolean }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const FINISHED = ["ENDED", "CANCELLED", "EXPIRED"];
const roleOf = (identity: string) => String(identity || "").split(":")[0];

async function askAndroidPermissions(role: Role): Promise<boolean> {
  if (Platform.OS !== "android") return true; // iOS asks when the camera/microphone is first used
  const wanted = role === "monitor" ? [PermissionsAndroid.PERMISSIONS.CAMERA] : [PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  const res = await PermissionsAndroid.requestMultiple(wanted);
  return wanted.every((p) => res[p] === PermissionsAndroid.RESULTS.GRANTED);
}

export function useLiveRoomNative(interviewId: string, role: Role) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<RoomError | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [endedReason, setEndedReason] = useState<string | null>(null);

  const roomRef = useRef<any>(null);
  const leaving = useRef(false);
  const consent = useRef(false);
  const recovering = useRef(false);
  const mounted = useRef(true);
  const recoverRef = useRef<() => void>(() => {});

  const report = useCallback((type: string, details?: object) => { liveApi.event(interviewId, role, type, details).catch(() => {}); }, [interviewId, role]);

  const snapshot = useCallback((room: any) => {
    const lk = getLiveKit(); if (!room || !lk || !mounted.current) return;
    const parts = [room.localParticipant, ...Array.from(room.remoteParticipants.values())] as any[];
    setTiles(parts.map((p) => {
      const cam = p.getTrackPublication(lk.Track.Source.Camera), mic = p.getTrackPublication(lk.Track.Source.Microphone);
      return { identity: p.identity, role: roleOf(p.identity), name: p.name || p.identity, isLocal: p === room.localParticipant, participant: p, publication: cam || null,
        cameraOn: !!cam && !cam.isMuted && !!cam.track, micOn: !!mic && !mic.isMuted };
    }));
    setMicOn(room.localParticipant.isMicrophoneEnabled); setCamOn(room.localParticipant.isCameraEnabled);
  }, []);

  const finish = useCallback((reason: string) => { setEndedReason(reason); setPhase("ended"); }, []);

  const connect = useCallback(async () => {
    const lk = getLiveKit(); if (!lk) throw new Error("This build cannot do video calls");
    if (!(await askAndroidPermissions(role))) { const e: any = new Error("Camera/microphone permission was denied."); e.media = { code: "permission_denied", message: "Camera" + (role === "monitor" ? "" : " and microphone") + " permission was denied. Open the app settings, allow access, then press Retry.", settings: true }; throw e; }
    if (role === "candidate") await lk.AudioSession.startAudioSession();
    const t = await liveApi.token(interviewId, role, consent.current);
    const room: any = new lk.Room({ adaptiveStream: true, dynacast: true, videoCaptureDefaults: { resolution: lk.VideoPresets.h540.resolution, facingMode: role === "monitor" ? "environment" : "user" } });
    const refresh = () => snapshot(room);
    [lk.RoomEvent.ParticipantConnected, lk.RoomEvent.ParticipantDisconnected, lk.RoomEvent.TrackSubscribed, lk.RoomEvent.TrackUnsubscribed, lk.RoomEvent.TrackPublished,
      lk.RoomEvent.TrackUnpublished, lk.RoomEvent.LocalTrackPublished, lk.RoomEvent.LocalTrackUnpublished, lk.RoomEvent.TrackMuted, lk.RoomEvent.TrackUnmuted].forEach((ev) => room.on(ev, refresh));
    room.on(lk.RoomEvent.Reconnecting, () => { if (mounted.current) { setPhase("reconnecting"); report("reconnecting"); } });
    room.on(lk.RoomEvent.Reconnected, () => { if (mounted.current) { setPhase("connected"); report("reconnected"); refresh(); } });
    room.on(lk.RoomEvent.Disconnected, (reason: unknown) => {
      if (leaving.current || !mounted.current) return;
      if (reason === lk.DisconnectReason.ROOM_DELETED) { finish("ended_by_host"); return; }
      recoverRef.current();
    });
    await room.connect(t.url, t.token);
    roomRef.current = room;
    try {
      if (role === "monitor") await room.localParticipant.setCameraEnabled(true, { facingMode: "environment" });
      else await room.localParticipant.enableCameraAndMicrophone();
    } catch (e: any) {
      leaving.current = true; await room.disconnect(); leaving.current = false; roomRef.current = null;
      const denied = /permission|denied|NotAllowed/i.test(String(e?.message) + String(e?.name));
      const media = { code: denied ? "permission_denied" : "media_error", message: denied ? "Camera or microphone permission was denied. Open the app settings, allow access, then press Retry." : (e?.message || "Could not start the camera."), settings: denied };
      report(media.code, { message: media.message });
      throw Object.assign(new Error(media.message), { media });
    }
    snapshot(room);
  }, [interviewId, role, snapshot, report, finish]);

  const fail = useCallback((e: any) => {
    const code = e instanceof ApiError ? e.code : e?.media?.code;
    if (e instanceof ApiError && e.code && FINISHED.includes(e.code)) { finish(e.code.toLowerCase()); return; }
    setError({ message: e?.media?.message || (e instanceof ApiError ? e.message : e?.message || "Could not join"), code, opensAt: e instanceof ApiError ? e.body?.opens_at : undefined, settings: e?.media?.settings });
    setPhase("error");
  }, [finish]);

  const join = useCallback(async (agreed: boolean) => {
    consent.current = agreed; leaving.current = false; setError(null); setPhase("connecting");
    try { await connect(); if (!mounted.current) return; setPhase("connected"); report("joined", { client: "mobile" }); if (role === "monitor") report("monitor_started"); }
    catch (e) { if (mounted.current) fail(e); }
  }, [connect, report, fail, role]);

  recoverRef.current = async () => {
    if (recovering.current) return; recovering.current = true; setPhase("reconnecting");
    try {
      for (let i = 0; i < 6 && mounted.current && !leaving.current; i++) {
        await sleep(Math.min(2000 * 2 ** i, 15000));
        if (!mounted.current || leaving.current) return;
        try {
          const iv = await liveApi.get(interviewId);
          if (["ended", "cancelled", "expired"].includes(iv.status)) { finish(iv.status); return; }
          await connect(); if (!mounted.current) return;
          setPhase("connected"); report("reconnected", { rejoin: true }); return;
        } catch (e) { if (e instanceof ApiError && e.code && FINISHED.includes(e.code)) { finish(e.code.toLowerCase()); return; } }
      }
      if (mounted.current && !leaving.current) { setError({ message: "Connection lost. Check your internet and press Retry.", code: "connection_lost" }); setPhase("error"); }
    } finally { recovering.current = false; }
  };

  const stopAudio = () => { const lk = getLiveKit(); if (lk && role === "candidate") lk.AudioSession.stopAudioSession().catch(() => {}); };
  const leave = useCallback(async () => {
    leaving.current = true; const room = roomRef.current; roomRef.current = null;
    if (room) { try { await room.disconnect(); } catch { /* already gone */ } }
    stopAudio();
    report("left"); if (role === "monitor") report("monitor_stopped");
    if (mounted.current) { setTiles([]); setMicOn(false); setCamOn(false); setPhase("idle"); }
  }, [report, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMic = useCallback(async () => { const r = roomRef.current; if (!r) return; try { await r.localParticipant.setMicrophoneEnabled(!r.localParticipant.isMicrophoneEnabled); snapshot(r); } catch { /* ignore */ } }, [snapshot]);
  const toggleCam = useCallback(async () => { const r = roomRef.current; if (!r) return; try { await r.localParticipant.setCameraEnabled(!r.localParticipant.isCameraEnabled, role === "monitor" ? { facingMode: "environment" } : undefined); snapshot(r); } catch { /* ignore */ } }, [snapshot, role]);
  const clearError = useCallback(() => { setError(null); setPhase((p) => (p === "error" ? "idle" : p)); }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; leaving.current = true; const r = roomRef.current; roomRef.current = null; if (r) r.disconnect().catch(() => {}); stopAudio(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { phase, error, tiles, micOn, camOn, endedReason, join, leave, toggleMic, toggleCam, clearError };
}

// A controllable stand-in for "livekit-client" (jsdom has no WebRTC). It behaves like the parts of the SDK the UI uses.
export const RoomEvent = Object.fromEntries(["ParticipantConnected", "ParticipantDisconnected", "TrackSubscribed", "TrackUnsubscribed", "TrackPublished", "TrackUnpublished",
  "LocalTrackPublished", "LocalTrackUnpublished", "TrackMuted", "TrackUnmuted", "Reconnecting", "Reconnected", "AudioPlaybackStatusChanged", "MediaDevicesError", "Disconnected"].map((k) => [k, k]));
export const Track = { Source: { Camera: "camera", Microphone: "microphone" } };
export const DisconnectReason = { ROOM_DELETED: "ROOM_DELETED", CLIENT_INITIATED: "CLIENT_INITIATED", SERVER_SHUTDOWN: "SERVER_SHUTDOWN" };
export const VideoPresets = { h540: { width: 960, height: 540 } };

export const rooms = [];            // every Room constructed by the app, newest last
export const behaviour = { mediaError: null, connectError: null }; // tests flip these

const track = (kind, label) => ({ kind, label, attached: new Set(), attach(el) { this.attached.add(el); return el; }, detach(el) { this.attached.delete(el); } });
export function makeParticipant(identity, name, { camera = true, mic = true, isLocal = false } = {}) {
  const pubs = {};
  if (camera) pubs.camera = { track: track("video", identity + "-cam"), isMuted: false };
  if (mic) pubs.microphone = { track: track("audio", identity + "-mic"), isMuted: false };
  return { identity, name, isLocal, pubs, getTrackPublication(src) { return this.pubs[src]; },
    get isMicrophoneEnabled() { return !!this.pubs.microphone && !this.pubs.microphone.isMuted; }, get isCameraEnabled() { return !!this.pubs.camera && !this.pubs.camera.isMuted; } };
}

export class Room {
  constructor(opts) {
    this.opts = opts; this.handlers = {}; this.remoteParticipants = new Map(); this.canPlaybackAudio = true; this.connected = false; this.name = "";
    this.calls = [];
    const lp = makeParticipant("", "", { camera: false, mic: false, isLocal: true });
    const room = this;
    lp.enableCameraAndMicrophone = async () => { room.calls.push(["enableCameraAndMicrophone"]); if (behaviour.mediaError) throw behaviour.mediaError;
      lp.pubs.camera = { track: track("video", "local-cam"), isMuted: false }; lp.pubs.microphone = { track: track("audio", "local-mic"), isMuted: false }; room.emit("LocalTrackPublished"); };
    lp.setMicrophoneEnabled = async (on) => { room.calls.push(["setMicrophoneEnabled", on]); if (!on && lp.pubs.microphone) lp.pubs.microphone.isMuted = true; else lp.pubs.microphone = { track: track("audio", "local-mic"), isMuted: false }; room.emit("TrackMuted"); };
    lp.setCameraEnabled = async (on, o) => { room.calls.push(["setCameraEnabled", on, o]); if (behaviour.mediaError) throw behaviour.mediaError;
      if (!on && lp.pubs.camera) lp.pubs.camera.isMuted = true; else lp.pubs.camera = { track: track("video", "local-cam"), isMuted: false }; room.emit("LocalTrackPublished"); };
    this.localParticipant = lp;
    rooms.push(this);
  }
  on(ev, fn) { (this.handlers[ev] ||= []).push(fn); return this; }
  emit(ev, ...a) { (this.handlers[ev] || []).forEach((f) => f(...a)); }
  async connect(url, token) {
    this.calls.push(["connect", url, token]);
    if (behaviour.connectError) throw behaviour.connectError;
    this.url = url; this.token = token; this.connected = true;
    const payload = JSON.parse(atob(token.split(".")[1])); this.localParticipant.identity = payload.sub; this.localParticipant.name = payload.name || payload.sub; this.name = payload.room;
  }
  async disconnect() { if (!this.connected) return; this.connected = false; this.emit("Disconnected", "CLIENT_INITIATED"); }
  async startAudio() { this.canPlaybackAudio = true; this.emit("AudioPlaybackStatusChanged"); }
  // ---- test controls
  addRemote(identity, name, o) { const p = makeParticipant(identity, name, o); this.remoteParticipants.set(identity, p); this.emit("ParticipantConnected", p); return p; }
  removeRemote(identity) { const p = this.remoteParticipants.get(identity); this.remoteParticipants.delete(identity); this.emit("ParticipantDisconnected", p); }
  drop(reason = "SERVER_SHUTDOWN") { this.connected = false; this.emit("Disconnected", reason); }
}
export const last = () => rooms[rooms.length - 1];

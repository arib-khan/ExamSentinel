/**
 * Everything that talks to LiveKit lives here (token signing + room control).
 * The API secret is read from the server environment only; it never reaches the browser or the mobile app.
 *
 *   LIVEKIT_URL         wss://<your-project>.livekit.cloud   (or ws://your-own-server:7880)
 *   LIVEKIT_API_KEY / LIVEKIT_API_SECRET
 */
const { AccessToken, RoomServiceClient, TrackSource } = require("livekit-server-sdk");
const { ServiceError } = require("./errors");

function config() {
  const url = process.env.LIVEKIT_URL, apiKey = process.env.LIVEKIT_API_KEY, apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) {
    throw new ServiceError(503, "The video service is not configured on the server (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)", "LIVEKIT_NOT_CONFIGURED");
  }
  return { url, apiKey, apiSecret };
}
const httpUrl = (u) => u.replace(/^wss:/, "https:").replace(/^ws:/, "http:");

let override = null; // tests inject a fake RoomServiceClient
const _setClient = (c) => { override = c; };
const client = () => { if (override) return override; const c = config(); return new RoomServiceClient(httpUrl(c.url), c.apiKey, c.apiSecret); };

/**
 * What each device may do inside the room (enforced by the LiveKit server, not by our UI):
 *  host      HR interviewer: camera + microphone, sees/hears everyone
 *  candidate the interview device: camera + microphone, sees/hears the HR
 *  monitor   the workspace phone: CAMERA ONLY (no microphone), and it cannot receive anyone else's media
 */
const GRANTS = {
  host:      { canPublish: true, canSubscribe: true,  canPublishData: true,  canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE] },
  candidate: { canPublish: true, canSubscribe: true,  canPublishData: true,  canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE] },
  monitor:   { canPublish: true, canSubscribe: false, canPublishData: false, canPublishSources: [TrackSource.CAMERA] },
};

async function createAccessToken({ role, identity, name, room, metadata, ttlSeconds }) {
  const { apiKey, apiSecret, url } = config();
  const at = new AccessToken(apiKey, apiSecret, { identity, name, ttl: ttlSeconds, metadata: JSON.stringify(metadata || {}) });
  at.addGrant({ roomJoin: true, room, ...GRANTS[role] });
  return { token: await at.toJwt(), url };
}

const wrap = (e) => {
  if (e instanceof ServiceError) return e;
  return new ServiceError(502, "Cannot reach the video service", "LIVEKIT_UNAVAILABLE", { detail: String(e && e.message || e).slice(0, 200) });
};
const notFound = (e) => e && (e.code === "not_found" || e.status === 404 || /not found|does not exist/i.test(String(e.message)));

async function ensureRoom(name, metadata) {
  try {
    await client().createRoom({ name, emptyTimeout: 15 * 60, departureTimeout: 60, maxParticipants: 6, metadata: JSON.stringify(metadata || {}) });
  } catch (e) { throw wrap(e); }
}

const sourceName = (s) => (s === TrackSource.CAMERA || s === "camera" ? "camera" : s === TrackSource.MICROPHONE || s === "microphone" ? "microphone" : "other");

/** Plain-JSON participants of a room: [{ identity, role, name, connected, camera, microphone }] */
async function listParticipants(room) {
  let list;
  try { list = await client().listParticipants(room); }
  catch (e) { if (notFound(e)) return []; throw wrap(e); }
  return list.map((p) => {
    const tracks = (p.tracks || []).map((t) => ({ source: sourceName(t.source), muted: !!t.muted }));
    return {
      identity: p.identity, role: String(p.identity).split(":")[0], name: p.name,
      connected: true,
      camera: tracks.some((t) => t.source === "camera" && !t.muted),
      microphone: tracks.some((t) => t.source === "microphone" && !t.muted),
    };
  });
}

async function deleteRoom(room) {
  try { await client().deleteRoom(room); }
  catch (e) { if (notFound(e)) return false; throw wrap(e); }
  return true;
}
async function removeParticipant(room, identity) {
  try { await client().removeParticipant(room, identity); }
  catch (e) { if (notFound(e)) return false; throw wrap(e); }
  return true;
}

module.exports = { createAccessToken, ensureRoom, listParticipants, deleteRoom, removeParticipant, GRANTS, _setClient };

/**
 * /api/live-interviews/*   (mounted from routes/ApiControler.js, below the shared JWT middleware)
 *
 *   HR      : POST /  GET /  GET /candidate-pool  POST /candidates  GET|PUT /:id  POST /:id/cancel|end|invite  GET /:id/timeline
 *   Candidate: GET /mine  GET /:id
 *   Both    : POST /:id/token   GET /:id/status   POST /:id/events
 * Every rule is enforced here on the server; the apps only display what the server allows.
 */
const express = require("express");
const router = express.Router();
const { requireUser, requirePermission } = require("../../middleware/liveInterviewAuth");
const svc = require("../../services/liveInterview/liveInterviewService");
const { parseId } = require("../../services/liveInterview/validators");
const { ok, ah, actorOf } = require("./_util");

router.use(requireUser);
const P = (m, a) => requirePermission(m, a);

/* static paths first */
router.get("/mine", P("live_interview_portal", "read"), ah(async (req, res) => ok(res, await svc.mine(await actorOf(req)))));
router.get("/candidate-pool", P("live_interviews", "read"), ah(async (req, res) => ok(res, await svc.candidatePool(await actorOf(req), req.query.search))));
router.post("/candidates", P("live_interviews", "create"), ah(async (req, res) => ok(res, await svc.createCandidate(req.body || {}, await actorOf(req)), "Candidate ready", 201)));

router.get("/", P("live_interviews", "read"), ah(async (req, res) => ok(res, await svc.list(await actorOf(req), { status: req.query.status }))));
router.post("/", P("live_interviews", "create"), ah(async (req, res) => ok(res, await svc.create(req.body || {}, await actorOf(req)), "Interview scheduled", 201)));

router.get("/:id", ah(async (req, res) => ok(res, await svc.get(parseId(req.params.id), await actorOf(req)))));
router.put("/:id", P("live_interviews", "update"), ah(async (req, res) => ok(res, await svc.update(parseId(req.params.id), req.body || {}, await actorOf(req)), "Interview updated")));
router.post("/:id/cancel", P("live_interviews", "update"), ah(async (req, res) => ok(res, await svc.cancel(parseId(req.params.id), await actorOf(req)), "Interview cancelled")));
router.post("/:id/end", P("live_interviews", "execute"), ah(async (req, res) => ok(res, await svc.end(parseId(req.params.id), await actorOf(req)), "Interview ended")));
router.post("/:id/invite", P("live_interviews", "update"), ah(async (req, res) => ok(res, await svc.sendInvite(parseId(req.params.id), await actorOf(req), req.body && req.body.note))));
router.get("/:id/timeline", P("live_interviews", "read"), ah(async (req, res) => ok(res, await svc.timeline(parseId(req.params.id), await actorOf(req)))));

/* joining: the server decides who gets a token and what that token allows */
router.post("/:id/token", ah(async (req, res) => {
  const b = req.body || {};
  const role = String(b.role || "");
  // the permission needed depends on the role being requested
  const need = role === "host" ? ["live_interviews", "execute"] : ["live_interview_portal", "execute"];
  const { can } = require("../../middleware/liveInterviewAuth");
  if (!(await can(req, need[0], need[1]))) return res.status(403).json({ status: false, msg: `Forbidden: ${need.join(".")} permission required` });
  ok(res, await svc.issueToken(parseId(req.params.id), await actorOf(req), { role, consent: b.consent === true, client: b.client }), "Token issued");
}));
router.get("/:id/status", ah(async (req, res) => ok(res, await svc.liveStatus(parseId(req.params.id), await actorOf(req)))));
router.post("/:id/events", ah(async (req, res) => ok(res, await svc.recordEvent(parseId(req.params.id), await actorOf(req), req.body || {}))));

module.exports = router;

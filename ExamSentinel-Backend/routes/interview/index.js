/**
 * Interview module entry. Mounted from routes/ApiControler.js (AFTER the shared JWT middleware):
 *
 *   const interview = require("./interview");
 *   router.use("/interviews", interview.interviews);
 *   router.use("/interview-attempts", interview.attempts);
 *
 * Each router applies its own requireUser + permission checks, so nothing here can affect the Exam routes.
 */
const { startExpirySweeper } = require("../../services/interview/attemptService");
startExpirySweeper();

module.exports = {
  interviews: require("./interviewRoutes"),
  attempts: require("./attemptRoutes"),
};

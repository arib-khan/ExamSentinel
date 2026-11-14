/**
 * Server-side interview timing. The browser/mobile countdown is cosmetic; THIS decides validity.
 */
const GRACE_MS = 5000; // network latency allowance when saving the last answers

const computeExpiry = (start, durationMinutes, scheduledEnd) => {
  let e = new Date(start.getTime() + durationMinutes * 60000);
  if (scheduledEnd && new Date(scheduledEnd).getTime() < e.getTime()) e = new Date(scheduledEnd);
  return e;
};
const remainingSeconds = (attempt, at = new Date()) =>
  Math.max(0, Math.floor((new Date(attempt.expires_at).getTime() - at.getTime()) / 1000));
const isExpired = (attempt, at = new Date(), graceMs = 0) =>
  at.getTime() > new Date(attempt.expires_at).getTime() + graceMs;

module.exports = { GRACE_MS, computeExpiry, remainingSeconds, isExpired };

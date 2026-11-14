/**
 * Interview invitations.
 *  - The candidate ALWAYS sees the interview in the app's Interview section (that is the in-app invitation).
 *  - A shareable link + meeting code is always available.
 *  - E-mail is sent only when SMTP is configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) and nodemailer is installed.
 */
const FRONTEND_URL = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const joinLink = (id) => `${FRONTEND_URL()}/candidate/live-interviews/${id}`;

function smtpConfigured() { return !!(process.env.SMTP_HOST && process.env.SMTP_FROM); }

const fmt = (d) => new Date(d).toUTCString().replace("GMT", "UTC");

function buildMessage(iv, hostName, note) {
  const link = joinLink(iv.id);
  const text = [
    `Hello ${iv.candidate_name},`, "",
    `You are invited to a live video interview${hostName ? " with " + hostName : ""}.`, "",
    `Title:    ${iv.title}`, `When:     ${fmt(iv.scheduled_start)} (${iv.duration_minutes} minutes)`, `Meeting code: ${iv.meeting_code}`, "",
    "How to join:",
    "1. Log in to ExamSentinel with your candidate account and open the Interview section.",
    `2. Or open this link: ${link}`,
    "3. Use a laptop (or phone) for the video call with your face visible.",
    "4. Place a SECOND phone behind or beside your computer and open the ExamSentinel app on it, to show your workspace.",
    "   The interview needs your camera and microphone permission. Your workspace video is visible to the interviewer.",
    note ? `\nNote from the interviewer:\n${note}` : "", "", "Good luck!",
  ].join("\n");
  return { subject: `Interview invitation: ${iv.title}`, text, link };
}

async function sendInvite(iv, hostName, note) {
  const msg = buildMessage(iv, hostName, note);
  if (!iv.candidate_email) return { sent: false, reason: "The candidate has no email address", link: msg.link, meeting_code: iv.meeting_code };
  if (!smtpConfigured()) return { sent: false, reason: "SMTP is not configured on the server; share the link instead", link: msg.link, meeting_code: iv.meeting_code };
  let nodemailer;
  try { nodemailer = require("nodemailer"); } catch { return { sent: false, reason: "nodemailer is not installed on the server (npm install nodemailer)", link: msg.link, meeting_code: iv.meeting_code }; }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: process.env.SMTP_FROM, to: iv.candidate_email, subject: msg.subject, text: msg.text });
  return { sent: true, link: msg.link, meeting_code: iv.meeting_code };
}

module.exports = { joinLink, sendInvite, buildMessage, smtpConfigured };

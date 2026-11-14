export const fmtDateTime = (v) => (v ? new Date(v).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");
export const fmtTime = (v) => (v ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

export const fmtClock = (secs) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
};

// <input type="datetime-local"> <-> ISO
export const toLocalInput = (v) => {
  if (!v) return "";
  const d = new Date(v), p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

const GREEN = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
const AMBER = "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
const BLUE = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
const GREY = "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200";
const RED = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
export const STATE_STYLE = { live: RED, available: GREEN, upcoming: AMBER, scheduled: BLUE, ended: GREY, cancelled: GREY, expired: GREY };
export const STATE_LABEL = { live: "Live now", available: "Ready to join", upcoming: "Upcoming", scheduled: "Scheduled", ended: "Ended", cancelled: "Cancelled", expired: "Expired" };

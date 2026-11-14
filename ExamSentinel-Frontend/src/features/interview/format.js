export const fmtDate = (v) => (v ? new Date(v).toLocaleString() : "—");

export const fmtDuration = (secs) => {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

// <input type="datetime-local"> <-> ISO
export const toLocalInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

export const TYPE_LABELS = { technical: "Technical", hr: "HR", general: "General" };
export const typeLabel = (t) => TYPE_LABELS[t] || (t ? t.charAt(0).toUpperCase() + t.slice(1) : "—");

const GREEN = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
const AMBER = "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
const BLUE = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
const GREY = "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200";
const RED = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
export const INTERVIEW_STATUS_STYLE = { draft: AMBER, published: GREEN, archived: GREY };
export const CATEGORY_STYLE = { available: GREEN, active: BLUE, upcoming: AMBER, completed: GREY, missed: RED };
export const ATTEMPT_STATUS_LABEL = {
  in_progress: "In progress", submitted: "Submitted", auto_submitted: "Auto-submitted", expired: "Expired",
};
export const EVAL_STATUS_LABEL = {
  not_submitted: "Not submitted", pending_manual_review: "Pending manual review",
  auto_evaluated: "Auto-evaluated", evaluated: "Evaluated",
};

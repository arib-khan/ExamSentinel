export const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString() : "—");
export const fmtDuration = (s?: number | null) => (s == null ? "—" : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);
export const typeLabel = (t: string) => ({ technical: "Technical", hr: "HR", general: "General" } as Record<string, string>)[t] ?? t.charAt(0).toUpperCase() + t.slice(1);

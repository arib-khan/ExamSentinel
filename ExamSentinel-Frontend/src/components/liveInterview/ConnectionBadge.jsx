import { Loader2, Wifi, WifiOff } from "lucide-react";

const STYLES = {
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  bad: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  idle: "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
};
export const Pill = ({ tone = "idle", children, testId }) => (
  <span data-testid={testId} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[tone]}`}>{children}</span>
);

/** Connection of THIS device to the video room. */
export function PhaseBadge({ phase, online }) {
  if (!online) return <Pill tone="bad"><WifiOff className="h-3 w-3" /> You are offline</Pill>;
  if (phase === "connected") return <Pill tone="ok"><Wifi className="h-3 w-3" /> Connected</Pill>;
  if (phase === "connecting") return <Pill tone="warn"><Loader2 className="h-3 w-3 animate-spin" /> Connecting…</Pill>;
  if (phase === "reconnecting") return <Pill tone="warn"><Loader2 className="h-3 w-3 animate-spin" /> Reconnecting…</Pill>;
  if (phase === "error") return <Pill tone="bad">Connection problem</Pill>;
  return <Pill>Not connected</Pill>;
}

/** Another participant (candidate / workspace camera) as seen from the room or from the server status. */
export function PresenceBadge({ connected, required = true, label }) {
  if (!required) return <Pill>{label}: not required</Pill>;
  return connected ? <Pill tone="ok" testId={`presence-${label}`}>{label}: connected</Pill> : <Pill tone="bad" testId={`presence-${label}`}>{label}: not connected</Pill>;
}

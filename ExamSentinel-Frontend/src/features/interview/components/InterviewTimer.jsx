// Interview module :: visual countdown.
// The SERVER decides validity (attempt.ia_deadline); this component is
// presentation only - it re-syncs with the server value on every poll.
import { useEffect, useState } from "react";
import { Timer, AlertTriangle } from "lucide-react";

export default function InterviewTimer({ remainingSeconds, onExpire }) {
  const [seconds, setSeconds] = useState(remainingSeconds);

  useEffect(() => {
    setSeconds(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => {
      setSeconds((s) => {
        if (s <= 1) {
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [seconds, onExpire]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const danger = seconds <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-semibold tabular-nums ${
        danger ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-muted"
      }`}
      data-testid="interview-timer"
    >
      {danger ? (
        <AlertTriangle className="w-5 h-5" />
      ) : (
        <Timer className="w-5 h-5" />
      )}
      {h > 0 ? `${String(h).padStart(2, "0")}:` : ""}
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

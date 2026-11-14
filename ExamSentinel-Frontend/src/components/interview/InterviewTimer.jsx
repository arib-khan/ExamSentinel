import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";

/**
 * Visual countdown ONLY. `remainingSeconds` comes from the server, so the deadline is computed from it
 * (not from the browser's wall clock). The server rejects late answers regardless of what this shows.
 * Pass a new `syncKey` whenever fresh remaining time is fetched to re-sync the display.
 */
export default function InterviewTimer({ remainingSeconds, syncKey, onExpire }) {
  const deadline = useRef(performance.now() + remainingSeconds * 1000);
  const [left, setLeft] = useState(remainingSeconds);
  const fired = useRef(false);

  useEffect(() => {
    deadline.current = performance.now() + remainingSeconds * 1000;
    fired.current = false;
    setLeft(remainingSeconds);
  }, [remainingSeconds, syncKey]);

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000));
      setLeft(s);
      if (s === 0 && !fired.current) { fired.current = true; onExpire && onExpire(); }
    }, 500);
    return () => clearInterval(id);
  }, [onExpire]);

  const m = Math.floor(left / 60), s = left % 60;
  const tone = left <= 60 ? "text-red-600 border-red-300 bg-red-50 dark:bg-red-950/40 dark:text-red-300" : left <= 300 ? "text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300" : "text-foreground";
  return (
    <div className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-lg font-semibold ${tone}`} aria-live="off">
      <Timer className="h-4 w-4" /> {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

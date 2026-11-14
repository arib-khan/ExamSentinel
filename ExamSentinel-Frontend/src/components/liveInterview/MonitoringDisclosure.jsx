import { Eye, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

/** Plain-language disclosure the candidate must accept before any camera or microphone is switched on. */
export default function MonitoringDisclosure({ mode, checked, onChange }) {
  const monitor = mode === "monitor";
  return (
    <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex items-center gap-2 font-semibold"><Eye className="h-4 w-4" /> {monitor ? "Your workspace video will be shown to the interviewer" : "Your video and audio will be shared live"}</div>
      <ul className="list-disc space-y-1 pl-5">
        {monitor ? (
          <>
            <li>This phone sends its <b>rear camera</b> (your desk and workspace) to the interviewer in real time. No microphone is used.</li>
            <li>Only the interviewer for this interview can see it. Nothing is recorded by ExamSentinel.</li>
            <li>A red <b>MONITORING ACTIVE</b> banner stays on screen while it is sending, and you can press <b>Stop monitoring</b> at any time.</li>
          </>
        ) : (
          <>
            <li>Your <b>camera and microphone</b> are shared live with the interviewer only.</li>
            <li>The interview is <b>not recorded</b> by ExamSentinel.</li>
            <li>Your browser will ask for camera and microphone permission. You can leave the call at any time.</li>
          </>
        )}
      </ul>
      <label className="flex cursor-pointer items-start gap-2 pt-1 font-medium">
        <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} aria-label="I understand and agree" className="mt-0.5" />
        <span><ShieldCheck className="mr-1 inline h-4 w-4" />I understand and agree to share {monitor ? "my workspace camera" : "my camera and microphone"} for this interview.</span>
      </label>
    </div>
  );
}

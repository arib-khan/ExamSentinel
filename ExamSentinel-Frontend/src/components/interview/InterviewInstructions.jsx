import { useState } from "react";
import { AlertTriangle, Clock, ListChecks, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Interview details + instructions + the "I understand" gate before starting. */
export default function InterviewInstructions({ interview, onStart, starting, blockedReason }) {
  const [agreed, setAgreed] = useState(false);
  const resume = !!interview.open_attempt_id;
  return (
    <Card>
      <CardHeader><CardTitle>{interview.title}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {interview.description && <p className="text-sm text-muted-foreground">{interview.description}</p>}
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border p-3"><Clock className="h-4 w-4" /> {interview.duration_minutes} minutes</div>
          <div className="flex items-center gap-2 rounded-md border p-3"><ListChecks className="h-4 w-4" /> {interview.question_count} questions · {interview.total_marks} marks</div>
          <div className="flex items-center gap-2 rounded-md border p-3"><ShieldCheck className="h-4 w-4" /> {interview.proctoring_enabled ? "Proctored" : "Not proctored"}</div>
        </div>

        <div>
          <h3 className="mb-1 font-semibold">Instructions</h3>
          <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">{interview.instructions || "No specific instructions. Answer every question to the best of your ability."}</div>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>The timer is controlled by the server. Closing the page does <b>not</b> pause it.</li>
          <li>Your answers are saved automatically while you work.</li>
          <li>When time runs out your interview is submitted automatically.</li>
          {interview.proctoring_enabled ? <li>Switching tabs or leaving full screen is recorded and shown to the evaluator.</li> : null}
        </ul>

        {blockedReason ? (
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" /> {blockedReason}
          </div>
        ) : (
          <div className="space-y-3">
            {!resume && (
              <div className="flex items-center gap-2">
                <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
                <Label htmlFor="agree" className="text-sm">I have read the instructions and I am ready to begin.</Label>
              </div>
            )}
            <Button disabled={starting || (!resume && !agreed)} onClick={onStart}>
              {starting ? "Starting…" : resume ? "Resume interview" : "Start interview"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

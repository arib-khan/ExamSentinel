// Interview module :: instructions panel (candidate pre-start screen)
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ListChecks, Clock, FileQuestion, ShieldAlert } from "lucide-react";

export default function InterviewInstructions({ interview, onStart, loading }) {
  const [accepted, setAccepted] = useState(false);
  const blocked = interview.iv_status !== "PUBLISHED";

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListChecks className="w-5 h-5" /> Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <Clock className="w-4 h-4" />
            Duration: <strong>{interview.iv_duration_minutes} minutes</strong>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <FileQuestion className="w-4 h-4" />
            Questions: <strong>{interview.question_count}</strong>
          </div>
        </div>

        {interview.iv_description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {interview.iv_description}
          </p>
        )}

        <div className="rounded-lg border p-4 text-sm whitespace-pre-line leading-relaxed">
          {interview.iv_instructions ||
            "1. Answer all questions honestly.\n2. The timer cannot be paused once the interview starts.\n3. Your answers are saved automatically.\n4. Click Submit when you are done."}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            The timer is controlled by the server - closing this tab does not
            pause the interview. When time expires the interview is
            auto-submitted. Tab switches and idle time are logged for review.
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            disabled={blocked}
          />
          I have read and understood the instructions
        </label>

        <Button
          className="w-full"
          size="lg"
          disabled={!accepted || loading || blocked}
          onClick={onStart}
        >
          {loading ? "Starting..." : "Start Interview"}
        </Button>

        {blocked && (
          <p className="text-center text-sm text-muted-foreground">
            This interview is not currently open (status: {interview.iv_status}).
          </p>
        )}
      </CardContent>
    </Card>
  );
}

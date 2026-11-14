import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtClock, fmtDateTime } from "../format";

const TEXT = {
  ended_by_host: "The interviewer ended the interview.", ended: "This interview has ended.",
  cancelled: "This interview was cancelled.", expired: "The time for this interview has passed.",
  left: "You left the interview.",
};
export default function EndedCard({ reason, interview, onBack, backLabel = "Back to interviews", seconds }) {
  return (
    <Card className="mx-auto max-w-xl" data-testid="ended-card">
      <CardContent className="space-y-4 pt-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="text-xl font-semibold">Interview ended</h2>
        <p className="text-muted-foreground">{TEXT[reason] || TEXT.ended}</p>
        {interview && (
          <div className="mx-auto max-w-sm space-y-1 rounded-md bg-muted/40 p-3 text-left text-sm">
            <div><b>{interview.title}</b></div>
            <div>Started: {fmtDateTime(interview.started_at)}</div>
            <div>Ended: {fmtDateTime(interview.ended_at)}</div>
            {seconds != null && <div>Duration: {fmtClock(seconds)}</div>}
          </div>
        )}
        <Button onClick={onBack}>{backLabel}</Button>
      </CardContent>
    </Card>
  );
}

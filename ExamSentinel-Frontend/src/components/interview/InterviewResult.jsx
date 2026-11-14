import { CheckCircle2, Clock, Hourglass, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATTEMPT_STATUS_LABEL, fmtDate, fmtDuration } from "@/features/interview/format";

/** What the candidate is allowed to see: never a score that is unfinished or not released. */
export default function InterviewResult({ result }) {
  const Icon = result.result_visible ? (result.passed === false ? XCircle : CheckCircle2) : result.evaluation_status === "pending_manual_review" ? Hourglass : Clock;
  return (
    <Card>
      <CardHeader><CardTitle>{result.interview_title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${result.passed === false ? "text-red-600" : result.result_visible ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <div className="font-semibold">{ATTEMPT_STATUS_LABEL[result.status] || result.status}</div>
            <div className="text-sm text-muted-foreground">Submitted {fmtDate(result.submitted_at)} · Time taken {fmtDuration(result.duration_seconds)}</div>
          </div>
        </div>

        {result.result_visible ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Score" value={`${result.score} / ${result.total_marks}`} />
              <Stat label="Percentage" value={result.percentage == null ? "—" : `${result.percentage}%`} />
              <Stat label="Outcome" value={result.passed == null ? "—" : result.passed ? "Passed" : "Not passed"} />
            </div>
            {result.comments && <div className="rounded-md bg-muted/40 p-3 text-sm"><b>Evaluator comments:</b> {result.comments}</div>}
          </div>
        ) : (
          <p className="rounded-md bg-muted/40 p-3 text-sm">{result.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
const Stat = ({ label, value }) => (
  <div className="rounded-md border p-3"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="text-xl font-semibold">{value}</div></div>
);

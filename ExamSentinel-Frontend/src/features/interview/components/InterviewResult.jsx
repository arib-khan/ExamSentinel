// Interview module :: result view (candidate, shared shape with staff)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import InterviewStatusBadge from "./InterviewStatusBadge";
import { Hourglass, CheckCircle2 } from "lucide-react";

export default function InterviewResult({ result }) {
  const { attempt, questions, evaluation, pending_manual_review } = result;
  const pct = Number(attempt.ia_percentage || 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            <span>{attempt.iv_title} — Result</span>
            <InterviewStatusBadge status={attempt.ia_status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold">
                {attempt.ia_score ?? "—"}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {attempt.iv_total_marks}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Score</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold">{pct}%</div>
              <div className="text-xs text-muted-foreground mt-1">Percentage</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold">
                {attempt.ia_duration_seconds
                  ? Math.round(attempt.ia_duration_seconds / 60)
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Minutes taken</div>
            </div>
          </div>

          <Progress value={pct} />

          {pending_manual_review ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300">
              <Hourglass className="w-4 h-4" />
              Subjective/technical answers are <strong>Pending Manual Review</strong> —
              your final score may change after evaluation.
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 p-3 text-sm text-green-800 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4" />
              Evaluation complete. {evaluation?.ie_remarks ? `Remarks: ${evaluation.ie_remarks}` : ""}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(questions || []).map((q, i) => (
            <div key={q.iq_id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">
                  <span className="text-muted-foreground mr-1.5">Q{i + 1}.</span>
                  {q.iq_question}
                </p>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="outline">
                    {q.ians_marks_awarded ?? "—"}/{q.iq_marks}
                  </Badge>
                  {q.ians_is_auto_evaluated ? (
                    <Badge variant="secondary">Auto</Badge>
                  ) : (
                    <Badge variant="secondary">Manual</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {q.ians_selected_option
                  ? `Option ${q.ians_selected_option}${q.iq_options ? ` — ${q.iq_options[q.ians_selected_option] ?? ""}` : ""}`
                  : q.ians_answer_text || "No answer given"}
              </p>
              {q.ians_evaluator_comment && (
                <p className="text-sm italic text-muted-foreground border-l-2 pl-3">
                  Evaluator: {q.ians_evaluator_comment}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

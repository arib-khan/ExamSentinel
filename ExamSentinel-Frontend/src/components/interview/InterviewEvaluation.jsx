import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVAL_STATUS_LABEL, fmtDate } from "@/features/interview/format";

/**
 * Evaluator view: question, expected answer, candidate answer, marks + comment per answer, overall comments.
 * MCQ answers are auto-graded and read-only. Manual answers must be graded before finalizing.
 */
export default function InterviewEvaluation({ detail, onSave, onFinalize, busy }) {
  const finalized = detail.evaluation?.status === "finalized";
  const [grades, setGrades] = useState(() => {
    const g = {};
    for (const it of detail.items) if (it.answer && !it.auto_gradable) g[it.question.question_id] = { marks: it.answer.marks_awarded ?? "", comment: it.answer.evaluator_comment ?? "" };
    return g;
  });
  const [comments, setComments] = useState(detail.evaluation?.comments || "");

  const pending = useMemo(
    () => detail.items.filter((it) => it.needs_review && (grades[it.question.question_id]?.marks === "" || grades[it.question.question_id]?.marks == null)).length,
    [detail.items, grades]
  );
  const payload = () => ({
    grades: Object.entries(grades).filter(([, g]) => g.marks !== "" && g.marks != null)
      .map(([qid, g]) => ({ question_id: Number(qid), marks: Number(g.marks), comment: g.comment || null })),
    comments,
  });
  const set = (qid, patch) => setGrades((p) => ({ ...p, [qid]: { ...p[qid], ...patch } }));

  const attempt = detail.attempt;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex flex-wrap items-center gap-2">
          {detail.interview.title} <span className="text-base font-normal text-muted-foreground">— {detail.candidate.user_name || detail.candidate.user_id}</span>
        </CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>Status: <b className="text-foreground">{attempt.status}</b></span>
          <span>Evaluation: <b className="text-foreground">{EVAL_STATUS_LABEL[attempt.evaluation_status]}</b></span>
          <span>Score: <b className="text-foreground">{attempt.score ?? "—"} / {attempt.total_marks ?? "—"}</b></span>
          <span>Percentage: <b className="text-foreground">{attempt.percentage == null ? "pending" : attempt.percentage + "%"}</b></span>
        </CardContent>
      </Card>

      {detail.items.map((it, i) => {
        const q = it.question, a = it.answer, g = grades[q.question_id];
        return (
          <Card key={q.question_id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <b>Q{i + 1}.</b> <Badge variant="outline" className="capitalize">{q.question_type.replace("_", " ")}</Badge>
                <span className="text-muted-foreground">{q.marks} marks</span>
                {it.auto_gradable && <Badge variant="secondary">auto-graded</Badge>}
              </div>
              <p className="whitespace-pre-wrap">{q.question}</p>

              {q.expected_answer && <div className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><b>Expected:</b> {q.expected_answer}</div>}
              {it.auto_gradable && <div className="text-sm text-muted-foreground">Correct option: <b>{q.correct_option}</b></div>}

              <div className="rounded-md border p-3 text-sm">
                <div className="mb-1 text-xs uppercase text-muted-foreground">Candidate answer</div>
                {!a || (!a.answer_text && !a.selected_option) ? <i className="text-muted-foreground">Not answered</i>
                  : it.auto_gradable ? <span>Selected <b>{a.selected_option}</b> → {a.marks_awarded} / {q.marks}</span>
                  : <pre className={`whitespace-pre-wrap font-sans ${q.question_type === "coding" ? "font-mono text-xs" : ""}`}>{a.answer_text}</pre>}
              </div>

              {a && !it.auto_gradable && (
                <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                  <div><label className="text-xs text-muted-foreground">Marks (0–{q.marks})</label>
                    <Input type="number" min={0} max={q.marks} step="0.5" disabled={finalized || busy} value={g?.marks ?? ""}
                      onChange={(e) => set(q.question_id, { marks: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Comment</label>
                    <Input disabled={finalized || busy} value={g?.comment ?? ""} onChange={(e) => set(q.question_id, { comment: e.target.value })} /></div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="space-y-3 pt-6">
          <label className="text-sm font-medium">Overall comments</label>
          <Textarea rows={3} value={comments} disabled={finalized || busy} onChange={(e) => setComments(e.target.value)} />
          {finalized ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Finalized {fmtDate(detail.evaluation.finalized_at)}</div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" disabled={busy} onClick={() => onSave(payload())}>Save draft</Button>
              <Button disabled={busy || pending > 0} onClick={() => onFinalize(payload())}>Finalize evaluation</Button>
              {pending > 0 && <span className="flex items-center gap-1 text-sm text-amber-700"><AlertTriangle className="h-4 w-4" /> {pending} answer(s) still need marks</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {detail.events?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Security events ({detail.events.length})</CardTitle></CardHeader>
          <CardContent className="max-h-56 space-y-1 overflow-auto text-sm">
            {detail.events.map((e) => (
              <div key={e.event_id} className="flex gap-3">
                <span className="w-44 text-muted-foreground">{fmtDate(e.occurred_at)}</span>
                <span className={e.severity === "critical" ? "font-semibold text-red-600" : e.severity === "warning" ? "text-amber-700" : ""}>{e.event_type.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">{e.source}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

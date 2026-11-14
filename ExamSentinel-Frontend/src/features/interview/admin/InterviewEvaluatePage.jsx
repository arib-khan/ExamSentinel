// Interview module :: staff evaluation page.
// Shows candidate answers next to expected answers; the evaluator awards
// marks (never above the question max), adds comments and finalizes.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/reusableComponets/Loader";
import InterviewStatusBadge from "../components/InterviewStatusBadge";
import {
  getAttemptEvaluation,
  saveAttemptEvaluation,
} from "@/services/InterviewServices/interviewService";

export default function InterviewEvaluatePage() {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState({});
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAttemptEvaluation(attemptId);
        if (res.data.status) {
          setData(res.data.data);
          setRemarks(res.data.data.evaluation?.ie_remarks || "");
        } else {
          toast.error(res.data.msg || "Could not load evaluation");
          navigate(`/admin/interviews/${id}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load evaluation");
        navigate(`/admin/interviews/${id}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId, id, navigate]);

  const setDecision = (iansId, patch) =>
    setDecisions((prev) => ({ ...prev, [iansId]: { ...prev[iansId], ...patch } }));

  const handleSave = async (finalize) => {
    setSaving(true);
    try {
      const payload = {
        decisions: Object.entries(decisions).map(([ians_id, d]) => ({
          ians_id: Number(ians_id),
          marks: d.marks === "" || d.marks === undefined ? null : Number(d.marks),
          comment: d.comment,
        })),
        remarks,
        finalize,
      };
      const res = await saveAttemptEvaluation(attemptId, payload);
      if (res.data.status) {
        toast.success(
          `${res.data.msg} — ${res.data.data.marks_awarded}/${res.data.data.total_marks} (${res.data.data.percentage}%)`
        );
        navigate(`/admin/interviews/${id}`);
      } else {
        toast.error(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return <div className="flex justify-center py-16"><Loader /></div>;
  }

  const { attempt, answers, evaluation, events } = data;
  const finalized = evaluation?.ie_status === "COMPLETED";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/interviews/${id}`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Interview
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{attempt.iv_title}</h1>
          <p className="text-sm text-muted-foreground">
            Evaluation · Attempt #{attempt.ia_id} · started{" "}
            {attempt.ia_start_time ? new Date(attempt.ia_start_time).toLocaleString() : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InterviewStatusBadge status={attempt.ia_status} />
          <InterviewStatusBadge status={evaluation?.ie_status} />
        </div>
      </div>

      {finalized && (
        <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-300">
          Evaluation finalized — {attempt.ia_score}/{attempt.iv_total_marks} ({attempt.ia_percentage}%).
          Finalized evaluations are read-only.
        </div>
      )}

      <div className="space-y-4">
        {answers.map((a, i) => {
          const d = decisions[a.ians_id] || { marks: "", comment: "" };
          const max = Number(a.iq_marks || 0);
          return (
            <Card key={a.ians_id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex flex-wrap items-start justify-between gap-2">
                  <span>
                    Q{i + 1}. {a.iq_question}
                  </span>
                  <span className="flex gap-1.5 shrink-0">
                    <Badge variant="secondary">{a.iq_question_type}</Badge>
                    <Badge variant="outline">{max} marks</Badge>
                    {a.ians_is_auto_evaluated ? (
                      <Badge>Auto-scored</Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Candidate answer
                    </div>
                    {a.iq_question_type === "MCQ" ? (
                      <p>
                        <strong>{a.ians_selected_option || "—"}</strong>
                        {a.ians_selected_option && a.iq_options?.[a.ians_selected_option]
                          ? ` — ${a.iq_options[a.ians_selected_option]}`
                          : ""}
                      </p>
                    ) : (
                      <p className="whitespace-pre-line">
                        {a.ians_answer_text || <em>No answer given</em>}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Expected answer
                    </div>
                    <p className="whitespace-pre-line">
                      {a.iq_expected_answer || <em>Not provided</em>}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-[110px_1fr] gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`marks-${a.ians_id}`}>Marks (0–{max})</Label>
                    <Input
                      id={`marks-${a.ians_id}`}
                      type="number"
                      min="0"
                      max={max}
                      disabled={a.ians_is_auto_evaluated || finalized}
                      value={a.ians_is_auto_evaluated ? a.ians_marks_awarded ?? "" : d.marks}
                      onChange={(e) => setDecision(a.ians_id, { marks: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`comment-${a.ians_id}`}>Comment</Label>
                    <Input
                      id={`comment-${a.ians_id}`}
                      disabled={finalized}
                      value={
                        a.ians_is_auto_evaluated
                          ? a.ians_evaluator_comment || ""
                          : d.comment !== undefined
                            ? d.comment
                            : a.ians_evaluator_comment || ""
                      }
                      onChange={(e) => setDecision(a.ians_id, { comment: e.target.value })}
                      placeholder="Feedback for the candidate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Remarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={3}
            value={remarks}
            disabled={finalized}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Overall feedback shown to the candidate after finalization"
          />
          {!finalized && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" disabled={saving} onClick={() => handleSave(false)}>
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button disabled={saving} onClick={() => handleSave(true)}>
                {saving ? "Finalizing..." : "Finalize Evaluation"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Security Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events logged.</p>
          ) : (
            <div className="space-y-1.5 text-sm">
              {events.map((ev) => (
                <div key={ev.iev_id} className="flex items-center gap-3 border-b pb-1.5">
                  <span className="text-xs text-muted-foreground w-40 shrink-0">
                    {new Date(ev.iev_created_at).toLocaleString()}
                  </span>
                  <Badge variant={ev.iev_event_type === "TAB_SWITCH" ? "destructive" : "secondary"}>
                    {ev.iev_event_type}
                  </Badge>
                  <span className="text-muted-foreground truncate">{ev.iev_event_details}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

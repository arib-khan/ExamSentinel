import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import { fromLocalInput, toLocalInput } from "../format";
import { selectCls } from "./ui";
import Field from "./Field";

const EMPTY = { title: "", description: "", instructions: "", interview_type: "general", duration_minutes: 30,
  scheduled_start: "", scheduled_end: "", passing_percentage: "", auto_submit_on_expiry: true, show_result_to_candidate: false, proctoring_enabled: false };

/** Create (no :id) or edit (:id) an interview. */
export default function InterviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [types, setTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { interviewApi.types().then((t) => setTypes(t.interview_types)).catch(() => {}); }, []);
  useEffect(() => {
    if (!id) return;
    interviewApi.get(id).then((i) => {
      setLocked(i.attempt_count > 0);
      setForm({ ...EMPTY, ...i, description: i.description || "", instructions: i.instructions || "",
        scheduled_start: toLocalInput(i.scheduled_start), scheduled_end: toLocalInput(i.scheduled_end),
        passing_percentage: i.passing_percentage ?? "", auto_submit_on_expiry: !!i.auto_submit_on_expiry,
        show_result_to_candidate: !!i.show_result_to_candidate, proctoring_enabled: !!i.proctoring_enabled });
    }).catch((e) => { toast.error(apiErrorMessage(e)); navigate("/admin/interviews"); });
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      title: form.title, description: form.description, instructions: form.instructions, interview_type: form.interview_type,
      duration_minutes: Number(form.duration_minutes), scheduled_start: fromLocalInput(form.scheduled_start), scheduled_end: fromLocalInput(form.scheduled_end),
      passing_percentage: form.passing_percentage === "" ? null : Number(form.passing_percentage),
      auto_submit_on_expiry: form.auto_submit_on_expiry, show_result_to_candidate: form.show_result_to_candidate, proctoring_enabled: form.proctoring_enabled,
    };
    setSaving(true);
    try {
      const saved = id ? await interviewApi.update(id, body) : await interviewApi.create(body);
      toast.success(id ? "Interview updated" : "Interview created");
      navigate(id ? `/admin/interviews/${id}` : `/admin/interviews/${saved.interview_id}/questions`);
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setSaving(false); }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader><CardTitle>{id ? "Edit interview" : "New interview"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title *"><Input required maxLength={200} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Type">
                <select className={selectCls} value={form.interview_type} onChange={(e) => set("interview_type", e.target.value)}>
                  {types.length ? types.map((t) => <option key={t.type_code} value={t.type_code}>{t.label}</option>) : <option value="general">General Interview</option>}
                </select>
              </Field>
              <Field label="Duration (minutes) *"><Input type="number" required min={1} max={600} disabled={locked} value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} /></Field>
              <Field label="Passing %"><Input type="number" min={0} max={100} step="0.5" value={form.passing_percentage} onChange={(e) => set("passing_percentage", e.target.value)} /></Field>
            </div>
            <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Instructions shown to the candidate"><Textarea rows={5} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opens at (optional)"><Input type="datetime-local" value={form.scheduled_start} onChange={(e) => set("scheduled_start", e.target.value)} /></Field>
              <Field label="Closes at (optional)"><Input type="datetime-local" value={form.scheduled_end} onChange={(e) => set("scheduled_end", e.target.value)} /></Field>
            </div>
            <div className="space-y-2 text-sm">
              {[["auto_submit_on_expiry", "Auto-submit answers when time runs out"], ["proctoring_enabled", "Record security events (tab switches, full-screen exit …)"], ["show_result_to_candidate", "Show the result to the candidate after evaluation"]].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2"><Checkbox checked={form[k]} onCheckedChange={(v) => set(k, !!v)} /> {label}</label>
              ))}
            </div>
            {locked && <p className="text-sm text-amber-700">Candidates have already attempted this interview, so the duration is locked.</p>}
            <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

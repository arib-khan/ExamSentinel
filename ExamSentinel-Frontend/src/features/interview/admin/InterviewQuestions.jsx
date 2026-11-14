import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import InterviewManageLayout from "./InterviewManageLayout";
import { selectCls } from "./ui";
import Field from "./Field";

const blank = () => ({ question: "", question_type: "subjective", category: "", difficulty: "medium", marks: 1, expected_answer: "",
  options: [{ key: "A", text: "" }, { key: "B", text: "" }], correct_option: "A" });

function QuestionDialog({ interviewId, qTypes, initial, onClose, onSaved }) {
  const [f, setF] = useState(initial ? { ...blank(), ...initial, category: initial.category || "", expected_answer: initial.expected_answer || "", options: initial.options || blank().options, correct_option: initial.correct_option || "A" } : blank());
  const [saving, setSaving] = useState(false);
  const meta = qTypes.find((t) => t.type_code === f.question_type);
  const isMcq = !!meta?.requires_options;
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setOpt = (i, text) => set("options", f.options.map((o, n) => (n === i ? { ...o, text } : o)));
  const addOpt = () => set("options", [...f.options, { key: String.fromCharCode(65 + f.options.length), text: "" }]);
  const delOpt = (i) => { const next = f.options.filter((_, n) => n !== i).map((o, n) => ({ ...o, key: String.fromCharCode(65 + n) })); set("options", next); if (!next.some((o) => o.key === f.correct_option)) set("correct_option", next[0]?.key || ""); };

  const save = async () => {
    const body = { question: f.question, question_type: f.question_type, category: f.category || null, difficulty: f.difficulty, marks: Number(f.marks), expected_answer: f.expected_answer || null,
      ...(isMcq ? { options: f.options, correct_option: f.correct_option } : {}) };
    setSaving(true);
    try { initial ? await interviewApi.updateQuestion(interviewId, initial.question_id, body) : await interviewApi.addQuestion(interviewId, body); toast.success("Question saved"); onSaved(); }
    catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? "Edit question" : "Add question"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Type"><select className={selectCls} value={f.question_type} onChange={(e) => set("question_type", e.target.value)}>
              {qTypes.map((t) => <option key={t.type_code} value={t.type_code}>{t.label}</option>)}</select></Field>
            <Field label="Difficulty"><select className={selectCls} value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></Field>
            <Field label="Marks"><Input type="number" min={0} step="0.5" value={f.marks} onChange={(e) => set("marks", e.target.value)} /></Field>
          </div>
          <Field label="Question *"><Textarea rows={3} value={f.question} onChange={(e) => set("question", e.target.value)} /></Field>
          <Field label="Category / topic"><Input value={f.category} onChange={(e) => set("category", e.target.value)} /></Field>
          {isMcq ? (
            <div className="space-y-2" role="group" aria-label="Options"><div className="text-sm font-medium leading-none">Options (select the correct one)</div>
              {f.options.map((o, i) => (
                <div key={o.key} className="flex items-center gap-2">
                  <input type="radio" name="correct" checked={f.correct_option === o.key} onChange={() => set("correct_option", o.key)} />
                  <b className="w-5">{o.key}</b><Input value={o.text} onChange={(e) => setOpt(i, e.target.value)} />
                  {f.options.length > 2 && <Button type="button" size="icon" variant="ghost" onClick={() => delOpt(i)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              ))}
              {f.options.length < 8 && <Button type="button" size="sm" variant="outline" onClick={addOpt}>Add option</Button>}
            </div>
          ) : (
            <Field label="Expected answer / marking guide (visible to evaluators only)"><Textarea rows={3} value={f.expected_answer} onChange={(e) => set("expected_answer", e.target.value)} /></Field>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={saving} onClick={save}>{saving ? "Saving…" : "Save question"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuestionsBody({ interview, reloadInterview }) {
  const id = interview.interview_id;
  const [qs, setQs] = useState(null);
  const [qTypes, setQTypes] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const locked = interview.attempt_count > 0;

  const load = useCallback(() => interviewApi.questions(id).then(setQs).catch((e) => toast.error(apiErrorMessage(e))), [id]);
  useEffect(() => { load(); interviewApi.types().then((t) => setQTypes(t.question_types)); }, [load]);
  const refresh = () => { load(); reloadInterview(); };

  const move = async (i, d) => {
    const order = qs.map((q) => q.question_id); const j = i + d;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    try { setQs(await interviewApi.reorderQuestions(id, order)); } catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const del = async (q) => {
    if (!window.confirm("Delete this question?")) return;
    try { await interviewApi.deleteQuestion(id, q.question_id); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{locked ? "Questions are locked because candidates have already attempted this interview." : "Drag order with the arrows. Candidates see questions in this order."}</p>
        <PermissionGate module="interviews" action="update"><Button disabled={locked} className="gap-2" onClick={() => setEditing(null)}><PlusCircle className="h-4 w-4" /> Add question</Button></PermissionGate>
      </div>
      {qs === null ? null : qs.length === 0 ? <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No questions yet.</div> : qs.map((q, i) => (
        <div key={q.question_id} className="flex gap-3 rounded-md border p-3">
          <div className="flex flex-col"><Button size="icon" variant="ghost" disabled={locked || i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" disabled={locked || i === qs.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button></div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs"><b className="text-sm">Q{i + 1}</b>
              <Badge variant="outline" className="capitalize">{q.question_type.replace("_", " ")}</Badge><Badge variant="secondary" className="capitalize">{q.difficulty}</Badge>
              {q.category && <Badge variant="secondary">{q.category}</Badge>}<span className="text-muted-foreground">{q.marks} marks</span></div>
            <p className="whitespace-pre-wrap text-sm">{q.question}</p>
            {q.options && <ul className="text-sm text-muted-foreground">{q.options.map((o) => <li key={o.key} className={o.key === q.correct_option ? "font-medium text-emerald-700" : ""}>{o.key}. {o.text}{o.key === q.correct_option ? " ✓" : ""}</li>)}</ul>}
          </div>
          <PermissionGate module="interviews" action="update"><div className="flex items-start gap-1">
            <Button size="icon" variant="outline" disabled={locked} onClick={() => setEditing(q)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" disabled={locked} onClick={() => del(q)}><Trash2 className="h-4 w-4" /></Button></div></PermissionGate>
        </div>
      ))}
      {editing !== undefined && <QuestionDialog interviewId={id} qTypes={qTypes} initial={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); refresh(); }} />}
    </div>
  );
}

export default function InterviewQuestions() {
  return <InterviewManageLayout>{(i, reload) => <QuestionsBody interview={i} reloadInterview={reload} />}</InterviewManageLayout>;
}

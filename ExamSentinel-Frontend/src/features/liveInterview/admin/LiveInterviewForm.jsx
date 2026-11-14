import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";
import { fmtDateTime, fromLocalInput, toLocalInput } from "../format";
import Field from "./Field";
import { copyText, selectCls } from "./ui";

const defaultStart = () => { const d = new Date(Date.now() + 60 * 60000); d.setMinutes(0, 0, 0); return toLocalInput(d); };
const EMPTY = { title: "", description: "", candidate_id: "", candidate_email: "", candidate_phone: "", scheduled_start: defaultStart(), duration_minutes: 30, monitoring_required: true };

/** Schedule (no :id) or reschedule (:id) a live interview. */
export default function LiveInterviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [pool, setPool] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [newCand, setNewCand] = useState(null);   // dialog state { name, email } | null
  const [cred, setCred] = useState(null);         // credentials to show once
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { const t = setTimeout(() => liveApi.candidatePool(search).then(setPool).catch(() => {}), 250); return () => clearTimeout(t); }, [search]);
  useEffect(() => {
    if (!id) return;
    liveApi.get(id).then((i) => setForm({ ...EMPTY, title: i.title, description: i.description || "", candidate_id: i.candidate_id, candidate_email: i.candidate_email || "", candidate_phone: i.candidate_phone || "",
      scheduled_start: toLocalInput(i.scheduled_start), duration_minutes: i.duration_minutes, monitoring_required: !!i.monitoring_required }))
      .catch((e) => { toast.error(apiErrorMessage(e)); navigate("/admin/live-interviews"); });
  }, [id, navigate]);

  const pick = (userId) => {
    const u = pool.find((p) => p.user_id === userId);
    setForm((f) => ({ ...f, candidate_id: userId, candidate_email: f.candidate_email || (/@/.test(userId) ? userId : "") }));
    if (u && !form.title) setForm((f) => ({ ...f, title: `Interview with ${u.user_name}` }));
  };
  const saveCandidate = async () => {
    try {
      const r = await liveApi.createCandidate(newCand);
      setPool((p) => (p.some((x) => x.user_id === r.user_id) ? p : [{ user_id: r.user_id, user_name: r.user_name }, ...p]));
      setForm((f) => ({ ...f, candidate_id: r.user_id, candidate_email: r.user_id }));
      setNewCand(null);
      if (r.temp_password) setCred(r); else toast.info("That candidate already has an account; selected.");
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = { title: form.title, description: form.description, candidate_email: form.candidate_email || null, candidate_phone: form.candidate_phone || null,
      scheduled_start: fromLocalInput(form.scheduled_start), duration_minutes: Number(form.duration_minutes), monitoring_required: form.monitoring_required };
    if (!id) { if (!form.candidate_id) { toast.error("Choose a candidate first"); return; } body.candidate_id = form.candidate_id; }
    setSaving(true);
    try {
      if (id) { await liveApi.update(id, body); toast.success("Interview updated"); navigate("/admin/live-interviews"); }
      else setCreated(await liveApi.create(body));
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setSaving(false); }
  };

  if (created) {
    return (
      <div className="container mx-auto max-w-2xl py-8"><Card data-testid="created-card">
        <CardHeader><CardTitle>Interview scheduled</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md bg-muted/40 p-3"><div className="font-medium">{created.title}</div><div className="text-muted-foreground">{created.candidate_name} · {fmtDateTime(created.scheduled_start)} · {created.duration_minutes} min</div></div>
          <div>Meeting code: <b className="font-mono">{created.meeting_code}</b></div>
          <div className="break-all">Link for the candidate: <span className="font-mono">{created.join_link}</span></div>
          <p className="text-muted-foreground">The candidate also sees this interview in their Interview section. It opens for joining 10 minutes before the start.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={async () => toast[(await copyText(created.join_link)) ? "success" : "error"]("Link copied")}><Copy className="mr-2 h-4 w-4" /> Copy link</Button>
            <Button variant="outline" onClick={async () => { try { const r = await liveApi.invite(created.id); if (r.sent) toast.success("Invitation e-mailed"); else toast.info(`${r.reason}.`); } catch (e) { toast.error(apiErrorMessage(e)); } }}>Send e-mail invitation</Button>
            <Button onClick={() => navigate("/admin/live-interviews")}>Done</Button>
          </div>
        </CardContent></Card></div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader><CardTitle>{id ? "Reschedule interview" : "Schedule a live interview"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title *"><Input required maxLength={200} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>

            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Candidate *</div>
              {id ? <div className="text-sm">{form.candidate_id}</div> : (
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Input aria-label="Search candidates" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select aria-label="Candidate" className={selectCls} value={form.candidate_id} onChange={(e) => pick(e.target.value)}>
                      <option value="">Select a candidate…</option>{pool.map((u) => <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.user_id})</option>)}
                    </select>
                  </div>
                  <Button type="button" variant="outline" className="self-start" onClick={() => setNewCand({ name: "", email: "" })}><UserPlus className="mr-2 h-4 w-4" /> New candidate</Button>
                </div>)}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Candidate email (for the invitation)"><Input type="email" value={form.candidate_email} onChange={(e) => set("candidate_email", e.target.value)} /></Field>
                <Field label="Candidate phone"><Input value={form.candidate_phone} onChange={(e) => set("candidate_phone", e.target.value)} /></Field>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date and time *"><Input type="datetime-local" required value={form.scheduled_start} onChange={(e) => set("scheduled_start", e.target.value)} /></Field>
              <Field label="Duration (minutes) *"><Input type="number" required min={5} max={480} value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.monitoring_required} onCheckedChange={(v) => set("monitoring_required", !!v)} aria-label="Use a workspace monitoring camera" /> Candidate uses a second phone as a workspace monitoring camera</label>
            <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : id ? "Save changes" : "Schedule interview"}</Button><Button type="button" variant="outline" onClick={() => navigate("/admin/live-interviews")}>Cancel</Button></div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!newCand} onOpenChange={(o) => !o && setNewCand(null)}>
        <DialogContent><DialogHeader><DialogTitle>New candidate</DialogTitle><DialogDescription>Creates a candidate login. The email is the user ID.</DialogDescription></DialogHeader>
          {newCand && <div className="space-y-3">
            <Field label="Full name *"><Input value={newCand.name} onChange={(e) => setNewCand({ ...newCand, name: e.target.value })} /></Field>
            <Field label="Email *"><Input type="email" value={newCand.email} onChange={(e) => setNewCand({ ...newCand, email: e.target.value })} /></Field></div>}
          <DialogFooter><Button variant="outline" onClick={() => setNewCand(null)}>Cancel</Button><Button disabled={!newCand?.name || !newCand?.email} onClick={saveCandidate}>Create candidate</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!cred} onOpenChange={(o) => !o && setCred(null)}>
        <DialogContent><DialogHeader><DialogTitle>Candidate account created</DialogTitle><DialogDescription>Share these login details with the candidate. The password is shown only once.</DialogDescription></DialogHeader>
          {cred && <div className="space-y-1 rounded-md bg-muted/40 p-3 font-mono text-sm" data-testid="credentials"><div>User ID: {cred.user_id}</div><div>Password: {cred.temp_password}</div></div>}
          <DialogFooter><Button variant="outline" onClick={async () => toast[(await copyText(`User ID: ${cred.user_id}\nPassword: ${cred.temp_password}`)) ? "success" : "error"]("Copied")}>Copy</Button><Button onClick={() => setCred(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

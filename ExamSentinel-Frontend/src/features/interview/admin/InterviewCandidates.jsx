import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/components/PermissionGate";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import InterviewManageLayout from "./InterviewManageLayout";
import Field from "./Field";
import { fmtDate } from "../format";

function AssignDialog({ interviewId, assignedIds, onClose, onDone }) {
  const [pool, setPool] = useState([]);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set());
  const [max, setMax] = useState(1);
  const [saving, setSaving] = useState(false);
  useEffect(() => { const t = setTimeout(() => interviewApi.candidatePool(search).then(setPool).catch((e) => toast.error(apiErrorMessage(e))), 250); return () => clearTimeout(t); }, [search]);
  const free = pool.filter((u) => !assignedIds.has(u.user_id));
  const toggle = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const save = async () => {
    setSaving(true);
    try { const r = await interviewApi.assignCandidates(interviewId, [...picked], Number(max)); toast.success(`${r.added} candidate(s) assigned`); onDone(); }
    catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign candidates</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Only users with the <b>Candidate</b> role are listed. Create them from User Management.</p>
        <Input placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="max-h-64 space-y-1 overflow-auto rounded-md border p-2">
          {free.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">No unassigned candidates found.</div> : free.map((u) => (
            <label key={u.user_id} className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-muted/50">
              <Checkbox checked={picked.has(u.user_id)} onCheckedChange={() => toggle(u.user_id)} /> <span className="font-medium">{u.user_name}</span> <span className="text-muted-foreground">{u.user_id}</span>
            </label>))}
        </div>
        <Field label="Attempts allowed" className="w-40"><Input type="number" min={1} max={20} value={max} onChange={(e) => setMax(e.target.value)} /></Field>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!picked.size || saving} onClick={save}>Assign {picked.size || ""}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CandidatesBody({ interview }) {
  const id = interview.interview_id;
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(() => interviewApi.candidates(id).then(setRows).catch((e) => toast.error(apiErrorMessage(e))), [id]);
  useEffect(() => { load(); }, [load]);
  const grant = async (c) => {
    try { await interviewApi.updateCandidate(id, c.candidate_id, c.max_attempts + 1); toast.success("One more attempt granted"); load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Remove ${c.candidate_name || c.candidate_id}?`)) return;
    try { await interviewApi.removeCandidate(id, c.candidate_id); load(); } catch (e) { toast.error(apiErrorMessage(e)); }
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><PermissionGate module="interviews" action="execute"><Button className="gap-2" onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" /> Assign candidates</Button></PermissionGate></div>
      {rows === null ? null : rows.length === 0 ? <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No candidates assigned.</div> : (
        <div className="rounded-md border"><Table>
          <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>User ID</TableHead><TableHead>Attempts</TableHead><TableHead>Assigned</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{rows.map((c) => (
            <TableRow key={c.id}><TableCell className="font-medium">{c.candidate_name || "—"}</TableCell><TableCell>{c.candidate_id}</TableCell>
              <TableCell>{c.attempts_used} / {c.max_attempts}</TableCell><TableCell className="text-sm text-muted-foreground">{fmtDate(c.assigned_at)}</TableCell>
              <TableCell className="space-x-1 whitespace-nowrap text-right"><PermissionGate module="interviews" action="execute">
                {c.attempts_used >= c.max_attempts && <Button size="sm" variant="outline" onClick={() => grant(c)}>Allow +1 attempt</Button>}
                <Button size="sm" variant="outline" disabled={c.attempts_used > 0} onClick={() => remove(c)}>Remove</Button></PermissionGate></TableCell></TableRow>))}
          </TableBody></Table></div>)}
      {open && <AssignDialog interviewId={id} assignedIds={new Set((rows || []).map((r) => r.candidate_id))} onClose={() => setOpen(false)} onDone={() => { setOpen(false); load(); }} />}
    </div>
  );
}
export default function InterviewCandidates() { return <InterviewManageLayout>{(i) => <CandidatesBody interview={i} />}</InterviewManageLayout>; }

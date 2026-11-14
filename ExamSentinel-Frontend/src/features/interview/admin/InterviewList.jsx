import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import { INTERVIEW_STATUS_STYLE, fmtDate, typeLabel } from "../format";
import { selectCls } from "./ui";

export default function InterviewList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => interviewApi.list({ status: status || undefined, type: type || undefined })
    .then(setRows).catch((e) => { toast.error(apiErrorMessage(e)); setRows([]); }), [status, type]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { interviewApi.types().then((t) => setTypes(t.interview_types)).catch(() => {}); }, []);

  const toggle = async (i) => {
    try { i.status === "published" ? await interviewApi.unpublish(i.interview_id) : await interviewApi.publish(i.interview_id); load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const del = async () => {
    try { await interviewApi.remove(toDelete.interview_id); toast.success("Interview deleted"); setToDelete(null); load(); }
    catch (e) { toast.error(apiErrorMessage(e)); setToDelete(null); }
  };

  return (
    <div className="container mx-auto space-y-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Interviews</h1>
        <PermissionGate module="interviews" action="create">
          <Button className="gap-2" onClick={() => navigate("/admin/interviews/create")}><PlusCircle className="h-4 w-4" /> New interview</Button>
        </PermissionGate>
      </div>
      <div className="flex gap-3">
        <select className={`${selectCls} max-w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
        <select className={`${selectCls} max-w-48`} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>{types.map((t) => <option key={t.type_code} value={t.type_code}>{t.label}</option>)}
        </select>
      </div>

      {rows === null ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No interviews found.</div>
      ) : (
        <div className="rounded-md border"><Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Schedule</TableHead>
            <TableHead className="text-right">Qs</TableHead><TableHead className="text-right">Candidates</TableHead><TableHead className="text-right">Attempts</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((i) => (
              <TableRow key={i.interview_id}>
                <TableCell className="font-medium"><button className="text-left hover:underline" onClick={() => navigate(`/admin/interviews/${i.interview_id}`)}>{i.title}</button></TableCell>
                <TableCell>{typeLabel(i.interview_type)}</TableCell>
                <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${INTERVIEW_STATUS_STYLE[i.status]}`}>{i.status}</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">{i.scheduled_start ? fmtDate(i.scheduled_start) : "Any time"}</TableCell>
                <TableCell className="text-right">{i.question_count}</TableCell>
                <TableCell className="text-right">{i.candidate_count}</TableCell>
                <TableCell className="text-right">{i.attempt_count}</TableCell>
                <TableCell className="space-x-1 whitespace-nowrap text-right">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/interviews/${i.interview_id}`)}>Manage</Button>
                  <PermissionGate module="interviews" action="update"><Button size="sm" variant="outline" onClick={() => navigate(`/admin/interviews/${i.interview_id}/edit`)}>Edit</Button></PermissionGate>
                  <PermissionGate module="interviews" action="execute"><Button size="sm" variant="outline" onClick={() => toggle(i)}>{i.status === "published" ? "Unpublish" : "Publish"}</Button></PermissionGate>
                  <PermissionGate module="interviews" action="delete"><Button size="sm" variant="destructive" onClick={() => setToDelete(i)}>Delete</Button></PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete “{toDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>Its questions and candidate assignments will be removed. Interviews that already have attempts cannot be deleted; archive them instead.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={del}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

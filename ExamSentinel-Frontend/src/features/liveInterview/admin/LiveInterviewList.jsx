import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlusCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";
import { STATE_LABEL, STATE_STYLE, fmtDateTime } from "../format";
import { copyText, selectCls } from "./ui";

export default function LiveInterviewList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState("");
  const [toCancel, setToCancel] = useState(null);
  const load = useCallback(() => liveApi.list({ status: status || undefined }).then(setRows).catch((e) => { toast.error(apiErrorMessage(e)); setRows((p) => p || []); }), [status]);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const copy = async (i) => toast[(await copyText(i.join_link)) ? "success" : "error"]((await copyText(i.join_link)) ? "Meeting link copied" : "Could not copy; select the link manually");
  const invite = async (i) => {
    try {
      const r = await liveApi.invite(i.id);
      if (r.sent) toast.success(`Invitation e-mailed to ${i.candidate_email}`);
      else { await copyText(r.link); toast.info(`${r.reason}. The link was copied to your clipboard.`); }
      load();
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const cancel = async () => { try { await liveApi.cancel(toCancel.id); toast.success("Interview cancelled"); } catch (e) { toast.error(apiErrorMessage(e)); } setToCancel(null); load(); };

  return (
    <div className="container mx-auto space-y-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Live Interviews</h1><p className="text-sm text-muted-foreground">Schedule video interviews, share the link and run them live.</p></div>
        <PermissionGate module="live_interviews" action="create"><Button className="gap-2" onClick={() => navigate("/admin/live-interviews/create")}><PlusCircle className="h-4 w-4" /> Schedule interview</Button></PermissionGate>
      </div>
      <select aria-label="Filter by status" className={`${selectCls} max-w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="ended">Ended</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option>
      </select>
      {rows === null ? <Skeleton className="h-64" /> : rows.length === 0 ? <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No interviews yet. Schedule the first one.</div> : (
        <div className="overflow-x-auto rounded-md border"><Table>
          <TableHeader><TableRow><TableHead>Interview</TableHead><TableHead>Candidate</TableHead><TableHead>When</TableHead><TableHead>Status</TableHead><TableHead>Code</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{rows.map((i) => {
            const canOpen = ["available", "live"].includes(i.join_state);
            return (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.title}</TableCell>
                <TableCell>{i.candidate_name}<div className="text-xs text-muted-foreground">{i.candidate_email}</div></TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmtDateTime(i.scheduled_start)}<div className="text-xs text-muted-foreground">{i.duration_minutes} min</div></TableCell>
                <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLE[i.join_state] || STATE_STYLE[i.status]}`}>{i.join_state === "available" ? "Ready" : STATE_LABEL[i.join_state] || i.status}</span></TableCell>
                <TableCell className="font-mono text-xs">{i.meeting_code}</TableCell>
                <TableCell className="space-x-1 whitespace-nowrap text-right">
                  <PermissionGate module="live_interviews" action="execute">
                    {i.status !== "ended" && i.status !== "cancelled" && i.status !== "expired" && <Button size="sm" disabled={!canOpen} onClick={() => navigate(`/admin/live-interviews/${i.id}/room`)}><Video className="mr-1 h-4 w-4" />{i.status === "live" ? "Rejoin" : "Start"}</Button>}
                  </PermissionGate>
                  {["scheduled", "live"].includes(i.status) && <Button size="sm" variant="outline" onClick={() => copy(i)}>Copy link</Button>}
                  {i.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => invite(i)}>Invite</Button>}
                  <PermissionGate module="live_interviews" action="update">
                    {i.status === "scheduled" && <><Button size="sm" variant="outline" onClick={() => navigate(`/admin/live-interviews/${i.id}/edit`)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setToCancel(i)}>Cancel</Button></>}
                  </PermissionGate>
                </TableCell>
              </TableRow>);
          })}</TableBody>
        </Table></div>)}
      <AlertDialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancel “{toCancel?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>The candidate will no longer be able to join. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction onClick={cancel}>Cancel interview</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

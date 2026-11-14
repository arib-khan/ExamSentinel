import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import InterviewManageLayout from "./InterviewManageLayout";
import { ATTEMPT_STATUS_LABEL, EVAL_STATUS_LABEL, fmtDate, fmtDuration } from "../format";

function Body({ interview }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  useEffect(() => { interviewApi.attempts(interview.interview_id).then(setRows).catch((e) => { toast.error(apiErrorMessage(e)); setRows([]); }); }, [interview.interview_id]);
  if (rows === null) return null;
  if (!rows.length) return <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No attempts yet.</div>;
  return (
    <div className="rounded-md border"><Table>
      <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>#</TableHead><TableHead>Started</TableHead><TableHead>Status</TableHead><TableHead>Evaluation</TableHead><TableHead>Time</TableHead><TableHead>Flags</TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{rows.map((a) => (
        <TableRow key={a.attempt_id}>
          <TableCell className="font-medium">{a.candidate_name || a.candidate_id}</TableCell><TableCell>{a.attempt_no}</TableCell>
          <TableCell className="text-sm text-muted-foreground">{fmtDate(a.start_time)}</TableCell>
          <TableCell>{ATTEMPT_STATUS_LABEL[a.status]}</TableCell><TableCell>{EVAL_STATUS_LABEL[a.evaluation_status]}</TableCell>
          <TableCell>{fmtDuration(a.duration_seconds)}</TableCell>
          <TableCell>{a.flagged_events > 0 ? <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="h-4 w-4" />{a.flagged_events}</span> : "—"}</TableCell>
          <TableCell className="text-right"><Button size="sm" variant="outline" disabled={a.status === "in_progress"} onClick={() => navigate(`/admin/interview-attempts/${a.attempt_id}/evaluation`)}>
            {a.evaluation_status === "pending_manual_review" ? "Evaluate" : "View"}</Button></TableCell>
        </TableRow>))}
      </TableBody></Table></div>
  );
}
export default function InterviewAttempts() { return <InterviewManageLayout>{(i) => <Body interview={i} />}</InterviewManageLayout>; }

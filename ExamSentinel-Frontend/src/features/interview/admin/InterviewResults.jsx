import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import InterviewManageLayout from "./InterviewManageLayout";
import { EVAL_STATUS_LABEL, fmtDate } from "../format";

const Stat = ({ label, value }) => <Card><CardContent className="pt-6"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="text-2xl font-semibold">{value ?? "—"}</div></CardContent></Card>;

function Body({ interview }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  useEffect(() => { interviewApi.results(interview.interview_id).then(setData).catch((e) => toast.error(apiErrorMessage(e))); }, [interview.interview_id]);
  if (!data) return null;
  const s = data.summary;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Attempts" value={s.attempts} /><Stat label="In progress" value={s.in_progress} /><Stat label="Pending review" value={s.pending_review} />
        <Stat label="Evaluated" value={s.evaluated} /><Stat label="Average %" value={s.average_percentage} /><Stat label="Passed" value={s.passed} />
      </div>
      {data.results.length === 0 ? <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No results yet.</div> : (
        <div className="rounded-md border"><Table>
          <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Submitted</TableHead><TableHead>Evaluation</TableHead><TableHead className="text-right">Score</TableHead><TableHead className="text-right">%</TableHead><TableHead>Outcome</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{data.results.map((r) => (
            <TableRow key={r.attempt_id}>
              <TableCell className="font-medium">{r.candidate_name || r.candidate_id}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{fmtDate(r.submission_time)}</TableCell>
              <TableCell>{EVAL_STATUS_LABEL[r.evaluation_status]}</TableCell>
              <TableCell className="text-right">{r.evaluation_status === "evaluated" || r.evaluation_status === "auto_evaluated" ? `${r.score} / ${r.total_marks}` : "—"}</TableCell>
              <TableCell className="text-right">{r.percentage ?? "—"}</TableCell>
              <TableCell>{r.passed == null ? "—" : r.passed ? "Passed" : "Not passed"}</TableCell>
              <TableCell className="text-right"><Button size="sm" variant="outline" disabled={r.status === "in_progress"} onClick={() => navigate(`/admin/interview-attempts/${r.attempt_id}/evaluation`)}>Open</Button></TableCell>
            </TableRow>))}
          </TableBody></Table></div>)}
    </div>
  );
}
export default function InterviewResults() { return <InterviewManageLayout>{(i) => <Body interview={i} />}</InterviewManageLayout>; }

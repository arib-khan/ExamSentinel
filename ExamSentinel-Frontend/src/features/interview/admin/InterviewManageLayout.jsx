import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGate } from "@/components/PermissionGate";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";
import { INTERVIEW_STATUS_STYLE, typeLabel } from "../format";

const TABS = [["", "Overview"], ["questions", "Questions"], ["candidates", "Candidates"], ["attempts", "Attempts"], ["results", "Results"]];

/** Header + tabs shared by every per-interview admin page. children = (interview, reload) => node */
export default function InterviewManageLayout({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => interviewApi.get(id).then(setInterview).catch((e) => { toast.error(apiErrorMessage(e)); navigate("/admin/interviews"); }), [id, navigate]);
  useEffect(() => { reload(); }, [reload]);

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); toast.success(okMsg); await reload(); } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(false); }
  };
  if (!interview) return <div className="container mx-auto py-8"><Skeleton className="h-64" /></div>;

  return (
    <div className="container mx-auto space-y-4 py-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/interviews")}><ArrowLeft className="mr-1 h-4 w-4" /> All interviews</Button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{interview.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${INTERVIEW_STATUS_STYLE[interview.status]}`}>{interview.status}</span>
            {typeLabel(interview.interview_type)} · {interview.duration_minutes} min · {interview.question_count} questions · {interview.total_marks} marks
          </div>
        </div>
        <PermissionGate module="interviews" action="execute">
          {interview.status === "published"
            ? <Button variant="outline" disabled={busy} onClick={() => act(() => interviewApi.unpublish(id), "Moved back to draft")}>Unpublish</Button>
            : <Button disabled={busy} onClick={() => act(() => interviewApi.publish(id), "Interview published")}>Publish</Button>}
        </PermissionGate>
      </div>
      <nav className="flex gap-1 border-b">
        {TABS.map(([path, label]) => (
          <NavLink key={path} end to={`/admin/interviews/${id}${path ? "/" + path : ""}`}
            className={({ isActive }) => `-mb-px border-b-2 px-4 py-2 text-sm ${isActive ? "border-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</NavLink>
        ))}
      </nav>
      {children(interview, reload)}
    </div>
  );
}

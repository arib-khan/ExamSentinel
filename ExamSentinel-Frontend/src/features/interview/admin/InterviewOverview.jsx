import InterviewManageLayout from "./InterviewManageLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/PermissionGate";
import { fmtDate, typeLabel } from "../format";

const Row = ({ k, v }) => <div className="flex gap-4 border-b py-2 text-sm"><div className="w-48 text-muted-foreground">{k}</div><div className="flex-1">{v}</div></div>;

export default function InterviewOverview() {
  const navigate = useNavigate();
  return (
    <InterviewManageLayout>{(i) => (
      <div className="max-w-3xl">
        <Row k="Type" v={typeLabel(i.interview_type)} />
        <Row k="Duration" v={`${i.duration_minutes} minutes`} />
        <Row k="Opens" v={fmtDate(i.scheduled_start)} /><Row k="Closes" v={fmtDate(i.scheduled_end)} />
        <Row k="Passing percentage" v={i.passing_percentage ?? "—"} />
        <Row k="Auto-submit on expiry" v={i.auto_submit_on_expiry ? "Yes" : "No (attempt is marked expired)"} />
        <Row k="Security events" v={i.proctoring_enabled ? "Recorded" : "Off"} />
        <Row k="Result visible to candidate" v={i.show_result_to_candidate ? "Yes" : "No"} />
        <Row k="Description" v={i.description || "—"} />
        <Row k="Instructions" v={<span className="whitespace-pre-wrap">{i.instructions || "—"}</span>} />
        <PermissionGate module="interviews" action="update">
          <Button className="mt-4" variant="outline" onClick={() => navigate(`/admin/interviews/${i.interview_id}/edit`)}>Edit details</Button>
        </PermissionGate>
      </div>
    )}</InterviewManageLayout>
  );
}

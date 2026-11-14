import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewCard from "@/components/interview/InterviewCard";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";

const FILTERS = [["all", "All"], ["active", "Active"], ["available", "Available"], ["upcoming", "Upcoming"], ["completed", "Completed"]];

export default function CandidateInterviewList() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    interviewApi.mine().then(setItems).catch((e) => { toast.error(apiErrorMessage(e)); setItems([]); });
  }, []);

  const shown = useMemo(() => (items || []).filter((i) => filter === "all" || i.category === filter || (filter === "completed" && i.category === "missed")), [items, filter]);

  const open = (i) => {
    if (i.category === "completed" && i.last_attempt_id && i.last_attempt_status !== "in_progress") navigate(`/candidate/interview-attempts/${i.last_attempt_id}/result`);
    else navigate(`/candidate/interviews/${i.interview_id}`);
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div><h1 className="text-2xl font-semibold">My Interviews</h1><p className="text-sm text-muted-foreground">Interviews assigned to you.</p></div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([k, label]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>
            {label}{items && k !== "all" ? ` (${items.filter((i) => i.category === k).length})` : ""}
          </Button>
        ))}
      </div>
      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-56" />)}</div>
      ) : shown.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No interviews here yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((i) => <InterviewCard key={i.interview_id} interview={i} onOpen={open} />)}</div>
      )}
    </div>
  );
}

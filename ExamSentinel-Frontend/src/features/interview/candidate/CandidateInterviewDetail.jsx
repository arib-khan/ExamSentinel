import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewInstructions from "@/components/interview/InterviewInstructions";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";

export default function CandidateInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [starting, setStarting] = useState(false);
  const [blocked, setBlocked] = useState(null);

  useEffect(() => {
    interviewApi.get(id).then(setInterview).catch((e) => { toast.error(apiErrorMessage(e)); navigate("/candidate/interviews", { replace: true }); });
  }, [id, navigate]);

  const start = async () => {
    setStarting(true);
    try {
      const r = await interviewApi.start(id);
      navigate(`/candidate/interview-attempts/${r.attempt_id}`);
    } catch (e) {
      setBlocked(apiErrorMessage(e)); // server decides: not started yet / window closed / no attempts left ...
      toast.error(apiErrorMessage(e));
    } finally { setStarting(false); }
  };

  if (!interview) return <div className="container mx-auto py-8"><Skeleton className="h-96" /></div>;
  const exhausted = !interview.open_attempt_id && interview.attempts_used >= interview.max_attempts;
  return (
    <div className="container mx-auto max-w-3xl space-y-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/candidate/interviews")}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
      <InterviewInstructions interview={interview} onStart={start} starting={starting}
        blockedReason={exhausted ? "You have used all attempts for this interview." : blocked} />
    </div>
  );
}

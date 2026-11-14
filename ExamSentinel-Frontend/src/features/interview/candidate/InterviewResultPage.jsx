import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewResult from "@/components/interview/InterviewResult";
import { interviewApi, apiErrorCode, apiErrorMessage } from "@/services/InterviewServices/interviewService";

export default function InterviewResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    interviewApi.result(attemptId).then(setResult).catch((e) => {
      if (apiErrorCode(e) === "IN_PROGRESS") return navigate(`/candidate/interview-attempts/${attemptId}`, { replace: true });
      toast.error(apiErrorMessage(e)); navigate("/candidate/interviews", { replace: true });
    });
  }, [attemptId, navigate]);

  return (
    <div className="container mx-auto max-w-3xl space-y-4 py-8">
      {result ? <InterviewResult result={result} /> : <Skeleton className="h-64" />}
      <Button onClick={() => navigate("/candidate/interviews")}>Back to my interviews</Button>
    </div>
  );
}

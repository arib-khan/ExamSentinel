import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewEvaluation from "@/components/interview/InterviewEvaluation";
import { PermissionGate } from "@/components/PermissionGate";
import { interviewApi, apiErrorMessage } from "@/services/InterviewServices/interviewService";

export default function InterviewEvaluationPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  const load = useCallback(() => interviewApi.evaluation(attemptId).then((d) => { setDetail(d); setVersion((v) => v + 1); }).catch((e) => { toast.error(apiErrorMessage(e)); navigate(-1); }), [attemptId, navigate]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, msg) => { setBusy(true); try { const d = await fn(); setDetail(d); setVersion((v) => v + 1); toast.success(msg); } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(false); } };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 py-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(detail ? `/admin/interviews/${detail.interview.interview_id}/results` : -1)}><ArrowLeft className="mr-1 h-4 w-4" /> Results</Button>
      {!detail ? <Skeleton className="h-96" /> : (
        // Without update/execute permission the evaluator can look but not grade/finalize.
        <PermissionGate module="interview_evaluations" action="update" fallback={<InterviewEvaluation key={version} detail={{ ...detail, evaluation: { ...(detail.evaluation || {}), status: "finalized" } }} onSave={() => {}} onFinalize={() => {}} busy />}>
          <InterviewEvaluation key={version} detail={detail} busy={busy}
            onSave={(p) => run(() => interviewApi.saveEvaluation(attemptId, p), "Draft saved")}
            onFinalize={(p) => run(async () => { if (p.grades.length) await interviewApi.saveEvaluation(attemptId, p); return interviewApi.finalizeEvaluation(attemptId, p.comments); }, "Evaluation finalized")} />
        </PermissionGate>
      )}
    </div>
  );
}

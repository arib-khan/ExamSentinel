// Interview module :: candidate interview details + instructions + start.
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/reusableComponets/Loader";
import InterviewInstructions from "../components/InterviewInstructions";
import { getInterviewDetails, startInterview } from "@/services/InterviewServices/interviewService";

export default function InterviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getInterviewDetails(id);
        if (res.data.status) setDetails(res.data.data);
        else {
          toast.error(res.data.msg || "Interview not found");
          navigate("/interviews");
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load interview details");
        navigate("/interviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startInterview(id);
      const d = res.data;
      if (!d.status) {
        toast.error(d.msg || "Could not start interview");
        return;
      }
      const { attempt } = d.data;
      if (d.data.closed || attempt.ia_status !== "IN_PROGRESS") {
        navigate(`/interview-result/${attempt.ia_id}`);
        return;
      }
      navigate(`/interview-attempt/${attempt.ia_id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not start interview");
    } finally {
      setStarting(false);
    }
  };

  if (loading || !details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  const { interview, attempt } = details;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <Link to="/interviews">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Interviews
          </Link>
        </Button>
      </div>

      {attempt && attempt.ia_status !== "IN_PROGRESS" ? (
        <div className="max-w-3xl mx-auto rounded-xl border border-white/15 bg-white/5 p-8 text-center space-y-4">
          <h2 className="text-white text-lg font-semibold">{interview.iv_title}</h2>
          <p className="text-white/70 text-sm">
            You have already completed this interview attempt.
          </p>
          <Button onClick={() => navigate(`/interview-result/${attempt.ia_id}`)}>
            View Result
          </Button>
        </div>
      ) : attempt && attempt.ia_status === "IN_PROGRESS" ? (
        <div className="max-w-3xl mx-auto rounded-xl border border-amber-300/30 bg-amber-500/10 p-8 text-center space-y-4">
          <h2 className="text-white text-lg font-semibold">
            Your attempt is still in progress
          </h2>
          <Button onClick={() => navigate(`/interview-attempt/${attempt.ia_id}`)}>
            Resume Interview
          </Button>
        </div>
      ) : (
        <InterviewInstructions interview={interview} onStart={handleStart} loading={starting} />
      )}
    </div>
  );
}

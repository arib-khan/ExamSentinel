// Interview module :: candidate interview dashboard (list).
// Sections: In Progress / Available / Upcoming / Completed with results.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { MessagesSquare, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/reusableComponets/Loader";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";
import InterviewCard from "../components/InterviewCard";
import { getMyInterviews } from "@/services/InterviewServices/interviewService";

export default function CandidateInterviewsPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const student = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("interviewStudent") || "null");
    } catch {
      return null;
    }
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyInterviews();
      if (res.data.status) setInterviews(res.data.data);
      else toast.error(res.data.msg || "Could not load interviews");
    } catch (err) {
      console.error(err);
      toast.error("Could not load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openInterview = (iv) => {
    if (iv.attempt_status === "IN_PROGRESS") {
      navigate(`/interview-attempt/${iv.attempt_id}`);
    } else {
      navigate(`/interviews/${iv.iv_id}`);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("interviewToken");
    sessionStorage.removeItem("interviewStudent");
    navigate("/interview-login");
  };

  const sections = useMemo(() => {
    const inProgress = interviews.filter((i) => i.attempt_status === "IN_PROGRESS");
    const completed = interviews.filter(
      (i) => i.attempt_status && i.attempt_status !== "IN_PROGRESS"
    );
    const available = interviews.filter(
      (i) => !i.attempt_status && i.iv_status === "PUBLISHED"
    );
    const upcoming = interviews.filter(
      (i) => !i.attempt_status && i.iv_status !== "PUBLISHED"
    );
    return [
      { title: "Active Interviews", items: inProgress },
      { title: "Available Interviews", items: available },
      { title: "Upcoming", items: upcoming },
      { title: "Completed & Results", items: completed },
    ].filter((s) => s.items.length > 0);
  }, [interviews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/30 to-blue-600/30 flex items-center justify-center">
              <MessagesSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold">ExamSentinel Interviews</h1>
              <p className="text-white/60 text-sm">
                {student?.name ? `Welcome, ${student.name}` : "Candidate dashboard"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={load}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader />
          </div>
        ) : interviews.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16">
              <NoDataFound />
              <p className="text-center text-white/60 mt-4">
                No interviews have been assigned to you yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-white/90 font-medium mb-4 flex items-center gap-2">
                  {section.title}
                  <span className="text-xs rounded-full bg-white/10 text-white/70 px-2 py-0.5">
                    {section.items.length}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((iv) => (
                    <InterviewCard key={iv.iv_id} interview={iv} onOpen={openInterview} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-white/40 mt-12">
          <Link to="/" className="hover:text-white/70">
            ← Back to Exam Login
          </Link>
        </p>
      </main>
    </div>
  );
}

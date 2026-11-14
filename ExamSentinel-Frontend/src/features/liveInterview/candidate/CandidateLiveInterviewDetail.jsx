import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";
import { STATE_LABEL, STATE_STYLE, fmtDateTime } from "../format";

const WHY = {
  upcoming: (i) => `The room opens at ${fmtDateTime(i.opens_at)}. This page updates by itself.`,
  ended: () => "This interview has ended.", cancelled: () => "This interview was cancelled.", expired: () => "The time for this interview has passed.",
};

export default function CandidateLiveInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [iv, setIv] = useState(null);
  const load = useCallback(() => liveApi.get(id).then(setIv).catch((e) => { toast.error(apiErrorMessage(e)); navigate("/candidate/live-interviews", { replace: true }); }), [id, navigate]);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  if (!iv) return <div className="container mx-auto py-8"><Skeleton className="h-96" /></div>;
  const canJoin = ["live", "available"].includes(iv.join_state);
  return (
    <div className="container mx-auto max-w-3xl space-y-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/candidate/live-interviews")}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2"><CardTitle>{iv.title}</CardTitle>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_STYLE[iv.join_state]}`}>{STATE_LABEL[iv.join_state]}</span></div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {iv.description && <p className="text-muted-foreground">{iv.description}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <div><span className="text-muted-foreground">When: </span><b>{fmtDateTime(iv.scheduled_start)}</b></div>
            <div><span className="text-muted-foreground">Length: </span><b>{iv.duration_minutes} minutes</b></div>
            <div><span className="text-muted-foreground">Interviewer: </span><b>{iv.host_name}</b></div>
            <div><span className="text-muted-foreground">Meeting code: </span><b>{iv.meeting_code}</b></div>
          </div>
          {WHY[iv.join_state] && <p className="rounded-md bg-muted/50 p-3">{WHY[iv.join_state](iv)}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">How this interview works</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>The interviewer talks to you live on video and asks the questions. There is nothing to type or answer in the app.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3"><div className="mb-1 flex items-center gap-2 font-medium"><Laptop className="h-4 w-4" /> Device 1: your laptop (or main phone)</div>
              <p className="text-muted-foreground">Joins the video call. Your front camera must show your face clearly. Use headphones if possible.</p></div>
            {iv.monitoring_required && <div className="rounded-md border p-3"><div className="mb-1 flex items-center gap-2 font-medium"><Smartphone className="h-4 w-4" /> Device 2: a second phone</div>
              <p className="text-muted-foreground">Place it behind or beside your computer so its <b>rear camera</b> shows your desk and workspace. It only sends video, never sound.</p></div>}
          </div>
          {iv.monitoring_required && <p className="text-muted-foreground">Tip: open the ExamSentinel app on the second phone, sign in with the same account, open this interview and choose <b>Use as monitoring camera</b>. No app? Open this page in the phone's browser and use the button below.</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" disabled={!canJoin} onClick={() => navigate(`/candidate/live-interviews/${id}/room`)}><Laptop className="mr-2 h-4 w-4" /> Join interview on this device</Button>
        {iv.monitoring_required && <Button size="lg" variant="outline" disabled={!canJoin} onClick={() => navigate(`/candidate/live-interviews/${id}/monitor`)}><Smartphone className="mr-2 h-4 w-4" /> Use this phone as monitoring camera</Button>}
      </div>
      {!canJoin && iv.join_state === "upcoming" && <p className="text-sm text-muted-foreground">The buttons unlock {fmtDateTime(iv.opens_at)}.</p>}
    </div>
  );
}

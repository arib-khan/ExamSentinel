import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Square } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VideoTile from "@/components/liveInterview/VideoTile";
import { PhaseBadge } from "@/components/liveInterview/ConnectionBadge";
import PreJoin from "@/components/liveInterview/PreJoin";
import EndedCard from "../rtc/EndedCard";
import useLiveRoom from "../rtc/useLiveRoom";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";

/**
 * SECOND phone, in the browser: sends the REAR camera only (no microphone) to the interviewer.
 * (The ExamSentinel mobile app does the same natively. Phone browsers need https for camera access.)
 */
export default function MonitorCamera() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = useLiveRoom({ interviewId: id, role: "monitor" });
  const [iv, setIv] = useState(null);
  const back = () => navigate(`/candidate/live-interviews/${id}`);
  const secure = typeof window === "undefined" || window.isSecureContext !== false;

  useEffect(() => { liveApi.get(id).then(setIv).catch((e) => { toast.error(apiErrorMessage(e)); navigate("/candidate/live-interviews"); }); }, [id, navigate]);

  // keep the phone screen awake while monitoring (best effort; not all browsers support it)
  useEffect(() => {
    if (room.phase !== "connected" || !navigator.wakeLock) return undefined;
    let lock; navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release?.().catch?.(() => {}); };
  }, [room.phase]);

  if (!iv) return <div className="container mx-auto py-8"><Skeleton className="h-96" /></div>;
  if (room.phase === "ended") return <div className="container mx-auto py-8"><EndedCard reason={room.endedReason || iv.status} interview={iv} onBack={back} backLabel="Back" /></div>;

  if (!["connected", "reconnecting"].includes(room.phase)) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <PreJoin title="Use this phone as the monitoring camera" subtitle="Place this phone behind or beside your computer so the rear camera shows your desk and workspace." mode="monitor" interview={iv}
          phase={room.phase} error={room.error} onJoin={room.join} joinLabel="Start monitoring camera">
          {!secure && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Secure page required</AlertTitle><AlertDescription>Phone browsers only allow the camera on https pages. Open this site with an https:// address.</AlertDescription></Alert>}
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground"><li>Plug the phone in and turn the screen timeout off if you can.</li><li>Lean it against something so the rear camera sees the desk, keyboard and screen.</li><li>Keep this page open for the whole interview.</li></ol>
        </PreJoin>
      </div>
    );
  }
  const me = room.tiles.find((t) => t.isLocal);
  return (
    <div className="mx-auto max-w-xl space-y-3 p-3">
      <div role="status" className="flex items-center justify-between gap-2 rounded-md bg-red-600 p-3 text-white" data-testid="monitoring-banner">
        <span className="flex items-center gap-2 font-bold"><span className="h-3 w-3 animate-pulse rounded-full bg-white" /> MONITORING ACTIVE</span>
        <PhaseBadge phase={room.phase} online={room.online} />
      </div>
      <p className="text-sm text-muted-foreground">Your workspace is being shown live to the interviewer. Nothing is recorded.</p>
      {room.phase === "reconnecting" && <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Reconnecting…</AlertTitle><AlertDescription>Keep this page open.</AlertDescription></Alert>}
      {room.error && <Alert variant="destructive" role="alert"><AlertTriangle className="h-4 w-4" /><AlertTitle>Problem</AlertTitle><AlertDescription>{room.error.message}</AlertDescription></Alert>}
      <VideoTile track={me?.camera} cameraOn={me?.cameraOn} muted label="Workspace camera" sublabel="Rear camera" placeholder="Starting camera…" big />
      <Button variant="destructive" size="lg" className="w-full" onClick={async () => { await room.leave(); toast.info("Monitoring stopped"); back(); }}><Square className="mr-2 h-4 w-4" /> Stop monitoring</Button>
    </div>
  );
}

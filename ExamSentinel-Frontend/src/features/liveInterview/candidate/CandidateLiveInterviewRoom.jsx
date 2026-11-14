import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Camera, CameraOff, Eye, Loader2, LogOut, Mic, MicOff, Volume2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import VideoTile, { AudioSink } from "@/components/liveInterview/VideoTile";
import { PhaseBadge, PresenceBadge, Pill } from "@/components/liveInterview/ConnectionBadge";
import PreJoin from "@/components/liveInterview/PreJoin";
import EndedCard from "../rtc/EndedCard";
import useLiveRoom from "../rtc/useLiveRoom";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";
import { fmtClock } from "../format";

/** The candidate's main device (laptop or phone): talks to the HR interviewer with face + voice. */
export default function CandidateLiveInterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = useLiveRoom({ interviewId: id, role: "candidate" });
  const [iv, setIv] = useState(null);
  const [status, setStatus] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const back = () => navigate("/candidate/live-interviews");

  useEffect(() => { liveApi.get(id).then(setIv).catch((e) => { toast.error(apiErrorMessage(e)); back(); }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const poll = useCallback(async () => { try { setStatus(await liveApi.status(id)); } catch { /* ignore */ } }, [id]);
  useEffect(() => { poll(); const t = setInterval(poll, 4000); return () => clearInterval(t); }, [poll]);

  if (!iv) return <div className="container mx-auto py-8"><Skeleton className="h-96" /></div>;
  if (room.phase === "ended" || (["ended", "cancelled", "expired"].includes(iv.status) && !["connected", "reconnecting"].includes(room.phase))) {
    return <div className="container mx-auto py-8"><EndedCard reason={room.endedReason || iv.status} interview={iv} onBack={back} /></div>;
  }
  const inCall = ["connected", "reconnecting"].includes(room.phase);
  if (!inCall) {
    return (
      <div className="container mx-auto space-y-4 py-8">
        <PreJoin title="Join your interview" subtitle="Use the device with your front camera. Keep your face clearly visible." mode="candidate" interview={iv}
          phase={room.phase} error={room.error} onJoin={room.join} joinLabel="Join interview">
          {iv.monitoring_required && <p className="rounded-md border p-3 text-sm"><Eye className="mr-1 inline h-4 w-4" /> After joining, put your <b>second phone</b> behind or beside your computer and open the ExamSentinel app (or this site) on it → <b>Use as monitoring camera</b>.</p>}
        </PreJoin>
      </div>
    );
  }
  const hr = room.tiles.find((t) => t.role === "host");
  const me = room.tiles.find((t) => t.isLocal);
  const monitorOn = !!status?.participants.monitor.connected;
  return (
    <div className="container mx-auto max-w-5xl space-y-4 py-4">
      {room.tiles.filter((t) => !t.isLocal && t.microphone).map((t) => <AudioSink key={t.identity} track={t.microphone} />)}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{iv.title}</h1>
        <div className="flex items-center gap-2"><PhaseBadge phase={room.phase} online={room.online} /><Pill>{fmtClock(status?.elapsed_seconds)}</Pill></div>
      </div>
      {room.phase === "reconnecting" && <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Reconnecting…</AlertTitle><AlertDescription>Your connection dropped. The call resumes automatically; please stay on this page.</AlertDescription></Alert>}
      {room.error && <Alert variant="destructive" role="alert"><AlertTriangle className="h-4 w-4" /><AlertTitle>Problem</AlertTitle><AlertDescription>{room.error.message} <Button size="sm" variant="outline" className="ml-2" onClick={room.clearError}>Dismiss</Button></AlertDescription></Alert>}
      {room.needsAudioClick && <Alert><Volume2 className="h-4 w-4" /><AlertTitle>Sound is blocked by the browser</AlertTitle><AlertDescription><Button size="sm" onClick={room.enableAudio}>Enable sound</Button></AlertDescription></Alert>}
      {iv.monitoring_required && (
        <div role="status" className={`flex items-center gap-2 rounded-md border p-3 text-sm ${monitorOn ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}>
          <Eye className="h-4 w-4" />
          {monitorOn ? "Workspace camera is connected. The interviewer can see your desk." : "Workspace camera NOT connected. Open ExamSentinel on your second phone → this interview → Use as monitoring camera."}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2"><VideoTile track={hr?.camera} cameraOn={hr?.cameraOn} label={iv.host_name} sublabel="Interviewer" micOn={hr ? hr.micOn : undefined} placeholder="Waiting for the interviewer to join…" big /></div>
        <div className="space-y-2"><VideoTile track={me?.camera} cameraOn={me?.cameraOn} muted mirrored label="You" micOn={me ? me.micOn : room.micOn} />
          <PresenceBadge label="Interviewer" connected={!!hr} /></div>
      </div>
      <div className="sticky bottom-2 flex flex-wrap items-center justify-center gap-3 rounded-lg border bg-background/95 p-3 shadow backdrop-blur">
        <Button variant={room.micOn ? "outline" : "destructive"} onClick={room.toggleMic}>{room.micOn ? <><Mic className="mr-2 h-4 w-4" /> Mute</> : <><MicOff className="mr-2 h-4 w-4" /> Unmute</>}</Button>
        <Button variant={room.camOn ? "outline" : "destructive"} onClick={room.toggleCam}>{room.camOn ? <><Camera className="mr-2 h-4 w-4" /> Camera off</> : <><CameraOff className="mr-2 h-4 w-4" /> Camera on</>}</Button>
        <Button variant="destructive" onClick={() => setConfirmLeave(true)}><LogOut className="mr-2 h-4 w-4" /> Leave</Button>
      </div>
      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Leave the interview?</AlertDialogTitle><AlertDialogDescription>You can rejoin while the interview is still running.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Stay</AlertDialogCancel><AlertDialogAction onClick={async () => { await room.leave(); back(); }}>Leave</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

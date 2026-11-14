import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Camera, CameraOff, Eye, Loader2, Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import VideoTile, { AudioSink } from "@/components/liveInterview/VideoTile";
import { PhaseBadge, PresenceBadge, Pill } from "@/components/liveInterview/ConnectionBadge";
import PreJoin from "@/components/liveInterview/PreJoin";
import EndedCard from "../rtc/EndedCard";
import useLiveRoom from "../rtc/useLiveRoom";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";
import { STATE_LABEL, STATE_STYLE, fmtClock, fmtDateTime } from "../format";

const Row = ({ k, children }) => <div className="flex justify-between gap-3 border-b py-1.5 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{children}</span></div>;

/** HR live dashboard: candidate face + workspace camera side by side, status, and call controls. */
export default function LiveInterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = useLiveRoom({ interviewId: id, role: "host" });
  const [iv, setIv] = useState(null);
  const [status, setStatus] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [, setTick] = useState(0);
  const statusAt = useRef(0);
  const back = () => navigate("/admin/live-interviews");

  useEffect(() => { liveApi.get(id).then(setIv).catch((e) => { toast.error(apiErrorMessage(e)); back(); }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const poll = useCallback(async () => {
    try { const s = await liveApi.status(id); statusAt.current = Date.now(); setStatus(s); } catch { /* keep the last known status */ }
  }, [id]);
  useEffect(() => { poll(); const t = setInterval(poll, 3000); return () => clearInterval(t); }, [poll]);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  const endInterview = async () => {
    setEnding(true);
    try { await liveApi.end(id); await room.leave(); setIv(await liveApi.get(id)); toast.success("Interview ended"); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setEnding(false); setConfirmEnd(false); poll(); }
  };

  if (!iv) return <div className="container mx-auto py-8"><Skeleton className="h-96" /></div>;

  const finished = ["ended", "cancelled", "expired"].includes(iv.status) || room.phase === "ended";
  if (finished && room.phase !== "connected") {
    return <div className="container mx-auto py-8"><EndedCard reason={room.endedReason || iv.status} interview={iv} onBack={back} backLabel="Back to interviews" seconds={iv.started_at && iv.ended_at ? (new Date(iv.ended_at) - new Date(iv.started_at)) / 1000 : undefined} /></div>;
  }

  const inCall = ["connected", "reconnecting"].includes(room.phase);
  if (!inCall) {
    return (
      <div className="container mx-auto space-y-4 py-8">
        <PreJoin title="Live interview" subtitle={iv.status === "live" ? "The interview is in progress. Rejoin to continue." : "Joining starts the interview and lets the candidate in."}
          interview={iv} requireConsent={false} phase={room.phase} error={room.error} onJoin={() => room.join()} joinLabel={iv.status === "live" ? "Rejoin interview" : "Start interview"}>
          <p className="text-sm text-muted-foreground">Candidate: <b>{iv.candidate_name}</b>{iv.monitoring_required ? " · a second phone will send the workspace camera." : ""} Your browser will ask for camera and microphone access.</p>
        </PreJoin>
      </div>
    );
  }

  const cand = room.tiles.find((t) => t.role === "candidate");
  const mon = room.tiles.find((t) => t.role === "monitor");
  const me = room.tiles.find((t) => t.isLocal);
  const candConnected = !!cand;
  const monConnected = !!mon;
  const elapsed = status ? status.elapsed_seconds + (status.status === "live" ? (Date.now() - statusAt.current) / 1000 : 0) : 0;

  return (
    <div className="container mx-auto space-y-4 py-4">
      {room.tiles.filter((t) => !t.isLocal && t.microphone).map((t) => <AudioSink key={t.identity} track={t.microphone} />)}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">ExamSentinel – Live Interview</h1>
          <div className="text-sm text-muted-foreground">{iv.title} · Meeting code <b>{iv.meeting_code}</b></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_STYLE.live}`}>● {STATE_LABEL.live}</span>
          <PhaseBadge phase={room.phase} online={room.online} />
          <Pill tone="idle"><span data-testid="elapsed">{fmtClock(elapsed)}</span></Pill>
        </div>
      </div>

      {room.phase === "reconnecting" && <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Reconnecting…</AlertTitle><AlertDescription>Your connection dropped. The call resumes automatically.</AlertDescription></Alert>}
      {room.error && <Alert variant="destructive" role="alert"><AlertTriangle className="h-4 w-4" /><AlertTitle>Problem</AlertTitle><AlertDescription>{room.error.message} <Button size="sm" variant="outline" className="ml-2" onClick={room.clearError}>Dismiss</Button></AlertDescription></Alert>}
      {room.needsAudioClick && <Alert><Volume2 className="h-4 w-4" /><AlertTitle>Sound is blocked by the browser</AlertTitle><AlertDescription><Button size="sm" onClick={room.enableAudio}>Enable sound</Button></AlertDescription></Alert>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <div className="text-sm font-medium">Candidate face (primary video)</div>
          <VideoTile track={cand?.camera} cameraOn={cand?.cameraOn} label={iv.candidate_name} sublabel="Candidate" micOn={cand ? cand.micOn : undefined} placeholder={candConnected ? "Candidate camera is off" : "Waiting for the candidate to join…"} big />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium"><Eye className="h-4 w-4" /> Workspace camera (secondary)</div>
            <VideoTile track={mon?.camera} cameraOn={mon?.cameraOn} label="Workspace" sublabel="Rear camera" placeholder={iv.monitoring_required ? "Workspace camera not connected. The candidate opens ExamSentinel on a second phone." : "Monitoring is not required for this interview."} />
          </div>
          <div className="w-1/2 min-w-[140px]"><VideoTile track={me?.camera} cameraOn={me?.cameraOn} muted mirrored label="You" micOn={micOnSafe(me, room.micOn)} /></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Candidate information</CardTitle></CardHeader>
          <CardContent>
            <Row k="Name">{iv.candidate_name}</Row><Row k="Email">{iv.candidate_email || "—"}</Row><Row k="Phone">{iv.candidate_phone || "—"}</Row>
            <Row k="Interview ID">#{iv.id} · {iv.meeting_code}</Row>
            <Row k="Scheduled">{fmtDateTime(iv.scheduled_start)} ({iv.duration_minutes} min)</Row>
            <Row k="Started">{fmtDateTime(status?.started_at || iv.started_at)}</Row>
            <Row k="Ended">{status?.ended_at ? fmtDateTime(status.ended_at) : "—"}</Row>
            <Row k="Duration so far">{fmtClock(elapsed)}</Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Connection status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Row k="Your connection"><PhaseBadge phase={room.phase} online={room.online} /></Row>
            <Row k="Candidate"><PresenceBadge label="Candidate" connected={candConnected || !!status?.participants.candidate.connected} /></Row>
            <Row k="Candidate mic / camera">{cand ? `${cand.micOn ? "mic on" : "mic off"} · ${cand.cameraOn ? "camera on" : "camera off"}` : "—"}</Row>
            <Row k="Workspace camera"><PresenceBadge label="Workspace" connected={monConnected || !!status?.participants.monitor.connected} required={!!iv.monitoring_required} /></Row>
            <Row k="Video service">{status ? (status.livekit_available ? "available" : "not reachable") : "checking…"}</Row>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-2 flex flex-wrap items-center justify-center gap-3 rounded-lg border bg-background/95 p-3 shadow backdrop-blur">
        <Button variant={room.micOn ? "outline" : "destructive"} onClick={room.toggleMic}>{room.micOn ? <><Mic className="mr-2 h-4 w-4" /> Mute</> : <><MicOff className="mr-2 h-4 w-4" /> Unmute</>}</Button>
        <Button variant={room.camOn ? "outline" : "destructive"} onClick={room.toggleCam}>{room.camOn ? <><Camera className="mr-2 h-4 w-4" /> Camera off</> : <><CameraOff className="mr-2 h-4 w-4" /> Camera on</>}</Button>
        <Button variant="outline" onClick={room.leave}>Leave (keep interview running)</Button>
        <Button variant="destructive" onClick={() => setConfirmEnd(true)}><PhoneOff className="mr-2 h-4 w-4" /> End interview</Button>
      </div>

      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>End the interview for everyone?</AlertDialogTitle>
            <AlertDialogDescription>The candidate and the workspace camera are disconnected immediately and nobody can rejoin.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep going</AlertDialogCancel><AlertDialogAction disabled={ending} onClick={endInterview}>End interview</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
const micOnSafe = (me, fallback) => (me ? me.micOn : fallback);

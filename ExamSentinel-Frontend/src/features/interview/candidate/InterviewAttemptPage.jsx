import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Maximize, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InterviewQuestion from "@/components/interview/InterviewQuestion";
import InterviewTimer from "@/components/interview/InterviewTimer";
import useInterviewProctoring from "../hooks/useInterviewProctoring";
import { interviewApi, apiErrorCode, apiErrorMessage } from "@/services/InterviewServices/interviewService";

const hasAnswer = (a) => !!(a && ((a.answer_text && a.answer_text.trim()) || a.selected_option));
const toPayload = (qid, a = {}) => ({ question_id: qid, answer_text: a.answer_text ?? null, selected_option: a.selected_option ?? null });

export default function InterviewAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState(null);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [saveState, setSaveState] = useState("saved");
  const [remaining, setRemaining] = useState(0);
  const [syncKey, setSyncKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFull, setIsFull] = useState(!!document.fullscreenElement);

  const answersRef = useRef({}); answersRef.current = answers;
  const dirty = useRef(new Set());
  const saveTimer = useRef(null);
  const closing = useRef(false);

  const goResult = useCallback(() => { closing.current = true; navigate(`/candidate/interview-attempts/${attemptId}/result`, { replace: true }); }, [navigate, attemptId]);

  const applyView = useCallback((v, initial) => {
    if (v.attempt.status !== "in_progress") { goResult(); return false; }
    setRemaining(v.attempt.remaining_seconds); setSyncKey((k) => k + 1);
    if (initial) {
      setView(v);
      const m = {}; for (const a of v.answers) m[a.question_id] = { answer_text: a.answer_text, selected_option: a.selected_option };
      setAnswers(m);
    }
    return true;
  }, [goResult]);

  useEffect(() => {
    interviewApi.attemptView(attemptId).then((v) => applyView(v, true))
      .catch((e) => { toast.error(apiErrorMessage(e)); navigate("/candidate/interviews", { replace: true }); });
  }, [attemptId, applyView, navigate]);

  // keep the on-screen clock honest: re-sync with the server every 60 s
  useEffect(() => {
    const t = setInterval(() => { interviewApi.attemptView(attemptId).then((v) => applyView(v, false)).catch(() => {}); }, 60000);
    return () => clearInterval(t);
  }, [attemptId, applyView]);

  const flush = useCallback(async () => {
    clearTimeout(saveTimer.current);
    if (!dirty.current.size) return true;
    const ids = [...dirty.current]; dirty.current = new Set();
    setSaveState("saving");
    try {
      await interviewApi.saveAnswers(attemptId, ids.map((q) => toPayload(q, answersRef.current[q])));
      setSaveState(dirty.current.size ? "unsaved" : "saved");
      return true;
    } catch (e) {
      const code = apiErrorCode(e);
      if (code === "ATTEMPT_EXPIRED" || code === "ATTEMPT_CLOSED") { toast.info(apiErrorMessage(e)); goResult(); return false; }
      ids.forEach((q) => dirty.current.add(q)); setSaveState("error");
      return false;
    }
  }, [attemptId, goResult]);

  const change = (qid, patch) => {
    setAnswers((p) => ({ ...p, [qid]: { ...p[qid], ...patch } }));
    dirty.current.add(qid); setSaveState("unsaved");
    clearTimeout(saveTimer.current); saveTimer.current = setTimeout(flush, 1500);
  };

  const submit = useCallback(async () => {
    if (submitting || closing.current) return;
    setSubmitting(true);
    try {
      const all = Object.keys(answersRef.current).map((q) => toPayload(Number(q), answersRef.current[q]));
      await interviewApi.submit(attemptId, all);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      toast.success("Interview submitted");
      goResult();
    } catch (e) { toast.error(apiErrorMessage(e)); setSubmitting(false); }
  }, [attemptId, goResult, submitting]);

  const onFlag = useCallback((type) => toast.warning(`Recorded: ${type.replace(/_/g, " ")}`), []);
  useInterviewProctoring(attemptId, !!view?.interview.proctoring_enabled, onFlag);

  useEffect(() => {
    const h = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => { // don't lose work by accident
    const h = (e) => { if (!closing.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => { window.removeEventListener("beforeunload", h); clearTimeout(saveTimer.current); };
  }, []);

  const answered = useMemo(() => (view ? view.questions.filter((q) => hasAnswer(answers[q.question_id])).length : 0), [view, answers]);

  if (!view) return <div className="container mx-auto py-8"><Skeleton className="h-[28rem]" /></div>;
  const q = view.questions[idx];
  const move = async (to) => { await flush(); setIdx(Math.max(0, Math.min(view.questions.length - 1, to))); };

  return (
    <div className="container mx-auto max-w-5xl space-y-4 py-6">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background/95 p-3 backdrop-blur">
        <div>
          <div className="font-semibold">{view.interview.title}</div>
          <div className="text-xs text-muted-foreground">
            {answered}/{view.questions.length} answered ·{" "}
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "All changes saved" : saveState === "error" ? <span className="text-red-600">Save failed – will retry</span> : "Unsaved changes"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {view.interview.proctoring_enabled && !isFull && (
            <Button size="sm" variant="outline" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}><Maximize className="mr-1 h-4 w-4" /> Full screen</Button>
          )}
          <InterviewTimer remainingSeconds={remaining} syncKey={syncKey} onExpire={submit} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Card><CardContent className="space-y-6 pt-6">
          <InterviewQuestion question={q} index={idx} total={view.questions.length} value={answers[q.question_id] || {}}
            onChange={(patch) => change(q.question_id, patch)} disabled={submitting} />
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" disabled={idx === 0 || submitting} onClick={() => move(idx - 1)}>Previous</Button>
            {idx < view.questions.length - 1
              ? <Button onClick={() => move(idx + 1)} disabled={submitting}>Next</Button>
              : <Button onClick={async () => { await flush(); setConfirmOpen(true); }} disabled={submitting}><Send className="mr-1 h-4 w-4" /> Submit</Button>}
          </div>
        </CardContent></Card>

        <Card className="h-fit"><CardContent className="space-y-3 pt-6">
          <div className="text-sm font-medium">Questions</div>
          <div className="grid grid-cols-5 gap-2">
            {view.questions.map((qq, i) => (
              <button key={qq.question_id} type="button" onClick={() => move(i)}
                className={`h-9 rounded-md border text-sm ${i === idx ? "border-primary ring-2 ring-primary/30" : ""} ${hasAnswer(answers[qq.question_id]) ? "bg-emerald-100 text-emerald-900" : "bg-muted/40"}`}>{i + 1}</button>
            ))}
          </div>
          <Button className="w-full" variant="outline" disabled={submitting} onClick={async () => { await flush(); setConfirmOpen(true); }}>Submit interview</Button>
        </CardContent></Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit interview?</AlertDialogTitle>
            <AlertDialogDescription>
              You answered {answered} of {view.questions.length} questions.
              {answered < view.questions.length ? " Unanswered questions will score zero." : ""} You cannot change answers after submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep working</AlertDialogCancel>
            <AlertDialogAction onClick={submit}>Submit now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

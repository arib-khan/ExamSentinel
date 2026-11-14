import { Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { STATE_LABEL, STATE_STYLE, fmtDateTime } from "@/features/liveInterview/format";

const ACTION = { live: "Join now", available: "Join interview", upcoming: "View details", ended: "View", cancelled: "View", expired: "View" };

/** Candidate-facing card for one scheduled interview. */
export default function LiveInterviewCard({ interview, onOpen }) {
  const s = interview.join_state;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">{interview.title}</CardTitle>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLE[s] || ""}`}>{STATE_LABEL[s] || s}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {fmtDateTime(interview.scheduled_start)}</div>
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {interview.duration_minutes} minutes</div>
        <div className="flex items-center gap-2"><User className="h-4 w-4" /> Interviewer: {interview.host_name}</div>
        {s === "upcoming" && <div className="text-xs">You can join from {fmtDateTime(interview.opens_at)}.</div>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={s === "available" || s === "live" ? "default" : "outline"} onClick={() => onOpen(interview)}>{ACTION[s] || "Open"}</Button>
      </CardFooter>
    </Card>
  );
}

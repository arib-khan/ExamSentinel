import { Calendar, Clock, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_STYLE, fmtDate, typeLabel } from "@/features/interview/format";

const ACTION_LABEL = { available: "View & start", active: "Resume", upcoming: "View details", completed: "View result", missed: "View details" };

/** Candidate-facing card for one assigned interview. */
export default function InterviewCard({ interview, onOpen }) {
  const cat = interview.category;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">{interview.title}</CardTitle>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_STYLE[cat] || ""}`}>{cat}</span>
        </div>
        <Badge variant="outline" className="w-fit">{typeLabel(interview.interview_type)}</Badge>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
        {interview.description && <p className="line-clamp-2">{interview.description}</p>}
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {interview.duration_minutes} minutes</div>
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />
          {interview.scheduled_start ? `${fmtDate(interview.scheduled_start)}${interview.scheduled_end ? " – " + fmtDate(interview.scheduled_end) : ""}` : "Available any time"}
        </div>
        <div className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Attempts used: {interview.attempts_used} / {interview.max_attempts}</div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={cat === "available" || cat === "active" ? "default" : "outline"} onClick={() => onOpen(interview)}>
          {ACTION_LABEL[cat] || "Open"}
        </Button>
      </CardFooter>
    </Card>
  );
}

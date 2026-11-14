// Interview module :: candidate interview card (dashboard list)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileQuestion, CalendarDays } from "lucide-react";
import InterviewStatusBadge from "./InterviewStatusBadge";

const TYPE_LABELS = {
  TECHNICAL: "Technical Interview",
  HR: "HR Interview",
  GENERAL: "General Interview",
};

export default function InterviewCard({ interview, onOpen }) {
  const iv = interview;
  const attemptStatus = iv.attempt_status || null;

  const canStart =
    iv.iv_status === "PUBLISHED" &&
    (!attemptStatus || attemptStatus === "IN_PROGRESS");

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{iv.iv_title}</CardTitle>
            <CardDescription>
              {TYPE_LABELS[iv.iv_type] || iv.iv_type}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <InterviewStatusBadge status={attemptStatus || iv.iv_status} />
            {attemptStatus && attemptStatus !== "IN_PROGRESS" && (
              <span className="text-xs text-muted-foreground">
                Attempt: {attemptStatus}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> {iv.iv_duration_minutes} minutes
          </div>
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" /> {iv.question_count} questions
          </div>
          {iv.iv_schedule_start && (
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {new Date(iv.iv_schedule_start).toLocaleString()}
            </div>
          )}
        </div>
        <Button onClick={() => onOpen(iv)} className="w-full">
          {attemptStatus === "IN_PROGRESS"
            ? "Resume Interview"
            : attemptStatus
              ? "View Details / Result"
              : canStart
                ? "View Instructions"
                : "View Details"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Interview module :: shared status badge (candidate + staff views)
import { Badge } from "@/components/ui/badge";

const VARIANTS = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CLOSED: "destructive",
  IN_PROGRESS: "default",
  SUBMITTED: "outline",
  EXPIRED: "destructive",
  EVALUATED: "default",
  PENDING: "secondary",
  COMPLETED: "default",
  ASSIGNED: "outline",
};

const LABELS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  EXPIRED: "Expired",
  EVALUATED: "Evaluated",
  PENDING: "Pending Review",
  COMPLETED: "Completed",
  ASSIGNED: "Assigned",
};

export default function InterviewStatusBadge({ status }) {
  if (!status) return null;
  return <Badge variant={VARIANTS[status] || "secondary"}>{LABELS[status] || status}</Badge>;
}

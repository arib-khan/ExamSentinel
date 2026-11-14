// Interview module :: admin interview list (management section).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2, Send, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Loader from "@/components/reusableComponets/Loader";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";
import ConfirmDialog from "@/features/redux_exam/ConfirmDialog";
import InterviewStatusBadge from "../components/InterviewStatusBadge";
import {
  getInterviewList,
  deleteInterview,
  publishInterview,
  unpublishInterview,
  closeInterview,
} from "@/services/InterviewServices/interviewService";

export default function InterviewListPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInterviewList();
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteInterview(deleteTarget.iv_id);
      if (res.data.status) {
        toast.success(res.data.msg);
        setDeleteTarget(null);
        load();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const statusAction = async (iv, action) => {
    try {
      const res = await action(iv.iv_id);
      if (res.data.status) {
        toast.success(res.data.msg);
        load();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interviews</h1>
          <p className="text-sm text-muted-foreground">
            Create, publish and evaluate interviews — isolated from the exam module.
          </p>
        </div>
        <Button onClick={() => navigate("/admin/interviews/create")}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Interview
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : interviews.length === 0 ? (
        <NoDataFound />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Candidates</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((iv) => (
                <TableRow key={iv.iv_id}>
                  <TableCell className="font-medium">{iv.iv_title}</TableCell>
                  <TableCell>{iv.iv_type}</TableCell>
                  <TableCell><InterviewStatusBadge status={iv.iv_status} /></TableCell>
                  <TableCell className="text-center">{iv.question_count}</TableCell>
                  <TableCell className="text-center">{iv.candidate_count}</TableCell>
                  <TableCell className="text-center">{iv.attempt_count}</TableCell>
                  <TableCell>{iv.iv_duration_minutes} min</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" title="Open"
                        onClick={() => navigate(`/admin/interviews/${iv.iv_id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Edit"
                        onClick={() => navigate(`/admin/interviews/${iv.iv_id}/edit`)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {iv.iv_status === "DRAFT" ? (
                        <Button size="icon" variant="ghost" title="Publish"
                          onClick={() => statusAction(iv, publishInterview)}>
                          <Send className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : iv.iv_status === "PUBLISHED" ? (
                        <>
                          <Button size="icon" variant="ghost" title="Unpublish"
                            onClick={() => statusAction(iv, unpublishInterview)}>
                            <Undo2 className="w-4 h-4 text-amber-600" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Close"
                            onClick={() => statusAction(iv, closeInterview)}>
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      ) : null}
                      <Button size="icon" variant="ghost" title="Delete"
                        onClick={() => setDeleteTarget(iv)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        type="danger"
        title="Delete interview?"
        message={`"${deleteTarget?.iv_title}" and all its questions, assignments, attempts and evaluations will be permanently deleted.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

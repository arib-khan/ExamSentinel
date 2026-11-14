// Interview module :: interview detail (staff) — Questions / Candidates /
// Attempts tabs. Publishing lives in the header.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, UserPlus, ArrowUp, ArrowDown, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Loader from "@/components/reusableComponets/Loader";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";
import { Checkbox } from "@/components/ui/checkbox";
import InterviewStatusBadge from "../components/InterviewStatusBadge";
import {
  getInterview,
  getInterviewQuestions,
  addInterviewQuestions,
  deleteInterviewQuestion,
  reorderInterviewQuestions,
  getInterviewCandidates,
  getAvailableStudents,
  assignInterviewCandidates,
  unassignInterviewCandidate,
  getInterviewAttempts,
  publishInterview,
  unpublishInterview,
} from "@/services/InterviewServices/interviewService";

const QUESTION_TYPES = ["MCQ", "SHORT_ANSWER", "SUBJECTIVE", "TECHNICAL", "CODING", "HR"];
const BLANK_QUESTION = {
  iq_question: "",
  iq_question_type: "SUBJECTIVE",
  iq_category: "",
  iq_difficulty: "MEDIUM",
  iq_marks: 1,
  iq_expected_answer: "",
  iq_options: { A: "", B: "", C: "", D: "" },
  iq_correct_option: "",
};

function SimpleTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div>
      <div className="flex gap-1 border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}

export default function InterviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // add-question dialog
  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [qForm, setQForm] = useState(BLANK_QUESTION);
  const [qSaving, setQSaving] = useState(false);

  // assign dialog
  const [aDialogOpen, setADialogOpen] = useState(false);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [aLoading, setALoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ivRes, qRes, cRes, aRes] = await Promise.all([
        getInterview(id),
        getInterviewQuestions(id),
        getInterviewCandidates(id),
        getInterviewAttempts(id),
      ]);
      if (ivRes.data.status) setInterview(ivRes.data.data);
      else toast.error(ivRes.data.msg || "Interview not found");
      setQuestions(qRes.data?.data || []);
      setCandidates(cRes.data?.data || []);
      setAttempts(aRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load interview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  /* ---------- questions ---------- */

  const handleAddQuestion = async () => {
    if (!qForm.iq_question.trim()) {
      toast.error("Question text is required");
      return;
    }
    setQSaving(true);
    try {
      const payload = { ...qForm };
      if (payload.iq_question_type === "MCQ") {
        payload.iq_options = Object.fromEntries(
          Object.entries(payload.iq_options).filter(([, v]) => v.trim() !== "")
        );
        if (Object.keys(payload.iq_options).length < 2 || !payload.iq_correct_option) {
          toast.error("MCQ needs at least 2 options and a correct option");
          setQSaving(false);
          return;
        }
      } else {
        delete payload.iq_options;
        delete payload.iq_correct_option;
      }
      const res = await addInterviewQuestions(id, [payload]);
      if (res.data.status) {
        toast.success(res.data.msg);
        setQDialogOpen(false);
        setQForm(BLANK_QUESTION);
        loadAll();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Could not add question");
    } finally {
      setQSaving(false);
    }
  };

  const handleDeleteQuestion = async (qid) => {
    try {
      const res = await deleteInterviewQuestion(id, qid);
      if (res.data.status) {
        toast.success(res.data.msg);
        loadAll();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const moveQuestion = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const items = questions.map((q, i) => ({ iq_id: q.iq_id, iq_order: i + 1 }));
    [items[index], items[target]] = [items[target], items[index]];
    try {
      const res = await reorderInterviewQuestions(id, items);
      if (res.data.status) {
        setQuestions((qs) => {
          const copy = [...qs];
          [copy[index], copy[target]] = [copy[target], copy[index]];
          return copy;
        });
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Reorder failed");
    }
  };

  /* ---------- candidates ---------- */

  const openAssignDialog = async () => {
    setADialogOpen(true);
    setALoading(true);
    setSelected({});
    try {
      const res = await getAvailableStudents(id, "");
      setAvailable(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load students");
    } finally {
      setALoading(false);
    }
  };

  const searchAvailable = async (term) => {
    setSearch(term);
    try {
      const res = await getAvailableStudents(id, term);
      setAvailable(res.data?.data || []);
    } catch {
      /* keep previous list */
    }
  };

  const handleAssign = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]).map(Number);
    if (!ids.length) {
      toast.error("Select at least one student");
      return;
    }
    try {
      const res = await assignInterviewCandidates(id, ids);
      if (res.data.status) {
        toast.success(res.data.msg);
        setADialogOpen(false);
        loadAll();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Assign failed");
    }
  };

  const handleUnassign = async (studentId) => {
    try {
      const res = await unassignInterviewCandidate(id, studentId);
      if (res.data.status) {
        toast.success(res.data.msg);
        loadAll();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Unassign failed");
    }
  };

  /* ---------- publish ---------- */

  const togglePublish = async () => {
    try {
      const action =
        interview.iv_status === "PUBLISHED" ? unpublishInterview : publishInterview;
      const res = await action(id);
      if (res.data.status) {
        toast.success(res.data.msg);
        loadAll();
      } else toast.error(res.data.msg);
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  if (loading || !interview) {
    return <div className="flex justify-center py-16"><Loader /></div>;
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/interviews")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> All Interviews
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{interview.iv_title}</h1>
            <InterviewStatusBadge status={interview.iv_status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {interview.iv_type} · {interview.iv_duration_minutes} min ·{" "}
            {interview.iv_total_marks} marks · {questions.length} questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/interviews/${id}/edit`)}>
            Edit Details
          </Button>
          {interview.iv_status === "PUBLISHED" ? (
            <Button variant="outline" onClick={togglePublish}>
              <Undo2 className="w-4 h-4 mr-1.5" /> Unpublish
            </Button>
          ) : interview.iv_status !== "CLOSED" ? (
            <Button onClick={togglePublish}>
              <Send className="w-4 h-4 mr-1.5" /> Publish
            </Button>
          ) : null}
        </div>
      </div>

      <SimpleTabs
        tabs={[
          {
            id: "questions",
            label: `Questions (${questions.length})`,
            content: (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Questions</CardTitle>
                  <Button size="sm" onClick={() => setQDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Question
                  </Button>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <NoDataFound />
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div key={q.iq_id} className="rounded-lg border p-4 flex items-start gap-3">
                          <div className="flex flex-col gap-1 pt-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6"
                              disabled={i === 0} onClick={() => moveQuestion(i, -1)}>
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6"
                              disabled={i === questions.length - 1}
                              onClick={() => moveQuestion(i, 1)}>
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-sm">
                              {i + 1}. {q.iq_question}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="secondary">{q.iq_question_type}</Badge>
                              <Badge variant="outline">{q.iq_marks} marks</Badge>
                              {q.iq_category && <Badge variant="outline">{q.iq_category}</Badge>}
                              <Badge variant="outline">{q.iq_difficulty}</Badge>
                            </div>
                            {q.iq_question_type === "MCQ" && q.iq_options && (
                              <p className="text-xs text-muted-foreground">
                                Options: {Object.entries(q.iq_options).map(([k, v]) => `${k}. ${v}`).join(" · ")}
                                {" — correct: "}<strong>{q.iq_correct_option}</strong>
                              </p>
                            )}
                            {q.iq_expected_answer && (
                              <p className="text-xs text-muted-foreground">
                                Expected: {q.iq_expected_answer}
                              </p>
                            )}
                          </div>
                          <Button size="icon" variant="ghost"
                            onClick={() => handleDeleteQuestion(q.iq_id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            id: "candidates",
            label: `Candidates (${candidates.length})`,
            content: (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Assigned Candidates</CardTitle>
                  <Button size="sm" onClick={openAssignDialog}>
                    <UserPlus className="w-4 h-4 mr-1" /> Assign Candidates
                  </Button>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 ? (
                    <NoDataFound />
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Attempt</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates.map((c) => (
                            <TableRow key={c.ic_id}>
                              <TableCell className="font-mono text-sm">{c.roll_number}</TableCell>
                              <TableCell>{c.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                              <TableCell>
                                {c.attempt_status ? (
                                  <InterviewStatusBadge status={c.attempt_status} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not started</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="icon" variant="ghost" title="Unassign"
                                  onClick={() => handleUnassign(c.ic_student_id)}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            id: "attempts",
            label: `Attempts (${attempts.length})`,
            content: (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attempts & Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  {attempts.length === 0 ? (
                    <NoDataFound />
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Evaluation</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attempts.map((a) => (
                            <TableRow key={a.ia_id}>
                              <TableCell>
                                <div className="font-medium text-sm">{a.student_name}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {a.roll_number}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {a.ia_start_time ? new Date(a.ia_start_time).toLocaleString() : "—"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {a.ia_submission_time
                                  ? new Date(a.ia_submission_time).toLocaleString()
                                  : "—"}
                              </TableCell>
                              <TableCell><InterviewStatusBadge status={a.ia_status} /></TableCell>
                              <TableCell className="text-center text-sm">
                                {a.ia_score != null ? `${a.ia_score} (${a.ia_percentage}%)` : "—"}
                              </TableCell>
                              <TableCell>
                                {a.evaluation_status ? (
                                  <InterviewStatusBadge status={a.evaluation_status} />
                                ) : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline"
                                  onClick={() =>
                                    navigate(`/admin/interviews/${id}/evaluate/${a.ia_id}`)
                                  }>
                                  Evaluate
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
        ]}
      />

      {/* -------- Add question dialog -------- */}
      <Dialog open={qDialogOpen} onOpenChange={setQDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea rows={3} value={qForm.iq_question}
                onChange={(e) => setQForm((f) => ({ ...f, iq_question: e.target.value }))}
                placeholder="Enter the question" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={qForm.iq_question_type}
                  onValueChange={(v) => setQForm((f) => ({ ...f, iq_question_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input type="number" min="1" value={qForm.iq_marks}
                  onChange={(e) =>
                    setQForm((f) => ({ ...f, iq_marks: Number(e.target.value) || 1 }))
                  } />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={qForm.iq_category}
                  onChange={(e) => setQForm((f) => ({ ...f, iq_category: e.target.value }))}
                  placeholder="e.g. Data Structures" />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={qForm.iq_difficulty}
                  onValueChange={(v) => setQForm((f) => ({ ...f, iq_difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["EASY", "MEDIUM", "HARD"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {qForm.iq_question_type === "MCQ" && (
              <div className="space-y-2 rounded-lg border p-3">
                <Label>Options & Correct Answer</Label>
                {["A", "B", "C", "D"].map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <input type="radio" className="accent-primary" name="correct-opt"
                      checked={qForm.iq_correct_option === k}
                      onChange={() => setQForm((f) => ({ ...f, iq_correct_option: k }))} />
                    <span className="text-sm font-medium w-4">{k}.</span>
                    <Input value={qForm.iq_options[k]}
                      onChange={(e) =>
                        setQForm((f) => ({
                          ...f,
                          iq_options: { ...f.iq_options, [k]: e.target.value },
                        }))
                      }
                      placeholder={`Option ${k}`} />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Expected Answer / Evaluation Notes</Label>
              <Textarea rows={3} value={qForm.iq_expected_answer}
                onChange={(e) =>
                  setQForm((f) => ({ ...f, iq_expected_answer: e.target.value }))
                }
                placeholder="What a good answer looks like (helps the evaluator)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestion} disabled={qSaving}>
              {qSaving ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------- Assign candidates dialog -------- */}
      <Dialog open={aDialogOpen} onOpenChange={setADialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Candidates</DialogTitle>
          </DialogHeader>
          <Input placeholder="Search by name, roll number or email"
            value={search} onChange={(e) => searchAvailable(e.target.value)} />
          <div className="space-y-1.5 min-h-40">
            {aLoading ? (
              <div className="flex justify-center py-8"><Loader /></div>
            ) : available.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No more students available to assign.
              </p>
            ) : (
              available.map((s) => (
                <label key={s.id}
                  className="flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={Boolean(selected[s.id])}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({ ...prev, [s.id]: v === true }))
                    }
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{s.roll_number}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setADialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

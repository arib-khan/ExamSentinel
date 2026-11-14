// Interview module :: create / edit interview form.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/reusableComponets/Loader";
import {
  createInterview,
  getInterview,
  updateInterview,
} from "@/services/InterviewServices/interviewService";

const TYPES = ["TECHNICAL", "HR", "GENERAL"];
// future types are supported by the varchar column; extended here when needed

export default function InterviewFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    iv_title: "",
    iv_type: "TECHNICAL",
    iv_description: "",
    iv_instructions: "",
    iv_duration_minutes: 30,
    iv_schedule_start: "",
    iv_schedule_end: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getInterview(id);
        if (res.data.status) {
          const d = res.data.data;
          setForm({
            iv_title: d.iv_title || "",
            iv_type: d.iv_type || "TECHNICAL",
            iv_description: d.iv_description || "",
            iv_instructions: d.iv_instructions || "",
            iv_duration_minutes: d.iv_duration_minutes || 30,
            iv_schedule_start: d.iv_schedule_start ? d.iv_schedule_start.slice(0, 16) : "",
            iv_schedule_end: d.iv_schedule_end ? d.iv_schedule_end.slice(0, 16) : "",
          });
        } else {
          toast.error(res.data.msg || "Interview not found");
          navigate("/admin/interviews");
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load interview");
        navigate("/admin/interviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: typeof e === "string" ? e : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.iv_title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        iv_duration_minutes: Number(form.iv_duration_minutes) || 30,
        iv_schedule_start: form.iv_schedule_start
          ? new Date(form.iv_schedule_start).toISOString()
          : null,
        iv_schedule_end: form.iv_schedule_end
          ? new Date(form.iv_schedule_end).toISOString()
          : null,
      };
      const res = isEdit
        ? await updateInterview(id, payload)
        : await createInterview(payload);
      if (res.data.status) {
        toast.success(res.data.msg);
        navigate(isEdit ? `/admin/interviews/${id}` : `/admin/interviews/${res.data.data.insertId}`);
      } else {
        toast.error(res.data.msg || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Interview" : "Create Interview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the interview settings."
            : "Fill the details, then add questions and assign candidates on the next screen."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="iv_title">Title *</Label>
              <Input id="iv_title" value={form.iv_title} onChange={set("iv_title")}
                placeholder="e.g. Frontend Developer Technical Round" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select value={form.iv_type} onValueChange={set("iv_type")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iv_duration">Duration (minutes)</Label>
                <Input id="iv_duration" type="number" min="1"
                  value={form.iv_duration_minutes} onChange={set("iv_duration_minutes")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iv_description">Description</Label>
              <Textarea id="iv_description" rows={3} value={form.iv_description}
                onChange={set("iv_description")}
                placeholder="Short description shown to candidates" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iv_instructions">Instructions</Label>
              <Textarea id="iv_instructions" rows={6} value={form.iv_instructions}
                onChange={set("iv_instructions")}
                placeholder="Line separated instructions shown before the interview starts" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iv_start">Schedule Start (optional)</Label>
                <Input id="iv_start" type="datetime-local"
                  value={form.iv_schedule_start} onChange={set("iv_schedule_start")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iv_end">Schedule End (optional)</Label>
                <Input id="iv_end" type="datetime-local"
                  value={form.iv_schedule_end} onChange={set("iv_schedule_end")} />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline"
                onClick={() => navigate("/admin/interviews")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Interview"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

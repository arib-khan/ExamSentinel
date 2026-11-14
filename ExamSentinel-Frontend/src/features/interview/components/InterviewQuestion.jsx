// Interview module :: question renderer.
// Renders by iq_question_type: MCQ (radio options) vs open-ended
// (SHORT_ANSWER single line / everything else multi-line textarea).
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function InterviewQuestion({
  question,
  answer,
  onChange,
  disabled = false,
  number,
}) {
  const q = question;
  const isMCQ = q.iq_question_type === "MCQ";
  const options = q.iq_options || {};

  const handleChange = (patch) => onChange?.(q.iq_id, patch);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium leading-relaxed">
          <span className="text-muted-foreground mr-2">Q{number ?? q.iq_order}.</span>
          {q.iq_question}
        </h3>
        <div className="flex shrink-0 gap-1.5">
          <Badge variant="outline">{q.iq_marks} mark{(Number(q.iq_marks) || 0) === 1 ? "" : "s"}</Badge>
          <Badge variant="secondary">{q.iq_question_type?.replace("_", " ")}</Badge>
        </div>
      </div>

      {isMCQ ? (
        <div className="space-y-2.5">
          {Object.entries(options).map(([key, text]) => (
            <label
              key={key}
              className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                answer?.ians_selected_option === key
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                className="mt-1 accent-primary"
                name={`q-${q.iq_id}`}
                checked={answer?.ians_selected_option === key}
                disabled={disabled}
                onChange={() => handleChange({ selected_option: key })}
              />
              <span className="text-sm">
                <strong className="mr-1.5">{key}.</strong>
                {text}
              </span>
            </label>
          ))}
        </div>
      ) : q.iq_question_type === "SHORT_ANSWER" ? (
        <div className="space-y-2">
          <Label htmlFor={`ans-${q.iq_id}`}>Your answer</Label>
          <Input
            id={`ans-${q.iq_id}`}
            value={answer?.ians_answer_text || ""}
            disabled={disabled}
            placeholder="Type a short answer"
            onChange={(e) => handleChange({ answer_text: e.target.value })}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`ans-${q.iq_id}`}>Your answer</Label>
          <Textarea
            id={`ans-${q.iq_id}`}
            rows={q.iq_question_type === "CODING" ? 12 : 6}
            value={answer?.ians_answer_text || ""}
            disabled={disabled}
            className={q.iq_question_type === "CODING" ? "font-mono text-sm" : ""}
            placeholder={
              q.iq_question_type === "CODING"
                ? "// write your code here"
                : "Explain your answer in detail"
            }
            onChange={(e) => handleChange({ answer_text: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

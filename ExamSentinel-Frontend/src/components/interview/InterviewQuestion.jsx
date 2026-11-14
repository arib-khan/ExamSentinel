import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/** One question + its answer control. `value` = { answer_text, selected_option }. */
export default function InterviewQuestion({ question, index, total, value = {}, onChange, disabled }) {
  const isMcq = question.question_type === "mcq";
  const isCoding = question.question_type === "coding";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Question {index + 1} of {total}</span>
        <Badge variant="outline" className="capitalize">{question.question_type.replace("_", " ")}</Badge>
        {question.category && <Badge variant="secondary">{question.category}</Badge>}
        <span>{question.marks} mark{question.marks === 1 ? "" : "s"}</span>
      </div>
      <p className="whitespace-pre-wrap text-lg leading-relaxed">{question.question}</p>

      {isMcq ? (
        <div className="space-y-2" role="radiogroup">
          {(question.options || []).map((o) => {
            const checked = value.selected_option === o.key;
            return (
              <label key={o.key} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${disabled ? "opacity-60" : ""}`}>
                <input type="radio" name={`q-${question.question_id}`} className="mt-1" checked={checked} disabled={disabled}
                  onChange={() => onChange({ selected_option: o.key })} />
                <span><b className="mr-1">{o.key}.</b>{o.text}</span>
              </label>
            );
          })}
          {value.selected_option && !disabled && (
            <button type="button" className="text-xs text-muted-foreground underline" onClick={() => onChange({ selected_option: null })}>Clear selection</button>
          )}
        </div>
      ) : (
        <Textarea
          value={value.answer_text || ""} disabled={disabled}
          onChange={(e) => onChange({ answer_text: e.target.value })}
          rows={isCoding ? 14 : 8}
          spellCheck={!isCoding}
          className={isCoding ? "font-mono text-sm" : ""}
          placeholder={isCoding ? "Write your code here…" : "Type your answer here…"}
        />
      )}
    </div>
  );
}

import { cloneElement, useId } from "react";
import { Label } from "@/components/ui/label";

/** Label + control wired together (htmlFor/id) so clicking the label focuses the field and screen readers announce it. */
export default function Field({ label, children, className, hint }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

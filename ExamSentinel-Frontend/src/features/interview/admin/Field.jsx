import { cloneElement, useId } from "react";
import { Label } from "@/components/ui/label";

/** Label + control wired together (htmlFor/id), so clicking the label focuses the field and screen readers announce it. */
export default function Field({ label, children, className }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
    </div>
  );
}

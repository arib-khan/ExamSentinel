// select-exam-combobox.jsx
import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { set } from "date-fns";

export function ExamCombobox({
  exams,
  setExamId,
  setExamDuration = () => { },
  selectedId,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (selectedId) {
      setValue(selectedId);
    }
  }, [selectedId]);

  const handleSelect = (currentValue) => {
    const selectedExam = exams.find((exam) => exam.exam_id === currentValue);

    if (selectedExam) {
      setValue(currentValue);
      setExamId(currentValue);
      setExamDuration(selectedExam.exam_duration);
      sessionStorage.setItem("examId", currentValue);
    } else {
      setValue("");
      setExamId("");
      setExamDuration(null);
    }

    setOpen(false);
  };

  const selectedExam = exams.find((exam) => exam.exam_id === value);
  const displayText = selectedExam
    ? `${value} - ${selectedExam.exam_name}`
    : "Select Exam";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background hover:bg-gray-100"
          disabled={disabled}
        >
          <span className="block truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-background border rounded-md shadow-md"
        sideOffset={5}
        align="start"
      >
        <Command className="bg-background">
          <CommandInput placeholder="Search exam..." className="h-9" />
          <CommandList className="max-h-[200px] overflow-y-auto">
            {exams.length === 0 ? (
              <CommandEmpty>No exam available</CommandEmpty>
            ) : (
              <CommandGroup>
                {exams.map((exam) => (
                  <CommandItem
                    key={exam.exam_id}
                    value={exam.exam_id}
                    onSelect={() => handleSelect(exam.exam_id)}
                    className="hover:bg-gray-100"
                  >
                    {`${exam.exam_id} - ${exam.exam_name}`}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === exam.exam_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

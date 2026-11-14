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

export function StudentCombobox({
  students,
  setStudentId,
  setStudentName,
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
    const selectedStu = students.find((stud) => stud.id === currentValue);

    if (selectedStu) {
      setValue(currentValue);
      setStudentId(currentValue);
      sessionStorage.setItem("studentId", currentValue);
      if (setStudentName) setStudentName(selectedStu.name);
    } else {
      setValue("");
      setStudentId("");
      if (setStudentName) setStudentName("");
    }

    setOpen(false);
  };

  const selectedStu = students.find((s) => s.id === value);
  const displayText = selectedStu
    ? `${value} - ${selectedStu.name}`
    : "Select Student";

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
          <CommandInput placeholder="Search student..." className="h-9" />
          <CommandList className="max-h-[200px] overflow-y-auto">
            {students.length === 0 ? (
              <CommandEmpty>No student found</CommandEmpty>
            ) : (
              <CommandGroup>
                {students.map((stu) => (
                  <CommandItem
                    key={stu.id}
                    value={stu.id}
                    onSelect={() => handleSelect(stu.id)}
                    className="hover:bg-gray-100"
                  >
                    {`${stu.id} - ${stu.name}`}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === stu.id ? "opacity-100" : "opacity-0"
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

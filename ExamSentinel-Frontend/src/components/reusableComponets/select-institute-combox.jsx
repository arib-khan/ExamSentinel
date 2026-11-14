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

export function InstitutionCombobox({
  institutions,
  setInstId,
  setInstName,
  selectedId, // NEW PROP
  disabled = false, // Optional
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Sync selectedId when passed from outside (e.g., in edit mode)
  useEffect(() => {
    if (selectedId) {
      setValue(selectedId);
    }
  }, [selectedId]);

  const handleSelect = (currentValue) => {
    const selectedInst = institutions.find(
      (inst) => inst.inst_id === currentValue
    );

    if (selectedInst) {
      setValue(currentValue);
      setInstId(currentValue);
      sessionStorage.setItem("instId", currentValue);

      if (setInstName) setInstName(selectedInst.inst_name);
    } else {
      setValue("");
      setInstId("");
      if (setInstName) setInstName("");
    }

    setOpen(false);
  };

  const selectedInst = institutions.find((inst) => inst.inst_id === value);
  const displayText = selectedInst
    ? `${value} - ${selectedInst.inst_name}`
    : "Select Institution";

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
          <CommandInput placeholder="Search institution..." className="h-9" />
          <CommandList className="max-h-[200px] overflow-y-auto">
            {institutions.length === 0 ? (
              <CommandEmpty>No institution available</CommandEmpty>
            ) : (
              <CommandGroup>
                {institutions.map((inst) => (
                  <CommandItem
                    key={inst.inst_id}
                    value={inst.inst_id}
                    onSelect={() => handleSelect(inst.inst_id)}
                    className="hover:bg-gray-100"
                  >
                    {`${inst.inst_id} - ${inst.inst_name}`}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === inst.inst_id ? "opacity-100" : "opacity-0"
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

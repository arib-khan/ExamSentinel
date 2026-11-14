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

export function CenterCombobox({
  centers,
  setCentreId,
  setCentreName,
  selectedId, // NEW PROP
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
    const selectedCenter = centers.find(
      (center) => center.centre_id === currentValue
    );

    if (selectedCenter) {
      setValue(currentValue);
      setCentreId(currentValue);
      sessionStorage.setItem("centreId", currentValue);

      if (setCentreName) setCentreName(selectedCenter.centre_name);
    } else {
      setValue("");
      setCentreId("");
      if (setCentreName) setCentreName("");
    }

    setOpen(false);
  };

  const selectedCenter = centers.find(
    (center) => center.centre_id === value
  );

  const displayText = selectedCenter
    ? `${value} - ${selectedCenter.centre_name}`
    : "Select Centre";

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
          <CommandInput placeholder="Search centre..." className="h-9" />
          <CommandList className="max-h-[200px] overflow-y-auto">
            {centers.length === 0 ? (
              <CommandEmpty>No centres available</CommandEmpty>
            ) : (
              <CommandGroup>
                {centers.map((center) => (
                  <CommandItem
                    key={center.centre_id}
                    value={center.centre_id}
                    onSelect={() => handleSelect(center.centre_id)}
                    className="hover:bg-gray-100"
                  >
                    {`${center.centre_id} - ${center.centre_name}`}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === center.centre_id
                          ? "opacity-100"
                          : "opacity-0"
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

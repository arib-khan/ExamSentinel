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

export function UserRoleCombobox({
    roles,
    setRoleId,
    setRoleName,
    selectedId, // For edit mode
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    // Sync external selectedId
    useEffect(() => {
        if (selectedId) {
            setValue(selectedId);
        }
    }, [selectedId]);

    const handleSelect = (currentValue) => {
        const selectedRole = roles.find((role) => role.user_role_id === currentValue);

        if (selectedRole) {
            setValue(currentValue);
            setRoleId(currentValue);
            if (setRoleName) setRoleName(selectedRole.user_role_name);
        } else {
            setValue("");
            setRoleId("");
            if (setRoleName) setRoleName("");
        }

        setOpen(false);
    };

    const selectedRole = roles.find((role) => role.user_role_id === value);
    const displayText = selectedRole
        ? `${value} - ${selectedRole.user_role_name}`
        : "Select User Role";

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
                    <CommandInput placeholder="Search role..." className="h-9" />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                        {roles.length === 0 ? (
                            <CommandEmpty>No roles available</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {roles.map((role) => (
                                    <CommandItem
                                        key={role.user_role_id}
                                        value={role.user_role_id}
                                        onSelect={() => handleSelect(role.user_role_id)}
                                        className="hover:bg-gray-100"
                                    >
                                        {`${role.user_role_id} - ${role.user_role_name}`}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === role.user_role_id ? "opacity-100" : "opacity-0"
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

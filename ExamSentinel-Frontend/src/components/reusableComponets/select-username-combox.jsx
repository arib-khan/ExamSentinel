// import React, { useEffect, useState } from "react";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";

// export function UserNameCombobox({
//     users,
//     setUserId,
//     setUserName,
//     selectedId, // For edit mode
//     disabled = false,
// }) {
//     const [open, setOpen] = useState(false);
//     const [value, setValue] = useState("");

//     // Sync external selectedId
//     useEffect(() => {
//         if (selectedId) {
//             setValue(selectedId);
//         }
//     }, [selectedId]);

//     const handleSelect = (currentValue) => {
//         const selectedUser = users.find((user) => user.user_id === currentValue);

//         if (selectedUser) {
//             setValue(currentValue);
//             setUserId(currentValue);
//             if (setUserName) setUserName(selectedUser.user_name);
//         } else {
//             setValue("");
//             setUserId("");
//             if (setUserName) setUserName("");
//         }

//         setOpen(false);
//     };

//     const selectedUser = users.find((user) => user.user_id === value);
//     const displayText = selectedUser
//         ? `${value} - ${selectedUser.user_name}`
//         : "Select User Name";

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={open}
//                     className="w-full justify-between bg-background hover:bg-gray-100"
//                     disabled={disabled}
//                 >
//                     <span className="block truncate">{displayText}</span>
//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent
//                 className="w-full p-0 bg-background border rounded-md shadow-md"
//                 sideOffset={5}
//                 align="start"
//             >
//                 <Command className="bg-background">
//                     <CommandInput placeholder="Search role..." className="h-9" />
//                     <CommandList className="max-h-[200px] overflow-y-auto">
//                         {users.length === 0 ? (
//                             <CommandEmpty>No users available</CommandEmpty>
//                         ) : (
//                             <CommandGroup>
//                                 {users.map((user) => (
//                                     <CommandItem
//                                         key={user.user_id}
//                                         value={user.user_id}
//                                         onSelect={() => handleSelect(user.user_id)}
//                                         className="hover:bg-gray-100"
//                                     >
//                                         {`${user.user_id} - ${user.user_name}`}
//                                         <Check
//                                             className={cn(
//                                                 "ml-auto h-4 w-4",
//                                                 value === user.user_id ? "opacity-100" : "opacity-0"
//                                             )}
//                                         />
//                                     </CommandItem>
//                                 ))}
//                             </CommandGroup>
//                         )}
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// }

import React, { useState } from "react";
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

export function UserNameCombobox({
    users,
    setUserId,
    setUserName,
    selectedId, // For edit mode
    disabled = false,
}) {
    const [open, setOpen] = useState(false);

    const handleSelect = (currentValue) => {
        const selectedUser = users.find(
            (user) => user.user_id === currentValue
        );

        setUserId(currentValue);
        setUserName?.(selectedUser?.user_name || "");

        setOpen(false);
    };

    const selectedUser = users.find((user) => user.user_id === selectedId);

    const displayText = selectedUser
        ? `${selectedUser.user_id} - ${selectedUser.user_name}`
        : "Select User Name";

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
                        {users.length === 0 ? (
                            <CommandEmpty>No users available</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {users.map((user) => (
                                    <CommandItem
                                        key={user.user_id}
                                        value={user.user_id}
                                        onSelect={() => handleSelect(user.user_id)}
                                        className="hover:bg-gray-100"
                                    >
                                        {`${user.user_id} - ${user.user_name}`}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedId === user.user_id
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

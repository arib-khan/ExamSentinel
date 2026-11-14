import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
} from 'lucide-react';

// Sortable Header Component
export const SortableHeader = ({ column, children }) => {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
        >
            {children}
            {column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
};

// Status Badge Component
export const StatusBadge = ({ status }) => {
    const variants = {
        'In Progress': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        'Backlog': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        'Todo': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        'Done': 'bg-green-100 text-green-800 hover:bg-green-100',
        'Canceled': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Active': 'bg-green-100 text-green-800 hover:bg-green-100',
        'Inactive': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Yes': 'bg-green-100 text-green-800 hover:bg-green-100',
        'No': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Not Started': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Paused': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        'Submitted': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        'Captured': 'bg-green-100 text-green-800 hover:bg-green-100',
        'Verified': 'bg-green-100 text-green-800 hover:bg-green-100',
        'Not Captured': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Not Verified': 'bg-red-100 text-red-800 hover:bg-red-100',
    };

    return (
        <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
            {status}
        </Badge>
    );
};

// Priority Badge Component
export const PriorityBadge = ({ priority }) => {
    const variants = {
        'High': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Medium': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        'Low': 'bg-green-100 text-green-800 hover:bg-green-100',
        'Hard': 'bg-red-100 text-red-800 hover:bg-red-100',
        'Easy': 'bg-green-100 text-green-800 hover:bg-green-100',
    };

    return (
        <Badge className={variants[priority] || 'bg-gray-100 text-gray-800'}>
            {priority}
        </Badge>
    );
};

// Actions Menu Component
// export const ActionsMenu = ({ row, onEdit, onDelete, onView }) => {
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                     <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//                 {onView && (
//                     <div
//                         className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
//                         onClick={() => onView(row)}
//                     >
//                         View Details
//                     </div>
//                 )}
//                 {onEdit && (
//                     <div
//                         className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
//                         onClick={() => onEdit(row)}
//                     >
//                         Edit
//                     </div>
//                 )}
//                 {onDelete && (
//                     <div
//                         className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent text-red-600"
//                         onClick={() => onDelete(row)}
//                     >
//                         Delete
//                     </div>
//                 )}
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// };

export const ActionsMenu = ({ row, actions }) => {
    if (!actions || actions.length === 0) return null; // hide menu if no actions

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <MoreHorizontal className="h-4 w-4 hover:bg-background" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action, i) => (
                    <div key={i}>{action}</div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
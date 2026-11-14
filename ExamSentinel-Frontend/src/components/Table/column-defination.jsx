import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SortableHeader, StatusBadge, PriorityBadge, ActionsMenu } from './sortable-header.jsx';

// Task Columns Configuration
export const taskColumns = [
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <SortableHeader column={column}>Task</SortableHeader>
        ),
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('id')}</div>
        ),
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue('type')}</Badge>
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <SortableHeader column={column}>Title</SortableHeader>
        ),
        cell: ({ row }) => (
            <div className="max-w-[500px] truncate font-medium">
                {row.getValue('title')}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <PriorityBadge priority={row.getValue('priority')} />,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <ActionsMenu
                row={row}
                onEdit={(row) => console.log('Edit:', row.original)}
                onDelete={(row) => console.log('Delete:', row.original)}
                onView={(row) => console.log('View:', row.original)}
            />
        ),
    },
];

// User Columns Configuration
export const userColumns = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <SortableHeader column={column}>Name</SortableHeader>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
            <Badge variant="secondary">{row.getValue('role')}</Badge>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        accessorKey: 'lastLogin',
        header: ({ column }) => (
            <SortableHeader column={column}>Last Login</SortableHeader>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <ActionsMenu
                row={row}
                onEdit={(row) => console.log('Edit user:', row.original)}
                onDelete={(row) => console.log('Delete user:', row.original)}
                onView={(row) => console.log('View user:', row.original)}
            />
        ),
    },
];

// Sample Data
export const sampleTaskData = [
    {
        id: 'TASK-8782',
        type: 'Documentation',
        title: "You can't compress the program without quantifying the open-source SSD pixel!",
        status: 'In Progress',
        priority: 'Medium',
    },
    {
        id: 'TASK-7878',
        type: 'Documentation',
        title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
        status: 'Backlog',
        priority: 'Medium',
    },
    {
        id: 'TASK-7839',
        type: 'Bug',
        title: 'We need to bypass the neural TCP card!',
        status: 'Todo',
        priority: 'High',
    },
    {
        id: 'TASK-5562',
        type: 'Feature',
        title: 'The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!',
        status: 'Backlog',
        priority: 'Medium',
    },
    {
        id: 'TASK-8686',
        type: 'Feature',
        title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
        status: 'Canceled',
        priority: 'Medium',
    },
    {
        id: 'TASK-1260',
        type: 'Bug',
        title: 'Use the digital TLS panel, then you can transmit the haptic system!',
        status: 'Done',
        priority: 'High',
    },
    {
        id: 'TASK-3401',
        type: 'Feature',
        title: 'Implementing new user authentication system',
        status: 'In Progress',
        priority: 'High',
    },
    {
        id: 'TASK-9912',
        type: 'Bug',
        title: 'Fix memory leak in data processing module',
        status: 'Todo',
        priority: 'High',
    },
    {
        id: 'TASK-4567',
        type: 'Documentation',
        title: 'Update API documentation for v2.0',
        status: 'Backlog',
        priority: 'Low',
    },
    {
        id: 'TASK-2234',
        type: 'Feature',
        title: 'Add dark mode support to dashboard',
        status: 'Done',
        priority: 'Medium',
    },
    {
        id: 'TASK-8782',
        type: 'Documentation',
        title: "You can't compress the program without quantifying the open-source SSD pixel!",
        status: 'In Progress',
        priority: 'Medium',
    },
    {
        id: 'TASK-7878',
        type: 'Documentation',
        title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
        status: 'Backlog',
        priority: 'Medium',
    },
    {
        id: 'TASK-7839',
        type: 'Bug',
        title: 'We need to bypass the neural TCP card!',
        status: 'Todo',
        priority: 'High',
    },
    {
        id: 'TASK-5562',
        type: 'Feature',
        title: 'The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!',
        status: 'Backlog',
        priority: 'Medium',
    },
    {
        id: 'TASK-8686',
        type: 'Feature',
        title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
        status: 'Canceled',
        priority: 'Medium',
    },
    {
        id: 'TASK-1260',
        type: 'Bug',
        title: 'Use the digital TLS panel, then you can transmit the haptic system!',
        status: 'Done',
        priority: 'High',
    },
    {
        id: 'TASK-3401',
        type: 'Feature',
        title: 'Implementing new user authentication system',
        status: 'In Progress',
        priority: 'High',
    },
    {
        id: 'TASK-9912',
        type: 'Bug',
        title: 'Fix memory leak in data processing module',
        status: 'Todo',
        priority: 'High',
    },
    {
        id: 'TASK-4567',
        type: 'Documentation',
        title: 'Update API documentation for v2.0',
        status: 'Backlog',
        priority: 'Low',
    },
    {
        id: 'TASK-2234',
        type: 'Feature',
        title: 'Add dark mode support to dashboard',
        status: 'Done',
        priority: 'Medium',
    },
];

export const sampleUserData = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-01-15',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-01-14',
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Editor',
        status: 'Inactive',
        lastLogin: '2024-01-10',
    },
    {
        id: 4,
        name: 'Alice Wilson',
        email: 'alice@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-01-16',
    },
    {
        id: 5,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'Moderator',
        status: 'Active',
        lastLogin: '2024-01-13',
    },
    {
        id: 6,
        name: 'Diana Prince',
        email: 'diana@example.com',
        role: 'Admin',
        status: 'Inactive',
        lastLogin: '2024-01-08',
    },
];
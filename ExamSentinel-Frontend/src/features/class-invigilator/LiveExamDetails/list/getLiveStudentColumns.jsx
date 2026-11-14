import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getLiveStudentColumns = ({ canExecute, onView }) => [
  {
    accessorKey: "iecsm_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("iecsm_id")}</div>
    ),
    meta: {
      displayName: "ID",
      defaultVisible: false,
    },
  },

  {
    accessorKey: "iecsm_exam_id",
    header: ({ column }) => (
      <SortableHeader column={column}>Cadidate Exam Id</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("iecsm_exam_id")}</div>
    ),
    meta: {
      displayName: "Candidate Exam ID",
      defaultVisible: false,
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Student Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
    meta: {
      displayName: "Student Name",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "roll_number",
    header: "Roll Number",
    cell: ({ row }) => <div>{row.getValue("roll_number") || "-"}</div>,
    meta: {
      displayName: "Roll Number",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "exam_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Exam Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("exam_name")}
      </div>
    ),
    meta: {
      displayName: "Exam Name",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "students_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("students_status");
      const displayStatus = status === null ? "Not Started" : status;
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Status",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "attempt_status",
    header: "Attempt Questions",
    cell: ({ row }) => <div>{row.getValue("attempt_status")}</div>,
    meta: {
      displayName: "Attempt Questions",
      defaultVisible: true,
    },
  },

  {
    accessorKey: "left_time",
    header: "Time Left",
    cell: ({ row }) => (
      <div className="text-green-600 text-sm font-medium">
        {row.getValue("left_time")}m
      </div>
    ),
    meta: {
      displayName: "Time Left",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "iecsm_seat_num",
    header: "Seat Number",
    cell: ({ row }) => <div>{row.getValue("iecsm_seat_num")}</div>,
    meta: {
      displayName: "Seat Number",
      defaultVisible: true,
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsMenu
        row={row}
        actions={[
          <PermissionGate module="admin_controls" action="execute" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView(row.original)}
            >
              View Details
            </div>
          </PermissionGate>,
        ]}
      />
    ),
    meta: {
      displayName: "Actions",
      defaultVisible: canExecute,
    },
  },
];

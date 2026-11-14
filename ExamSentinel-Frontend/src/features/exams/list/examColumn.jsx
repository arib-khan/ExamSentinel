import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getExamColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "exam_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("exam_id")}</div>
    ),
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },
  // {
  //   accessorKey: "exam_inst_id",
  //   header: ({ column }) => <SortableHeader column={column}>Institute ID</SortableHeader>,
  //   cell: ({ row }) => (
  //     <div className="font-medium">{row.getValue("exam_inst_id")}</div>
  //   ),
  // },
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
      defaultVisible: true
    }
  },
  {
    accessorKey: "exam_no_of_students",
    header: "Students",
    cell: ({ row }) => <div>{row.getValue("exam_no_of_students")}</div>,
    meta: {
      displayName: "Students",
      defaultVisible: true
    }
  },
  {
    accessorKey: "exam_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("exam_status");
      const displayStatus = status === "A" ? "Active" : "Inactive";
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Status",
      defaultVisible: true
    }
  },
  {
    accessorKey: "exam_start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("exam_start_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    meta: {
      displayName: "Start Date",
      defaultVisible: true
    }
  },
  {
    accessorKey: "exam_end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("exam_end_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    meta: {
      displayName: "End Date",
      defaultVisible: true
    }
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <ActionsMenu
  //       row={row}
  //       onEdit={() => onEdit("edit", row.original)}
  //       onDelete={() => onDelete("delete", row.original)}
  //       onView={() => onView("view", row.original)}
  //     />
  //   ),
  // },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsMenu
        row={row}
        actions={[
          <PermissionGate module="exams" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="exams" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="exams" action="delete" key="delete">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent text-red-600"
              onClick={() => onDelete("delete", row.original)}
            >
              Delete
            </div>
          </PermissionGate>,
        ]}
      />
    ),
    meta: {
      displayName: "Actions",
      defaultVisible: true
    }
  },
];

import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getStudentColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },
  {
    accessorKey: "student_exam_id",
    header: ({ column }) => <SortableHeader column={column}>Cadidate Exam Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("student_exam_id")}</div>,
    meta: {
      displayName: "Candidate Exam ID",
      defaultVisible: false
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Candidate Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
    meta: {
      displayName: "Candidate Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "roll_number",
    header: "Roll Number",
    cell: ({ row }) => <div>{row.getValue("roll_number") || "-"}</div>,
    meta: {
      displayName: "Roll Number",
      defaultVisible: true
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return (
        <a href={`mailto:${email}`} className="text-blue-600 underline">
          {email}
        </a>
      );
    },
    meta: {
      displayName: "Email",
      defaultVisible: false
    }
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
    meta: {
      displayName: "Phone",
      defaultVisible: false
    }
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <div>{row.getValue("gender")}</div>,
    meta: {
      displayName: "gender",
      defaultVisible: true
    }
  },
  {
    accessorKey: "is_disabled",
    header: "Disability",
    cell: ({ row }) => <div>{row.getValue("is_disabled")}</div>,
    meta: {
      displayName: "is_disabled",
      defaultVisible: false
    }
  },
  {
    accessorKey: "Category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("Category")}</div>,
    meta: {
      displayName: "Category",
      defaultVisible: true
    }
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => <div>{row.getValue("state")}</div>,
    meta: {
      displayName: "State",
      defaultVisible: true
    }
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <div>{row.getValue("city")}</div>,
    meta: {
      displayName: "City",
      defaultVisible: true
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsMenu
        row={row}
        actions={[
          <PermissionGate module="students" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="students" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="students" action="delete" key="delete">
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

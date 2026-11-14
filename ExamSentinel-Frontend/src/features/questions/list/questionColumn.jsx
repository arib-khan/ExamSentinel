import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  PriorityBadge,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getQuestionColumns = ({ onEdit, onDelete, onView }) => [
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
    accessorKey: "exam_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Exam ID</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("exam_name")}</div>
    ),
    meta: {
      displayName: "Exam Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "question",
    header: ({ column }) => (
      <SortableHeader column={column}>Questions</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("question")}
      </div>
    ),
  },
  {
    accessorKey: "option_a",
    header: "Option A",
    cell: ({ row }) => <div>{row.getValue("option_a")}</div>,
    meta: {
      displayName: "Option A",
      defaultVisible: false
    }
  },
  {
    accessorKey: "option_b",
    header: "Option B",
    cell: ({ row }) => <div>{row.getValue("option_b")}</div>,
    meta: {
      displayName: "Option B",
      defaultVisible: false
    }
  },
  {
    accessorKey: "option_c",
    header: "Option C",
    cell: ({ row }) => <div>{row.getValue("option_c")}</div>,
    meta: {
      displayName: "Option C",
      defaultVisible: false
    }
  },
  {
    accessorKey: "option_d",
    header: "Option D",
    cell: ({ row }) => <div>{row.getValue("option_d")}</div>,
    meta: {
      displayName: "Option D",
      defaultVisible: false
    }
  },

  {
    accessorKey: "correct_option",
    header: "Answer",
    cell: ({ row }) => {
      const status = row.getValue("correct_option");
      const capitalizedStatus = status ? status.toUpperCase() : "";
      return <StatusBadge status={capitalizedStatus} />;
    },
    meta: {
      displayName: "Answer",
      defaultVisible: false
    }
  },
  {
    accessorKey: "DifficultyLevel",
    header: "Difficulty Level",
    cell: ({ row }) => {
      const value = row.getValue("DifficultyLevel");
      const priority = value === 0 ? "Easy" : "Hard";
      return <PriorityBadge priority={priority} />;
    },
    meta: {
      displayName: "Difficulty Level",
      defaultVisible: true
    }
  },
  {
    accessorKey: "Language",
    header: "Language",
    cell: ({ row }) => {
      const status = row.getValue("Language");
      const capitalizedStatus = status ? status.toUpperCase() : "";
      return <StatusBadge status={capitalizedStatus} />;
    },
    meta: {
      displayName: "Language",
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
          <PermissionGate module="questions" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="questions" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="questions" action="delete" key="delete">
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


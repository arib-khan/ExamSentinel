import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getUsersColumns = ({ onEdit, onDelete, onView }) => [
  // {
  //   accessorKey: "user_id",
  //   header: ({ column }) => <SortableHeader column={column}>User ID</SortableHeader>,
  //   cell: ({ row }) => <div className="font-medium">{row.getValue("user_id")}</div>,
  // },
  {
    accessorKey: "user_id",
    header: "User ID (Email)",
    cell: ({ row }) => {
      const email = row.getValue("user_id");
      return (
        <a href={`mailto:${email}`} className="text-blue-600 underline">
          {email}
        </a>
      );
    },
    meta: {
      displayName: "User ID",
      defaultVisible: true
    }
  },

  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <SortableHeader column={column}> Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("user_name")}
      </div>
    ),
    meta: {
      displayName: "Name",
      defaultVisible: true
    }
  },

  {
    accessorKey: "user_role_id",
    header: ({ column }) => <SortableHeader column={column}>Role Name</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("user_role_id")}</div>,
    meta: {
      displayName: "Role Name",
      defaultVisible: true
    }
  },
  // {
  //   accessorKey: "user_inst_id",
  //   header: ({ column }) => <SortableHeader column={column}>Institute Name</SortableHeader>,
  //   cell: ({ row }) => <div className="font-medium">{row.getValue("user_inst_id")}</div>,
  // },
  // {
  //   accessorKey: "user_student_id",
  //   header: ({ column }) => <SortableHeader column={column}>Student Name</SortableHeader>,
  //   cell: ({ row }) => <div className="font-medium">{row.getValue("user_student_id")}</div>,
  // },

  {
    accessorKey: "user_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("user_status");
      const displayStatus = status === "A" ? "Active" : "Inactive";
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Status",
      defaultVisible: true
    }
  },
  {
    accessorKey: "user_contact_number_1",
    header: "User Contact 1",
    cell: ({ row }) => <div>{row.getValue("user_contact_number_1") || "-"}</div>,
    meta: {
      displayName: "User Contact 1",
      defaultVisible: true
    }
  },
  {
    accessorKey: "user_contact_number_2",
    header: "User Contact 2",
    cell: ({ row }) => <div>{row.getValue("user_contact_number_2") || "-"}</div>,
    meta: {
      displayName: "User Contact 2",
      defaultVisible: false
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
          <PermissionGate module="user_management" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="user_management" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="user_management" action="delete" key="delete">
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

import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getUsersColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "user_role_id",
    header: ({ column }) => <SortableHeader column={column}>Role Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("user_role_id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },

  {
    accessorKey: "user_role_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Role Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("user_role_name")}
      </div>
    ),
    meta: {
      displayName: "Role Name",
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

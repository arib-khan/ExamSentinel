import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getUsersColumns = ({ onEdit, onView }) => [
  {
    accessorKey: "sys_object_id",
    header: ({ column }) => <SortableHeader column={column}> Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("sys_object_id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },

  {
    accessorKey: "sys_object_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Object Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("sys_object_name")}
      </div>
    ),
    meta: {
      displayName: "Role Name",
      defaultVisible: false
    }
  },
  {
    accessorKey: "sys_object_display_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Object Display Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("sys_object_display_name")}
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
  //       actions={[
  //         <PermissionGate module="object_permission" action="read" key="view">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onView("view", row.original)}
  //           >
  //             View Details
  //           </div>
  //         </PermissionGate>,

  //         <PermissionGate module="object_permission" action="update" key="edit">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onEdit("edit", row.original)}
  //           >
  //             Update Permissions
  //           </div>
  //         </PermissionGate>,

  //       ]}
  //     />
  //   ),
  //   meta: {
  //     displayName: "Actions",
  //     defaultVisible: true
  //   }
  // },
];

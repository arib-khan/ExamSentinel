import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getCenterInventroyColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "center_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("center_id")}</div>
    ),
    meta: {
      displayName: "ID",
      defaultVisible: false // Show by default
    }
  },

  {
    accessorKey: "centre_name",
    header: "Center Name",
    cell: ({ row }) => <div>{row.getValue("centre_name")}</div>,
    meta: {
      displayName: "Center Name",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "center_block",
    header: "Block",
    cell: ({ row }) => <div>{row.getValue("center_block")}</div>,
    meta: {
      displayName: "Block",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "center_hall",
    header: "Hall",
    cell: ({ row }) => <div>{row.getValue("center_hall")}</div>,
    meta: {
      displayName: "Hall",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "center_room",
    header: "Room",
    cell: ({ row }) => <div>{row.getValue("center_room")}</div>,
    meta: {
      displayName: "Room",
      defaultVisible: true // Hide by default
    }
  },
  {
    accessorKey: "center_row",
    header: "Row",
    cell: ({ row }) => <div>{row.getValue("center_row")}</div>,
    meta: {
      displayName: "Row",
      defaultVisible: true // Hide by default
    }
  },
  {
    accessorKey: "center_seat_number",
    header: "Seat Number",
    cell: ({ row }) => <div>{row.getValue("center_seat_number")}</div>,
    meta: {
      displayName: "Seat Number",
      defaultVisible: true // Hide by default
    }
  },
  {
    accessorKey: "center_is_available",
    header: "Availability",
    cell: ({ row }) => {
      const status = row.getValue("center_is_available");
      const displayStatus = status === "Y" ? "Yes" : "No";
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Availability",
      defaultVisible: true
    }
  },
  {
    accessorKey: "center_seat_remark",
    header: ({ column }) => (
      <SortableHeader column={column}>Seat Remark</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("center_seat_remark")}
      </div>
    ),
    meta: {
      displayName: "Seat Remark",
      defaultVisible: true // Show by default
    }
  },

  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <ActionsMenu
  //       row={row}
  //       actions={[
  //         <PermissionGate module="center" action="read" key="view">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onView("view", row.original)}
  //           >
  //             View Details
  //           </div>
  //         </PermissionGate>,

  //         <PermissionGate module="center" action="update" key="edit">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onEdit("edit", row.original)}
  //           >
  //             Edit
  //           </div>
  //         </PermissionGate>,

  //         <PermissionGate module="center" action="delete" key="delete">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent text-red-600"
  //             onClick={() => onDelete("delete", row.original)}
  //           >
  //             Delete
  //           </div>
  //         </PermissionGate>,
  //       ]}
  //     />
  //   ),
  //   meta: {
  //     displayName: "Actions",
  //     defaultVisible: true // Always show actions
  //   }
  // },
];
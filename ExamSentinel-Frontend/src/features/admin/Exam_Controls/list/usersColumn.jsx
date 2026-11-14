import { PermissionGate } from "@/components/PermissionGate";
import {
  PriorityBadge,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";

export const getUsersColumns = () => [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column}> Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },
  {
    accessorKey: "centre_name",
    header: ({ column }) => <SortableHeader column={column}>Center Name</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("centre_name")}</div>,
    meta: {
      displayName: "Center Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "exam_name",
    header: ({ column }) => <SortableHeader column={column}>Exam Name</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("exam_name")}</div>,
    meta: {
      displayName: "Exam Name",
      defaultVisible: true
    }
  },

  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <SortableHeader column={column}>User Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("user_id")}
      </div>
    ),
    meta: {
      displayName: "User Name",
      defaultVisible: true
    }
  },

  {
    accessorKey: "otp",
    header: "OTP (One Time Password) ",
    cell: ({ row }) => <div>{row.getValue("otp") || "-"}</div>,
    meta: {
      displayName: "OTP",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "otp_verifyed",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("otp_verifyed");
      const displayStatus = status === "Yes" ? "Verified" : "Not Verified";
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Status",
      defaultVisible: true,
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date&Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));

      const formatted = date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // for AM/PM
      });

      return <div>{formatted}</div>;
    },
    meta: {
      displayName: "Created Date&Time",
      defaultVisible: false,
    },
  },
  {
    accessorKey: "expires_at",
    header: "Expire Date&Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("expires_at"));

      const formatted = date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // for AM/PM
      });

      return <div>{formatted}</div>;
    },
    meta: {
      displayName: "Expire Date&Time",
      defaultVisible: false,
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <ActionsMenu
  //       row={row}
  //       actions={[
  //         <PermissionGate module="user_management" action="read" key="view">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onView("view", row.original)}
  //           >
  //             View Details
  //           </div>
  //         </PermissionGate>,

  //         <PermissionGate module="user_management" action="update" key="edit">
  //           <div
  //             className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
  //             onClick={() => onEdit("edit", row.original)}
  //           >
  //             Edit
  //           </div>
  //         </PermissionGate>,

  //         <PermissionGate module="user_management" action="delete" key="delete">
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
  //     defaultVisible: true
  //   }
  // },
];

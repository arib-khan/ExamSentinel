import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
  StatusBadge,
} from "@/components/Table/sortable-header";
import { Badge } from "@/components/ui/badge";

export const instituteColumn = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "inst_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("inst_id")}</div>
    ),
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Institute Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("inst_name")}
      </div>
    ),
    meta: {
      displayName: "Institute Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_city",
    header: "City",
    cell: ({ row }) => <div>{row.getValue("inst_city")}</div>,
    meta: {
      displayName: "City",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_state",
    header: "State",
    cell: ({ row }) => <div>{row.getValue("inst_state")}</div>,
    meta: {
      displayName: "State",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_zipcode",
    header: "Zipcode",
    cell: ({ row }) => <div>{row.getValue("inst_zipcode")}</div>,
    meta: {
      displayName: "Zipcode",
      defaultVisible: false
    }
  },
  {
    accessorKey: "inst_contact_1_name",
    header: "Primary Contact",
    cell: ({ row }) => <div>{row.getValue("inst_contact_1_name")}</div>,
    meta: {
      displayName: "Primary Contact",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_contact_1_desig",
    header: "Designation",
    cell: ({ row }) => <div>{row.getValue("inst_contact_1_desig")}</div>,
    meta: {
      displayName: "Designation",
      defaultVisible: false
    }
  },
  {
    accessorKey: "inst_contact_1_email",
    header: "Email",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("inst_contact_1_email")}`}
        className="text-blue-600 underline"
      >
        {row.getValue("inst_contact_1_email")}
      </a>
    ),
    meta: {
      displayName: "Email",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_contact_1_phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("inst_contact_1_phone") || "-"}</div>,
    meta: {
      displayName: "Phone",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("inst_status");
      const displayStatus = status === "A" ? "Active" : "Inactive";
      return <StatusBadge status={displayStatus} />;
    },
    meta: {
      displayName: "Status",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_reg_date",
    header: "Registered On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("inst_reg_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    meta: {
      displayName: "Registered On",
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
          <PermissionGate module="institution" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="institution" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="institution" action="delete" key="delete">
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

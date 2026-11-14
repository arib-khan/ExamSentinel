// import { PermissionGate } from "@/components/PermissionGate";
// import {
//   ActionsMenu,
//   SortableHeader,
// } from "@/components/Table/sortable-header";

// export const getCenterColumns = ({ onEdit, onDelete, onView }) => [
//   {
//     accessorKey: "centre_id",
//     header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
//     cell: ({ row }) => (
//       <div className="font-medium">{row.getValue("centre_id")}</div>
//     ),
//   },
//   {
//     accessorKey: "centre_name",
//     header: ({ column }) => (
//       <SortableHeader column={column}>Center Name</SortableHeader>
//     ),
//     cell: ({ row }) => (
//       <div className="max-w-[300px] truncate font-medium">
//         {row.getValue("centre_name")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "centre_email",
//     header: "Center Email Address",
//     cell: ({ row }) => (
//       <a
//         href={`mailto:${row.getValue("centre_email")}`}
//         className="text-blue-600 underline"
//       >
//         {row.getValue("centre_email")}
//       </a>
//     ),
//   },
//   {
//     accessorKey: "centre_phone",
//     header: "Center Phone Number",
//     cell: ({ row }) => <div>{row.getValue("centre_phone")}</div>,
//   },

//   {
//     accessorKey: "centre_address_line_1",
//     header: "Address Line 1",
//     cell: ({ row }) => <div>{row.getValue("centre_address_line_1")}</div>,
//   },
//   {
//     accessorKey: "centre_address_line_2",
//     header: "Address Line 2",
//     cell: ({ row }) => <div>{row.getValue("centre_address_line_2")}</div>,
//   },
//   {
//     accessorKey: "centre_city",
//     header: "City",
//     cell: ({ row }) => <div>{row.getValue("centre_city")}</div>,
//   },
//   {
//     accessorKey: "centre_state",
//     header: "State",
//     cell: ({ row }) => <div>{row.getValue("centre_state")}</div>,
//   },
//   {
//     accessorKey: "centre_zipcode",
//     header: "Zipcode",
//     cell: ({ row }) => <div>{row.getValue("centre_zipcode")}</div>,
//   },
//   {
//     accessorKey: "centre_contact_1_name",
//     header: "Primary Contact Name",
//     cell: ({ row }) => <div>{row.getValue("centre_contact_1_name")}</div>,
//   },
//   {
//     accessorKey: "centre_contact_1_phone",
//     header: "Phone Number",
//     cell: ({ row }) => <div>{row.getValue("centre_contact_1_phone")}</div>,
//   },
//   {
//     accessorKey: "centre_contact_1_email",
//     header: "Email",
//     cell: ({ row }) => (
//       <a
//         href={`mailto:${row.getValue("centre_contact_1_email")}`}
//         className="text-blue-600 underline"
//       >
//         {row.getValue("centre_contact_1_email")}
//       </a>
//     ),
//   },

//   {
//     id: "actions",
//     header: "Actions",
//     cell: ({ row }) => (
//       <ActionsMenu
//         row={row}
//         actions={[
//           <PermissionGate module="center" action="read" key="view">
//             <div
//               className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
//               onClick={() => onView("view", row.original)}
//             >
//               View Details
//             </div>
//           </PermissionGate>,

//           <PermissionGate module="center" action="update" key="edit">
//             <div
//               className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
//               onClick={() => onEdit("edit", row.original)}
//             >
//               Edit
//             </div>
//           </PermissionGate>,

//           <PermissionGate module="center" action="delete" key="delete">
//             <div
//               className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent text-red-600"
//               onClick={() => onDelete("delete", row.original)}
//             >
//               Delete
//             </div>
//           </PermissionGate>,
//         ]}
//       />
//     ),
//   },
// ];

import { PermissionGate } from "@/components/PermissionGate";
import {
  ActionsMenu,
  SortableHeader,
} from "@/components/Table/sortable-header";

export const getCenterColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "centre_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("centre_id")}</div>
    ),
    meta: {
      displayName: "ID",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "centre_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Center Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("centre_name")}
      </div>
    ),
    meta: {
      displayName: "Center Name",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "centre_email",
    header: "Center Email Address",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("centre_email")}`}
        className="text-blue-600 underline"
      >
        {row.getValue("centre_email")}
      </a>
    ),
    meta: {
      displayName: "Email Address",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "centre_phone",
    header: "Center Phone Number",
    cell: ({ row }) => <div>{row.getValue("centre_phone")}</div>,
    meta: {
      displayName: "Phone Number",
      defaultVisible: true // Show by default
    }
  },
  {
    accessorKey: "centre_address_line_1",
    header: "Address Line 1",
    cell: ({ row }) => <div>{row.getValue("centre_address_line_1")}</div>,
    meta: {
      displayName: "Address Line 1",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_address_line_2",
    header: "Address Line 2",
    cell: ({ row }) => <div>{row.getValue("centre_address_line_2")}</div>,
    meta: {
      displayName: "Address Line 2",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_city",
    header: "City",
    cell: ({ row }) => <div>{row.getValue("centre_city")}</div>,
    meta: {
      displayName: "City",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_state",
    header: "State",
    cell: ({ row }) => <div>{row.getValue("centre_state")}</div>,
    meta: {
      displayName: "State",
      defaultVisible: true // Show by default (5th column)
    }
  },
  {
    accessorKey: "centre_zipcode",
    header: "Zipcode",
    cell: ({ row }) => <div>{row.getValue("centre_zipcode")}</div>,
    meta: {
      displayName: "Zipcode",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_1_name",
    header: "Primary Contact Name",
    cell: ({ row }) => <div>{row.getValue("centre_contact_1_name")}</div>,
    meta: {
      displayName: "Primary Contact Name",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_1_phone",
    header: "Contact Phone",
    cell: ({ row }) => <div>{row.getValue("centre_contact_1_phone")}</div>,
    meta: {
      displayName: "Contact Phone",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_1_email",
    header: "Contact Email",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("centre_contact_1_email")}`}
        className="text-blue-600 underline"
      >
        {row.getValue("centre_contact_1_email")}
      </a>
    ),
    meta: {
      displayName: "Contact Email",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_2_name",
    header: "Secondary Contact Name",
    cell: ({ row }) => <div>{row.getValue("centre_contact_2_name")}</div>,
    meta: {
      displayName: "Secondary Contact Name",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_2_phone",
    header: "Contact Phone",
    cell: ({ row }) => <div>{row.getValue("centre_contact_2_phone")}</div>,
    meta: {
      displayName: "Contact Phone",
      defaultVisible: false // Hide by default
    }
  },
  {
    accessorKey: "centre_contact_2_email",
    header: "Contact Email",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("centre_contact_2_email")}`}
        className="text-blue-600 underline"
      >
        {row.getValue("centre_contact_2_email")}
      </a>
    ),
    meta: {
      displayName: "Contact Email",
      defaultVisible: false // Hide by default
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsMenu
        row={row}
        actions={[
          <PermissionGate module="center" action="read" key="view">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onView("view", row.original)}
            >
              View Details
            </div>
          </PermissionGate>,

          <PermissionGate module="center" action="update" key="edit">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => onEdit("edit", row.original)}
            >
              Edit
            </div>
          </PermissionGate>,

          <PermissionGate module="center" action="delete" key="delete">
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
      defaultVisible: true // Always show actions
    }
  },
];
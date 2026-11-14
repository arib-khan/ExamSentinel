import { SortableHeader, StatusBadge } from "@/components/Table/sortable-header";

export const getInventryColumn = () => [
  {
    accessorKey: "center_seat_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_seat_id")}</div>,
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
      defaultVisible: false
    }
  },
  {
    accessorKey: "center_block",
    header: ({ column }) => <SortableHeader column={column}>Block</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_block")}</div>,
    meta: {
      displayName: "Block",
      defaultVisible: false
    }
  },
  {
    accessorKey: "center_floor_number",
    header: ({ column }) => <SortableHeader column={column}>Floor Number</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_floor_number")}</div>,
    meta: {
      displayName: "Floor Number",
      defaultVisible: false
    }
  },
  {
    accessorKey: "center_hall",
    header: ({ column }) => <SortableHeader column={column}>Hall</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_hall")}</div>,
    meta: {
      displayName: "Hall",
      defaultVisible: false
    }
  },
  {
    accessorKey: "center_seat_number",
    header: ({ column }) => <SortableHeader column={column}>Seat Number</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_seat_number")}</div>,
    meta: {
      displayName: "Seat Number",
      defaultVisible: false
    }
  },
  {
    accessorKey: "center_seat_label",
    header: ({ column }) => <SortableHeader column={column}>Seat Label</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("center_seat_label")}</div>,
    meta: {
      displayName: "Seat Label",
      defaultVisible: true
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


];

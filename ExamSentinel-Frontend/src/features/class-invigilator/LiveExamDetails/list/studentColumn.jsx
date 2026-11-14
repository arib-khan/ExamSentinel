import {
  SortableHeader,
} from "@/components/Table/sortable-header";

export const getStudentColumns = () => [
  {
    accessorKey: "iecsm_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("iecsm_id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: false
    }
  },


  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Student Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
    meta: {
      displayName: "Student Name",
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
    accessorKey: "exam_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Exam Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("exam_name")}
      </div>
    ),
    meta: {
      displayName: "Exam Name",
      defaultVisible: true
    }
  },


  {
    accessorKey: "iecsm_room_name",
    header: "Room Name",
    cell: ({ row }) => <div>{row.getValue("iecsm_room_name") || "-"}</div>,
    meta: {
      displayName: "Room Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "iecsm_seat_num",
    header: "Seat Number",
    cell: ({ row }) => <div>{row.getValue("iecsm_seat_num")}</div>,
    meta: {
      displayName: "Seat Number",
      defaultVisible: true
    }
  },
];

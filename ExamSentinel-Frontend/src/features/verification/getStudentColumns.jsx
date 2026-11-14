import { ActionsMenu, SortableHeader } from "@/components/Table/sortable-header";
import { Button } from "@/components/ui/button";

export const getStudentColumns = ({ onOtp }) => [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "roll_number",
    header: "Roll Number",
    cell: ({ row }) => <div>{row.getValue("roll_number") || "-"}</div>,
  },
  {
    accessorKey: "name",
    header: "Candidate Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onOtp(row.original)}>
          Send OTP
        </Button>
      </div>
    ),
  },
];

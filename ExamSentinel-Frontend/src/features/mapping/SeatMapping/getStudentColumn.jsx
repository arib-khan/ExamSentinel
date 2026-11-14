import { SortableHeader } from "@/components/Table/sortable-header";

export const getStudentColumn = () => [
  {
    accessorKey: "iecsm_id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("iecsm_id")}</div>,
    meta: {
      displayName: "ID",
      defaultVisible: true
    }
  },
  {
    accessorKey: "iecsm_inst_id",
    header: ({ column }) => <SortableHeader column={column}>Institution Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("iecsm_inst_id")}</div>,
    meta: {
      displayName: "Institution ID",
      defaultVisible: false
    }
  },
  {
    accessorKey: "iecsm_exam_id",
    header: ({ column }) => <SortableHeader column={column}>Exam Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("iecsm_exam_id")}</div>,
    meta: {
      displayName: "Exam ID",
      defaultVisible: false
    }
  },
  {
    accessorKey: "iecsm_student_id",
    header: ({ column }) => <SortableHeader column={column}>Student Exam Id</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("iecsm_student_id")}</div>,
    meta: {
      displayName: "Student Exam ID",
      defaultVisible: false
    }
  },
  {
    accessorKey: "roll_number",
    header: ({ column }) => <SortableHeader column={column}>Roll Number</SortableHeader>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("roll_number")}</div>,
    meta: {
      displayName: "Roll Number",
      defaultVisible: true
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
    meta: {
      displayName: "Candidate Name",
      defaultVisible: true
    }
  },
  {
    accessorKey: "inst_name",
    header: "Institution",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("inst_name")}
      </div>
    ),
    meta: {
      displayName: "Institution",
      defaultVisible: false
    }
  },
  {
    accessorKey: "exam_name",
    header: "Exam",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("exam_name")}
      </div>
    ),
    meta: {
      displayName: "Exam",
      defaultVisible: false
    }
  },

];

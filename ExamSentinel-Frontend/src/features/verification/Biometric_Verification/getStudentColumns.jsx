// // getStudentColumns.jsx
// import { ActionsMenu, SortableHeader, StatusBadge } from "@/components/Table/sortable-header";
// import { Button } from "@/components/ui/button";
// import { Armchair, Fingerprint, RockingChair } from "lucide-react";

// export const getStudentColumns = ({ onCaptureFingerprint, onSeatAllotment }) => [
//   {
//     accessorKey: "id",
//     header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
//     cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
//   },

//   {
//     accessorKey: "roll_number",
//     header: "Roll Number",
//     cell: ({ row }) => <div>{row.getValue("roll_number") || "-"}</div>,
//   },
//   {
//     accessorKey: "name",
//     header: "Candidate Name",
//     cell: ({ row }) => <div>{row.getValue("name")}</div>,
//   },
//   {
//     accessorKey: "is_disabled",
//     header: "PWD Status",
//     cell: ({ row }) => {
//       const status = row.getValue("is_disabled");
//       const displayStatus = status === "Y" ? "Yes" : "No";
//       return <StatusBadge status={displayStatus} />;
//     },
//   },
//   {
//     accessorKey: "date_of_birth",
//     header: "Date of Birth",
//     cell: ({ row }) => <div>{row.getValue("date_of_birth") || "-"}</div>,
//   },
//   {
//     id: "actions",
//     header: "Capture Fingerprint",
//     // cell: ({ row }) => (
//     //   <div className="flex gap-2">
//     //     <Button
//     //       size="sm"
//     //       onClick={() => onCaptureFingerprint(row.original)}
//     //       className="gap-2"
//     //     >
//     //       <Fingerprint className="w-4 h-4" />
//     //       Capture Fingerprint
//     //     </Button>
//     //   </div>
//     // ),
//     cell: ({ row }) => {
//       const hasFingerprint = row.getValue("capture") != null; //  here we are checking the capture value 

//       return (
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             onClick={() => onCaptureFingerprint(row.original)}
//             className={`gap-2 ${hasFingerprint ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"} `}
//           >
//             <Fingerprint className="w-4 h-4 " />
//             {hasFingerprint ? "View Fingerprint" : "Capture Fingerprint"}
//           </Button>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "capture",
//     header: "Fingerprint Capture",
//     cell: ({ row }) => {
//       const status = row.getValue("capture");
//       const displayStatus = status != null ? "Captured" : "Not Captured";
//       return <StatusBadge status={displayStatus} />;
//     },
//     meta: {
//       displayName: "Capture",
//       defaultVisible: false
//     }
//   },
//   {
//     id: "action",
//     header: "Seat Allocation",
//     cell: ({ row }) => {
//       const hasSeat = row.getValue("center_seat_label") != null; //  here we are checking the seat id if have value 

//       return (
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             onClick={() => onSeatAllotment(row.original)}
//             className={`gap-2 ${hasSeat ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"} `}
//           >
//             <Armchair className="w-4 h-4" />
//             {hasSeat ? "Already Seat Alloment" : "Seat Allotment"}
//           </Button>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "center_seat_label",
//     header: "Seat Label",
//     cell: ({ row }) => <div>{row.getValue("center_seat_label")}</div>,
//     meta: {
//       displayName: "center_seat_label",
//       defaultVisible: true
//     }
//   },
// ];

// getStudentColumns.jsx
import { ActionsMenu, SortableHeader, StatusBadge } from "@/components/Table/sortable-header";
import { Button } from "@/components/ui/button";
import { Armchair, Fingerprint, Camera } from "lucide-react";

export const getStudentColumns = ({
  onCaptureFingerprint,
  onSeatAllotment,
  onCapturePhoto
}) => [
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
      accessorKey: "is_disabled",
      header: "PWD Status",
      cell: ({ row }) => {
        const status = row.getValue("is_disabled");
        const displayStatus = status === "Y" ? "Yes" : "No";
        return <StatusBadge status={displayStatus} />;
      },
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => <div>{row.getValue("date_of_birth") || "-"}</div>,
    },
    {
      id: "photo_action",
      header: "Capture Photo",
      cell: ({ row }) => {
        // Adjust field name based on your database schema
        const hasPhoto = row.original.photo_capture != null || row.original.captured_photo != null;

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onCapturePhoto(row.original)}
              className={`gap-2 ${hasPhoto ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"} `}
            >
              <Camera className="w-4 h-4" />
              {hasPhoto ? "View Photo" : "Capture Photo"}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "photo_capture",
      header: "Photo Status",
      cell: ({ row }) => {
        const status = row.getValue("photo_capture") || row.original.captured_photo;
        const displayStatus = status != null ? "Captured" : "Not Captured";
        return <StatusBadge status={displayStatus} />;
      },
      meta: {
        displayName: "Photo Capture",
        defaultVisible: false
      }
    },
    {
      id: "actions",
      header: "Capture Fingerprint",
      cell: ({ row }) => {
        const hasFingerprint = row.getValue("capture") != null;

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onCaptureFingerprint(row.original)}
              className={`gap-2 ${hasFingerprint ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"} `}
            >
              <Fingerprint className="w-4 h-4 " />
              {hasFingerprint ? "View Fingerprint" : "Capture Fingerprint"}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "capture",
      header: "Fingerprint Capture",
      cell: ({ row }) => {
        const status = row.getValue("capture");
        const displayStatus = status != null ? "Captured" : "Not Captured";
        return <StatusBadge status={displayStatus} />;
      },
      meta: {
        displayName: "Capture",
        defaultVisible: false
      }
    },

    {
      id: "action",
      header: "Seat Allocation",
      cell: ({ row }) => {
        const hasSeat = row.getValue("center_seat_label") != null;

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onSeatAllotment(row.original)}
              className={`gap-2 ${hasSeat ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"} `}
            >
              <Armchair className="w-4 h-4" />
              {hasSeat ? "Already Seat Allotment" : "Seat Allotment"}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "center_seat_label",
      header: "Seat Label",
      cell: ({ row }) => <div>{row.getValue("center_seat_label") || "-"}</div>,
      meta: {
        displayName: "center_seat_label",
        defaultVisible: true
      }
    },
  ];
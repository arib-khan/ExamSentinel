// // StudentVerificationList.jsx
// import React, { useState } from "react";
// import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Users } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { PermissionGate } from "@/components/PermissionGate";
// import BiometricDialog from "./BiometricDialog";
// import { DataTable } from "@/components/Table/data-table";
// import { getStudentColumns } from "./getStudentColumns";
// import useGetList from "./useGetList";
// import SeatAllocation from "./SeatAllocation";
// import { Card } from "@/components/reusableComponets/Card";

// export default function StudentVerificationList() {
//     const navigate = useNavigate();
//     const { data, loading, error, refetch } = useGetList();


//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);

//     const [seatDialogOpen, setSeatDialogOpen] = useState(false);


//     const handleSeatAllotment = (student) => {
//         setSelectedStudent(student);
//         setSeatDialogOpen(true);
//     };

//     const handleCaptureFingerprint = (student) => {
//         setSelectedStudent(student);
//         setBiometricDialogOpen(true);
//     };

//     const handleVerified = (student, fingerprintData) => {
//         // Handle successful biometric verification
//         // console.log("Verified student:", student);
//         // console.log("Fingerprint data:", fingerprintData);
//         refetch(); // reload updated status
//     };

//     const columns = getStudentColumns({
//         onCaptureFingerprint: handleCaptureFingerprint,
//         onSeatAllotment: handleSeatAllotment,
//     });
//     console.log(data);

//     const totalCapturedFingerprint = data
//         ? data.filter(student => student.capture !== null && student.capture !== undefined).length
//         : 0;
//     const totalSeatAllocated = data
//         ? data.filter(student => student.center_seat_label !== null && student.center_seat_label !== undefined).length
//         : 0;
//     const remainingStudents = data
//         ? data.length - data.filter(student => student.capture !== null && student.capture !== undefined).length
//         : 0;


//     return (
//         <div className="container mx-auto py-8">
//             {loading && <SkeletonCard />}
//             {error && <div className="text-center text-red-500">Failed to load data.</div>}

//             <div className="flex gap-4 mb-3">
//                 <PermissionGate module="students" action="create">
//                     <Button
//                         onClick={() => navigate("/admin/students/register")}
//                         className="gap-2 cursor-pointer"
//                     >
//                         <PlusCircle className="w-4 h-4" />
//                         Register Student
//                     </Button>
//                 </PermissionGate>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
//                 <Card
//                     icon={<Users size={20} className="text-red-400" />}
//                     title="Remaining Students"
//                     value={remainingStudents}
//                     activeBg="bg-red-900 border-red-400"
//                 />
//                 <Card
//                     icon={<Users size={20} className="text-green-400" />}
//                     title="Total Captured Fingerprints"
//                     value={totalCapturedFingerprint}
//                     activeBg="bg-green-900 border-green-400"
//                 />
//                 <Card
//                     icon={<Users size={20} className="text-blue-400" />}

//                     title="Total Seat Allocated"
//                     value={totalSeatAllocated}
//                     activeBg="bg-blue-900 border-blue-400"
//                 />
//             </div>

//             {!loading && data && data.length > 0 && (
//                 <DataTable
//                     data={data}
//                     columns={columns}
//                     searchPlaceholder="Search students..."
//                     tableName="Students"
//                     showExcelExport
//                 />
//             )}

//             {data && data.length === 0 && (
//                 <div className="text-center ">No students found.</div>
//             )}

//             <BiometricDialog
//                 open={biometricDialogOpen}
//                 onClose={() => setBiometricDialogOpen(false)}
//                 student={selectedStudent}
//                 onVerified={handleVerified}
//             />

//             <SeatAllocation
//                 open={seatDialogOpen}
//                 onClose={() => setSeatDialogOpen(false)}
//                 student={selectedStudent}
//                 onVerified={handleVerified}
//             />
//         </div>
//     );
// }
// StudentVerificationList.jsx
import React, { useState } from "react";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import BiometricDialog from "./BiometricDialog";
import PhotoCaptureDialog from "./PhotoCaptureDialog";
import { DataTable } from "@/components/Table/data-table";
import { getStudentColumns } from "./getStudentColumns";
import useGetList from "./useGetList";
import SeatAllocation from "./SeatAllocation";
import { Card } from "@/components/reusableComponets/Card";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function StudentVerificationList() {
    const navigate = useNavigate();
    const { data, loading, error, refetch } = useGetList();

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
    const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
    const [seatDialogOpen, setSeatDialogOpen] = useState(false);

    const handleSeatAllotment = (student) => {
        setSelectedStudent(student);
        setSeatDialogOpen(true);
    };

    const handleCaptureFingerprint = (student) => {
        setSelectedStudent(student);
        setBiometricDialogOpen(true);
    };

    const handleCapturePhoto = (student) => {
        setSelectedStudent(student);
        setPhotoDialogOpen(true);
    };

    const handleVerified = (student, data) => {
        // Handle successful verification (biometric, photo, or seat)
        refetch(); // reload updated status
    };

    const columns = getStudentColumns({
        onCaptureFingerprint: handleCaptureFingerprint,
        onSeatAllotment: handleSeatAllotment,
        onCapturePhoto: handleCapturePhoto,
    });

    // Calculate statistics
    const totalCapturedFingerprint = data
        ? data.filter(student => student.capture !== null && student.capture !== undefined).length
        : 0;

    const totalCapturedPhotos = data
        ? data.filter(student =>
            (student.photo_capture !== null && student.photo_capture !== undefined) ||
            (student.captured_photo !== null && student.captured_photo !== undefined)
        ).length
        : 0;

    const totalSeatAllocated = data
        ? data.filter(student => student.center_seat_label !== null && student.center_seat_label !== undefined).length
        : 0;

    const remainingStudents = data
        ? data.length - data.filter(student => student.capture !== null && student.capture !== undefined).length
        : 0;

    return (
        <div className="container mx-auto py-8">
            {loading && <SkeletonCard />}
            {error && <div className="text-center text-red-500">Failed to load data.</div>}

            <div className="flex gap-4 mb-3">
                <PermissionGate module="students" action="create">
                    <Button
                        onClick={() => navigate("/admin/students/register")}
                        className="gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Register Student
                    </Button>
                </PermissionGate>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                <Card
                    icon={<Users size={20} className="text-red-800" />}
                    title="Remaining Students"
                    value={remainingStudents}
                    activeBg="bg-red-400 border-red-400"
                />
                <Card
                    icon={<Users size={20} className="text-green-800" />}
                    title="Total Captured Fingerprints"
                    value={totalCapturedFingerprint}
                    activeBg="bg-green-400 border-green-400"
                />
                <Card
                    icon={<Camera size={20} className="text-purple-800" />}
                    title="Total Captured Photos"
                    value={totalCapturedPhotos}
                    activeBg="bg-purple-400 border-purple-400"
                />
                <Card
                    icon={<Users size={20} className="text-blue-800" />}
                    title="Total Seat Allocated"
                    value={totalSeatAllocated}
                    activeBg="bg-blue-400 border-blue-400"
                />
            </div>

            {!loading && data && data.length > 0 && (
                <DataTable
                    data={data}
                    columns={columns}
                    searchPlaceholder="Search students..."
                    tableName="Students"
                    showExcelExport
                />
            )}

            {!loading && data && data.length === 0 && <NoDataFound description="No Students data found" />}

            <BiometricDialog
                open={biometricDialogOpen}
                onClose={() => setBiometricDialogOpen(false)}
                student={selectedStudent}
                onVerified={handleVerified}
            />

            <PhotoCaptureDialog
                open={photoDialogOpen}
                onClose={() => setPhotoDialogOpen(false)}
                student={selectedStudent}
                onVerified={handleVerified}
            />

            <SeatAllocation
                open={seatDialogOpen}
                onClose={() => setSeatDialogOpen(false)}
                student={selectedStudent}
                onVerified={handleVerified}
            />
        </div>
    );
}
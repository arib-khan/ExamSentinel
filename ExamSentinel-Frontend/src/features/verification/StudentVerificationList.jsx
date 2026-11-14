
import React, { useState } from "react";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import OTPDialog from "./OTPDialog";
import { DataTable } from "@/components/Table/data-table";
import { getStudentColumns } from "./getStudentColumns";
import useGetList from "../student/list/useGetList";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function StudentVerificationList() {
    const navigate = useNavigate();
    const { data, loading, error, refetch } = useGetList();

    const [otpStudent, setOtpStudent] = useState(null);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);

    const handleOpenOtp = (student) => {
        setOtpStudent(student);
        setOtpDialogOpen(true);
    };

    const handleVerified = (student) => {
        refetch(); // reload updated status
    };

    const columns = getStudentColumns({
        onOtp: handleOpenOtp, // pass otp handler
    });

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

            {!loading && data && data.length > 0 && (
                <DataTable
                    data={data}
                    columns={columns}
                    searchPlaceholder="Search students..."
                    tableName="Students"
                    showExcelExport
                />
            )}

            {!loading && data && data.length === 0 && <NoDataFound description="No Students data found." />}

            <OTPDialog
                open={otpDialogOpen}
                onClose={() => setOtpDialogOpen(false)}
                student={otpStudent}
                onVerified={handleVerified}
            />
        </div>
    );
}

// src/components/list/AbsentStudentList.jsx
import React, { useEffect } from "react";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { DataTable } from "@/components/Table/data-table";
import useGetList from "./useGetList";
import { getLiveStudentColumns } from "./getAbsentLiveStudentColumns";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function AbsentStudentList({ students, loading, error }) {
    // const absentStudents = students?.filter(student => student.students_status !== "Active") || [];



    const columns = getLiveStudentColumns();

    return (
        <div className="container mx-auto py-4">
            {loading && <SkeletonCard />}
            {error && <div className="text-center text-red-500">Failed to load data.</div>}

            {!loading && !error && (
                <DataTable
                    data={students}
                    columns={columns}
                    searchPlaceholder="Search absent students..."
                    tableName="Absent Students"
                />
            )}

            {!loading && students.length === 0 && <NoDataFound />}
        </div>
    );
}
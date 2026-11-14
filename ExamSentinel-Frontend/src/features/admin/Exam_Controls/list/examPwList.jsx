import React, { useImperativeHandle, useState } from "react";
import { getUsersColumns } from "./usersColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/Table/data-table";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function ExamPWList({ ref }) {
  const { data, loading, error, refetch } = useGetList();

  useImperativeHandle(ref, () => ({
    reFetchData: () => {
      refetch();
    }
  }));

  const openForm = (mode, studentData) => {
    setFormMode(mode);
    setSelectedStudent(studentData);
    setShowForm(true);
  };


  const columns = getUsersColumns({
    // onEdit: openForm,
    // onDelete: openForm,
    // onView: openForm,
  });
  const filterConfig = [
    {
      key: "exam_name",
      label: "Exam Name",
      type: "select"
    },
    {
      key: "centre_name",
      label: "Center Name",
      type: "select"
    },
    {
      key: "otp_verifyed",
      label: "OTP Status",
      type: "select"
    },
  ]

  return (
    <div className="container mx-auto py-8">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}


      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search here..."
          tableName="Exam Generated Passwords List"
          showExcelExport
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 &&
        <NoDataFound
          title="No Data found."
          description="No Exam Passwords have been generated yet."
        />
      }
      {/* {!loading && data && data.length === 0 && (
        <div className="text-center text-gray-500">No Data found.</div>
      )} */}
    </div>
  );
}



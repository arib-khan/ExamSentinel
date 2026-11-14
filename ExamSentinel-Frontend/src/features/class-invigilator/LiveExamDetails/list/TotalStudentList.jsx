// import React, { useState } from "react";
// import { getStudentColumns } from "./studentColumn";
// import useGetList from "./useGetList";
// import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
// import { DataTable } from "@/components/Table/data-table";

// export default function StudentList({ setTotatlStudent }) {
//   const { data, loading, error, refetch } = useGetList();
//   if (data && setTotatlStudent) {
//     setTotatlStudent(data.length)
//   }

//   const columns = getStudentColumns({});
//   const filterConfig = [
//     {
//       key: "state",
//       label: "State",
//       type: "select"
//     },
//     {
//       key: "city",
//       label: "City",
//       type: "select"
//     },
//   ]

//   return (
//     <div className="container mx-auto py-8">
//       {loading && <SkeletonCard />}
//       {error && (
//         <div className="text-center text-red-500">Failed to load data.</div>
//       )}

//       {!loading && data && data.length > 0 && (
//         <DataTable
//           data={data}
//           columns={columns}
//           searchPlaceholder="Search students..."
//           tableName="Total_Students"
//           showExcelExport
//           filterConfig={filterConfig}
//         />
//       )}

//       {!loading && data && data.length === 0 && (
//         <div className="text-center text-gray-500">No students found.</div>
//       )}
//     </div>
//   );
// }
// src/components/list/TotalStudentList.jsx
import React, { useEffect } from "react";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { DataTable } from "@/components/Table/data-table";
import { getStudentColumns } from "./studentColumn";
import useGetList from "./useGetList";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function StudentList({ students, loading, error }) {


  const columns = getStudentColumns();

  return (
    <div className="container mx-auto py-4">
      {loading && <SkeletonCard />}
      {error && <div className="text-center text-red-500">Failed to load data.</div>}

      {!loading && students && students.length > 0 && (
        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Search all students..."
          tableName="Total Students"
        />
      )}

      {!loading && students && students.length === 0 && <NoDataFound />}
    </div>
  );
}
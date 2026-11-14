// // src/components/list/LiveStudentList.jsx
// import React, { useEffect } from "react";
// import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
// import { DataTable } from "@/components/Table/data-table";
// import { getLiveStudentColumns } from "./getLiveStudentColumns";
// import { usePermissions } from "@/contexts/PermissionContext";

// export default function LiveStudentList({ students, loading, error }) {
//   const { hasPermission } = usePermissions();
//   const canExecute = hasPermission("admin_controls", 'execute')


//   const columns = getLiveStudentColumns({ canExecute });

//   return (
//     <div className="container mx-auto py-4">
//       {loading && <SkeletonCard />}
//       {error && <div className="text-center text-red-500">Failed to load data.</div>}

//       {!loading && !error && (
//         <DataTable
//           data={students}
//           columns={columns}
//           searchPlaceholder="Search active students..."
//           tableName="Active_Students"
//         />
//       )}

//       {!loading && students.length === 0 && (
//         <div className="text-center text-gray-500">No active students found.</div>
//       )}
//     </div>
//   );
// }
import React, { useState } from "react"
import { SkeletonCard } from "@/components/reusableComponets/LoadingState"
import { DataTable } from "@/components/Table/data-table"
import { getLiveStudentColumns } from "./getLiveStudentColumns"
import { usePermissions } from "@/contexts/PermissionContext"
import StudentDetailsModal from "../Create/StudentDetailsModal"
import { NoDataFound } from "@/components/reusableComponets/NoDataFound"

export default function LiveStudentList({ students, loading, error, refreshKey }) {
  const { hasPermission } = usePermissions()
  const canExecute = hasPermission("admin_controls", "execute")

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleView = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const columns = getLiveStudentColumns({ canExecute, onView: handleView })

  return (
    <div className="container mx-auto py-4">
      {loading && <SkeletonCard />}
      {error && <div className="text-center text-red-500">Failed to load data.</div>}

      {!loading && !error && (
        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Search active students..."
          tableName="Active Students"
        />
      )}

      {!loading && students.length === 0 && <NoDataFound
        description="No active students found."
      />}

      {/* Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshKey={refreshKey}
      />
    </div>
  )
}

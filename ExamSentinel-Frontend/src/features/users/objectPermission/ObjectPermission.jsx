// // import useObjectPer from "./useObjectPer";

// // function ObjectPermission() {
// //     const { data, loading, error, fetchData } = useObjectPer();
// //     console.log(data, "permision");


// //     return <div>ObjectPermission</div>;
// // }

// // export default ObjectPermission;


// import React, { useState } from "react";
// import { getUsersColumns } from "./usersColumn";
// import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
// import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { PlusCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { PermissionGate } from "@/components/PermissionGate";
// import ObjectPermissionForm from "./ObjectPermissionForm";
// import { DataTable } from "@/components/Table/data-table";
// import useObjectPer from "./useObjectPer";

// export default function UserRoleList() {
//     const navigate = useNavigate()
//     const { data, loading, error, fetchData } = useObjectPer();

//     console.log(data);

//     const roleList = data?.roles
//         ? Object.entries(data.roles).map(([roleId, roleData]) => ({
//             role_id: Number(roleId),
//             role_name: roleData.roleName
//         }))
//         : [];


//     const [formMode, setFormMode] = useState(null); // 'view' | 'edit' | 'delete'
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [showForm, setShowForm] = useState(false);

//     const openForm = (mode, studentData) => {
//         setFormMode(mode);
//         setSelectedStudent(studentData);
//         setShowForm(true);
//     };

//     const closeForm = () => {
//         setShowForm(false);
//         setFormMode(null);
//         setSelectedStudent(null);
//         refetch(); // Reload data after update/delete
//     };

//     const columns = getUsersColumns({
//         onEdit: openForm,
//         onView: openForm,
//     });
//     const filterConfig = [
//         {
//             key: "role_id",
//             label: "Role Id",
//             type: "select"
//         },
//     ]

//     console.log(roleList);


//     return (
//         <div className="container mx-auto py-8">
//             {loading && <SkeletonCard />}
//             {error && (
//                 <div className="text-center text-red-500">Failed to load data.</div>
//             )}

//             {/* <div className="flex gap-4 mb-3">
//         <PermissionGate module="user_management" action="create">
//           <Button
//             onClick={() => navigate("/admin/user-role/create")}
//             className="gap-2 cursor-pointer"
//           >
//             <PlusCircle className="w-4 h-4" />
//             Add New User Role
//           </Button>
//         </PermissionGate>

//       </div> */}

//             {!loading && roleList && roleList.length > 0 && (
//                 <DataTable
//                     data={roleList}
//                     columns={columns}
//                     searchPlaceholder="Search objects..."
//                     tableName="Object"
//                     showExcelExport
//                     filterConfig={filterConfig}
//                 />
//             )}

//             {!loading && roleList && roleList.length === 0 && (
//                 <div className="text-center text-gray-500">No Object Permission found.</div>
//             )}

//             {/* Modal Form */}
//             <Dialog open={showForm} onOpenChange={setShowForm}>
//                 <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                         <h2 className="text-lg font-semibold capitalize">
//                             {formMode} User Role Permission
//                         </h2>
//                     </DialogHeader>
//                     <ObjectPermissionForm
//                         mode={formMode}
//                         initialData={selectedStudent}
//                         onClose={closeForm}
//                     />
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }



import React, { useState } from "react";
import { getUsersColumns } from "./usersColumn";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DataTable } from "@/components/Table/data-table";
import ObjectPermissionForm from "./ObjectPermissionForm";
import useObjectPer from "./useObjectPer";
import { PermissionGate } from "@/components/PermissionGate";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function UserRoleList() {
    const { data, loading, error, refetch } = useObjectPer();
    const navigate = useNavigate();

    // Transform dictionary to array for the DataTable
    const roleList = data?.roles
        ? Object.entries(data.roles).map(([roleId, roleData]) => ({
            role_id: Number(roleId),
            role_name: roleData.roleName
        }))
        : [];

    const [formMode, setFormMode] = useState(null); // 'view' | 'edit'
    const [selectedRoleData, setSelectedRoleData] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // This function triggers when Action button is clicked
    const openForm = (mode, rowData) => {
        const roleId = rowData.role_id.toString();

        // 1. Find the full permission details from the original 'data' using the ID
        const fullRoleDetails = data.roles[roleId];

        if (fullRoleDetails) {
            // 2. Merge the ID back in so the form knows which ID to update
            setSelectedRoleData({
                role_id: roleId,
                ...fullRoleDetails
            });
            setFormMode(mode);
            setShowForm(true);
        } else {
            console.error("Role details not found for ID:", roleId);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setFormMode(null);
        setSelectedRoleData(null);
        refetch(); // Reload data after update
    };

    const columns = getUsersColumns({
        onEdit: openForm,
        onView: openForm,
    });

    const filterConfig = [
        { key: "role_id", label: "Role Id", type: "select" },
    ];


    return (
        <div className="container mx-auto py-8">
            {loading && <SkeletonCard />}

            {error && (
                <div className="text-center text-red-500">Failed to load data.</div>
            )}

            <div className="flex gap-4 mb-3">
                <PermissionGate module="user_management" action="create">
                    <Button
                        onClick={() => navigate("/admin/object-permission/add")}
                        className="gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Object Permission
                    </Button>
                </PermissionGate>

            </div>

            {!loading && roleList.length > 0 && (
                <DataTable
                    data={roleList}
                    columns={columns}
                    searchPlaceholder="Search roles..."
                    tableName="Object Permissions"
                    showExcelExport
                    filterConfig={filterConfig}
                />
            )}

            {!loading && roleList.length === 0 && <NoDataFound description="No Roles data found." />}

            {/* Modal Form */}
            <Dialog open={showForm} onOpenChange={(val) => !val && closeForm()}>
                {/* Increased max-width because permission tables are wide */}
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <h2 className="text-lg font-semibold capitalize">
                            {formMode} Permissions: {selectedRoleData?.roleName}
                        </h2>
                    </DialogHeader>

                    {selectedRoleData && (
                        <ObjectPermissionForm
                            mode={formMode}
                            initialData={selectedRoleData}
                            onClose={closeForm}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
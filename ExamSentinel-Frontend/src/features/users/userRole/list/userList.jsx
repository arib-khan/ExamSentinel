import React, { useState } from "react";
import { getUsersColumns } from "./usersColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import UserForm from "../create/UserRoleForms";
import { DataTable } from "@/components/Table/data-table";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function UserRoleList() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useGetList();

  const [formMode, setFormMode] = useState(null); // 'view' | 'edit' | 'delete'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openForm = (mode, studentData) => {
    setFormMode(mode);
    setSelectedStudent(studentData);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormMode(null);
    setSelectedStudent(null);
    refetch(); // Reload data after update/delete
  };

  const columns = getUsersColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });
  const filterConfig = [
    {
      key: "user_role_id",
      label: "Role Id",
      type: "select"
    },
  ]

  return (
    <div className="container mx-auto py-8">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <div className="flex gap-4 mb-3">
        <PermissionGate module="user_management" action="create">
          <Button
            onClick={() => navigate("/admin/user-role/create")}
            className="gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add New User Role
          </Button>
        </PermissionGate>

      </div>

      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search students..."
          tableName="User Roles"
          showExcelExport
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 && <NoDataFound description="No User Role Data Found." />}

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <h2 className="text-lg font-semibold capitalize">
              {formMode} User Role
            </h2>
          </DialogHeader>
          <UserForm
            mode={formMode}
            initialData={selectedStudent}
            onClose={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}



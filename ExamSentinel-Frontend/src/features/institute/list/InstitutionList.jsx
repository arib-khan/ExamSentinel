import React, { useState } from "react";
import { DataTable } from "../../../components/Table/data-table";
import { instituteColumn } from "./instituteColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import InstitutionForm from "../create/AddInstitute";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/contexts/PermissionContext";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function InstitutionList() {
  const { getRoleName } = usePermissions();
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useGetList();

  const [formMode, setFormMode] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openForm = (mode, examData) => {
    setFormMode(mode);
    setSelectedInstitute(examData);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormMode(null);
    setSelectedInstitute(null);
    refetch();
  };

  const columns = instituteColumn({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });

  const filterConfig = [
    {
      key: "inst_status",
      label: "Status",
      type: "select"
    },
    {
      key: "inst_state",
      label: "State",
      type: "select"
    },
    {
      key: "inst_city",
      label: "City",
      type: "select"
    },
  ]

  const handleNewInstitute = () => {
    const role = getRoleName();
    console.log(role);

    navigate(`/${role}/institution/profile`);
  };
  return (
    <div className="container mx-auto py-10">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <div className="flex gap-4 mb-3">
        <PermissionGate module="institution" action="create" >
          <Button
            onClick={handleNewInstitute}
            className="gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Institute
          </Button>
        </PermissionGate>
      </div>

      {/* Render Tables */}
      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search institutes..."
          tableName="Institutes"
          showExcelExport={true}
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 && <NoDataFound description="No Instituation Data Found." />}

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <h2 className="text-lg font-semibold capitalize">
              {formMode} Institute
            </h2>
          </DialogHeader>
          <InstitutionForm
            mode={formMode}
            initialData={selectedInstitute}
            onClose={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

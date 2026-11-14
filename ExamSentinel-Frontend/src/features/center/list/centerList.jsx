import React, { useState } from "react";
import { DataTable } from "../../../components/Table/data-table";
import useGetList from "./useGetList";
import CentreForm from "../create/CenterForm";
import { getCenterColumns } from "./centerColumn";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";
export default function CenterList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGetList();

  const [formMode, setFormMode] = useState(null); // 'view' | 'edit' | 'delete'
  const [selectedExam, setSelectedExam] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openForm = (mode, examData) => {
    setFormMode(mode);
    setSelectedExam(examData);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormMode(null);
    setSelectedExam(null);
    refetch();
  };

  const columns = getCenterColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });


  const filterConfig = [
    {
      key: "centre_state",
      label: "State",
      type: "select"
    },
    {
      key: "centre_city",
      label: "City",
      type: "select"
    },
  ]
  return (
    <div className="container mx-auto py-10">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <div className="flex gap-4 mb-3">
        <PermissionGate module="center" action="create" >
          <Button
            onClick={() => navigate("/admin/center/profile")}
            className="gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Center
          </Button>
        </PermissionGate>

      </div>

      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search Centers..."
          tableName="Centers"
          showExcelExport
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 && <NoDataFound />}

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <h2 className="text-lg font-semibold capitalize">
              {formMode} Center
            </h2>
          </DialogHeader>
          <CentreForm
            mode={formMode}
            initialData={selectedExam}
            onClose={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

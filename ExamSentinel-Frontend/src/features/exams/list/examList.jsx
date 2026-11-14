import React, { useState } from "react";
import { DataTable } from "../../../components/Table/data-table";
import { getExamColumns } from "./examColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import ExamForm from "../update/updateExam";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarClock, PlusCircle } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function ExamList() {
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

  const columns = getExamColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });

  const filterConfig = [
    {
      key: "exam_status",
      label: "Status",
      type: "select"
    },
    // {
    //   key: "exam_inst_id",
    //   label: "Institute Id",
    //   type: "select"
    // },
  ]

  return (
    <div className="container mx-auto py-8">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <div className="flex gap-4 mb-3">
        <PermissionGate module="exams" action="create">
          <Button
            onClick={() => navigate("/admin/exams/create")}
            className="gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Exam
          </Button>
        </PermissionGate>
        <PermissionGate module="exams" action="execute">
          <Button
            onClick={() => navigate("/admin/exams/schedule")}
            className="gap-2 cursor-pointer"
            variant="outline"
          >
            <CalendarClock className="w-4 h-4" />
            Schedule Exam
          </Button>
        </PermissionGate>
      </div>

      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search exams..."
          tableName="Exams"
          showExcelExport
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 && <NoDataFound description="No Exam data found." />}

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <h2 className="text-lg font-semibold capitalize">
              {formMode} Exam
            </h2>
          </DialogHeader>
          <ExamForm
            mode={formMode}
            initialData={selectedExam}
            onClose={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { DataTable } from "../../../components/Table/data-table";
import { getStudentColumns } from "./studentColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import StudentForm from "../create/Registration";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/contexts/PermissionContext";
import { toast } from "sonner";
import { getExamList } from "@/services/ExamServices/examService";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import ConfirmDialog from "@/features/redux_exam/ConfirmDialog";
import { allStudentDelete } from "@/services/StudentServices/studentService";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function StudentList() {
  const { getRoleName } = usePermissions();
  const navigate = useNavigate();

  // 🔹 Exam state
  const [examId, setExamId] = useState(null);
  const [exams, setExams] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 🔹 Fetch students based on examId
  const { data, loading, error, refetch } = useGetList(examId);

  // 🔹 Fetch exam list on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getExamList();
        const list = res.data?.data || [];
        setExams(list);

        // 🔹 Auto-select first exam if none selected
        if (!examId && list.length > 0) {
          const firstExam = list[0];
          setExamId(firstExam.exam_id);
        }
      } catch (err) {
        toast.error("Failed to load exams");
        setExams([]);
      }
    })();
  }, []);


  // Modal & form state
  const [formMode, setFormMode] = useState(null);
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
    refetch(); // reload after update/delete
  };

  const columns = getStudentColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });

  const filterConfig = [

    {
      key: "gender",
      label: "Gender",
      type: "select"
    },
    {
      key: "Category",
      label: "Category",
      type: "select"
    },
    {
      key: "state",
      label: "State",
      type: "select"
    },
    {
      key: "city",
      label: "City",
      type: "select"
    },
    {
      key: "is_disabled",
      label: "Disability",
      type: "select"
    },
  ]


  // 🔹 Show confirmation dialog
  const handleDeleteClick = () => {
    if (!examId) {
      toast.error("Please select an exam first");
      return;
    }
    setShowSubmitModal(true);
  };

  // 🔹 Confirm deletion
  const confirmSubmit = async () => {
    try {
      const response = await allStudentDelete(examId);

      if (response.status) {
        toast.success(response.data.msg || "All questions deleted successfully");
        refetch();
      } else {
        toast.error(response.data.msg || "Failed to delete all questions");
      }
    } catch (error) {
      toast.error("Failed to delete all questions");
      console.error(error);
    } finally {
      setShowSubmitModal(false);
    }
  };

  // 🔹 Cancel deletion
  const cancelSubmit = () => {
    setShowSubmitModal(false);
  };



  const handleStudentNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/students/register`);
  };

  const handleBulkNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/students/bulk-upload`);
  };

  // 🔹 Get selected exam name for confirmation message
  const selectedExamName = exams.find(exam => exam.exam_id === examId)?.exam_name || "this exam";


  return (
    <div className="container mx-auto py-8">
      <h3 className="mb-2">Exam Selection</h3>
      <div className="flex flex-col sm:flex-row sm:items-center  flex-wrap gap-4 mb-4">
        {/* Exam Combobox */}
        <div className="w-full sm:w-1/4">
          <ExamCombobox
            exams={exams}
            selectedId={examId}
            setExamId={setExamId}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <PermissionGate module="students" action="create">
            <Button onClick={handleStudentNavigation} className="gap-2 w-full sm:w-auto">
              <PlusCircle className="w-4 h-4" />
              Register Student
            </Button>
          </PermissionGate>
          <PermissionGate module="students" action="execute">
            <Button onClick={handleBulkNavigation} className="gap-2 w-full sm:w-auto">
              <Upload className="w-4 h-4" />
              Student Bulk Upload
            </Button>
          </PermissionGate>

          <PermissionGate module="students" action="delete">
            <Button
              onClick={handleDeleteClick}
              className="gap-2 cursor-pointer w-full sm:w-auto"
              variant="destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Questions
            </Button>
          </PermissionGate>
        </div>
      </div>


      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search students..."
          tableName="Students"
          filterConfig={filterConfig}
          showExcelExport
        />
      )}

      {!loading && data && data.length === 0 && examId && <NoDataFound description="No Students Data Found." />}


      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader >
            {/* <h2 className="text-lg font-semibold capitalize">
              {formMode} Candidate
            </h2> */}
          </DialogHeader>
          <div className="overflow-y-auto">
            <StudentForm
              mode={formMode}
              initialData={selectedStudent}
              onClose={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitModal}
        title="Delete All Students"
        message={`Are you sure you want to delete all Students for "${selectedExamName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={cancelSubmit}
        type="warning"
      />
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { DataTable } from "../../../components/Table/data-table";
// import { getQuestionColumns } from "./questionColumn";
// import useGetList from "./useGetList";
// import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
// import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// import AddQuestionForm from "../create/addQuestions";
// import UpdateQuestion from "../create/UpdateQuestion";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Trash, Upload } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { PermissionGate } from "@/components/PermissionGate";
// import { usePermissions } from "@/contexts/PermissionContext";
// import { toast } from "sonner";
// import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
// import { getExamList } from "@/services/ExamServices/examService";
// import QuestionForm from "../create/QuestionForm";
// import { allQuestionDelete } from "@/services/QuestionServices/questionService";
// import ConfirmDialog from "@/features/redux_exam/ConfirmDialog";

// export default function QuestionList() {
//   const { getRoleName } = usePermissions();
//   const navigate = useNavigate()

//   // 🔹 Exam state
//   const [examId, setExamId] = useState(null);
//   const [exams, setExams] = useState([]);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);

//   // 🔹 Fetch students based on examId
//   const { data, loading, error, refetch } = useGetList(examId);

//   // 🔹 Fetch exam list on mount
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getExamList();
//         const list = res.data?.data || [];
//         setExams(list);

//         // 🔹 Auto-select first exam if none selected
//         if (!examId && list.length > 0) {
//           const firstExam = list[0];
//           setExamId(firstExam.exam_id);
//         }
//       } catch (err) {
//         toast.error("Failed to load exams");
//         setExams([]);
//       }
//     })();
//   }, []);



//   const [formMode, setFormMode] = useState(null); // 'view' | 'edit' | 'delete'
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   const openForm = (mode, examData) => {
//     setFormMode(mode);
//     setSelectedExam(examData);
//     setShowForm(true);
//   };

//   const closeForm = () => {
//     setShowForm(false);
//     setFormMode(null);
//     setSelectedExam(null);
//     refetch();
//   };

//   const columns = getQuestionColumns({
//     onEdit: openForm,
//     onDelete: openForm,
//     onView: openForm,
//   });


//   const filterConfig = [
//     {
//       key: "DifficultyLevel",
//       label: "Difficulty Level",
//       type: "select"
//     },
//     {
//       key: "Language",
//       label: "Language",
//       type: "select"
//     },
//   ]

//   const handleDelete = async () => {
//     if (!examId) return;
//     setShowSubmitModal(true);

//     try {
//       const response = await allQuestionDelete(examId);

//       if (response.status) {
//         toast.success(response.data.msg || "All questions deleted successfully");
//         refetch();
//       } else {
//         toast.error(response.data.msg || "Failed to delete all questions");
//       }

//     } catch (error) {
//       toast.error("Failed to delete all questions");
//       console.error(error);
//     }
//   }

//   const handleQuestionNavigation = () => {
//     const role = getRoleName();
//     navigate(`/${role}/questions/add`);
//   };
//   const handleBulkNavigation = () => {
//     const role = getRoleName();
//     navigate(`/${role}/questions/bulk-upload`);
//   };

//   return (
//     <div className="container mx-auto py-10">
//       {loading && <SkeletonCard />}
//       {error && (
//         <div className="text-center text-red-500">Failed to load data.</div>
//       )}

//       <h3 className="mb-2">Exam Selection</h3>
//       <div className="flex flex-col sm:flex-row sm:items-center  flex-wrap gap-4 mb-4">
//         {/* Exam Combobox */}
//         <div className="w-full sm:w-1/3">
//           <ExamCombobox
//             exams={exams}
//             selectedId={examId}
//             setExamId={setExamId}
//           />
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-4">
//           <PermissionGate module="questions" action="create">
//             <Button
//               onClick={handleQuestionNavigation}
//               className="gap-2 cursor-pointer w-full sm:w-auto"
//             >
//               <PlusCircle className="w-4 h-4" />
//               Add Question
//             </Button>
//           </PermissionGate>

//           <PermissionGate module="questions" action="execute">
//             <Button
//               onClick={handleBulkNavigation}
//               className="gap-2 cursor-pointer w-full sm:w-auto"
//               variant="outline"
//             >
//               <Upload className="w-4 h-4" />
//               Upload Bulk Questions
//             </Button>
//           </PermissionGate>
//           <PermissionGate module="questions" action="execute">
//             <Button
//               onClick={handleDelete}
//               className="gap-2 cursor-pointer w-full sm:w-auto"
//               variant="outline"
//             >
//               <Trash className="w-4 h-4" />
//               Delete All Questions
//             </Button>
//           </PermissionGate>
//         </div>
//       </div>

//       {!loading && data && data.length > 0 && (
//         <DataTable
//           data={data}
//           columns={columns}
//           searchPlaceholder="Search questions..."
//           tableName="Questions"
//           showExcelExport
//           filterConfig={filterConfig}
//         />
//       )}

//       {!loading && data && data.length === 0 && (
//         <div className="text-center text-gray-500">No questions found.</div>
//       )}

//       {/* Modal Form */}
//       <Dialog open={showForm} onOpenChange={setShowForm}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             {/* <h2 className="text-lg font-semibold capitalize">
//               {formMode} Question
//             </h2> */}
//           </DialogHeader>
//           <div className="overflow-y-auto">
//             <QuestionForm
//               mode={formMode}
//               initialData={selectedExam}
//               onClose={closeForm}
//             />
//           </div>
//         </DialogContent>
//       </Dialog>

//       <ConfirmDialog
//         isOpen={showSubmitModal}
//         title="Delete All Questions"
//         message={`Are you sure you want to delete all questions for this exam? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         onConfirm={confirmSubmit}
//         onCancel={cancelSubmit}
//         type="warning"
//       />
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { DataTable } from "../../../components/Table/data-table";
import { getQuestionColumns } from "./questionColumn";
import useGetList from "./useGetList";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import AddQuestionForm from "../create/addQuestions";
import UpdateQuestion from "../create/UpdateQuestion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/contexts/PermissionContext";
import { toast } from "sonner";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import QuestionForm from "../create/QuestionForm";
import { allQuestionDelete } from "@/services/QuestionServices/questionService";
import ConfirmDialog from "@/features/redux_exam/ConfirmDialog";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

export default function QuestionList() {
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

  const columns = getQuestionColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });

  const filterConfig = [
    {
      key: "DifficultyLevel",
      label: "Difficulty Level",
      type: "select"
    },
    {
      key: "Language",
      label: "Language",
      type: "select"
    },
  ];

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
      const response = await allQuestionDelete(examId);

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

  const handleQuestionNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/questions/add`);
  };

  const handleBulkNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/questions/bulk-upload`);
  };

  // 🔹 Get selected exam name for confirmation message
  const selectedExamName = exams.find(exam => exam.exam_id === examId)?.exam_name || "this exam";

  return (
    <div className="container mx-auto py-10">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <h3 className="mb-2">Exam Selection</h3>
      <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 mb-4">
        {/* Exam Combobox */}
        <div className="w-full sm:w-1/3">
          <ExamCombobox
            exams={exams}
            selectedId={examId}
            setExamId={setExamId}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <PermissionGate module="questions" action="create">
            <Button
              onClick={handleQuestionNavigation}
              className="gap-2 cursor-pointer w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Add Question
            </Button>
          </PermissionGate>

          <PermissionGate module="questions" action="execute">
            <Button
              onClick={handleBulkNavigation}
              className="gap-2 cursor-pointer w-full sm:w-auto"
              variant="outline"
            >
              <Upload className="w-4 h-4" />
              Upload Bulk Questions
            </Button>
          </PermissionGate>

          <PermissionGate module="questions" action="delete">
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

      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search questions..."
          tableName="Questions"
          showExcelExport
          filterConfig={filterConfig}
        />
      )}

      {!loading && data && data.length === 0 && <NoDataFound description="No Question Data found." />}

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* <h2 className="text-lg font-semibold capitalize">
              {formMode} Question
            </h2> */}
          </DialogHeader>
          <div className="overflow-y-auto">
            <QuestionForm
              mode={formMode}
              initialData={selectedExam}
              onClose={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitModal}
        title="Delete All Questions"
        message={`Are you sure you want to delete all questions for "${selectedExamName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={cancelSubmit}
        type="warning"
      />
    </div>
  );
}
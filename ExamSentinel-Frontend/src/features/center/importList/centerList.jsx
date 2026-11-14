import React, { useEffect, useState } from "react";
import { DataTable } from "../../../components/Table/data-table";
import useGetList from "./useGetList";
import CentreForm from "../create/CenterForm";
import { getCenterInventroyColumns } from "./centerColumn";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PermissionGate } from "@/components/PermissionGate";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { getCenterLists } from "@/services/CenterServices/centerServices";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";
export default function CenterInventroyList() {
  const [centerId, setCenterId] = useState(null);
  const [centers, setCenters] = useState([]);
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGetList(centerId);

  // 🔹 Fetch center list on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getCenterLists();
        const list = res.data?.data || [];
        setCenters(list);

        // 🔹 Auto-select first exam if none selected
        if (!centerId && list.length > 0) {
          const firstExam = list[0];
          setCenterId(firstExam.centre_id);
        }
      } catch (err) {
        toast.error("Failed to load centers");
        setCenters([]);
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

  const columns = getCenterInventroyColumns({
    onEdit: openForm,
    onDelete: openForm,
    onView: openForm,
  });


  const filterConfig = [
    {
      key: "center_block",
      label: "Block",
      type: "select"
    },
    {
      key: "center_hall",
      label: "Hall",
      type: "select"
    },
  ]
  return (
    <div className="container mx-auto py-10">
      {loading && <SkeletonCard />}
      {error && (
        <div className="text-center text-red-500">Failed to load data.</div>
      )}

      <div className="w-full sm:w-1/3 mb-2">
        <CenterCombobox
          centers={centers}
          selectedId={centerId}
          setCentreId={setCenterId}
        />
      </div>


      {!loading && data && data.length > 0 && (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search Centers..."
          tableName="Center Inventroy"
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

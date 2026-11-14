

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { schema, defaultValues } from "./FormValidation";
import { updateExamStudentMap } from "@/services/MappingServices/mappingServices";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import { getExamList } from "@/services/ExamServices/examService";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { getCenterLists } from "@/services/CenterServices/centerServices";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/Table/data-table";
import { getStudentColumn } from "./getStudentColumn";
import useGetMapping from "./useGetMapping";
import { Button } from "@/components/ui/button";
import useGetCenterInvet from "./useGetCenterInvet";
import { getInventryColumn } from "./getInventryColumn";


export default function SeatMapping() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const [loading, setLoading] = useState(false);
    const [instID, setInstId] = useState(null);
    const [examID, setExamId] = useState(null);
    const [centreID, setCentreId] = useState(null);
    const [institute, setInstitute] = useState([]);
    const [examList, setExamList] = useState([]);
    const [centreList, setCentreList] = useState([]);
    const [error, setError] = useState(null);

    // ✅ Track selected students
    const [selectedStudents, setSelectedStudents] = useState([]);

    // ✅ Fetch dropdown data (Institution, Exam, Centre)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [instResponse, examResponse, centreResponse] = await Promise.all([
                    getInstitutionList(),
                    getExamList(),
                    getCenterLists(),
                ]);

                if (Array.isArray(instResponse.data?.result)) {
                    setInstitute(instResponse.data.result);
                }
                if (Array.isArray(examResponse.data?.data)) {
                    setExamList(examResponse.data.data);
                }
                if (Array.isArray(centreResponse.data?.data)) {
                    setCentreList(centreResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching lists:", err);
                setError("Failed to load data.");
            }
        };
        fetchData();
    }, []);

    // ✅ Fetch mapping data only when both instID & examID selected
    const {
        data = [],
        loading: loadinglist,
        error: errorList,
        refetch,
    } = useGetMapping(examID, instID);

    const { data: datas, loading: loadinglists, error: errorLists, refetch: refetchs, } = useGetCenterInvet(centreID);



    // ✅ Submission handler
    const onSubmit = async (formData) => {
        console.log(formData, "formdata");

        if (!instID || !examID) {
            toast.error("Please select Institution and Exam first");
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student to map");
            return;
        }

        try {
            setLoading(true);
            const payload = selectedStudents.map((student) => ({
                iecsm_centre_id: centreID,
                iecsm_id: student.iecsm_id,
            }));


            const response = await updateExamStudentMap(payload);

            if (response.status) {
                toast.success("Mapping saved successfully");
                refetch(); // ✅ refresh data
                setSelectedStudents([]); // ✅ clear selection
            } else {
                toast.error("Failed to save mapping");
            }
        } catch (err) {
            console.error("Error submitting mapping:", err);
            toast.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const columns = getStudentColumn();
    const columnsInv = getInventryColumn();
    const filterConfig = [];

    if (loading) return <SkeletonCard count={3} />;

    return (
        <div>
            {/* 🔹 FORM SECTION */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 space-y-6 bg-background shadow rounded-lg max-w-4xl mx-auto"
            >
                <h2 className="text-xl font-semibold mb-4">Seat Mapping Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Institution */}
                    <div>
                        <Label className="mb-1">Select Institution</Label>
                        <InstitutionCombobox
                            institutions={institute}
                            setInstId={(val) => {
                                setInstId(val);
                                reset((prev) => ({ ...prev, iecsm_inst_id: val }));
                            }}
                            selectedId={instID}
                        />
                        <p className="text-sm text-red-500">{errors.iecsm_inst_id?.message}</p>
                    </div>

                    {/* Exam */}
                    <div>
                        <Label className="mb-1">Select Exam</Label>
                        <ExamCombobox
                            exams={examList}
                            setExamId={(val) => {
                                setExamId(val);
                                reset((prev) => ({ ...prev, iecsm_exam_id: val }));
                            }}
                            selectedId={examID}
                        />
                        <p className="text-sm text-red-500">{errors.iecsm_exam_id?.message}</p>
                    </div>


                    {/* Centre */}
                    <div>
                        <Label className="mb-1">Select Centre</Label>
                        <CenterCombobox
                            centers={centreList}
                            setCentreId={(val) => {
                                setCentreId(val);
                                reset((prev) => ({ ...prev, iecsm_centre_id: val }));
                            }}
                            selectedId={centreID}
                        />
                        <p className="text-sm text-red-500">{errors.iecsm_centre_id?.message}</p>
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    <Button type="submit" disabled={loading || selectedStudents.length === 0}>
                        {loading ? "Saving..." : "Map Selected Students"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </div>
            </form>

            <div className="flex gap-2">
                {/* 🔹 DATA TABLE SECTION */}
                <div className="p-3 mt-3 bg-background shadow rounded-lg max-w-7xl mx-auto">
                    {loadinglist && <SkeletonCard />}
                    {errorList && (
                        <div className="text-center text-red-500">Failed to load data.</div>
                    )}

                    {!loadinglist && data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            searchPlaceholder="Search students..."
                            tableName="Students"
                            filterConfig={filterConfig}
                            showExcelExport={false}
                            enableRowSelection={true}
                            onSelectedRowsChange={(rows) => setSelectedStudents(rows)} // ✅ capture selected
                        />
                    )}

                    {!loadinglist && data?.length === 0 && (
                        <div className="text-center font-semibold ">No students found. Please Select Institution and Exam from above dropdown.</div>
                    )}
                </div>
                <div className="p-3 mt-3 bg-background shadow rounded-lg max-w-7xl mx-auto">
                    {loadinglist && <SkeletonCard />}
                    {errorList && (
                        <div className="text-center text-red-500">Failed to load data.</div>
                    )}

                    {!loadinglist && datas?.length > 0 && (
                        <DataTable
                            data={datas}
                            columns={columnsInv}
                            searchPlaceholder="Search..."
                            tableName="Center Inventroy"
                            filterConfig={filterConfig}
                            showExcelExport={false}
                            enableRowSelection={true}
                            onSelectedRowsChange={(rows) => setSelectedStudents(rows)} // ✅ capture selected
                        />
                    )}

                    {!loadinglist && datas?.length === 0 && (
                        <div className="text-center font-semibold ">No data found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// // import React, { useEffect, useState } from "react";
// // import useGetList from "./useGetList";
// // import { useForm, Controller } from "react-hook-form";
// // import { yupResolver } from "@hookform/resolvers/yup";
// // import * as yup from "yup";

// // import { Label } from "@/components/ui/label";
// // import { Button } from "@/components/ui/button";
// // import { Progress } from "@/components/ui/progress";
// // import { toast } from "sonner";
// // import apiClient from "@/services/apiClient";
// // import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
// // import { getExamList } from "@/services/ExamServices/examService";
// // import cloudClient from "@/services/cloudClient";
// // import { Input } from "@/components/ui/input";
// // import {
// //     Select,
// //     SelectTrigger,
// //     SelectContent,
// //     SelectItem,
// //     SelectValue,
// // } from "@/components/ui/select";

// // const schema = yup.object().shape({
// //     exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
// //     exam_shift: yup.string().optional(),
// //     validation_type: yup.string().required("Validation type is required").typeError("Validation type is required"),
// // });

// // export default function SeatDataFetching() {
// //     const { data, loading, error } = useGetList();
// //     console.log(data, "students data");

// //     const [examList, setExamList] = useState([]);
// //     const [isLoading, setLoading] = useState(false);

// //     const {
// //         control,
// //         handleSubmit,
// //         setValue,
// //         register,
// //         formState: { errors },
// //     } = useForm({
// //         resolver: yupResolver(schema),
// //         defaultValues: {
// //             exam_id: "",
// //             validation_type: "",
// //         },
// //     });

// //     // 🔹 Fetch center list
// //     useEffect(() => {
// //         (async () => {
// //             try {
// //                 const res = await getExamList();
// //                 const list = Array.isArray(res.data?.data) ? res.data.data : [];
// //                 setExamList(list);
// //             } catch (err) {
// //                 console.error("Error fetching exam list:", err);
// //                 toast.error("Failed to load exams");
// //                 setExamList([]);
// //             }
// //         })();
// //     }, []);

// //     // 🔹 Handle question paper download
// //     const onSubmit = async (data) => {
// //         const { exam_id } = data;
// //         setLoading(true);

// //         try {
// //             const res = await cloudClient.get(`api/download/question_image/${exam_id}`);
// //             console.log(res);

// //             if (res.status === 200) {
// //                 toast.success("Successfully re-arranged seat data.")
// //             }
// //         } catch (error) {
// //             toast.error("An error occurred during download or processing.");
// //             console.error(error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <form
// //             onSubmit={handleSubmit(onSubmit)}
// //             className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
// //         >
// //             <h1 className="text-xl font-bold">Seat Rearrangment</h1>

// //             <div className="grid grid-cols-2  gap-2">
// //                 <div>
// //                     <Label className="mb-1">Select Exam</Label>
// //                     <Controller
// //                         name="exam_id"
// //                         control={control}
// //                         render={({ field }) => (
// //                             <ExamCombobox
// //                                 exams={examList}
// //                                 selectedId={field.value}
// //                                 setExamId={(val) => setValue("exam_id", val)}
// //                             />
// //                         )}
// //                     />
// //                     {errors.exam_id && <p className="text-sm text-red-500">{errors.exam_id.message}</p>}
// //                 </div>

// //                 <div>
// //                     <Label className="mb-1">Exam Shift</Label>
// //                     <Input {...register("exam_shift")} />
// //                     <p className="text-sm text-red-500 mt-1">
// //                         {errors.exam_shift?.message}
// //                     </p>
// //                 </div>

// //                 <div>
// //                     <Label className="mb-1">Validation Type</Label>
// //                     <Controller
// //                         name="validation_type"
// //                         control={control}
// //                         render={({ field }) => (
// //                             <Select onValueChange={field.onChange} value={field.value}>
// //                                 <SelectTrigger className="w-full">
// //                                     <SelectValue placeholder="Select skip validation type" />
// //                                 </SelectTrigger>
// //                                 <SelectContent>
// //                                     <SelectItem value="Single">Single Candidate</SelectItem>
// //                                     <SelectItem value="Multiple">Multiple Candidate</SelectItem>
// //                                     <SelectItem value="All">All Candidate</SelectItem>
// //                                 </SelectContent>
// //                             </Select>
// //                         )}
// //                     />
// //                     <p className="text-sm text-red-500 mt-1">
// //                         {errors.validation_type?.message}
// //                     </p>
// //                 </div>



// //             </div>


// //             <Button type="submit" className="w-full" disabled={isLoading}>
// //                 {isLoading ? "Submiting..." : "Submit"}
// //             </Button>
// //         </form>
// //     );
// // }
// import React, { useEffect, useState } from "react";
// import useGetList from "./useGetList";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";

// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Command, CommandGroup, CommandList, CommandItem, CommandInput } from "@/components/ui/command";

// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { toast } from "sonner";
// import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
// import { getExamList } from "@/services/ExamServices/examService";
// import cloudClient from "@/services/cloudClient";

// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// const schema = yup.object().shape({
//     exam_id: yup.string().required("Exam is required"),
//     validation_type: yup.string().required("Validation type is required"),
//     exam_shift: yup.string().optional(),
//     otp: yup.string().optional(),
// });

// export default function SeatDataFetching() {
//     const { data: studentList } = useGetList();

//     const [examList, setExamList] = useState([]);
//     const [selectedStudents, setSelectedStudents] = useState([]);
//     const [tableData, setTableData] = useState([]);
//     const [isSearching, setSearching] = useState(false);
//     const [isSubmitting, setSubmitting] = useState(false);

//     const { control, handleSubmit, setValue, register, watch, formState: { errors } } = useForm({
//         resolver: yupResolver(schema),
//     });

//     const validationType = watch("validation_type");

//     useEffect(() => {
//         (async () => {
//             try {
//                 const res = await getExamList();
//                 const list = Array.isArray(res.data?.data) ? res.data.data : [];
//                 setExamList(list);
//             } catch (err) {
//                 toast.error("Failed to load exams");
//             }
//         })();
//     }, []);

//     // ⬅️ Student selection logic
//     const handleSelectStudent = (id) => {
//         if (validationType === "Single") {
//             setSelectedStudents([id]);
//         } else if (validationType === "Multiple") {
//             setSelectedStudents((prev) =>
//                 prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//             );
//         }
//     };

//     const fetchStudentData = () => {
//         setSearching(true);

//         setTimeout(() => {
//             let filtered = [];

//             if (validationType === "All") {
//                 filtered = studentList;
//             } else {
//                 filtered = studentList.filter((s) => selectedStudents.includes(s.id));
//             }

//             setTableData(filtered);
//             setSearching(false);
//         }, 400);
//     };

//     const onSubmit = async (formData) => {
//         setSubmitting(true);

//         const payload = {
//             exam_id: formData.exam_id,
//             shift: formData.exam_shift,
//             otp: formData.otp,
//             roll_numbers: tableData.map((s) => s.roll_number),
//         };

//         try {
//             await cloudClient.post("api/rearrange-seat", payload);
//             toast.success("Seat rearranged successfully!");
//         } catch (err) {
//             toast.error("Error submitting data");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="p-6 space-y-6 bg-background shadow rounded-lg max-w-3xl mx-auto"
//         >
//             <h1 className="text-xl font-bold">Seat Rearrangement</h1>

//             {/* FORM FIELDS */}
//             <div className="grid grid-cols-2 gap-4">

//                 {/* SELECT EXAM */}
//                 <div>
//                     <Label>Select Exam</Label>
//                     <Controller
//                         name="exam_id"
//                         control={control}
//                         render={({ field }) => (
//                             <ExamCombobox
//                                 exams={examList}
//                                 selectedId={field.value}
//                                 setExamId={(val) => setValue("exam_id", val)}
//                             />
//                         )}
//                     />
//                     <p className="text-red-500 text-sm">{errors.exam_id?.message}</p>
//                 </div>

//                 {/* SHIFT */}
//                 <div>
//                     <Label>Exam Shift</Label>
//                     <Input {...register("exam_shift")} />
//                 </div>

//                 {/* VALIDATION TYPE */}
//                 <div>
//                     <Label>Validation Type</Label>
//                     <Controller
//                         name="validation_type"
//                         control={control}
//                         render={({ field }) => (
//                             <Select onValueChange={field.onChange} value={field.value}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select Validation Type" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="Single">Single</SelectItem>
//                                     <SelectItem value="Multiple">Multiple</SelectItem>
//                                     <SelectItem value="All">All</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         )}
//                     />
//                 </div>
//             </div>

//             {/* STUDENT SELECTION FIELD */}
//             {validationType !== "All" && validationType && (
//                 <div>
//                     <Label>Select Student(s) by Roll No</Label>

//                     <Popover>
//                         <PopoverTrigger asChild>
//                             <div className="w-full">
//                                 <Input
//                                     placeholder="Type roll number..."
//                                     value={
//                                         validationType === "Single"
//                                             ? (selectedStudents[0]?.roll_number || "")
//                                             : selectedStudents.map((s) => s.roll_number).join(", ")
//                                     }
//                                     readOnly
//                                     className="cursor-pointer bg-white"
//                                 />
//                             </div>
//                         </PopoverTrigger>

//                         <PopoverContent className="w-full p-0">
//                             <Command>
//                                 <CommandInput placeholder="Search roll number..." />

//                                 <CommandList>
//                                     <CommandGroup>
//                                         {studentList.map((s) => {
//                                             const isSelected = selectedStudents.some(
//                                                 (st) => st.id === s.id
//                                             );
//                                             return (
//                                                 <CommandItem
//                                                     key={s.id}
//                                                     value={s.roll_number}
//                                                     onSelect={() => {
//                                                         if (validationType === "Single") {
//                                                             setSelectedStudents([s]);
//                                                         } else if (validationType === "Multiple") {
//                                                             setSelectedStudents((prev) =>
//                                                                 prev.some((x) => x.id === s.id)
//                                                                     ? prev.filter((x) => x.id !== s.id)
//                                                                     : [...prev, s]
//                                                             );
//                                                         }
//                                                     }}
//                                                     className="flex justify-between"
//                                                 >
//                                                     <span>{s.roll_number}</span>

//                                                     {isSelected && (
//                                                         <span className="text-green-600 font-bold">✓</span>
//                                                     )}
//                                                 </CommandItem>
//                                             );
//                                         })}
//                                     </CommandGroup>
//                                 </CommandList>
//                             </Command>
//                         </PopoverContent>
//                     </Popover>
//                 </div>
//             )}


//             {/* FETCH BUTTON */}
//             <div className="flex justify-end">
//                 <Button
//                     type="button"
//                     size="sm"
//                     onClick={fetchStudentData}
//                     disabled={isSearching}
//                 >
//                     {isSearching ? "Loading..." : "Fetch Students"}
//                 </Button>
//             </div>

//             {/* OTP + SUBMIT ABOVE TABLE */}
//             {tableData.length > 0 && (
//                 <div className="space-y-3 border p-4 rounded">
//                     <Label>Enter OTP</Label>
//                     <Input {...register("otp")} placeholder="Enter OTP" />

//                     <Button type="submit" disabled={isSubmitting}>
//                         {isSubmitting ? "Submitting..." : "Submit"}
//                     </Button>
//                 </div>
//             )}

//             {/* TABLE */}
//             {tableData.length > 0 && (
//                 <div className="border rounded p-4">
//                     <h2 className="font-semibold mb-2">Selected Students</h2>

//                     <table className="w-full border">
//                         <thead>
//                             <tr className="bg-gray-100">
//                                 <th className="p-2 border">Roll No</th>
//                                 <th className="p-2 border">Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {tableData.map((s) => (
//                                 <tr key={s.id}>
//                                     <td className="p-2 border">{s.roll_number}</td>
//                                     <td className="p-2 border">{s.name}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </form>
//     );
// }

import React, { useEffect, useState, useMemo } from "react";
import useGetList from "./useGetList"; // Assuming this returns the full list of students
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import Select from "react-select"; // 💡 Recommending 'react-select' for robust single/multiple select

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import cloudClient from "@/services/cloudClient";
import { Input } from "@/components/ui/input";
import {
    Select as ShadcnSelect, // Renaming to avoid conflict with react-select
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

// 💡 Assuming you have a basic Table component available, otherwise use a simple <table>
// const StudentTable = ({ students }) => { ... };

// --- 1. Schema Update ---
const schema = yup.object().shape({
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
    exam_shift: yup.string().optional(),
    validation_type: yup.string().required("Validation type is required").typeError("Validation type is required"),
    one_time_password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function SeatDataFetching() {
    // 💡 data holds all students from useGetList()
    const { data: allStudents, loading: listLoading, error: listError } = useGetList();

    // --- 2. New State Variables ---
    const [examList, setExamList] = useState([]);
    const [isLoading, setLoading] = useState(false);
    // State for selected roll numbers (for Single/Multiple)
    const [selectedStudentsRolls, setSelectedStudentsRolls] = useState([]);
    // State for data to display in the table
    const [fetchedStudentsData, setFetchedStudentsData] = useState([]);

    const {
        control,
        handleSubmit,
        setValue,
        register,
        resetField,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            exam_id: "",
            validation_type: "",
            exam_shift: "",
            one_time_password: "",
        },
    });

    // Watch the validation_type to enable conditional fields
    const validationType = useWatch({ control, name: "validation_type" });

    // Reset selected students whenever validationType changes
    useEffect(() => {
        setSelectedStudentsRolls([]);
        setFetchedStudentsData([]);
    }, [validationType]);


    // 🔹 Generate options for the student Select field
    const studentOptions = useMemo(() => {
        if (Array.isArray(allStudents)) {
            return allStudents.map(student => ({
                value: student.roll_number,
                label: `${student.roll_number} - ${student.name}`,
            }));
        }
        return [];
    }, [allStudents]);

    // 🔹 Fetch exam list
    useEffect(() => {
        // ... existing exam list fetching logic
        (async () => {
            try {
                const res = await getExamList();
                const list = Array.isArray(res.data?.data) ? res.data.data : [];
                setExamList(list);
            } catch (err) {
                console.error("Error fetching exam list:", err);
                toast.error("Failed to load exams");
                setExamList([]);
            }
        })();
    }, []);

    // --- 3. Function to Fetch/Filter Student Data ---
    const fetchStudentDetails = () => {
        setFetchedStudentsData([]); // Clear previous data
        if (!allStudents || allStudents.length === 0) {
            toast.error("No student data available to fetch.");
            return;
        }

        let studentsToFetch = [];

        if (validationType === 'All') {
            studentsToFetch = allStudents;
        } else if (validationType === 'Single' || validationType === 'Multiple') {
            if (selectedStudentsRolls.length === 0) {
                toast.error(`Please select at least one student for '${validationType}'.`);
                return;
            }
            studentsToFetch = allStudents.filter(student =>
                selectedStudentsRolls.includes(student.roll_number)
            );
        } else {
            toast.error("Please select a Validation Type.");
            return;
        }

        if (studentsToFetch.length > 0) {
            setFetchedStudentsData(studentsToFetch);
            toast.success(`Successfully fetched ${studentsToFetch.length} student(s).`);
        } else {
            toast.warning("No students matched the selection.");
        }
    };

    // --- 4. Function for Seat Re-arrangement (Final Submit) ---
    const reArrangeSeats = async (formData) => {
        const { exam_id, exam_shift, one_time_password } = formData;

        if (fetchedStudentsData.length === 0) {
            toast.error("Please fetch the student data first.");
            return;
        }

        setLoading(true);

        // Prepare the data to be sent
        const studentsRolls = fetchedStudentsData.map(s => s.roll_number);

        // This is the data structure you mentioned sending: roll_number with exam data
        const payload = {
            exam_id,
            exam_shift,
            one_time_password, // For re-arrangement authorization
            students_rolls: studentsRolls, // List of roll numbers to re-arrange
        };

        try {
            // Replace with your actual seat re-arrangement API call
            const res = await apiClient.post('api/seat-rearrangement', payload);

            if (res.status === 200) {
                toast.success("Successfully re-arranged seat data.");
                // Optionally clear the form/state after success
                // reset(); 
            } else {
                // Handle non-200 responses
                toast.error(`Seat re-arrangement failed: ${res.data?.message || 'Server error'}`);
            }
        } catch (error) {
            toast.error("An error occurred during seat re-arrangement.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 💡 Use a simple object to manage react-select props
    const selectProps = useMemo(() => {
        if (validationType === 'Single') {
            return { isMulti: false, placeholder: "Select one student Roll Number" };
        } else if (validationType === 'Multiple') {
            return { isMulti: true, placeholder: "Select multiple student Roll Numbers" };
        }
        return { isMulti: false, isDisabled: true, placeholder: "Select Validation Type first" };
    }, [validationType]);

    // Handle change for the react-select component
    const handleStudentSelectChange = (selected) => {
        if (validationType === 'Single') {
            setSelectedStudentsRolls(selected ? [selected.value] : []);
        } else if (validationType === 'Multiple') {
            setSelectedStudentsRolls(selected.map(item => item.value));
        }
    };


    return (
        <form
            onSubmit={handleSubmit(reArrangeSeats)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-4xl mx-auto"
        >
            <h1 className="text-2xl font-bold">🪑 Seat Rearrangement</h1>

            {/* --- Exam & Validation Type Selection --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Select Exam */}
                <div>
                    <Label htmlFor="exam_id" className="mb-1">Select Exam</Label>
                    <Controller
                        name="exam_id"
                        control={control}
                        render={({ field }) => (
                            <ExamCombobox
                                exams={examList}
                                selectedId={field.value}
                                setExamId={(val) => setValue("exam_id", val)}
                            />
                        )}
                    />
                    {errors.exam_id && <p className="text-sm text-red-500">{errors.exam_id.message}</p>}
                </div>

                {/* Exam Shift Input */}
                <div>
                    <Label htmlFor="exam_shift" className="mb-1">Exam Shift</Label>
                    <Input {...register("exam_shift")} id="exam_shift" />
                    <p className="text-sm text-red-500 mt-1">{errors.exam_shift?.message}</p>
                </div>

                {/* Validation Type Select */}
                <div>
                    <Label htmlFor="validation_type" className="mb-1">Validation Type</Label>
                    <Controller
                        name="validation_type"
                        control={control}
                        render={({ field }) => (
                            <ShadcnSelect onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full" id="validation_type">
                                    <SelectValue placeholder="Select validation type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single Student</SelectItem>
                                    <SelectItem value="Multiple">Multiple Students</SelectItem>
                                    <SelectItem value="All">All Students</SelectItem>
                                </SelectContent>
                            </ShadcnSelect>
                        )}
                    />
                    <p className="text-sm text-red-500 mt-1">{errors.validation_type?.message}</p>
                </div>
            </div>

            <hr />

            {/* --- Student Selection & Fetch Button --- */}
            <div className="space-y-4">
                {/* 1. Student Selective Field/List */}
                {(validationType === 'Single' || validationType === 'Multiple') && (
                    <div className="space-y-1">
                        <Label>Select Student(s) by Roll Number</Label>
                        <Select
                            options={studentOptions}
                            isLoading={listLoading}
                            isClearable={true}
                            // Apply dynamic props
                            isMulti={selectProps.isMulti}
                            placeholder={selectProps.placeholder}
                            isDisabled={listLoading || !validationType}
                            // Handle the change
                            onChange={handleStudentSelectChange}
                            classNamePrefix="react-select"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Current Selection: **{selectedStudentsRolls.length}** Roll Number(s)
                        </p>
                    </div>
                )}

                {validationType === 'All' && (
                    <div className="p-4 border border-dashed rounded-md bg-yellow-50/50">
                        <p className="text-sm text-yellow-700">
                            **Validation Type: All** is selected. Clicking "Fetch Student Data" will prepare **all** available students (**{allStudents?.length || 0}**) for re-arrangement.
                        </p>
                    </div>
                )}

                {/* 2. Button to fetch students data */}
                <Button
                    type="button"
                    onClick={fetchStudentDetails}
                    disabled={isLoading || listLoading || !validationType || (validationType !== 'All' && selectedStudentsRolls.length === 0)}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                >
                    {listLoading ? "Loading Students..." : "Fetch Student Data"}
                </Button>
            </div>

            <hr />

            {/* --- 3. Students Details Table (Only Selected Students) --- */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Fetched Student Details ({fetchedStudentsData.length})</h2>
                {fetchedStudentsData.length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fetchedStudentsData.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.roll_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student_exam_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No students fetched yet. Select and click "Fetch Student Data".</p>
                )}
            </div>

            <hr />

            {/* --- 4. Password Input and Final Submit --- */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Final Action</h2>
                <div>
                    <Label htmlFor="one_time_password" className="mb-1">One Time Password (OTP)</Label>
                    <Input
                        {...register("one_time_password")}
                        id="one_time_password"
                        type="password"
                        placeholder="Enter OTP for seat re-arrangement"
                    />
                    <p className="text-sm text-red-500 mt-1">{errors.one_time_password?.message}</p>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || fetchedStudentsData.length === 0}
                >
                    {isLoading ? "Re-arranging..." : "Re-arrange Seats Now"}
                </Button>
            </div>

        </form>
    );
}

// 💡 Remember to install react-select if you use this implementation: npm install react-select
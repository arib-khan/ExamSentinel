import React, { useState, useCallback, useRef } from "react";
import { getProfilePhoto } from "@/services/StudentServices/studentService";
import useGetList from "../Biometric_Verification/useGetList";
import PhotoCaptureComponent from "./PhotoCapture";
import FingerprintCaptureComponent from "./FingerprintCapture";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, CheckCircle, Users, Server } from "lucide-react";
import useGetPlanList from "./useGetPlanList";

import { findServerForStudent, getServerIP, registerStudentToServer } from "./serverRangeMatcher";
import { UploadQueueStatus } from "./UploadQueueStatus";

function BiometricRegistration() {
    const { data: studentList, loading, error, refetch } = useGetList();
    const { data: planList } = useGetPlanList();

    // Refs for child components
    const photoCaptureRef = useRef(null);
    const fingerprintCaptureRef = useRef(null);

    const [seatData, setSeatData] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [rollNumber, setRollNumber] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentImage, setStudentImage] = useState(null);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [assignedServer, setAssignedServer] = useState(null);

    // Fetch existing student image
    const fetchStudentImage = useCallback(async (student) => {
        setStudentImage(null);
        if (student && student.student_picture) {
            try {
                const res = await getProfilePhoto({
                    student_picture: student.student_picture,
                    exam_id: student.student_exam_id
                });
                if (res.status === 200) {
                    const blob = res.data;
                    const imgUrl = URL.createObjectURL(blob);
                    setStudentImage(imgUrl);
                }
            } catch (error) {
                console.error("Failed to load student image", error);
                setStudentImage(null);
            }
        }
    }, []);

    // Identify server for student
    const identifyServerForStudent = useCallback((student) => {
        if (!planList || planList.length === 0) {
            toast.error("Server plan list not available");
            return null;
        }

        const serverPlan = findServerForStudent(student.roll_number, planList);

        if (!serverPlan) {
            toast.error(`No server found for student ${student.roll_number}`);
            return null;
        }

        const serverIP = getServerIP(serverPlan);

        if (!serverIP) {
            toast.error("Server IP address not configured");
            return null;
        }

        setAssignedServer({
            ip: serverIP,
            plan: serverPlan
        });

        return { ip: serverIP, plan: serverPlan };
    }, [planList]);

    // Handle selecting a suggestion
    const handleSelectSuggestion = useCallback((student) => {
        setRollNumber(student.roll_number);
        setSelectedStudent(student);
        setFilteredSuggestions([]);
        fetchStudentImage(student);
        identifyServerForStudent(student);
    }, [fetchStudentImage, identifyServerForStudent]);

    // Handle input change and filter suggestions
    const handleInputChange = (e) => {
        const input = e.target.value.toUpperCase();
        setRollNumber(input);

        if (!input) {
            setSelectedStudent(null);
            setFilteredSuggestions([]);
            setAssignedServer(null);
            return;
        }

        if (studentList?.length > 0) {
            const filtered = studentList
                .filter(s =>
                    s.roll_number.toUpperCase().includes(input) ||
                    s.name.toUpperCase().includes(input)
                )
                .slice(0, 10);

            setFilteredSuggestions(filtered);

            const exactMatch = studentList.find(s => s.roll_number.toUpperCase() === input);
            if (exactMatch) {
                setSelectedStudent(exactMatch);
                fetchStudentImage(exactMatch);
                identifyServerForStudent(exactMatch);
            } else if (selectedStudent && selectedStudent.roll_number.toUpperCase() !== input) {
                setSelectedStudent(null);
                setAssignedServer(null);
            }
        }
    };

    // Search for student
    const handleSearch = () => {
        if (!rollNumber) {
            setSelectedStudent(null);
            toast.error("Please enter a Roll Number.");
            return;
        }

        const student = studentList?.find(
            (s) => s.roll_number.toUpperCase() === rollNumber.toUpperCase()
        );

        if (student) {
            handleSelectSuggestion(student);
        } else {
            setSelectedStudent(null);
            setStudentImage(null);
            setAssignedServer(null);
            toast.error(`Student with Roll Number "${rollNumber}" not found.`);
        }
    };

    // Clear all states
    const clearAllStates = useCallback(() => {
        setSelectedStudent(null);
        setRollNumber("");
        setStudentImage(null);
        setAssignedServer(null);
        setSeatData(null);

        // Reset child components
        if (photoCaptureRef.current) {
            photoCaptureRef.current.restartCamera();
        }
        if (fingerprintCaptureRef.current) {
            fingerprintCaptureRef.current.restartDeviceCheck();
        }
    }, []);

    // Handle registration
    const handleRegister = useCallback(async () => {
        // Check if both captures are submitted using refs
        const isPhotoSubmitted = photoCaptureRef.current?.isSubmitted();
        // const isFingerprintSubmitted = fingerprintCaptureRef.current?.isSubmitted();

        if (!isPhotoSubmitted) {
            toast.error("Please capture and submit Photo before registering.");
            return;
        }

        if (!assignedServer) {
            toast.error("Server information not available. Please re-select the student.");
            return;
        }

        setIsRegistering(true);

        try {
            const result = await registerStudentToServer(
                selectedStudent,
                assignedServer.ip,
            );

            setSeatData(result.data);
            setShowDialog(true);
            toast.success("Student registered successfully!");

        } catch (error) {
            console.error("Registration Error:", error);

            if (error.message.includes("Failed to fetch")) {
                toast.error(`Cannot connect to server ${assignedServer.ip}. Please check network connectivity.`);
            } else if (error.message.includes("timeout")) {
                toast.error(`Server ${assignedServer.ip} did not respond in time. Please try again.`);
            } else {
                toast.error(`Registration failed: ${error.message}`);
            }
        } finally {
            setIsRegistering(false);
        }
    }, [selectedStudent, assignedServer]);

    // Handle dialog close with state cleanup
    const handleDialogClose = useCallback(() => {
        setShowDialog(false);
        clearAllStates();
        refetch();
    }, [clearAllStates]);

    // Calculate statistics
    const totalCapturedFingerprint = studentList
        ? studentList.filter(student => student.student_biometric_captur === 'Y' && student.student_biometric_captur !== undefined).length
        : 0;

    const totalCapturedPhotos = studentList
        ? studentList.filter(student => (student.student_image !== null && student.student_image !== undefined)).length
        : 0;

    const totalSeatAllocated = studentList
        ? studentList.filter(student => student.iecsm_seat_num !== null && student.iecsm_seat_num !== undefined).length
        : 0;

    const remainingStudents = studentList
        ? studentList.length - studentList.filter(student => student.iecsm_seat_num !== null && student.iecsm_seat_num !== undefined).length
        : 0;

    if (loading) return <div>Loading student list...</div>;
    if (error) return <div>Error loading student list: {error?.message || 'Check console.'}</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h2 className="text-3xl font-bold mb-6">👤 Biometric Registration & Seat Allocation</h2>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <Card
                    icon={<Users size={20} className="text-red-800" />}
                    title="Remaining Students"
                    value={remainingStudents}
                    activeBg="bg-red-400 border-red-400"
                />
                <Card
                    icon={<Users size={20} className="text-green-800" />}
                    title="Total Captured Fingerprints"
                    value={totalCapturedFingerprint}
                    activeBg="bg-green-400 border-green-400"
                />
                <Card
                    icon={<Camera size={20} className="text-purple-800" />}
                    title="Total Captured Photos"
                    value={totalCapturedPhotos}
                    activeBg="bg-purple-400 border-purple-400"
                />
                <Card
                    icon={<Users size={20} className="text-blue-800" />}
                    title="Total Seat Allocated"
                    value={totalSeatAllocated}
                    activeBg="bg-blue-400 border-blue-400"
                />
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="mb-6 p-4 border rounded-lg flex justify-center gap-4 items-center">
                <div className="flex-1 relative">
                    <label htmlFor="rollNumberInput" className="block text-sm font-medium">
                        Roll Number / Name (Type to search):
                    </label>
                    <input
                        id="rollNumberInput"
                        type="text"
                        value={rollNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., ABCD001539 or Student Name"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Suggestions Dropdown */}
                    {rollNumber.length > 0 && filteredSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((student) => (
                                <li
                                    key={student.roll_number}
                                    onClick={() => handleSelectSuggestion(student)}
                                    className="p-2 cursor-pointer hover:bg-blue-100 border-b last:border-b-0 flex justify-between items-center text-sm"
                                >
                                    <span className="font-semibold text-gray-800">{student.roll_number}</span>
                                    <span className="text-gray-600 ml-4">{student.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <Button onClick={handleSearch} className="px-6 py-2">
                        Search Student
                    </Button>
                </div>
                <UploadQueueStatus />
            </div>

            {/* Registration Container */}
            {selectedStudent && (
                <div className="border-2 border-blue-500 p-6 rounded-xl shadow-lg space-y-6">
                    {/* Student Details */}
                    <div className="pb-4 border-b">
                        <h3 className="text-xl font-bold mb-3">Student Details</h3>
                        <div className="flex justify-between items-start">
                            <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-base">
                                <p><strong>Roll No:</strong> {selectedStudent.roll_number}</p>
                                <p><strong>Name:</strong> {selectedStudent.name}</p>
                                <p><strong>Application No:</strong> {selectedStudent.application_numbe}</p>
                                <p><strong>Category:</strong> {selectedStudent.Category}</p>
                                <p><strong>DOB:</strong> {selectedStudent.date_of_birth}</p>
                                <p><strong>PWD Status:</strong> {selectedStudent.is_disabled === "Y" ? "Yes" : "No"}</p>

                                {assignedServer && (
                                    <p className="col-span-2 mt-2 flex items-center gap-2 text-blue-600">
                                        <Server size={16} />
                                        <strong>Assigned Server:</strong> {assignedServer.ip}
                                    </p>
                                )}
                            </div>
                            {studentImage && (
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Existing Photo</p>
                                    <img
                                        src={studentImage}
                                        alt="Existing"
                                        className="w-24 h-24 border-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {
                        selectedStudent.iecsm_seat_num ? (
                            <div className="text-center ">
                                <CheckCircle className="inline w-6 h-6 mr-2 text-green-600 " />
                                Seat Already Allocated

                                <div className="flex flex-col justify-center items-center text-green-600 ">
                                    <p><strong>Room:</strong> {selectedStudent?.center_seat_label}</p>
                                    <p><strong>Seat:</strong> {selectedStudent?.iecsm_seat_num}</p>
                                </div>
                            </div>
                        ) : (

                            <>
                                {/* Biometric Captures */}
                                <div className="grid grid-cols-2 gap-6">
                                    <PhotoCaptureComponent
                                        ref={photoCaptureRef}
                                        student={selectedStudent}
                                    />
                                    <FingerprintCaptureComponent
                                        ref={fingerprintCaptureRef}
                                        student={selectedStudent}
                                    />
                                </div>

                                {/* Register Button */}
                                <div className="flex justify-end items-center pt-4 border-t">
                                    <Button
                                        onClick={handleRegister}
                                        disabled={isRegistering}
                                        className="px-8 py-3 text-lg font-bold bg-green-600 hover:bg-green-700"
                                    >
                                        {isRegistering ? "Registering..." : "Register & Allocate Seat"}
                                    </Button>
                                </div>
                            </>
                        )
                    }
                </div>
            )}

            {!selectedStudent && rollNumber && (
                <p className="text-center text-gray-500 mt-4">
                    Student not found. Please try again or search for a student above.
                </p>
            )}
            {!selectedStudent && !rollNumber && (
                <p className="text-center text-gray-500 mt-4">
                    Please enter a Roll Number and click <strong>Search Student</strong> to begin verification.
                </p>
            )}

            <SeatAllocatedDialog
                open={showDialog}
                onClose={handleDialogClose}
                seatData={seatData}
            />
        </div>
    );
}

export default BiometricRegistration;

// Card component
export const Card = ({ icon, title, value, activeBg, valueColor = "" }) => (
    <div
        className={`rounded-lg border p-2 flex items-center justify-between 
            ${activeBg || "bg-white border-gray-200"}
        `}
    >
        <div className="flex items-center gap-2">
            {icon && <span className="text-sm">{icon}</span>}
            <p className="text-sm font-medium text-white">{title}</p>
        </div>
        <p className={`text-sm font-bold ${valueColor || "text-white"}`}>
            {value}
        </p>
    </div>
);

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function SeatAllocatedDialog({ open, onClose, seatData }) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">
                        Seat Allocated Successfully
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-lg">
                        <div className="mt-4 space-y-2">
                            <p><strong>Room:</strong> {seatData?.room}</p>
                            <p><strong>Seat:</strong> {seatData?.seat}</p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
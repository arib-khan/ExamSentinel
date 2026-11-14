import { useState, useEffect, useMemo } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Eye, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getLiveExamActivity,
    getLiveStudentActivity,
} from "@/services/AdminLiveActivity/LiveExamActivity"
import { StatusBadge } from "@/components/Table/sortable-header"

// utils/formatters.js (you can also keep inline if you prefer)
export const formatText = (text) => {
    if (!text) return "";
    return text
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const StudentDetailsModal = ({ student, isOpen, onClose, refreshKey }) => {
    const [loginDetails, setLoginDetails] = useState([])
    const [studentLogs, setStudentLogs] = useState([])
    const [activeTab, setActiveTab] = useState("login")
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (isOpen && student) {
            fetchData()
        }
        // Reset search when modal opens/closes
        if (!isOpen) {
            setSearchTerm("")
        }
    }, [isOpen, student, refreshKey])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [loginRes, logsRes] = await Promise.all([
                getLiveExamActivity(student?.iecsm_exam_id, student?.id),
                getLiveStudentActivity(student.id),
            ])
            console.log(logsRes.data);

            setLoginDetails(loginRes?.data?.result || [])
            setStudentLogs(logsRes?.data?.result || [])
        } catch (err) {
            console.error("Failed to fetch student details", err)
        } finally {
            setLoading(false)
        }
    }

    const getLastActivityTime = () => {
        if (studentLogs.length > 0) {
            return studentLogs[studentLogs.length - 1]?.timestamp
        }
        if (loginDetails.length > 0) {
            return loginDetails[loginDetails.length - 1]?.timestamp
        }
        return null
    }

    const getExamStartedTime = () => {
        if (loginDetails.length > 0) {
            const examStartLog = loginDetails.find(
                (log) => log.event_type === "EXAM_STARTED"
            )
            return examStartLog ? examStartLog.timestamp : null
        }
        return null
    }

    // Global search functionality
    const filteredLoginDetails = useMemo(() => {
        if (!searchTerm) return loginDetails;
        return loginDetails.filter(log =>
            formatText(log.event_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [loginDetails, searchTerm]);

    const filteredStudentLogs = useMemo(() => {
        if (!searchTerm) return studentLogs;
        return studentLogs.filter(log => {
            const EXCLUDED_FIELDS = ["id", "is_final_submission", "student_id", "exam_id"];
            return Object.keys(log)
                .filter(key => !EXCLUDED_FIELDS.includes(key))
                .some(key => {
                    const value = log[key];
                    if (value === null || value === undefined) return false;

                    if (key === "timestamp") {
                        return new Date(value).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    if (key === "event_type" || key === "question_subject") {
                        return formatText(value).toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    if (key === "mark_for_review") {
                        return (value === 1 ? "true" : "false").includes(searchTerm.toLowerCase());
                    }
                    return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
        });
    }, [studentLogs, searchTerm]);

    const clearSearch = () => {
        setSearchTerm("");
    };

    const renderSearchBar = () => (
        <div className="relative mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search across all data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {searchTerm && (
                <p className="text-xs text-gray-500 mt-1">
                    {activeTab === "login"
                        ? `Found ${filteredLoginDetails.length} of ${loginDetails.length} login records`
                        : `Found ${filteredStudentLogs.length} of ${studentLogs.length} log records`
                    }
                </p>
            )}
        </div>
    );

    const renderLoginDetails = () => (
        <div className="text-sm">
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-3">
                {filteredLoginDetails.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">
                        {searchTerm ? "No matching login details found." : "No login details found."}
                    </div>
                ) : (
                    filteredLoginDetails.map((log) => (
                        <div key={log.id} className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm">
                            <div className="space-y-2">
                                <div>
                                    <span className="font-semibold text-gray-600">Event:</span>
                                    <span className="ml-2">{formatText(log.event_type)}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Time:</span>
                                    <span className="ml-2 text-xs text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
                <div className="grid grid-cols-2 font-semibold border-b pb-1 mb-2">
                    <span>Log Event Name</span>
                    <span>Timestamp</span>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
                    {filteredLoginDetails.length === 0 ? (
                        <div className="text-gray-500">
                            {searchTerm ? "No matching login details found." : "No login details found."}
                        </div>
                    ) : (
                        filteredLoginDetails.map((log) => (
                            <div
                                key={log.id}
                                className="grid grid-cols-2 border-b py-1 last:border-none"
                            >
                                <span>{formatText(log.event_type)}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    const EXCLUDED_FIELDS = ["id", "is_final_submission", "student_id", "exam_id"];

    const renderStudentLogs = () => (
        <div className="text-sm">
            {filteredStudentLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                    {searchTerm ? "No matching student logs found." : "No student logs found."}
                </div>
            ) : (
                <>
                    {/* Mobile Card Layout */}
                    <div className="block lg:hidden space-y-3 max-h-60 overflow-y-auto">
                        {filteredStudentLogs.map((log) => (
                            <div key={log.id} className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm">
                                <div className="space-y-2">
                                    {Object.keys(log)
                                        .filter((key) => !EXCLUDED_FIELDS.includes(key))
                                        .map((key) => (
                                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-semibold text-gray-600 mb-1 sm:mb-0">
                                                    {formatText(key)}:
                                                </span>
                                                <span className="break-words">
                                                    {key === "event_type" ? (
                                                        formatText(log[key])
                                                    ) : key === "question_subject" ? (
                                                        formatText(log[key])
                                                    ) : key === "timestamp" ? (
                                                        <span className="text-xs">
                                                            {new Date(log[key]).toLocaleString()}
                                                        </span>
                                                    ) : key === "mark_for_review" ? (
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-medium ${log[key] === 1
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {log[key] === 1 ? "True" : "False"}
                                                        </span>
                                                    ) : (
                                                        log[key] ?? "-"
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block max-h-60 overflow-y-auto border rounded">
                        <table className="min-w-full border border-gray-300">
                            {/* Table Head */}
                            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    {Object.keys(filteredStudentLogs[0] || {})
                                        .filter((key) => !EXCLUDED_FIELDS.includes(key))
                                        .map((key) => (
                                            <th
                                                key={key}
                                                className="px-2 py-1 border text-left font-semibold capitalize text-xs"
                                            >
                                                {formatText(key)}
                                            </th>
                                        ))}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {filteredStudentLogs.map((log) => (
                                    <tr key={log.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                                        {Object.keys(log)
                                            .filter((key) => !EXCLUDED_FIELDS.includes(key))
                                            .map((key) => (
                                                <td key={key} className="px-2 py-1 border text-xs">
                                                    {key === "event_type" ? (
                                                        formatText(log[key])
                                                    ) : key === "question_subject" ? (
                                                        formatText(log[key])
                                                    ) : key === "timestamp" ? (
                                                        new Date(log[key]).toLocaleString()
                                                    ) : key === "mark_for_review" ? (
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-medium ${log[key] === 1
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {log[key] === 1 ? "True" : "False"}
                                                        </span>
                                                    ) : (
                                                        <span className="break-words">
                                                            {log[key] ?? "-"}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );

    if (!student) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="w-full sm:max-w-4xl lg:max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
                <AlertDialogHeader className="flex-shrink-0">
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <span className="truncate">{student.name} - Exam Details</span>
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription asChild className="flex-1 overflow-hidden">
                    <div className="space-y-4 h-full flex flex-col">
                        {/* Student Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm flex-shrink-0">
                            <div>
                                <strong>Roll Number:</strong> {student.roll_number}
                            </div>
                            <div>
                                <strong>Exam:</strong> <span className="break-words">{student.exam_name}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <strong>Status:</strong>
                                <StatusBadge status={student.students_status}>
                                    {student.students_status}
                                </StatusBadge>
                            </div>
                            <div>
                                <strong>Time Left:</strong> {student.left_time} minutes
                            </div>
                            <div>
                                <strong>Exam Started:</strong>{" "}
                                {getExamStartedTime()
                                    ? new Date(getExamStartedTime()).toLocaleString()
                                    : "N/A"}
                            </div>
                            <div>
                                <strong>Last Activity:</strong>{" "}
                                {getLastActivityTime()
                                    ? new Date(getLastActivityTime()).toLocaleString()
                                    : "N/A"}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-3 border-t pt-4 flex-shrink-0">
                            <Button
                                size="sm"
                                variant={activeTab === "login" ? "default" : "outline"}
                                onClick={() => setActiveTab("login")}
                                disabled={loading}
                            >
                                Login Details ({loginDetails.length})
                            </Button>
                            <Button
                                size="sm"
                                variant={activeTab === "logs" ? "default" : "outline"}
                                onClick={() => setActiveTab("logs")}
                                disabled={loading}
                            >
                                Student Logs ({studentLogs.length})
                            </Button>
                        </div>

                        {/* Search Bar */}
                        {!loading && (
                            <div className="flex-shrink-0">
                                {renderSearchBar()}
                            </div>
                        )}

                        {/* Data Container */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full border rounded bg-gray-50 dark:bg-gray-900">
                                <div className="h-full p-3">
                                    {loading ? (
                                        <div className="text-center text-sm text-gray-500 py-8">
                                            Loading...
                                        </div>
                                    ) : activeTab === "login" ? (
                                        renderLoginDetails()
                                    ) : (
                                        renderStudentLogs()
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                </AlertDialogDescription>

                <AlertDialogFooter className="flex-shrink-0">
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction>Take Action</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default StudentDetailsModal
import React, { useState, useEffect, useMemo } from "react";
import { Users, Activity, AlertTriangle, UserX, RefreshCw } from "lucide-react";
import StudentList from "./list/TotalStudentList";
import LiveStudentList from "./list/LiveStudentList";
import AbsentStudentList from "./list/AbsentStudentList";
import useGetList from "./list/useGetList";
import { Button } from "@/components/ui/button";
import AlertList from "./list/AlertList";

function LiveExamMonitor() {
    const { data, loading, error, refetch } = useGetList();
    const [activeTab, setActiveTab] = useState(null);
    const [students, setStudents] = useState([]);

    const [totalStudents, setTotalStudents] = useState(0);
    const [activeStudents, setActiveStudents] = useState(0);
    const [submittedStudents, setSubmittedStudents] = useState(0);
    const [inprogressStudents, setInprogressStudents] = useState(0);
    const [absentStudents, setAbsentStudents] = useState(0);
    const [alerts, setAlerts] = useState(0);

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);

    // process data whenever it changes
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setStudents(data);

            const activeCount = data.filter((s) => s.students_status === "Active").length;
            const submitCount = data.filter((s) => s.students_status === "Submitted").length;
            const inprogressCount = data.filter((s) => s.students_status === "InProgress").length;
            const absentCount = data.filter((s) => s.students_status === null).length;
            const alertCount = data.filter((s) => s.students_status !== "Active" && s.students_status !== null && s.students_status !== "Submitted" && s.students_status !== "InProgress").length;

            setTotalStudents(data.length);
            setActiveStudents(activeCount);
            setSubmittedStudents(submitCount);
            setInprogressStudents(inprogressCount);
            setAbsentStudents(absentCount);
            setAlerts(alertCount);

            setLastFetched(new Date());
        }
    }, [data]);

    // setup auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refetch();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh, refetch]);

    const totalCandidates = students.length;

    const { captured, allocated, capturedPhotos, remaining } = useMemo(() => {
        const captured = students.filter(s => s.student_biometric_capture === "Y").length;
        const allocated = students.filter(s => s.iecsm_seat_num).length;
        const capturedPhotos = students.filter(s => s.student_image).length;
        return {
            captured,
            allocated,
            capturedPhotos,
            remaining: totalCandidates - allocated
        };
    }, [students]);

    return (
        <div className="p-4   min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Live Exam Monitor</h1>
                    <p className="text-sm text-gray-400">Real-time monitoring of active examinations</p>
                </div>
                <div className="flex flex-col items-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh((prev) => !prev)}
                        className={autoRefresh ? 'text-green-600' : ''}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                    </Button>
                    {lastFetched && (
                        <p className="text-sm text-gray-400 mt-1">
                            Last updated: {lastFetched.toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                <Card
                    icon={<Users size={20} className="text-blue-400" />}
                    title="Total Registered Students"
                    value={totalStudents}
                    onView={() => setActiveTab("total")}
                    isActive={activeTab === "total"}
                    activeBg="bg-blue-900 border-blue-400"
                />

                <ActiveCard
                    icon={<Activity size={20} className="text-green-400" />}
                    title="Live Students Summary"
                    stats={[
                        { label: "In Progress", value: inprogressStudents },
                        { label: "Active", value: activeStudents },
                        { label: "Submitted", value: submittedStudents },
                    ]}
                    onView={() => setActiveTab("active")}
                    isActive={activeTab === "active"}
                    activeBg="bg-green-900 border-green-400"
                    valueColor="text-green-400"
                />

                <Card
                    icon={<UserX size={20} className="text-red-400" />}
                    title="Absent"
                    value={absentStudents}
                    onView={() => setActiveTab("absent")}
                    isActive={activeTab === "absent"}
                    activeBg="bg-red-900 border-red-400"
                    valueColor="text-red-400"
                />

                <Card
                    icon={<AlertTriangle size={20} className="text-yellow-400" />}
                    title="Alerts"
                    value={alerts}
                    onView={() => setActiveTab("alerts")}
                    isActive={activeTab === "alerts"}
                    activeBg="bg-yellow-900 border-yellow-400"
                    valueColor="text-yellow-400"
                />
                <DataCard
                    title="Total Students Summary"
                    icon={<Users size={22} className="text-blue-500" />}
                    stats={[
                        { label: "Remaining Students", value: remaining, color: "text-red-400" },
                        { label: "Captured Fingerprints", value: captured, color: "text-green-400" },
                        { label: "Captured Photo", value: capturedPhotos, color: "text-amber-400" },
                        { label: "Seat Allocated", value: allocated, color: "text-blue-400" },
                    ]}
                />
            </div>

            {/* Conditional Rendering of Lists */}
            {activeTab && (
                <div className="rounded-xl p-6 border border-gray-700">
                    {activeTab === "total" && (
                        <StudentList students={students} loading={loading} error={error} />
                    )}
                    {activeTab === "active" && (
                        <LiveStudentList
                            students={students.filter((s) => s.students_status === "Active" || s.students_status === "Submitted" || s.students_status === "InProgress")}
                            loading={loading}
                            error={error}
                            refreshKey={lastFetched}
                        />
                    )}
                    {activeTab === "absent" && (
                        <AbsentStudentList
                            students={students.filter((s) => s.students_status === null)}
                            loading={loading}
                            error={error}
                        />
                    )}
                    {activeTab === "alerts" && (
                        <AlertList
                            students={students.filter((s) => s.students_status !== "Active" && s.students_status !== null && s.students_status !== "Submitted" && s.students_status !== "InProgress")}
                            loading={loading}
                            error={error}
                        />
                    )}

                </div>
            )}
        </div>
    );
}

// Card component
const Card = ({ icon, title, value, onView, isActive, activeBg, valueColor = "" }) => (
    <div
        className={`rounded-xl border p-4 flex flex-col items-center justify-center transition-colors
        ${isActive ? activeBg : ""} ${isActive ? "text-white" : ""}
      `}
    >
        {icon}
        <p className="text-sm mt-2">{title}</p>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>

        <button
            onClick={onView}
            disabled={isActive}
            className={`w-full mt-3 px-3 py-1 text-xs rounded-md border 
        ${isActive
                    ? "border-gray-600  cursor-not-allowed"
                    : "border-gray-600 "
                }
        transition-colors`}
        >
            {isActive ? "Viewing" : "View"}
        </button>
    </div>
);
const ActiveCard = ({
    icon,
    title,
    value,
    onView,
    isActive,
    activeBg,
    valueColor = "",
    stats = [] // ✅ optional stats array
}) => {
    const showStats = Array.isArray(stats) && stats.length > 0;

    return (
        <div
            className={`rounded-2xl border p-4 flex flex-col gap-2 w-full shadow-sm transition-colors
      ${isActive ? activeBg : ""} ${isActive ? "text-white" : ""}
    `}
        >

            <div className="flex items-center gap-2">
                <p className="text-md">{title}</p>
                <p>  {icon}</p>
            </div>
            {!showStats && (
                <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
            )}

            {showStats && (
                <div className=" text-md w-full">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between text-sm ">
                            <p >{stat.label}: </p>
                            <p className={`font-bold text-lg ${stat.color || ""}`}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={onView}
                disabled={isActive}
                className={`mt-3 px-3 py-1 text-xs rounded-md border
        ${isActive ? "border-gray-600 cursor-not-allowed" : "border-gray-600"}
      `}
            >
                {isActive ? "Viewing" : "View"}
            </button>
        </div>
    );
};


// Special Card component
const DataCard = ({ icon, title, stats }) => {
    return (
        <div className="rounded-2xl border p-4 flex flex-col gap-2 w-full shadow-sm ">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-md ">{title}</h3>
                {icon}
            </div>

            {stats.map((s, i) => (
                <div key={i} className="flex justify-between text-sm ">
                    <span>{s.label}:</span>
                    <span className={`font-bold text-lg ${s.color}`}>{s.value}</span>
                </div>
            ))}
        </div>
    );
};


export default LiveExamMonitor;

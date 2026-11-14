// BiometricDialog.jsx - Complete component file
import React, { useState, useEffect, use } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fingerprint, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { getProfilePhoto, updateStudentProfile } from "@/services/StudentServices/studentService";

export default function BiometricDialog({ open, onClose, student, onVerified }) {
    const [fingerprintData, setFingerprintData] = useState(null);
    const [status, setStatus] = useState("idle");
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const hasFingerprint = !!student?.capture;
    const [studentImage, setStudentImage] = useState(null);

    useEffect(() => {
        if (student) {
            (async () => {
                try {
                    const res = await getProfilePhoto({ student_picture: student.student_picture, exam_id: student.student_exam_id });
                    if (res.status === 200) {
                        const blob = res.data;
                        const imgUrl = URL.createObjectURL(blob);
                        setStudentImage(imgUrl);
                    } else {
                        toast.error("Unable to fetch profile photo");
                    }
                } catch (error) {
                    console.error("Failed to load student image", error);
                }
            })();
        }
    }, [student]);




    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setFingerprintData(null);
            setStatus("idle");
            setTimer(0);
            setIsCapturing(false);
            fetchDeviceInfo();
        }
    }, [open]);

    // Timer effect for capture process
    useEffect(() => {
        let interval = null;
        if (isCapturing && timer < 10) {
            interval = setInterval(() => {
                setTimer(timer => timer + 1);
            }, 1000);
        } else if (timer >= 10) {
            setIsCapturing(false);
            if (status === "capturing") {
                setStatus("timeout");
            }
        }
        return () => clearInterval(interval);
    }, [isCapturing, timer, status]);


    const fetchDeviceInfo = async () => {
        try {
            const response = await fetch("http://127.0.0.1:11100/rd/info", {
                method: "RDSERVICE",
            });

            if (!response.ok) throw new Error("Failed to fetch device info");

            const data = await response.text();
            setDeviceInfo(data);

            // Parse XML to check device status
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const deviceStatus = xmlDoc.getElementsByTagName("RDService")[0]?.getAttribute("status");

            if (deviceStatus === "READY") {
                setStatus("ready");
            } else if (deviceStatus === "NOTREADY") {
                setStatus("error");
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Device Info Error:", error);
            setDeviceInfo("Device not connected");
            setStatus("error");
        }
    };

    // Capture fingerprint
    const captureFingerprint = async () => {
        if (hasFingerprint) return;
        try {
            setStatus("capturing");
            setIsCapturing(true);
            setTimer(0);

            const pidOptionsXml = `
                <PidOptions ver="1.0">
                    <Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" env="P"/>
                </PidOptions>`;

            const response = await fetch("http://127.0.0.1:11100/rd/capture", {
                method: "CAPTURE",
                headers: {
                    "Content-Type": "text/xml",
                },
                body: pidOptionsXml,
            });

            if (!response.ok) throw new Error("Failed to capture fingerprint");

            const data = await response.text();

            // Parse the XML response to check if capture was successful
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const errCode = xmlDoc.getElementsByTagName("Resp")[0]?.getAttribute("errCode");

            if (errCode === "0") {
                setFingerprintData(data);
                setStatus("success");
                setIsCapturing(false);
                toast.success("Fingerprint captured successfully!");
            } else {
                setStatus("failed");
                setIsCapturing(false);
                toast.error("Fingerprint capture failed");
            }
        } catch (error) {
            console.error(error);
            setStatus("failed");
            setIsCapturing(false);
            toast.error("Fingerprint capture failed");
        }
    };

    // Submit student data with fingerprint
    const submitData = async () => {
        try {
            setLoading(true);

            // Extract PidData from the fingerprint response
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(fingerprintData, "text/xml");
            const pidData = xmlDoc.getElementsByTagName("PidData")[0]?.textContent;
            const now = new Date();
            const payload = {
                capture: pidData,
                capt_datetime: now.toISOString().slice(0, 19)
            };

            // Replace with your actual API endpoint
            const response = await updateStudentProfile(student?.id, payload);

            if (response.data.status) {
                toast.success(response.data.msg || "Student verification completed successfully!");
                onVerified(student, fingerprintData);
                onClose();
            } else {
                toast.error("Failed to submit verification data");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit verification data");
        } finally {
            setLoading(false);
        }
    };

    // Reset capture process
    const resetCapture = () => {
        setFingerprintData(null);
        setStatus("ready");
        setTimer(0);
        setIsCapturing(false);
    };

    // Circular timer component
    const CircularTimer = ({ progress, size = 60 }) => {
        const radius = (size - 8) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-300"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="text-blue-500 transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold">{Math.round(progress)}</span>
                </div>
            </div>
        );
    };

    if (!student) return null;

    const timerProgress = isCapturing ? (timer / 10) * 100 : 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Student Biometric Verification</DialogTitle>
                </DialogHeader>

                {/* Student Details */}
                <div className="flex justify-between">
                    <div className="space-y-2 p-4  rounded-lg">
                        {/* <p><strong>ID:</strong> {student.id}</p> */}
                        <p><strong>Roll Number:</strong> {student.roll_number}</p>
                        <p><strong>Name:</strong> {student.name}</p>
                        {/* <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Phone:</strong> {student.phone}</p> */}
                    </div>
                    <div>
                        {studentImage ? (
                            <img
                                src={studentImage}
                                alt="Student Profile"
                                className="w-20 h-20 rounded  border"
                            />
                        ) : null}
                    </div>
                </div>


                {/* Device Status */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Device Status:</h3>
                    <div className="p-2 bg-gray-100 rounded text-sm">
                        {status === "error" ? (
                            <span className="text-red-500">❌ Device not connected</span>
                        ) : status === "ready" ? (
                            <span className="text-green-500">✅ Device ready (Mantra MFS110)</span>
                        ) : (
                            <span className="text-yellow-500">🔄 Checking device...</span>
                        )}
                    </div>
                </div>

                {/* Fingerprint Capture Section */}
                <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                        {/* Status Icon and Timer */}
                        <div className="flex flex-col items-center space-y-2">
                            {status === "capturing" && (
                                <div className="flex flex-col items-center space-y-2">
                                    <CircularTimer progress={timerProgress} />
                                    <Fingerprint className="w-8 h-8 text-blue-500 animate-pulse" />
                                    <p className="text-sm text-gray-600">Place finger on scanner...</p>
                                </div>
                            )}

                            {status === "success" && (
                                <div className="flex flex-col items-center space-y-2">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                    <p className="text-sm text-green-600 font-semibold">Fingerprint captured successfully!</p>
                                </div>
                            )}

                            {status === "failed" && (
                                <div className="flex flex-col items-center space-y-2">
                                    <XCircle className="w-12 h-12 text-red-500" />
                                    <p className="text-sm text-red-600 font-semibold">Capture failed. Please try again.</p>
                                </div>
                            )}

                            {status === "timeout" && (
                                <div className="flex flex-col items-center space-y-2">
                                    <XCircle className="w-12 h-12 text-orange-500" />
                                    <p className="text-sm text-orange-600 font-semibold">Timeout. Please try again.</p>
                                </div>
                            )}

                            {(status === "idle" || status === "ready") && (
                                <div className="flex flex-col items-center space-y-2">
                                    {hasFingerprint ? (
                                        <p className="text-sm text-green-600 font-semibold">
                                            Fingerprint already captured for this student.
                                        </p>
                                    ) : (
                                        <>
                                            <Fingerprint className="w-12 h-12 text-gray-400" />
                                            <p className="text-sm text-gray-600">Ready to capture fingerprint</p>
                                        </>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-2 w-full">
                            {/* {(status === "idle" || status === "ready") && (
                                <Button
                                    onClick={captureFingerprint}
                                    disabled={status === "error" || deviceInfo === "Device not connected"}
                                    className="gap-2"
                                >
                                    <Fingerprint className="w-4 h-4" />
                                    Capture Fingerprint
                                </Button>
                            )} */}
                            {(status === "idle" || status === "ready") && (
                                <Button
                                    onClick={captureFingerprint}
                                    disabled={status === "error" || deviceInfo === "Device not connected" || hasFingerprint}
                                    className="gap-2"
                                >
                                    <Fingerprint className="w-4 h-4" />
                                    {hasFingerprint ? "Fingerprint Already Captured" : "Capture Fingerprint"}
                                </Button>
                            )}

                            {(status === "failed" || status === "timeout") && (
                                <Button
                                    onClick={resetCapture}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Retry
                                </Button>
                            )}

                            {status === "success" && (
                                <div className="flex gap-2 w-full">
                                    <Button
                                        onClick={resetCapture}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Recapture
                                    </Button>
                                    <Button
                                        onClick={submitData}
                                        disabled={loading}
                                        className="flex-1 gap-2"
                                    >
                                        {loading ? "Submitting..." : "Submit Verification"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Debug Info (optional - remove in production) */}
                {/* {fingerprintData && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-600">
                            View Raw Fingerprint Data
                        </summary>
                        <pre className="bg-gray-800 text-white p-2 mt-2 text-xs overflow-auto max-h-32">
                            {fingerprintData}
                        </pre>
                    </details>
                )} */}
            </DialogContent>
        </Dialog>
    );
}
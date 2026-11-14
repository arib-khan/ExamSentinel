import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fingerprint, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import uploadManager from "./uploadManager";

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

const FINGERPRINT_SCAN_IMAGE = "/public/HandImg.jpg";

const FingerprintCaptureComponent = forwardRef(({ student }, ref) => {
    const [fingerprintData, setFingerprintData] = useState(null);
    const [status, setStatus] = useState("idle");
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const fetchDeviceInfo = useCallback(async () => {
        try {
            const response = await fetch("http://127.0.0.1:11100/rd/info", { method: "RDSERVICE" });
            if (!response.ok) throw new Error("Failed to fetch device info");
            const data = await response.text();
            setDeviceInfo(data);

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const deviceStatus = xmlDoc.getElementsByTagName("RDService")[0]?.getAttribute("status");

            if (deviceStatus === "READY") {
                setStatus("ready");
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Device Info Error:", error);
            setDeviceInfo("Device not connected");
            setStatus("error");
        }
    }, []);

    const captureFingerprint = async () => {
        try {
            setStatus("capturing");
            setIsCapturing(true);
            setTimer(0);

            const pidOptionsXml = `<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" env="P"/></PidOptions>`;

            const response = await fetch("http://127.0.0.1:11100/rd/capture", {
                method: "CAPTURE",
                headers: { "Content-Type": "text/xml" },
                body: pidOptionsXml,
            });

            if (!response.ok) throw new Error("Failed to capture fingerprint");
            const data = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const respElement = xmlDoc.getElementsByTagName("Resp")[0];
            const errCode = respElement?.getAttribute("errCode");

            if (errCode === "0") {
                setFingerprintData(data);
                setStatus("success");
                // toast.success("Fingerprint captured successfully!");
            } else {
                setStatus("failed");
                toast.error("Fingerprint capture failed: " + respElement?.getAttribute("errInfo"));
            }
        } catch (error) {
            console.error(error);
            setStatus("failed");
            toast.error("Fingerprint capture failed due to connection error.");
        } finally {
            setIsCapturing(false);
        }
    };

    const submitData = async () => {
        if (!fingerprintData) return;

        try {
            setLoading(true);

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(fingerprintData, "text/xml");
            const pidDataElement = xmlDoc.getElementsByTagName("PidData")[0];
            const pidData = pidDataElement
                ? new XMLSerializer().serializeToString(pidDataElement)
                : fingerprintData;

            await uploadManager.addToQueue(
                {
                    student_id: student?.id,
                    pidData: pidData
                },
                'fingerprint',
                {
                    studentName: student?.name,
                    onSuccess: (result) => {
                        console.log(`✅ Fingerprint uploaded to ALL servers:`, result);
                    },
                    onPartialSuccess: (result) => {
                        console.log(`⚠️ Fingerprint uploaded to ${result.successfulServers.length} servers`);
                    }
                }
            );

            // toast.success("Fingerprint queued for upload! Upload will continue in background.");
            setIsSubmitted(true);

        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to queue fingerprint");
        } finally {
            setLoading(false);
        }
    };

    const resetCapture = () => {
        if (isSubmitted) {
            toast.info("Fingerprint already submitted. Cannot recapture.");
            return;
        }

        setFingerprintData(null);
        setStatus("ready");
        setTimer(0);
        setIsCapturing(false);
    };

    const restartDeviceCheck = useCallback(() => {
        setFingerprintData(null);
        setStatus("idle");
        setTimer(0);
        setIsCapturing(false);
        setIsSubmitted(false);
        fetchDeviceInfo();
    }, [fetchDeviceInfo]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        restartDeviceCheck,
        isSubmitted: () => isSubmitted
    }));

    useEffect(() => {
        if (student) {
            setFingerprintData(null);
            setStatus("idle");
            setTimer(0);
            setIsCapturing(false);
            setIsSubmitted(false);
            fetchDeviceInfo();
        }
    }, [student, fetchDeviceInfo]);

    useEffect(() => {
        let interval = null;
        if (isCapturing && timer < 10) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } else if (timer >= 10 && isCapturing) {
            setIsCapturing(false);
            if (status === "capturing") {
                setStatus("timeout");
                toast.error("Fingerprint capture timed out.");
            }
        }
        return () => clearInterval(interval);
    }, [isCapturing, timer, status]);

    if (!student) return <div className="text-gray-500 p-4 border rounded">Select a student.</div>;

    const timerProgress = isCapturing ? (timer / 10) * 100 : 0;

    return (
        <div className="border p-4 rounded-lg flex-1">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Fingerprint Capture
                    {isSubmitted && <CheckCircle className="w-5 h-5 text-green-500" />}
                </h3>
                <Button
                    onClick={restartDeviceCheck}
                    variant="outline"
                    size="sm"
                    disabled={isCapturing || loading}
                >
                    <RotateCcw className="w-4 h-4" />
                    Refresh Device
                </Button>
            </div>

            {/* Device Status */}
            <div className="p-2 bg-gray-100 rounded text-sm mb-4">
                <strong>Device Status:</strong> {status === "error" ? (
                    <span className="text-red-500">❌ Not connected</span>
                ) : status === "ready" ? (
                    <span className="text-green-500">✅ Ready</span>
                ) : (
                    <span className="text-yellow-500">🔄 Checking...</span>
                )}
            </div>

            {/* Visual Feedback Area */}
            <div className="flex flex-col items-center space-y-4 min-h-40 justify-center relative border border-dashed rounded p-4">
                {(status === "ready" || status === "capturing") && !fingerprintData && (
                    <img
                        src={FINGERPRINT_SCAN_IMAGE}
                        alt="Place finger on scanner"
                        className="w-full max-w-lg h-full object-contain rounded-md mb-8 opacity-80"
                    />
                )}

                {status === "capturing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70">
                        <CircularTimer progress={timerProgress} size={80} />
                        <p className="text-base font-semibold mt-2 text-blue-600 animate-pulse">
                            Place finger on scanner...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-base text-green-600 font-semibold">Capture Complete!</p>
                    </div>
                )}

                {(status === "failed" || status === "timeout") && (
                    <div className="flex flex-col items-center space-y-2">
                        <XCircle className="w-12 h-12 text-red-500" />
                        <p className="text-sm text-red-600 font-semibold">
                            {status === "timeout" ? "Timeout." : "Capture failed."}
                        </p>
                    </div>
                )}

                {(status === "idle" || status === "error") && !fingerprintData && (
                    <div className="flex flex-col items-center space-y-2">
                        <Fingerprint className="w-12 h-12" />
                        <p className="text-sm text-gray-600">
                            {status === "error" ? "Device Error. Check connection." : "Ready to start capture"}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mt-4">
                {(!fingerprintData && (status === "ready" || status === "failed" || status === "timeout")) && (
                    <Button
                        onClick={captureFingerprint}
                        disabled={status === "error" || isCapturing || isSubmitted}
                        className="gap-2 w-full"
                    >
                        <Fingerprint className="w-4 h-4" />
                        {status === "failed" || status === "timeout" ? "Retry Capture" : "Capture Fingerprint"}
                    </Button>
                )}

                {fingerprintData && (
                    <>
                        {!isSubmitted && (
                            <Button
                                onClick={resetCapture}
                                variant="outline"
                                className="gap-2 flex-1"
                                disabled={loading}
                            >
                                <RotateCcw className="w-4 h-4" />
                                Recapture
                            </Button>
                        )}
                        <Button
                            onClick={submitData}
                            disabled={loading || isSubmitted}
                            className="gap-2 flex-1"
                        >
                            {loading ? "Uploading..." : isSubmitted ? "Submitted ✓" : "Submit Fingerprint"}
                        </Button>
                    </>
                )}
            </div>

            {isSubmitted && (
                <p className="text-xs text-center text-green-600 font-semibold mt-2">
                    ✓ Fingerprint submitted successfully
                </p>
            )}
        </div>
    );
});

export default FingerprintCaptureComponent;
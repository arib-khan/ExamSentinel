import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, CheckCircle, XCircle, RotateCcw, Video } from "lucide-react";
import { getProfilePhoto } from "@/services/StudentServices/studentService";

export default function PhotoCaptureDialog({ open, onClose, student, onVerified }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [status, setStatus] = useState("idle");
    const [loading, setLoading] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [studentImage, setStudentImage] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");

    const hasPhoto = !!student?.photo_capture; // Adjust field name as needed

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


    // Get available cameras
    useEffect(() => {
        if (open) {
            enumerateCameras();
        }
    }, [open]);

    // Initialize camera when dialog opens
    useEffect(() => {
        if (open && !hasPhoto) {
            initializeCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open, selectedCamera, hasPhoto]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setCapturedPhoto(null);
            setStatus("idle");
            setLoading(false);
        }
    }, [open]);

    const enumerateCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            setAvailableCameras(cameras);

            if (cameras.length > 0 && !selectedCamera) {
                setSelectedCamera(cameras[0].deviceId);
            }
        } catch (error) {
            console.error("Error enumerating cameras:", error);
            toast.error("Failed to detect cameras");
        }
    };

    const initializeCamera = async () => {
        try {
            setStatus("initializing");

            const constraints = {
                video: {
                    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                    setStatus("ready");
                };
            }
        } catch (error) {
            console.error("Camera initialization error:", error);
            setStatus("error");
            setCameraReady(false);

            if (error.name === 'NotAllowedError') {
                toast.error("Camera access denied. Please allow camera permissions.");
            } else if (error.name === 'NotFoundError') {
                toast.error("No camera found. Please connect a camera.");
            } else {
                toast.error("Failed to access camera: " + error.message);
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const photoUrl = URL.createObjectURL(blob);
                    setCapturedPhoto({ blob, url: photoUrl });
                    setStatus("success");
                    stopCamera();
                    toast.success("Photo captured successfully!");
                }
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error("Capture error:", error);
            setStatus("failed");
            toast.error("Failed to capture photo");
        }
    };

    const retakePhoto = () => {
        if (capturedPhoto?.url) {
            URL.revokeObjectURL(capturedPhoto.url);
        }
        setCapturedPhoto(null);
        setStatus("idle");
        initializeCamera();
    };

    const submitPhoto = async () => {
        if (!capturedPhoto) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('photo', capturedPhoto.blob, 'captured_photo.jpg');
            formData.append('photo_capture_datetime', new Date().toISOString().slice(0, 19));

            // Replace with your actual API endpoint
            // Assuming you have updateStudentProfile service
            const response = await fetch(`/api/students/${student.id}/photo`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status || response.ok) {
                toast.success("Photo uploaded successfully!");
                onVerified(student, capturedPhoto);
                onClose();
            } else {
                toast.error("Failed to upload photo");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit photo");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (capturedPhoto?.url) {
            URL.revokeObjectURL(capturedPhoto.url);
        }
        stopCamera();
        onClose();
    };

    if (!student) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-2xl"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Candidate Photo Capture
                    </DialogTitle>
                </DialogHeader>

                {/* Student Details */}
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <p><strong>Roll Number:</strong> {student.roll_number}</p>
                        <p><strong>Name:</strong> {student.name}</p>
                    </div>
                    {studentImage && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Existing Photo</p>
                            <img
                                src={studentImage}
                                alt="Existing"
                                className="w-20 h-20 rounded  border"
                            />
                        </div>
                    )}
                </div>

                {/* Camera Selection */}
                {availableCameras.length > 1 && !capturedPhoto && (
                    <div className="mb-2">
                        <label className="text-sm font-medium">Select Camera:</label>
                        <select
                            value={selectedCamera}
                            onChange={(e) => {
                                setSelectedCamera(e.target.value);
                                stopCamera();
                            }}
                            className="w-full mt-1 p-2 border rounded"
                        >
                            {availableCameras.map((camera, index) => (
                                <option key={camera.deviceId} value={camera.deviceId}>
                                    {camera.label || `Camera ${index + 1}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Camera Status */}
                <div className="mb-2">
                    <div className="p-2 bg-gray-100 rounded text-sm">
                        {status === "error" ? (
                            <span className="text-red-500">❌ Camera not accessible</span>
                        ) : status === "ready" ? (
                            <span className="text-green-500">✅ Camera ready</span>
                        ) : status === "initializing" ? (
                            <span className="text-yellow-500">🔄 Initializing camera...</span>
                        ) : hasPhoto ? (
                            <span className="text-green-500">✅ Photo already captured</span>
                        ) : (
                            <span className="text-gray-500">⏳ Camera inactive</span>
                        )}
                    </div>
                </div>

                {/* Camera Preview / Captured Photo */}
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    {!capturedPhoto ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {!cameraReady && !hasPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Waiting for camera...</p>
                                    </div>
                                </div>
                            )}

                            {hasPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                                    <div className="text-white text-center">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-sm">Photo already captured for this student</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <img
                            src={capturedPhoto.url}
                            alt="Captured"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-2 mt-4">
                    {status === "ready" && !capturedPhoto && !hasPhoto && (
                        <Button
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            className="gap-2"
                            size="lg"
                        >
                            <Camera className="w-5 h-5" />
                            Capture Photo
                        </Button>
                    )}

                    {capturedPhoto && (
                        <div className="flex gap-2 w-full">
                            <Button
                                onClick={retakePhoto}
                                variant="outline"
                                className="gap-2 flex-1"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Retake
                            </Button>
                            <Button
                                onClick={submitPhoto}
                                disabled={loading}
                                className="gap-2 flex-1"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {loading ? "Uploading..." : "Submit Photo"}
                            </Button>
                        </div>
                    )}

                    {hasPhoto && (
                        <Button
                            onClick={handleClose}
                            variant="outline"
                        >
                            Close
                        </Button>
                    )}
                </div>

                {/* Instructions */}
                {!capturedPhoto && !hasPhoto && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                        Position the candidate in frame and click "Capture Photo"
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
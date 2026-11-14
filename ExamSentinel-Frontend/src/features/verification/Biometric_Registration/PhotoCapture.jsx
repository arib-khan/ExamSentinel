import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, CheckCircle, RotateCcw, Video } from "lucide-react";
import uploadManager from "./uploadManager";

const PhotoCaptureComponent = forwardRef(({ student }, ref) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [status, setStatus] = useState("idle");
    const [cameraReady, setCameraReady] = useState(false);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const hasPhoto = !!student?.photo_capture;

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    }, []);

    const initializeCamera = useCallback(async (deviceId) => {
        stopCamera();
        try {
            setStatus("initializing");
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 640 },
                    height: { ideal: 480 },
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
            toast.error("Failed to access camera: " + (error.name === 'NotAllowedError' ? "Access Denied" : error.message));
        }
    }, [stopCamera]);

    useEffect(() => {
        const enumerateCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(cameras);
                if (cameras.length > 0) {
                    setSelectedCamera(prev => prev || cameras[0].deviceId);
                }
            } catch (error) {
                console.error("Error enumerating cameras:", error);
                toast.error("Failed to detect cameras");
            }
        };
        enumerateCameras();
    }, []);

    useEffect(() => {
        if (student && !capturedPhoto && selectedCamera) {
            initializeCamera(selectedCamera);
        }
        return () => {
            if (student && !capturedPhoto) {
                stopCamera();
            }
        };
    }, [student, selectedCamera, capturedPhoto, initializeCamera, stopCamera]);

    // Reset on student change
    useEffect(() => {
        setCapturedPhoto(null);
        setIsSubmitted(false);
    }, [student]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const photoUrl = URL.createObjectURL(blob);
                    setCapturedPhoto({ blob, url: photoUrl });
                    setStatus("success");
                    stopCamera();
                    // toast.success("Photo captured successfully!");
                }
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error("Capture error:", error);
            setStatus("failed");
            toast.error("Failed to capture photo");
        }
    };

    const retakePhoto = () => {
        if (isSubmitted) {
            toast.info("Photo already submitted. Cannot retake.");
            return;
        }

        if (capturedPhoto?.url) {
            URL.revokeObjectURL(capturedPhoto.url);
        }
        setCapturedPhoto(null);
        setStatus("idle");
        initializeCamera(selectedCamera);
    };

    const submitPhoto = async () => {
        if (!capturedPhoto) return;

        try {
            setLoading(true);

            const reader = new FileReader();
            reader.readAsDataURL(capturedPhoto.blob);

            reader.onloadend = async () => {
                await uploadManager.addToQueue(
                    {
                        blob: reader.result,
                        student_id: student?.id
                    },
                    'photo',
                    {
                        studentName: student?.name,
                        onSuccess: (result) => {
                            console.log(`✅ Photo uploaded to ALL servers:`, result);
                        },
                        onPartialSuccess: (result) => {
                            console.log(`⚠️ Photo uploaded to ${result.successfulServers.length} servers, retrying failed ones...`);
                        },
                        onFail: (error) => {
                            console.error('❌ Photo upload failed:', error);
                        }
                    }
                );

                // toast.success("Photo queued for upload to all servers!");
                setIsSubmitted(true);
                setLoading(false);
            };
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to queue photo");
            setLoading(false);
        }
    };

    const restartCamera = useCallback(() => {
        if (capturedPhoto?.url) {
            URL.revokeObjectURL(capturedPhoto.url);
        }
        setCapturedPhoto(null);
        setIsSubmitted(false);
        stopCamera();
        initializeCamera(selectedCamera);
    }, [capturedPhoto, stopCamera, initializeCamera, selectedCamera]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        restartCamera,
        isSubmitted: () => isSubmitted
    }));

    if (!student) return <div className="text-gray-500 p-4 border rounded">Select a student.</div>;

    return (
        <div className="border p-4 rounded-lg flex-1">
            <div className="flex justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Photo Capture
                    {isSubmitted && <CheckCircle className="w-5 h-5 text-green-500" />}
                </h3>
                <Button
                    onClick={restartCamera}
                    variant="outline"
                    size="sm"
                >
                    <RotateCcw className="w-4 h-4" />
                    Refresh Device
                </Button>
            </div>

            {/* Camera Selection */}
            {availableCameras.length > 1 && !capturedPhoto && (
                <div className="mb-2">
                    <select
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="w-full mt-1 p-2 border rounded text-sm"
                    >
                        {availableCameras.map((camera, index) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Camera ${index + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Camera Preview / Captured Photo */}
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                                <div className="text-white text-center">
                                    <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{status === 'error' ? 'Camera Error' : 'Waiting for camera...'}</p>
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

            <div className="flex justify-center gap-2">
                {!capturedPhoto ? (
                    <Button
                        onClick={capturePhoto}
                        disabled={!cameraReady || hasPhoto || isSubmitted}
                        className="gap-2 w-full"
                    >
                        <Camera className="w-4 h-4" />
                        Capture Photo
                    </Button>
                ) : (
                    <>
                        {!isSubmitted && (
                            <Button
                                onClick={retakePhoto}
                                variant="outline"
                                className="gap-2 flex-1"
                                disabled={loading}
                            >
                                <RotateCcw className="w-4 h-4" />
                                Retake
                            </Button>
                        )}
                        <Button
                            onClick={submitPhoto}
                            disabled={loading || isSubmitted}
                            className="gap-2 flex-1"
                        >
                            {loading ? "Uploading..." : isSubmitted ? "Submitted ✓" : "Submit Photo"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
});

export default PhotoCaptureComponent;
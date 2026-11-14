// // components/ConnectionStatusOverlay.jsx
// import { useEffect, useState } from "react";
// import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";

// export default function ConnectionStatusOverlay({ socketStatus, onRetry }) {
//     const [dots, setDots] = useState("");
//     const [retryCount, setRetryCount] = useState(0);

//     // Animate dots for loading effect
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
//         }, 500);
//         return () => clearInterval(interval);
//     }, []);

//     // Track retry attempts
//     useEffect(() => {
//         if (socketStatus === "disconnected" || socketStatus === "error") {
//             setRetryCount((prev) => prev + 1);
//         }
//     }, [socketStatus]);

//     // Don't show overlay if connection is active or connected
//     const shouldShow = ["disconnected", "paused", "error"].includes(
//         socketStatus?.toLowerCase()
//     );

//     if (!shouldShow) return null;

//     const getStatusInfo = () => {
//         switch (socketStatus?.toLowerCase()) {
//             case "disconnected":
//                 return {
//                     icon: WifiOff,
//                     title: "Connection Lost",
//                     message: "Trying to reconnect to the server",
//                     color: "text-red-600",
//                     bgColor: "bg-red-50",
//                     borderColor: "border-red-200",
//                 };
//             case "paused":
//                 return {
//                     icon: AlertCircle,
//                     title: "Exam Paused",
//                     message: "Reconnecting to resume your exam",
//                     color: "text-orange-600",
//                     bgColor: "bg-orange-50",
//                     borderColor: "border-orange-200",
//                 };
//             case "error":
//                 return {
//                     icon: AlertCircle,
//                     title: "Connection Error",
//                     message: "Unable to connect to the server",
//                     color: "text-red-600",
//                     bgColor: "bg-red-50",
//                     borderColor: "border-red-200",
//                 };
//             // case "connecting":
//             //     return {
//             //         icon: RefreshCw,
//             //         title: "Connecting",
//             //         message: "Establishing connection with server",
//             //         color: "text-blue-600",
//             //         bgColor: "bg-blue-50",
//             //         borderColor: "border-blue-200",
//             //     };
//             default:
//                 return {
//                     icon: RefreshCw,
//                     title: "Connecting",
//                     message: "Please wait",
//                     color: "text-gray-600",
//                     bgColor: "bg-gray-50",
//                     borderColor: "border-gray-200",
//                 };
//         }
//     };

//     const statusInfo = getStatusInfo();
//     const StatusIcon = statusInfo.icon;

//     return (
//         <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center select-none">
//             <div className="max-w-md w-full mx-4">
//                 <div
//                     className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-2xl p-8 shadow-2xl`}
//                 >
//                     {/* Icon */}
//                     <div className="flex justify-center mb-6">
//                         <div
//                             className={`${statusInfo.bgColor} p-6 rounded-full ${socketStatus === "connecting" ? "animate-spin" : "animate-pulse"
//                                 }`}
//                         >
//                             <StatusIcon className={`${statusInfo.color} w-16 h-16`} />
//                         </div>
//                     </div>

//                     {/* Title */}
//                     <h2
//                         className={`text-3xl font-bold text-center mb-3 ${statusInfo.color}`}
//                     >
//                         {statusInfo.title}
//                     </h2>

//                     {/* Message */}
//                     <p className="text-center text-gray-700 text-lg mb-6">
//                         {statusInfo.message}
//                         <span className="inline-block w-8 text-left">{dots}</span>
//                     </p>

//                     {/* Connection Status Details */}
//                     <div className="space-y-3 mb-6">
//                         <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
//                             <span className="font-medium">Status:</span>
//                             <span className={`font-semibold ${statusInfo.color} capitalize`}>
//                                 {socketStatus}
//                             </span>
//                         </div>

//                         {retryCount > 0 && socketStatus !== "connecting" && (
//                             <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
//                                 <span className="font-medium">Retry Attempts:</span>
//                                 <span className="font-semibold">{retryCount}</span>
//                             </div>
//                         )}

//                         <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
//                             <span className="font-medium">Network:</span>
//                             <span
//                                 className={`flex items-center gap-2 font-semibold ${navigator.onLine ? "text-green-600" : "text-red-600"
//                                     }`}
//                             >
//                                 {navigator.onLine ? (
//                                     <>
//                                         <Wifi size={16} /> Online
//                                     </>
//                                 ) : (
//                                     <>
//                                         <WifiOff size={16} /> Offline
//                                     </>
//                                 )}
//                             </span>
//                         </div>
//                     </div>

//                     {/* Retry Button (only show for error or disconnected after some attempts) */}
//                     {(socketStatus === "error" ||
//                         (socketStatus === "disconnected" && retryCount > 3)) &&
//                         onRetry && (
//                             <button
//                                 onClick={() => {
//                                     setRetryCount(0);
//                                     onRetry();
//                                 }}
//                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
//                             >
//                                 <RefreshCw size={20} />
//                                 Retry Connection
//                             </button>
//                         )}

//                     {/* Loading Bar */}
//                     {socketStatus === "connecting" && (
//                         <div className="mt-6">
//                             <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                                 <div className="h-full bg-blue-600 animate-pulse rounded-full w-3/4"></div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Help Text */}
//                     <div className="mt-6 text-center text-sm text-gray-500">
//                         {!navigator.onLine ? (
//                             <p className="flex items-center justify-center gap-2">
//                                 <WifiOff size={16} />
//                                 Please check your internet connection
//                             </p>
//                         ) : (
//                             <p>Your exam timer is paused. Please do not close this window.</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
// components/ConnectionStatusOverlay.jsx
import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { getConnectionInfo } from "@/store/slices/examSocket";

export default function ConnectionStatusOverlay({ socketStatus, onRetry }) {
    const [dots, setDots] = useState("");
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Animate dots for loading effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Get connection info from socket
    useEffect(() => {
        const interval = setInterval(() => {
            const info = getConnectionInfo();
            setConnectionInfo(info);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Don't show overlay if connection is active or connected
    const shouldShow = ["disconnected", "paused", "error", "connecting"].includes(
        socketStatus?.toLowerCase()
    );

    if (!shouldShow) return null;

    const getStatusInfo = () => {
        switch (socketStatus?.toLowerCase()) {
            case "disconnected":
                return {
                    icon: WifiOff,
                    title: "Connection Lost",
                    message: "Trying to reconnect to the server",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            case "paused":
                return {
                    icon: AlertCircle,
                    title: "Exam Paused",
                    message: "Reconnecting to resume your exam",
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                    borderColor: "border-orange-200",
                };
            case "error":
                return {
                    icon: AlertCircle,
                    title: "Connection Error",
                    message: "Unable to connect to the server",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            case "connecting":
                return {
                    icon: RefreshCw,
                    title: "Connecting",
                    message: "Establishing connection with server",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                };
            default:
                return {
                    icon: RefreshCw,
                    title: "Connecting",
                    message: "Please wait",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center select-none">
            <div className="max-w-md w-full mx-4">
                <div
                    className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-2xl p-8 shadow-2xl`}
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className={`${statusInfo.bgColor} p-6 rounded-full ${socketStatus === "connecting" ? "animate-spin" : "animate-pulse"
                                }`}
                        >
                            <StatusIcon className={`${statusInfo.color} w-16 h-16`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className={`text-3xl font-bold text-center mb-3 ${statusInfo.color}`}
                    >
                        {statusInfo.title}
                    </h2>

                    {/* Message */}
                    <p className="text-center text-gray-700 text-lg mb-6">
                        {statusInfo.message}
                        <span className="inline-block w-8 text-left">{dots}</span>
                    </p>

                    {/* Connection Status Details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
                            <span className="font-medium">Status:</span>
                            <span className={`font-semibold ${statusInfo.color} capitalize`}>
                                {socketStatus}
                            </span>
                        </div>

                        {retryCount > 0 && socketStatus !== "connecting" && (
                            <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
                                <span className="font-medium">Retry Attempts:</span>
                                <span className="font-semibold">{retryCount}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
                            <span className="font-medium">Network:</span>
                            <span
                                className={`flex items-center gap-2 font-semibold ${navigator.onLine ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {navigator.onLine ? (
                                    <>
                                        <Wifi size={16} /> Online
                                    </>
                                ) : (
                                    <>
                                        <WifiOff size={16} /> Offline
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Retry Button (only show for error or disconnected after some attempts) */}
                    {(socketStatus === "error" ||
                        (socketStatus === "disconnected" && retryCount > 3)) &&
                        onRetry && (
                            <button
                                onClick={() => {
                                    setRetryCount(0);
                                    onRetry();
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Retry Connection
                            </button>
                        )}

                    {/* Loading Bar */}
                    {socketStatus === "connecting" && (
                        <div className="mt-6">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 animate-pulse rounded-full w-3/4"></div>
                            </div>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        {!navigator.onLine ? (
                            <p className="flex items-center justify-center gap-2">
                                <WifiOff size={16} />
                                Please check your internet connection
                            </p>
                        ) : (
                            <p>Your exam timer is paused. Please do not close this window.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
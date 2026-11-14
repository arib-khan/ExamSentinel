import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { config, getConfig } from "@/config";

const ExamSocketContext = createContext(null);

export const ExamSocketProvider = ({ children }) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [socketData, setSocketData] = useState(null);
    const [connectionInfo, setConnectionInfo] = useState({
        socketStatus: 'disconnected',
        reconnectAttempts: 0,
        maxReconnectAttempts: 10,
        shouldReconnect: true,
        WebSocket_url: null,
    });

    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectIntervalRef = useRef(5000);
    const shouldReconnectRef = useRef(true);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttemptsRef = useRef(10);
    const WebSocket_urlRef = useRef(null);
    const studentIdRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    // Ensure config is loaded
    const ensureSocketConfig = async () => {
        if (!WebSocket_urlRef.current) {
            await config.load();
            WebSocket_urlRef.current = getConfig("VITE_WEB_SOCKET_URL");
            // console.log("Loaded WebSocket URL:", WebSocket_urlRef.current);
        }
    };

    // Update connection info state
    const updateConnectionInfo = useCallback(() => {
        setConnectionInfo({
            socketStatus: getSocketStatus(),
            reconnectAttempts: reconnectAttemptsRef.current,
            maxReconnectAttempts: maxReconnectAttemptsRef.current,
            shouldReconnect: shouldReconnectRef.current,
            WebSocket_url: WebSocket_urlRef.current,
        });
    }, []);

    // Get socket status
    const getSocketStatus = useCallback(() => {
        if (!socketRef.current) return "disconnected";

        switch (socketRef.current.readyState) {
            case WebSocket.CONNECTING:
                return "connecting";
            case WebSocket.OPEN:
                return "connected";
            case WebSocket.CLOSING:
                return "closing";
            case WebSocket.CLOSED:
                return "disconnected";
            default:
                return "unknown";
        }
    }, []);

    // Connect to WebSocket
    const connect = useCallback(async (studentId) => {
        await ensureSocketConfig();

        if (!WebSocket_urlRef.current) {
            console.error("❌ VITE_SOCKET_URL missing in config.json");
            return;
        }

        if (!studentId) return;

        studentIdRef.current = studentId;

        if (!shouldReconnectRef.current) {
            console.log("⛔ Reconnect disabled");
            return;
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("🟢 Socket already connected");
            return;
        }

        if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
            console.error(
                `❌ Max reconnect attempts (${maxReconnectAttemptsRef.current}) reached. Stopping reconnection.`
            );
            setConnectionStatus('error');
            setSocketData({
                type: "connection",
                status: "error",
                usedInMin: 0,
                remainingInMin: 0,
            });
            updateConnectionInfo();
            return;
        }

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        // console.log(`🔄 Attempting to connect... (Attempt ${reconnectAttemptsRef.current + 1})`);

        setConnectionStatus('connecting');
        setSocketData({
            type: "connection",
            status: "connecting",
            usedInMin: 0,
            remainingInMin: 0,
        });

        try {
            socketRef.current = new WebSocket(`${WebSocket_urlRef.current}/ws?studentId=${studentId}`);

            socketRef.current.onopen = () => {
                console.log("✅ WebSocket connected");
                reconnectAttemptsRef.current = 0;
                clearTimeout(reconnectTimeoutRef.current);

                setConnectionStatus('connected');
                setSocketData({
                    type: "connection",
                    status: "connected",
                    usedInMin: 0,
                    remainingInMin: 0,
                });
                updateConnectionInfo();
            };

            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setSocketData(data);
                    // console.log(data, "logsss");
                } catch {
                    if (event.data === "resumed") {
                        console.log("⏯️ Exam resumed via WebSocket");
                        setSocketData({
                            type: "status",
                            status: "active",
                            usedInMin: 0,
                            remainingInMin: 0,
                        });
                    }
                }
            };

            socketRef.current.onclose = (event) => {
                console.log(`❌ WebSocket closed (Code: ${event.code}, Reason: ${event.reason})`);

                setConnectionStatus('disconnected');
                setSocketData({
                    type: "connection",
                    status: "disconnected",
                    usedInMin: 0,
                    remainingInMin: 0,
                });

                if (shouldReconnectRef.current) {
                    reconnectAttemptsRef.current++;

                    const delay = Math.min(
                        reconnectIntervalRef.current * Math.pow(1.5, reconnectAttemptsRef.current - 1),
                        30000
                    );

                    console.log(`🔁 Scheduling reconnect in ${delay / 1000}s (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect(studentIdRef.current);
                    }, delay);
                }
                updateConnectionInfo();
            };

            socketRef.current.onerror = (error) => {
                console.error("❌ WebSocket error:", error);

                setConnectionStatus('error');
                setSocketData({
                    type: "connection",
                    status: "error",
                    usedInMin: 0,
                    remainingInMin: 0,
                });
                updateConnectionInfo();
            };
        } catch (error) {
            console.error("❌ Failed to create WebSocket:", error);

            setConnectionStatus('error');
            setSocketData({
                type: "connection",
                status: "error",
                usedInMin: 0,
                remainingInMin: 0,
            });

            if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
                reconnectAttemptsRef.current++;
                const delay = Math.min(
                    reconnectIntervalRef.current * Math.pow(1.5, reconnectAttemptsRef.current - 1),
                    30000
                );

                reconnectTimeoutRef.current = setTimeout(() => {
                    connect(studentIdRef.current);
                }, delay);
            }
            updateConnectionInfo();
        }
    }, [updateConnectionInfo]);

    // Send message
    const sendMessage = useCallback((payload) => {
        // console.log(payload, "log");

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(payload));
            return true;
        } else {
            console.warn("⚠️ WebSocket not connected, cannot send:", payload);
            return false;
        }
    }, []);

    // Close socket
    const closeSocket = useCallback(() => {
        console.log("🛑 Closing exam socket and disabling reconnection");
        shouldReconnectRef.current = false;
        reconnectAttemptsRef.current = 0;
        clearTimeout(reconnectTimeoutRef.current);
        clearInterval(heartbeatIntervalRef.current);

        if (socketRef.current) {
            socketRef.current.close(1000, "Exam completed");
            socketRef.current = null;
        }

        setConnectionStatus('disconnected');
        updateConnectionInfo();
    }, [updateConnectionInfo]);

    // Restart connection
    const restart = useCallback((studentId) => {
        console.log("🔄 Manual reconnection requested");
        shouldReconnectRef.current = true;
        reconnectAttemptsRef.current = 0;
        clearTimeout(reconnectTimeoutRef.current);
        connect(studentId || studentIdRef.current);
    }, [connect]);

    // Start heartbeat
    const startHeartbeat = useCallback(() => {
        // Clear existing interval
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        // Send heartbeat every 10 seconds
        heartbeatIntervalRef.current = setInterval(() => {
            sendMessage({ status: "Active" });
        }, 10000);

        // Send initial heartbeat
        sendMessage({ status: "Active" });
    }, [sendMessage]);

    // Stop heartbeat
    const stopHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeout(reconnectTimeoutRef.current);
            clearInterval(heartbeatIntervalRef.current);
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const value = {
        connectionStatus,
        socketData,
        connectionInfo,
        connect,
        sendMessage,
        closeSocket,
        restart,
        getSocketStatus,
        startHeartbeat,
        stopHeartbeat,
    };

    return (
        <ExamSocketContext.Provider value={value}>
            {children}
        </ExamSocketContext.Provider>
    );
};

export const useExamSocket = () => {
    const context = useContext(ExamSocketContext);
    if (!context) {
        throw new Error('useExamSocket must be used within ExamSocketProvider');
    }
    return context;
};
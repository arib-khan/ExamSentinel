import React, { useEffect, useState } from "react";

const Fingerprint = () => {
    const [fingerprintData, setFingerprintData] = useState(null);
    const [status, setStatus] = useState("Idle");
    const [deviceInfo, setDeviceInfo] = useState(null);



    // 🔹 Fetch device info on mount
    useEffect(() => {
        const fetchDeviceInfo = async () => {
            try {
                const response = await fetch("http://127.0.0.1:11100/rd/info", {
                    method: "RDSERVICE",
                });

                if (!response.ok) throw new Error("Failed to fetch device info");

                const data = await response.text();
                setDeviceInfo(data);
            } catch (error) {
                console.error("Device Info Error:", error);
                setDeviceInfo("Failed to fetch device info ❌");
            }
        };

        fetchDeviceInfo();
    }, []);



    const captureFingerprint = async () => {
        try {
            setStatus("Capturing...");

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
            setFingerprintData(data);
            setStatus("Capture Success ✅");
        } catch (error) {
            console.error(error);
            setStatus("Capture Failed ❌");
        }
    };


    return (
        <div className="p-4">
            <h2>Fingerprint Capture</h2>
            {/* 🔹 Show device info */}
            <div>
                <h3 className="font-semibold">Device Info:</h3>
                {deviceInfo ? (
                    <pre className="bg-gray-800 p-2 mt-2">{deviceInfo}</pre>
                ) : (
                    <p>Loading device info...</p>
                )}
            </div>
            <button
                onClick={captureFingerprint}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Capture Fingerprint
            </button>
            <p>Status: {status}</p>
            {fingerprintData && (
                <pre className="bg-gray-800 p-2 mt-2">{fingerprintData}</pre>
            )}
        </div>
    );
};

export default Fingerprint;

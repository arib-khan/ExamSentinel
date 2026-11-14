import { useState, useEffect } from 'react';
import uploadManager from './uploadManager';
export const UploadQueueStatus = () => {
    const [status, setStatus] = useState(uploadManager.getStatus());
    const [stats, setStats] = useState(uploadManager.getDetailedStats());

    useEffect(() => {
        const unsubscribe = uploadManager.subscribe(() => {
            setStatus(uploadManager.getStatus());
            setStats(uploadManager.getDetailedStats());
        });
        return unsubscribe;
    }, []);

    if (status.total === 0) return null;

    return (
        <div className="  border rounded-lg p-1 shadow-lg max-w-md ">
            <h4 className="font-semibold flex items-center gap-2">
                <span className="animate-pulse">🔄</span>
                Upload Queue Monitor
            </h4>

            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Total in Queue:</span>
                    <span className="font-semibold">{status.total}</span>
                </div>

                <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-blue-600 font-semibold">{status.pending}</span>
                </div>

                {stats.partialSuccess > 0 && (
                    <div className="flex justify-between">
                        <span>Partial Success:</span>
                        <span className="text-yellow-600 font-semibold">{stats.partialSuccess}</span>
                    </div>
                )}

                {status.failed > 0 && (
                    <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="text-red-600 font-semibold">{status.failed}</span>
                    </div>
                )}

                {/* <div className="pt-2 border-t mt-3">
                    <div className="text-xs text-gray-600">By Type:</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <div className="font-medium">Photos</div>
                            <div className="text-xs">
                                Pending: {stats.byType.photo.pending} /
                                Failed: {stats.byType.photo.failed}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium">Fingerprints</div>
                            <div className="text-xs">
                                Pending: {stats.byType.fingerprint.pending} /
                                Failed: {stats.byType.fingerprint.failed}
                            </div>
                        </div>
                    </div>
                </div> */}

                {status.failed > 0 && (
                    <button
                        onClick={() => uploadManager.retryFailed()}
                        className="w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                        Retry Failed Uploads
                    </button>
                )}
            </div>
        </div>
    );
};
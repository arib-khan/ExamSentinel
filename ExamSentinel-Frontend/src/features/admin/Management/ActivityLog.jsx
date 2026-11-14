import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UploadCloud,
    Trash2,
    Plus,
    FileText,
    UserCircle,
    Database,
} from "lucide-react";
import { format } from "date-fns";

const iconMap = {
    upload: <UploadCloud className="text-blue-500" size={18} />,
    delete: <Trash2 className="text-red-500" size={18} />,
    create: <Plus className="text-green-500" size={18} />,
    update: <FileText className="text-yellow-500" size={18} />,
    login: <UserCircle className="text-purple-500" size={18} />,
    system: <Database className="text-gray-500" size={18} />,
};

const logs = [
    {
        id: 1,
        user: "Admin",
        action: "Uploaded 50 questions to Exam #2",
        timestamp: "2025-07-30T12:00:00Z",
        type: "upload",
    },
    {
        id: 2,
        user: "Admin",
        action: "Created new center: IPS Indore",
        timestamp: "2025-07-29T15:30:00Z",
        type: "create",
    },
    {
        id: 3,
        user: "Admin",
        action: "Deleted Student: RN2025123",
        timestamp: "2025-07-29T09:10:00Z",
        type: "delete",
    },
];
export default function ActivityLogs() {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <Card className="shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-4">
                            {logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No activities yet.
                                </p>
                            ) : (
                                logs.map((log) => (
                                    <li
                                        key={log.id}
                                        className="flex items-start gap-4 border-b pb-4"
                                    >
                                        <div className="mt-1">{iconMap[log.type] || iconMap.system}</div>
                                        <div className="flex-1">
                                            <div className="font-medium">{log.action}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(log.timestamp), "PPPpp")} by{" "}
                                                <Badge variant="outline">{log.user}</Badge>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

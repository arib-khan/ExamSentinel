
import React, { useEffect, useState } from "react";
import useGetList from "./useGetList";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Fingerprint,
    Camera,
    AlertCircle,
    RefreshCcw,
    Pause,
    Play,
} from "lucide-react";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    XAxis,
    YAxis,
    LabelList,
} from "recharts";

function BiometricDashboard() {
    const { data, loading, error, refetch } = useGetList();
    const [autoSync, setAutoSync] = useState(true);
    const [isRotating, setIsRotating] = useState(false);

    const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

    // Auto Sync every 10 seconds
    useEffect(() => {
        if (!autoSync) return;
        const interval = setInterval(() => {
            refetch();
        }, 10000);
        return () => clearInterval(interval);
    }, [autoSync, refetch]);

    const handleManualSync = () => {
        setIsRotating(true);
        refetch();
        setTimeout(() => setIsRotating(false), 1000);
    };

    const toggleAutoSync = () => {
        setAutoSync(!autoSync);
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-xl font-medium text-slate-700">Loading Dashboard...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-red-600">Error: {error?.message}</p>
                </div>
            </div>
        );

    const totalStudents = data?.length || 0;
    const totalCapturedFingerprint = data?.filter((s) => s.student_biometric_captur === "Y")?.length || 0;
    const totalCapturedPhotos =
        data?.filter((s) => s.student_image)?.length || 0;
    const totalSeatAllocated = data?.filter((s) => s.iecsm_seat_num)?.length || 0;
    const remainingStudents = totalStudents - totalSeatAllocated;

    const summaryStats = [
        { name: "Fingerprint Captured", value: totalCapturedFingerprint },
        { name: "Photos Captured", value: totalCapturedPhotos },
        { name: "Seat Allocated", value: totalSeatAllocated },
        { name: "Remaining", value: remainingStudents },
    ];

    const statsCards = [
        {
            title: "Total Students",
            value: totalStudents,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Fingerprint Captured",
            value: totalCapturedFingerprint,
            icon: Fingerprint,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            title: "Photos Captured",
            value: totalCapturedPhotos,
            icon: Camera,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Seat Allocated",
            value: totalSeatAllocated,
            icon: Users,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50"
        },
        {
            title: "Remaining",
            value: remainingStudents,
            icon: AlertCircle,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50"
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl shadow-sm border ">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold ">
                            Biometric Verification
                        </h2>
                        <p className=" mt-1">Real-time monitoring dashboard</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sync Status Button */}
                        <Button
                            onClick={toggleAutoSync}
                            variant={autoSync ? "default" : "outline"}
                            className={`relative overflow-hidden transition-all duration-300 ${autoSync
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700  shadow-lg shadow-green-500/30"
                                : "border-2 border-slate-300 hover:border-slate-400"
                                }`}
                        >
                            {autoSync ? (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Auto Sync Active
                                </>
                            ) : (
                                <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Auto Sync Paused
                                </>
                            )}
                        </Button>

                        {/* Manual Sync Button */}
                        {!autoSync && (
                            <Button
                                variant="outline"
                                onClick={handleManualSync}
                                className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                                <RefreshCcw className={`w-4 h-4 mr-2 ${isRotating ? 'animate-spin' : ''}`} />
                                Sync Now
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {statsCards.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={idx}
                                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Decorative Circle */}
                                <div
                                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-20 rounded-full -mr-16 -mt-16`}
                                ></div>

                                {/* Icon (small visible circle) */}
                                <div className="absolute top-2 right-3 w-10 h-10 rounded-full   flex items-center justify-center shadow-md">
                                    <Icon className="h-6 w-6 " />
                                </div>

                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium mb-1">{item.title}</p>
                                            <h3 className="text-3xl font-bold">{item.value}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <Card className=" border-0 shadow-lg">
                        <CardHeader >
                            <CardTitle className="text-xl font-semibold ">
                                Biometric Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={summaryStats}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-20}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend />

                                    <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                                        {summaryStats.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index]} />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="top"
                                            formatter={(value) => value}
                                            content={(props) => {
                                                const { x, y, width, height, value } = props;
                                                const threshold = 50; // if bar height > 50px, print inside the bar
                                                const posY = height < threshold ? y - 10 : y + 20;
                                                const fillColor = height < threshold ? "#334155" : "#fff";

                                                return (
                                                    <text
                                                        x={x + width / 2}
                                                        y={posY}
                                                        fill={fillColor}
                                                        textAnchor="middle"
                                                        fontWeight="bold"
                                                        fontSize="12"
                                                    >
                                                        {value}
                                                    </text>
                                                );
                                            }}
                                        />
                                    </Bar>

                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart */}
                    <Card className=" border-0 shadow-lg">
                        <CardHeader >
                            <CardTitle className="text-xl font-semibold ">
                                Distribution Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>

                                    <Pie
                                        data={summaryStats}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={105}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {summaryStats.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index]} />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        formatter={(value, entry) => {
                                            const { payload } = entry;
                                            return (
                                                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                                                    {payload.name} ({payload.value})
                                                </span>
                                            );
                                        }}
                                    />


                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default BiometricDashboard;
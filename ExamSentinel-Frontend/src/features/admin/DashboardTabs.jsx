import React, { useState } from "react"
import {
    BarChart3,
    Users,
} from "lucide-react"
import Dashboard from "./Dashboard"
import LiveExamMonitor from "../class-invigilator/LiveExamDetails/LiveExamDetails"

function DashboardTabs() {
    const [activeTab, setActiveTab] = useState("overview")

    const tabs = [
        { label: "Overview", value: "overview", icon: <BarChart3 className="w-4 h-4" /> },
        { label: "Live Exam", value: "liveexam", icon: <Users className="w-4 h-4" /> },
    ]

    return (
        <div className="min-h-screen  text-foreground">
            {/* Enhanced Tabs Header */}
            <div className="flex bg-card/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg mb-8 border">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex-1
              ${activeTab === tab.value
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        <span className={activeTab === tab.value ? "animate-pulse" : ""}>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === "overview" && (
                    <Dashboard />
                )}

                {activeTab === "liveexam" && (
                    <LiveExamMonitor />
                )}
            </div>
        </div>
    )
}

export default DashboardTabs
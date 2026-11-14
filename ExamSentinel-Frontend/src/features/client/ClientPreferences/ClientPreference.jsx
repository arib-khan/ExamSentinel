import React, { useState, useEffect } from "react";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import { getExamList } from "@/services/ExamServices/examService";
import {
    Settings, Clock, ShieldCheck, BarChart2, List, Eye,
    ChevronDown, ChevronUp, RotateCcw, Save, CheckCircle2, XCircle,
} from "lucide-react";

// ─── Preference Sections ──────────────────────────────────────────────────────

const PREFERENCE_SECTIONS = [
    {
        id: "exam_flow", label: "Exam Flow & Result", icon: BarChart2, color: "blue",
        preferences: [
            { key: "DECLARE_RESULT_ON_SUBMIT", description: "Declare result immediately after student submits exam", valueType: "boolean", default: "Y" },
            { key: "ALLOW_REATTEMPT", description: "Allow student to reattempt exam", valueType: "boolean", default: "N" },
            { key: "AUTO_SUBMIT_ON_TIME_END", description: "Auto-submit exam when time expires", valueType: "boolean", default: "Y" },
        ],
    },
    {
        id: "time_access", label: "Time & Accessibility", icon: Clock, color: "amber",
        preferences: [
            { key: "EXTRA_TIME_FOR_PWD", description: "Provide extra time for PWD students", valueType: "boolean", default: "N" },
            { key: "ALLOW_TIME_EXTENSION", description: "Allow manual time extension by admin", valueType: "boolean", default: "N" },
        ],
    },
    {
        id: "question_behavior", label: "Question & Option Behavior", icon: List, color: "violet",
        preferences: [
            { key: "RANDOMIZE_QUESTIONS", description: "Randomize question order per student", valueType: "boolean", default: "Y" },
            { key: "RANDOMIZE_OPTIONS", description: "Randomize options within questions", valueType: "boolean", default: "Y" },
            { key: "SHUFFLE_SECTIONS", description: "Shuffle question sections", valueType: "boolean", default: "N" },
            { key: "SAME_QUESTIONS_FOR_ALL", description: "Same question set for all students", valueType: "boolean", default: "N" },
        ],
    },
    {
        id: "ui_instructions", label: "Instructions & UI", icon: Eye, color: "teal",
        preferences: [
            { key: "SHOW_INSTRUCTIONS_BEFORE_EXAM", description: "Show instructions before exam starts", valueType: "boolean", default: "Y" },
            { key: "INSTRUCTION_TIME_SECONDS", description: "Time to read instructions (seconds)", valueType: "number", default: "120" },
            { key: "SHOW_QUESTION_PALETTE", description: "Show question palette (grid view)", valueType: "boolean", default: "Y" },
            { key: "ALLOW_QUESTION_NAVIGATION", description: "Allow back & forth navigation", valueType: "boolean", default: "Y" },
            { key: "SHOW_TIMER", description: "Show exam timer to student", valueType: "boolean", default: "Y" },
        ],
    },
    {
        id: "security", label: "Security & Anti-Cheating", icon: ShieldCheck, color: "red",
        preferences: [
            { key: "ROLL_NO_WATERMARK", description: "Show roll number watermark on exam screen", valueType: "boolean", default: "Y" },
            { key: "FULL_SCREEN_MODE", description: "Force exam in full screen mode", valueType: "boolean", default: "Y" },
            { key: "DISABLE_RIGHT_CLICK", description: "Disable right-click during exam", valueType: "boolean", default: "Y" },
            { key: "DISABLE_COPY_PASTE", description: "Disable copy-paste", valueType: "boolean", default: "Y" },
            { key: "TAB_SWITCH_WARNING_LIMIT", description: "Max tab switches allowed before warning", valueType: "number", default: "0" },
            { key: "AUTO_SUBMIT_ON_TAB_SWITCH_LIMIT", description: "Auto-submit if tab switch limit exceeded", valueType: "boolean", default: "Y" },
        ],
    },
    {
        id: "evaluation", label: "Evaluation & Marking", icon: Settings, color: "green",
        preferences: [
            { key: "NEGATIVE_MARKING", description: "Enable negative marking", valueType: "boolean", default: "N" },
            { key: "NEGATIVE_MARK_PERCENT", description: "Negative mark percentage", valueType: "number", default: "25" },
            { key: "SECTIONAL_CUTOFF", description: "Enable sectional cutoff", valueType: "boolean", default: "N" },
            { key: "PASS_PERCENTAGE", description: "Passing percentage", valueType: "number", default: "40" },
        ],
    },
];

const buildDefaults = () => {
    const map = {};
    PREFERENCE_SECTIONS.forEach((section) => {
        section.preferences.forEach((pref) => {
            map[pref.key] = { value: pref.default, show_yn: pref.default === "Y" ? "Y" : "N", remarks: "" };
        });
    });
    return map;
};

const COLOR_MAP = {
    blue: {
        badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
        header: "from-blue-50 to-background border-blue-200 dark:from-blue-900/20 dark:to-background dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
    },
    amber: {
        badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        header: "from-amber-50 to-background border-amber-200 dark:from-amber-900/20 dark:to-background dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
    },
    violet: {
        badge: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
        header: "from-violet-50 to-background border-violet-200 dark:from-violet-900/20 dark:to-background dark:border-violet-800",
        icon: "text-violet-600 dark:text-violet-400",
    },
    teal: {
        badge: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
        header: "from-teal-50 to-background border-teal-200 dark:from-teal-900/20 dark:to-background dark:border-teal-800",
        icon: "text-teal-600 dark:text-teal-400",
    },
    red: {
        badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        header: "from-red-50 to-background border-red-200 dark:from-red-900/20 dark:to-background dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
    },
    green: {
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
        header: "from-emerald-50 to-background border-emerald-200 dark:from-emerald-900/20 dark:to-background dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400",
    },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function BooleanToggle({ value, onChange }) {
    const isY = value === "Y";
    return (
        <button
            type="button"
            onClick={() => onChange(isY ? "N" : "Y")}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-background ${isY ? "bg-emerald-500 focus:ring-emerald-400" : "bg-muted focus:ring-muted-foreground"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isY ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}

// ─── Visible Icon ─────────────────────────────────────────────────────────────
// ✅ show_yn is now derived from the boolean value for boolean types.
// For number types, the manual toggle remains.

function VisibleIcon({ show_yn, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={show_yn === "Y" ? "Visible to student" : "Hidden from student"}
            className="transition-transform hover:scale-110 focus:outline-none"
        >
            {show_yn === "Y"
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                : <XCircle className="w-5 h-5 text-muted-foreground/40" />
            }
        </button>
    );
}

// ─── Preference Row ───────────────────────────────────────────────────────────

function PreferenceRow({ pref, data, onChange }) {
    const val = data?.[pref.key] ?? { value: pref.default, show_yn: pref.default === "Y" ? "Y" : "N", remarks: "" };

    const update = (field, newVal) => onChange(pref.key, { ...val, [field]: newVal });

    // ✅ When boolean value changes, sync show_yn automatically
    const handleValueChange = (newValue) => {
        onChange(pref.key, {
            ...val,
            value: newValue,
            // For booleans: visible icon mirrors the enabled/disabled state
            show_yn: pref.valueType === "boolean" ? newValue : val.show_yn,
        });
    };

    // For number type: manual show_yn toggle still works
    const handleVisibleToggle = () => {
        if (pref.valueType === "boolean") return; // locked to value for booleans
        update("show_yn", val.show_yn === "Y" ? "N" : "Y");
    };

    return (
        <>
            {/* ── MOBILE card (hidden on lg) ── */}
            <div className="lg:hidden flex flex-col gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                    <code className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded break-all leading-relaxed flex-1">
                        {pref.key}
                    </code>
                    <VisibleIcon show_yn={val.show_yn} onClick={handleVisibleToggle} />
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{pref.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                    {pref.valueType === "boolean" ? (
                        <div className="flex items-center gap-2">
                            <BooleanToggle value={val.value} onChange={handleValueChange} />
                            <span className={`text-xs font-semibold ${val.value === "Y" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                                {val.value === "Y" ? "Yes" : "No"}
                            </span>
                        </div>
                    ) : (
                        <Input
                            type="number"
                            value={val.value}
                            onChange={(e) => update("value", e.target.value)}
                            className="h-7 w-24 text-sm text-center"
                            min={0}
                        />
                    )}
                    <Input
                        placeholder="Remarks..."
                        value={val.remarks}
                        onChange={(e) => update("remarks", e.target.value)}
                        className="h-7 text-xs flex-1 min-w-[120px]"
                    />
                </div>
            </div>

            {/* ── DESKTOP row (hidden below lg) ── */}
            <div className="hidden lg:grid grid-cols-12 gap-3 items-start py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="col-span-3">
                    <code className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded break-all leading-relaxed">
                        {pref.key}
                    </code>
                </div>
                <div className="col-span-4 text-sm text-muted-foreground leading-snug pt-0.5">
                    {pref.description}
                </div>
                <div className="col-span-2 flex items-center">
                    {pref.valueType === "boolean" ? (
                        <div className="flex items-center gap-2">
                            <BooleanToggle value={val.value} onChange={handleValueChange} />
                            <span className={`text-xs font-semibold ${val.value === "Y" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                                {val.value === "Y" ? "Yes" : "No"}
                            </span>
                        </div>
                    ) : (
                        <Input
                            type="number"
                            value={val.value}
                            onChange={(e) => update("value", e.target.value)}
                            className="h-7 w-20 text-sm text-center"
                            min={0}
                        />
                    )}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                    <VisibleIcon show_yn={val.show_yn} onClick={handleVisibleToggle} />
                </div>
                <div className="col-span-2">
                    <Input
                        placeholder="Remarks..."
                        value={val.remarks}
                        onChange={(e) => update("remarks", e.target.value)}
                        className="h-7 text-xs"
                    />
                </div>
            </div>
        </>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
// ✅ Accordion: open/close controlled from parent via isOpen + onToggle props

function SectionCard({ section, prefData, onChange, isOpen, onToggle }) {
    const colors = COLOR_MAP[section.color];
    const Icon = section.icon;

    return (
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
            {/* Header */}
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r ${colors.header} border-b border-border`}
            >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className={`p-1.5 rounded-lg bg-background shadow-sm ${colors.badge} border flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </span>
                    <span className="font-semibold text-foreground text-sm tracking-wide truncate">
                        {section.label}
                    </span>
                    <Badge variant="outline" className={`text-[11px] border ${colors.badge} hidden sm:inline-flex flex-shrink-0`}>
                        {section.preferences.length} settings
                    </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="sm:hidden text-[11px] text-muted-foreground">{section.preferences.length}</span>
                    {isOpen
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                </div>
            </button>

            {/* Body */}
            {isOpen && (
                <div>
                    {/* Desktop column headers */}
                    <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-3">Key</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Value</div>
                        <div className="col-span-1 text-center">Visible</div>
                        <div className="col-span-2">Remarks</div>
                    </div>

                    {/* Mobile label bar */}
                    <div className="lg:hidden flex justify-between px-4 py-2 bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Setting</span>
                        <span>Visible</span>
                    </div>

                    <div className="divide-y divide-border bg-background lg:px-2 lg:py-1 p-2 flex flex-col gap-2 lg:gap-0">
                        {section.preferences.map((pref) => (
                            <PreferenceRow
                                key={pref.key}
                                pref={pref}
                                data={prefData}
                                onChange={onChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ClientPreference() {
    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const [instID, setInstId] = useState(userData?.user_inst_id || null);
    const [examID, setExamId] = useState(null);
    const [institute, setInstitute] = useState([]);
    const [examList, setExamList] = useState([]);
    const [prefData, setPrefData] = useState(buildDefaults());
    const [loading, setLoading] = useState(false);

    // ✅ Accordion: track which section id is open (only one at a time)
    const [openSectionId, setOpenSectionId] = useState(PREFERENCE_SECTIONS[0].id);

    const handleSectionToggle = (id) => {
        // If clicking the already-open section, close it; otherwise open the new one
        setOpenSectionId((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [instRes, examRes] = await Promise.all([getInstitutionList(), getExamList()]);
                if (Array.isArray(instRes.data?.result)) setInstitute(instRes.data.result);
                if (Array.isArray(examRes.data?.data)) setExamList(examRes.data.data);
            } catch {
                toast.error("Failed to load institutions or exams.");
            }
        };
        fetchData();
    }, []);

    // TODO: Fetch existing preferences when instID + examID change
    useEffect(() => {
        if (!instID || !examID) return;
        // fetchClientPreferences(instID, examID).then(data => {
        //   const map = {};
        //   data.forEach(row => {
        //     map[row.client_pref_key_description] = {
        //       value: row.client_pref_key_value,
        //       show_yn: row.client_pref_key_to_show_YN,
        //       remarks: row.client_pref_additional_remarks,
        //     };
        //   });
        //   setPrefData(map);
        // });
    }, [instID, examID]);

    const handleChange = (key, val) => setPrefData((prev) => ({ ...prev, [key]: val }));

    const handleResetDefaults = () => {
        setPrefData(buildDefaults());
        toast.info("Reset to default preferences.");
    };

    const handleSubmit = async () => {
        if (!instID || !examID) {
            toast.error("Please select Institution and Exam first.");
            return;
        }
        const payload = Object.entries(prefData).map(([key, val]) => ({
            client_id: instID,
            exam_id: examID,
            client_pref_key_value: val.value,
            client_pref_key_description: key,
            client_pref_key_to_show_YN: val.show_yn,
            client_pref_additional_remarks: val.remarks,
        }));
        try {
            setLoading(true);
            // await saveClientPreferences(payload);
            console.log("Payload to save:", payload);
            toast.success("Client preferences saved successfully!");
        } catch {
            toast.error("Failed to save preferences.");
        } finally {
            setLoading(false);
        }
    };

    const totalSettings = PREFERENCE_SECTIONS.reduce((s, sec) => s + sec.preferences.length, 0);

    return (
        <div className="min-h-screen bg-background">

            {/* ── Sticky Page Header ── */}
            <div className="bg-background border-b border-border px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Client Exam Preferences</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                            Configure exam behaviour settings for a client &amp; exam combination.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                            {totalSettings} total settings
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5 text-xs sm:text-sm">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Reset</span>
                            <span className="hidden sm:inline"> to Defaults</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={loading || !instID || !examID}
                            className="gap-1.5 text-xs sm:text-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

                {/* ── Selection Bar ── */}
                <div className="bg-background rounded-xl border border-border shadow-sm p-4 sm:p-5">
                    <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wider">
                        1 · Select Client &amp; Exam
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Institution</Label>
                            <InstitutionCombobox institutions={institute} setInstId={setInstId} selectedId={instID} />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Exam</Label>
                            <ExamCombobox exams={examList} setExamId={setExamId} selectedId={examID} />
                        </div>
                    </div>
                    {(!instID || !examID) && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                            ⚠️ Please select both Institution and Exam to load or save preferences.
                        </p>
                    )}
                </div>

                {/* ── Legend ── */}
                <div className="flex items-center gap-3 sm:gap-6 text-xs text-muted-foreground px-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                        <span>Visible</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                        <span>Hidden</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-7 items-center rounded-full bg-emerald-500 px-0.5 flex-shrink-0">
                            <span className="h-3 w-3 rounded-full bg-white ml-auto" />
                        </span>
                        <span>Enabled</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-7 items-center rounded-full bg-muted px-0.5 flex-shrink-0">
                            <span className="h-3 w-3 rounded-full bg-background" />
                        </span>
                        <span>Disabled</span>
                    </span>
                </div>

                {/* ── Preference Sections (Accordion) ── */}
                <div className="space-y-3 sm:space-y-4">
                    {PREFERENCE_SECTIONS.map((section) => (
                        <SectionCard
                            key={section.id}
                            section={section}
                            prefData={prefData}
                            onChange={handleChange}
                            isOpen={openSectionId === section.id}
                            onToggle={() => handleSectionToggle(section.id)}
                        />
                    ))}
                </div>

                {/* ── Bottom Save Bar ── */}
                <div className="bg-background border border-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {instID && examID
                            ? "Saving preferences for the selected institution & exam."
                            : "Select institution and exam to enable saving."}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5 flex-1 sm:flex-none">
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={loading || !instID || !examID}
                            className="gap-1.5 flex-1 sm:flex-none"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ClientPreference;
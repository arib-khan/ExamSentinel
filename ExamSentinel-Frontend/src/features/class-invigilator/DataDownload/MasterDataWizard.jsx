import React, { useState } from "react";
import DataDashboard from "./DataDashboard"; // the dashboard created earlier
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DataImportWizard from "./DataImportWizard";
import ActivateQp from "./ActivateQp";
import ExamControls from "@/features/admin/Exam_Controls/Exam_controls";

export default function MasterDataWizard() {
    const [step, setStep] = useState(1);

    const goToDashboard = () => setStep(2);
    const goToImport = () => setStep(1);

    return (
        <div className="p-3 max-w-6xl mx-auto space-y-3">
            <Card className="shadow-md rounded-2xl bg-background">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Master Data Wizard</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3 flex-wrap">
                    <Button variant={step === 1 ? "default" : "outline"} onClick={goToImport}>
                        Data Import
                    </Button>
                    <Button variant={step === 2 ? "default" : "outline"} onClick={goToDashboard}>
                        Data Dashboard
                    </Button>
                    <Button variant={step === 3 ? "default" : "outline"} onClick={() => setStep(3)}>
                        Activate Question Paper
                    </Button>
                    <Button variant={step === 4 ? "default" : "outline"} onClick={() => setStep(4)}>
                        Control Exam Start Activity
                    </Button>
                </CardContent>
            </Card>

            {/* Dynamic Content */}
            <div>
                {step === 1 && <DataImportWizard onSuccess={goToDashboard} />}
                {step === 2 && <DataDashboard />}
                {step === 3 && <ActivateQp />}
                {step === 4 && <ExamControls />}
            </div>
        </div>
    );
}
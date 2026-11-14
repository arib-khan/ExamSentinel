import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ExamControls from "./Exam_controls";
import ExamPWControl from "./ExamPWControl";

export default function MasterControls() {
    const [step, setStep] = useState(1);

    const goToDashboard = () => setStep(2);
    const goToImport = () => setStep(1);

    return (
        <div className="p-3 max-w-6xl mx-auto space-y-3">
            <Card className="shadow-md rounded-2xl bg-background">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Exam Controls</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3 flex-wrap">
                    <Button variant={step === 1 ? "default" : "outline"} onClick={goToImport}>
                        Control Exam Start Activity
                    </Button>
                    <Button variant={step === 2 ? "default" : "outline"} onClick={goToDashboard}>
                        Exam Password Generation
                    </Button>
                </CardContent>
            </Card>

            {/* Dynamic Content */}
            <div>
                {step === 1 && <ExamControls />}
                {step === 2 && <ExamPWControl />}
            </div>
        </div>
    );
}
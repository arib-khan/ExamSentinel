import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLoginAuditLogger } from "@/hooks/auditLogger/useLoginAuditLogger";
// import { connectExamSocket } from "@/store/slices/examSocket";
import { updateSocketStatus } from "@/store/slices/examSlice";
import { useDispatch } from "react-redux";
import { getConfig } from "@/config";
import { useExamSocket } from "@/store/context/ExamSocketContext";
// const base_url = import.meta.env.VITE_API_BASE_URL;

const base_url = getConfig('VITE_API_BASE_URL');
export default function CandidateLogin() {
    const { connect } = useExamSocket();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [roll, setRoll] = useState("");
    const [candidatePassword, setCandidatePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { logLoginEvent } = useLoginAuditLogger();


    const handleCandidateLogin = async (e) => {
        e.preventDefault();
        if (roll.length < 1 || roll.length > 50) {
            toast.error("Roll number must be between 1 and 50 characters.");
            return;
        }

        if (candidatePassword.length < 1 || candidatePassword.length > 255) {
            toast.error("Password must be between 1 and 255 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${base_url}api/student/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roll_number: roll,
                    password: candidatePassword,
                }),
            });

            const data = await res.json();

            if (data.success) {

                // connectExamSocket(data.data.student_id?.id, (socketData) => {
                //     dispatch(updateSocketStatus(socketData));

                // });
                connect(data.data.student_id?.id);

                sessionStorage.setItem("authToken", data.data.token);
                sessionStorage.setItem("re-attempt", data.data?.used_Time);

                sessionStorage.setItem(
                    "studentData",
                    JSON.stringify(data.data.student_id)
                );

                await logLoginEvent("CANDIDATE_LOGIN_SUCCESS", {
                    student_id: data.data.student_id,
                    roll_number: roll,
                });

                navigate("/exam-instructions");
            } else {
                toast.error(data.msg || "Invalid roll number or password");
                // await logLoginEvent("CANDIDATE_LOGIN_FAILURE", { roll_number: roll });
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Server error. Try again later.");
            // await logLoginEvent("CANDIDATE_LOGIN_ERROR", {
            //     roll_number: roll,
            //     error: err.message,
            // });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="text-center space-y-4 ">
                            <div className="text-center ">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl mb-3 backdrop-blur-sm">
                                    <GraduationCap className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                    Login
                                </h3>
                            </div>

                        </CardHeader>

                        <CardContent className="p-6">
                            {/* Candidate Login */}
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="roll" className="text-white font-medium">
                                            Roll Number
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="roll"
                                                value={roll}
                                                onChange={(e) => setRoll(e.target.value)}
                                                placeholder="ABCD000123"
                                                className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 uppercase focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="candidatePassword"
                                            className="text-white font-medium"
                                        >
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="candidatePassword"
                                                type="password"
                                                value={candidatePassword}
                                                onChange={(e) => setCandidatePassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCandidateLogin}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                Signing in...
                                            </div>
                                        ) : (
                                            <>
                                                <GraduationCap className="w-5 h-5 mr-2" />
                                                Sign In as Candidate
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
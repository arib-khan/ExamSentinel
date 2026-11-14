import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Shield,
  BookOpen,
  Users,
  Award,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// audit logger hook
import { useLoginAuditLogger } from "@/hooks/auditLogger/useLoginAuditLogger";
const base_url = import.meta.env.VITE_API_BASE_URL;


export default function ModernExamLogin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("candidate");
  const [rememberMe, setRememberMe] = useState(false);
  const [roll, setRoll] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logLoginEvent } = useLoginAuditLogger();

  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // this is working when user login token required for this api call
    // await logLoginEvent("CANDIDATE_LOGIN_ATTEMPT", { roll_number: roll });
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
      // console.log("Login Response:", data);

      if (data.success) {
        // Store auth data in state instead of sessionStorage for demo
        sessionStorage.setItem("authToken", data.data.token);
        sessionStorage.setItem("re-attempt", data.data?.used_Time);

        sessionStorage.setItem(
          "studentData",
          JSON.stringify(data.data.student_id)
        );
        // toast.success(data.msg || "Candidate login successful");

        await logLoginEvent("CANDIDATE_LOGIN_SUCCESS", {
          student_id: data.data.student_id,
          roll_number: roll,
        });
        navigate("/exam-instructions");
      } else {
        toast.error("Invalid roll number or password");
        await logLoginEvent("CANDIDATE_LOGIN_FAILURE", { roll_number: roll });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Try again later.");
      await logLoginEvent("CANDIDATE_LOGIN_ERROR", {
        roll_number: roll,
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Store auth data in state instead of sessionStorage for demo
        console.log("Auth Token:", data.data.token);
        console.log("Admin Data:", data.data.admin_id);
        toast.success("Admin login successful");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-600/10 to-cyan-600/10 rounded-full animate-pulse delay-1000"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-white/5 animate-bounce">
          <BookOpen size={80} />
        </div>
        <div className="absolute top-40 right-32 text-white/5 animate-bounce delay-500">
          <Award size={60} />
        </div>
        <div className="absolute bottom-32 left-32 text-white/5 animate-bounce delay-1000">
          <Users size={70} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-2">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ExamPortal
              </h1>
              <p className="text-gray-300 text-lg">
                Secure Online Examination System
              </p>
            </CardHeader>

            <CardContent className="p-6">
              {/* Custom Tab Navigation */}
              <div className="grid grid-cols-2 w-full bg-white/10 p-1 rounded-2xl mb-8 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab("candidate")}
                  className={`rounded-xl py-3 px-4 text-white transition-all duration-300 flex items-center justify-center ${activeTab === "candidate"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                    : "hover:bg-white/5"
                    }`}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Candidate
                </button>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`rounded-xl py-3 px-4 text-white transition-all duration-300 flex items-center justify-center ${activeTab === "admin"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg"
                    : "hover:bg-white/5"
                    }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </button>
              </div>

              {/* Candidate Login */}
              {activeTab === "candidate" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl mb-3 backdrop-blur-sm">
                      <GraduationCap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      Candidate Portal
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Access your examinations and results
                    </p>
                  </div>

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
                          placeholder="e.g. 21BCE0001"
                          className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
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
                          className="bg-white/95 text-gray-900 border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                          required
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    {activeTab === "admin" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rememberCandidate"
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                              setRememberMe(!!checked)
                            }
                            className="border-white/30"
                          />
                          <Label
                            htmlFor="rememberCandidate"
                            className="text-gray-300 text-sm"
                          >
                            Remember me
                          </Label>
                        </div>

                        <button
                          type="button"
                          className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

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
                          Sign in as Candidate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Login */}
              {activeTab === "admin" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl mb-3 backdrop-blur-sm">
                      <Shield className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      Admin Portal
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Manage exams and candidate records
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="adminUsername"
                        className="text-white font-medium"
                      >
                        Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="adminUsername"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="e.g. admin01"
                          className="bg-white/95 text-gray-900 border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="adminPassword"
                        className="text-white font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="adminPassword"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter admin password"
                          className="bg-white/95 text-gray-900 border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                          required
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberAdmin"
                          checked={rememberMe}
                          onCheckedChange={(checked) =>
                            setRememberMe(!!checked)
                          }
                          className="border-white/30"
                        />
                        <Label
                          htmlFor="rememberAdmin"
                          className="text-gray-300 text-sm"
                        >
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      onClick={handleAdminLogin}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Sign in as Admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">Secure • Reliable • Modern</p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1 text-gray-500 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="text-gray-500 text-xs">|</div>
              <div className="text-gray-500 text-xs">
                24/7 Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

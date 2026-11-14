import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getConfig } from "@/config";
import { setAuthData } from "@/store/slices/authSlice";
import { Award, BookOpen, Lock, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// const base_url = import.meta.env.VITE_API_BASE_URL;

const base_url = getConfig('VITE_API_BASE_URL');



export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use candidate API for admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${base_url}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: adminUsername,
          user_password: adminPassword,
        }),
      });

      const data = await res.json();

      if (data.status) {
        const token = data?.Token;
        const user = data?.result;
        dispatch(setAuthData({ token, user }));
        sessionStorage.setItem("authToken", data?.Token);
        sessionStorage.setItem(
          "userData",
          JSON.stringify(data?.result)
        );
        toast.success(data.msg);
        if (user.user_role_id === 1) {
          navigate("/admin/dashboard");
        } if (user.user_role_id === 2) {
          navigate("/client/dashboard");
        } if (user.user_role_id === 3) {
          navigate("/class-invigilator/dashboard");
        } if (user.user_role_id === 5) {
          navigate("/operator/dashboard");
        } if (user.user_role_id === 6) {
          navigate("/candidate/live-interviews"); // interview candidate
        }
      } else {
        toast.error("Invalid user credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-600/10 to-cyan-600/10 rounded-full animate-pulse delay-1000"></div>
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
                ExamSentinel
              </h1>
              <p className="text-gray-300 text-lg">
                AI-Powered Intelligent Examination Security System
              </p>
            </CardHeader>

            <CardContent className="p-6">
              {/* Admin Login */}
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl mb-3 backdrop-blur-sm"> */}
                  <div className="flex justify-center">
                    {/* <Shield className="w-8 h-8 text-purple-400" /> */}
                    <img
                      src="/CompanyLogo.png"
                      alt="ExamSentinel Logo"
                      className="w-40 rounded-lg"

                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Exam Administrator Login
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
                        className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
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
                        className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* <div className="flex items-center justify-between">
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
                  </div> */}

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
                        Sign in
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
              <div className="text-gray-500 text-xs">|</div>
              <div>
                <span className="text-gray-500 text-xs">
                  ExamSentinel
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
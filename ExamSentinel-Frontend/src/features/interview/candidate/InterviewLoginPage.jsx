// Interview module :: candidate login for the interview flow.
// Authenticates against the EXISTING /api/student/login endpoint and
// stores the session under separate "interviewToken" keys, so the exam
// candidate login at "/" keeps working exactly as before.
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { interviewLogin } from "@/services/InterviewServices/interviewService";

export default function InterviewLoginPage() {
  const navigate = useNavigate();
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!roll.trim() || !password) {
      toast.error("Enter your roll number and password.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await interviewLogin(roll.trim(), password);
      const data = res.data;
      if (data.success) {
        sessionStorage.setItem("interviewToken", data.data.token);
        sessionStorage.setItem(
          "interviewStudent",
          JSON.stringify(data.data.student_id)
        );
        toast.success("Welcome to your interview dashboard");
        navigate("/interviews");
      } else {
        toast.error(data.msg || "Invalid roll number or password");
      }
    } catch (err) {
      console.error("Interview login error:", err);
      toast.error("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl mb-3 backdrop-blur-sm mx-auto">
                <MessagesSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">
                ExamSentinel Interviews
              </h3>
              <p className="text-sm text-white/70">
                Sign in with your candidate roll number
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="roll" className="text-white font-medium">
                    Roll Number
                  </Label>
                  <Input
                    id="roll"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="ABCD000123"
                    className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 uppercase focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-white/95 text-black border-white/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? "Signing in..." : "Sign In for Interviews"}
                </Button>
              </form>
              <p className="text-center text-xs text-white/50 mt-6">
                <Link to="/" className="hover:text-white/80">
                  ← Back to Exam Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

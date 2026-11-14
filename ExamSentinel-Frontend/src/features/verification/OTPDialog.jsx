import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OTPDialog({ open, onClose, student, onVerified }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const sendOtp = async () => {
        try {
            setLoading(true);
            await axios.post("/api/send-otp", { userId: student.id, email: student.email, mobile: student.phone });
            toast.success("OTP sent to Email & Mobile");
        } catch {
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            const res = await axios.post("/api/verify-otp", { userId: student.id, otp });
            if (res.data.success) {
                toast.success("OTP Verified!");
                onVerified(student);
                onClose();
            } else {
                toast.error(res.data.message || "Invalid OTP");
            }
        } catch {
            toast.error("OTP Verification failed");
        } finally {
            setLoading(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <h2 className="text-lg font-semibold">Verify Candidate</h2>
                </DialogHeader>

                <div className="space-y-2">
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Roll:</strong> {student.roll_number}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Phone:</strong> {student.phone}</p>
                </div>

                <div className="space-y-4 mt-4">
                    <Input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />

                    <div className="flex justify-end gap-2">
                        <Button onClick={sendOtp} disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Button>
                        <Button onClick={verifyOtp} disabled={loading || !otp}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

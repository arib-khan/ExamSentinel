import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

// ✅ Yup validation schema
const schema = yup.object().shape({
    currentPassword: yup
        .string()
        .required("Current password is required"),
    newPassword: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
});

export default function ChangePassword() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            // 👇 You can call your API here
            console.log("Submitted data:", data);

            // Simulate success
            toast.success("Password changed successfully.");
            reset();
        } catch (error) {
            toast.error("Failed to change password.");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <Card className="rounded-2xl shadow-md">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Label htmlFor="currentPassword" className="mb-1">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                {...register("currentPassword")}
                            />
                            {errors.currentPassword && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="newPassword" className="mb-1">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                {...register("newPassword")}
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="mb-1">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Change Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

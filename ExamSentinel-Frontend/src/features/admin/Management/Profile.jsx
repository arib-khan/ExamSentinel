import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cross, Pencil, X } from "lucide-react";
import UserForm from "@/features/users/create/UserForm";
import { Button } from "@/components/ui/button";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);

    const userDetails = sessionStorage.getItem("userData");

    const avatar = "https://i.pravatar.cc/150?img=2";
    const {
        user_name,
        user_id,
        user_role_id,
        user_contact_number_1,
        user_contact_number_2,
        user_create_date,
        user_inst_id,
        user_student_id,
        user_status,
    } = userDetails ? JSON.parse(userDetails) : {};

    const data = {
        user_id: user_id,
        user_name: user_name,
        user_password: null,
        user_role_id: user_role_id || null,
        user_inst_id: user_inst_id || null,
        user_student_id: user_student_id || null,
        user_create_date: user_create_date || null,
        user_status: user_status || "A",
        user_contact_number_1: user_contact_number_1 || "",
        user_contact_number_2: user_contact_number_2 || "",
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Card className="shadow-md rounded-2xl">
                <CardHeader className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={avatar} alt={user_name} />
                            <AvatarFallback>
                                {user_name?.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl font-bold">{user_name}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                                {user_id || "Admin@gmail.com"}
                            </CardDescription>
                        </div>
                    </div>

                    {/* Edit button */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="cursor-pointer"
                    >
                        {isEditing ? <X className="h-4 w-4" /> : <Pencil className=" h-4 w-4" />}
                    </Button>
                </CardHeader>

                <CardContent className="grid gap-6">
                    {isEditing ? (
                        <UserForm mode="edit" initialData={data} enable={true} />
                    ) : (
                        <div className="space-y-2">
                            <p>
                                <strong>Name:</strong> {user_name}
                            </p>
                            <p>
                                <strong>Email:</strong> {user_id || "Admin@gmail.com"}
                            </p>

                            <p>
                                <strong>Status:</strong> {user_status === "A" ? "Active" : "Inactive"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Save } from "lucide-react";
import { updatePermissions } from "@/services/PermissionServices/objectPermision";
import { toast } from "sonner";


// Helper to clean up object keys (e.g., "user_management" -> "User Management")
const formatLabel = (str) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ObjectPermissionForm = ({ mode, initialData, onClose }) => {
    const isViewOnly = mode === "view";

    // State to hold the edited permissions
    const [permissions, setPermissions] = useState({});
    const [roleName, setRoleName] = useState("");

    // Initialize state when data loads
    useEffect(() => {
        if (initialData) {
            setRoleName(initialData.roleName);
            // Deep copy objects to avoid mutating props directly
            setPermissions(JSON.parse(JSON.stringify(initialData.objects || {})));
        }
    }, [initialData]);

    // Handle Checkbox Toggle
    const handleToggle = (objectKey, actionKey) => {
        if (isViewOnly) return;

        setPermissions(prev => {
            const currentVal = prev[objectKey][actionKey];
            return {
                ...prev,
                [objectKey]: {
                    ...prev[objectKey],
                    [actionKey]: currentVal === "Y" ? "N" : "Y" // Toggle Y/N
                }
            };
        });
    };

    const handleSave = async () => {
        const payload = {
            role_id: initialData.role_id,
            roleName: roleName,
            objects: permissions
        };

        try {
            const response = await updatePermissions(payload);
            if (response.status) {
                toast.success(response.data.mgs || "Permissions updated successfully");
            } else {
                toast.error(response.data.mgs || "Failed to update permissions");
            }
        } catch (error) {
            toast.error("An error occurred while updating permissions");
            console.error("Update Permissions Error:", error);
        }

        onClose();
    };

    // List of standard actions (Columns)
    const actions = ["create", "read", "update", "delete", "execute"];

    return (
        <div className="space-y-6">

            {/* Permission Matrix */}
            <div className="border rounded-md">
                <div className="grid grid-cols-6 gap-4 bg-muted/50 p-4 font-medium border-b text-sm">
                    <div className="col-span-1">Module Name</div>
                    {actions.map(action => (
                        <div key={action} className="text-center capitalize text-xs sm:text-sm">
                            {action}
                        </div>
                    ))}
                </div>

                <div >
                    <div className="divide-y">
                        {Object.entries(permissions).map(([objectKey, perms]) => (
                            <div key={objectKey} className="grid grid-cols-6 gap-2 p-4 items-center hover:bg-accent transition-colors">

                                {/* Row Header (Module Name) */}
                                <div className="col-span-1 font-medium text-sm ">
                                    {formatLabel(objectKey)}
                                </div>

                                {/* Checkboxes for each action */}
                                {actions.map(action => (
                                    <div key={action} className="flex justify-center">
                                        {/* If the permission key exists in data, show checkbox/status.
                                           Some objects might not have 'execute' or 'delete', 
                                           so we check if perms[action] exists.
                                        */}
                                        {perms[action] !== undefined ? (
                                            <div
                                                onClick={() => handleToggle(objectKey, action)}
                                                className={`
                                                    flex items-center justify-center w-8 h-8 rounded-md border transition-all
                                                    ${perms[action] === "Y"
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "bg-secondary border-secondary text-secondary-foreground"}
                                                    ${!isViewOnly ? "cursor-pointer hover:ring-2 ring-offset-1 ring-primary/20 shadow-sm" : "opacity-90 cursor-not-allowed"}
                                                `}
                                            >
                                                {perms[action] === "Y" && <Check className="w-5 h-5" />}
                                                {perms[action] === "N" && <X className="w-5 h-5 " />}
                                            </div>
                                        ) : (
                                            <span className="text-gray-200 text-xl">-</span> // Not applicable
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={onClose}>
                    {isViewOnly ? "Close" : "Cancel"}
                </Button>

                {!isViewOnly && (
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ObjectPermissionForm;
import { usePermissions } from "@/contexts/PermissionContext";

// components/PermissionGate.jsx
export const PermissionGate = ({
    module,
    action,
    actions,
    requireAll = false,
    fallback = null,
    children
}) => {
    const { hasPermission, hasAnyPermission } = usePermissions();

    let hasAccess = false;

    if (actions && Array.isArray(actions)) {
        if (requireAll) {
            hasAccess = actions.every(act => hasPermission(module, act));
        } else {
            hasAccess = hasAnyPermission(module, actions);
        }
    } else if (action) {
        hasAccess = hasPermission(module, action);
    }

    return hasAccess ? children : fallback;
};
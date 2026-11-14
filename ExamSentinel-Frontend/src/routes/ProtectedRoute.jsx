// components/ProtectedRoute.jsx
import { usePermissions } from '@/contexts/PermissionContext';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({
    children,
    module,
    action,
    actions,
    requireAll = false,
    fallbackPath = '/admin/dashboard'
}) => {
    const { hasPermission, hasAnyPermission, loading } = usePermissions();

    if (loading) {
        return <div>Loading...</div>;
    }

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

    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
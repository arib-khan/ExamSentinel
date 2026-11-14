// components/RoleDashboardRouter.jsx
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/contexts/UserRoleContext';
import Loader from '@/components/reusableComponets/Loader';
import { usePermissions } from '@/contexts/PermissionContext';

export const RoleDashboardRouter = () => {
    const { userRole, loading: roleLoading } = useUserRole();
    const { loading: permissionLoading } = usePermissions();

    if (roleLoading || permissionLoading) {
        return <Loader />;
    }

    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to appropriate dashboard based on role
    switch (userRole) {
        case 1:
            return <Navigate to="/admin/dashboard" replace />;
        case 2:
            return <Navigate to="/client/dashboard" replace />;
        case 3:
            return <Navigate to="/class-invigilator/dashboard" replace />;
        case 6: // Candidate (live interviews)
            return <Navigate to="/candidate/live-interviews" replace />;
        case 5:
            return <Navigate to="/operator/dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};
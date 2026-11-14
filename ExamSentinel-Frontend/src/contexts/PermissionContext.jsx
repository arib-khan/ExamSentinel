// import { useAuth } from '@/hooks/redux';
// import { getObjectPermission } from '@/services/PermissionServices/objectPermision';
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';

// const PermissionContext = createContext();

// export const usePermissions = () => {
//     const context = useContext(PermissionContext);
//     if (!context) {
//         throw new Error('usePermissions must be used within a PermissionProvider');
//     }
//     return context;
// };

// export const PermissionProvider = ({ children }) => {

//     const token = useSelector((state) => state.auth.token);
//     const [permissions, setPermissions] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);



//     useEffect(() => {
//         if (token) {
//             fetchPermissions();
//         } else {
//             setLoading(false);
//             setPermissions({});
//         }
//     }, [token]);

//     const fetchPermissions = async () => {
//         try {
//             setLoading(true);
//             // Replace with your actual API call
//             const res = await getObjectPermission();
//             console.log("Permission Response:", res);

//             const response = res;

//             if (response?.data?.status && response.data.data.permissionsData) {
//                 setPermissions(response.data.data.permissionsData);
//                 setError(null);
//             } else {
//                 throw new Error('Invalid response structure');
//             }
//         } catch (err) {
//             console.error('Error fetching permissions:', err);
//             setError(err.message);
//             setPermissions({});
//         } finally {
//             setLoading(false);
//         }
//     };

//     const hasPermission = (moduleName, action) => {
//         if (!permissions[moduleName]) return false;
//         return permissions[moduleName][action] === "Y";
//     };

//     const hasAnyPermission = (moduleName, actions = []) => {
//         if (!permissions[moduleName]) return false;
//         return actions.some(action => permissions[moduleName][action] === "Y");
//     };

//     const getModulePermissions = (moduleName) => {
//         return permissions[moduleName] || {};
//     };

//     const value = {
//         permissions,
//         loading,
//         error,
//         hasPermission,
//         hasAnyPermission,
//         getModulePermissions,
//         refetch: fetchPermissions
//     };

//     return (
//         <PermissionContext.Provider value={value}>
//             {children}
//         </PermissionContext.Provider>
//     );
// };

// contexts/PermissionContext.jsx
import { getObjectPermission } from '@/services/PermissionServices/objectPermision';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const PermissionContext = createContext();

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

export const PermissionProvider = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    const [permissions, setPermissions] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            fetchPermissions();
            getUserRoleFromToken();
        } else {
            setLoading(false);
            setPermissions({});
            setUserRole(null);
        }
    }, [token]);

    const getUserRoleFromToken = () => {
        try {
            // Get user role from sessionStorage or decode from token
            const userData = sessionStorage.getItem("userData");
            const userId = userData ? JSON.parse(userData).user_role_id : null;


            if (userId) {
                setUserRole(userId);
            }
            // } else if (token) {
            //     // Decode JWT token to get role
            //     const payload = JSON.parse(atob(token.split('.')[1]));
            //     const roleId = payload.user?.role_id;
            //     setUserRole(roleId || 2);
            // }
        } catch (err) {
            console.error('Error getting user role:', err);
            setUserRole(null);
        }
    };

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const res = await getObjectPermission();

            const response = res;

            if (response?.data?.status && response.data.data.permissionsData) {
                setPermissions(response.data.data.permissionsData);
                setError(null);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err.message);
            setPermissions({});
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (moduleName, action) => {
        if (!permissions[moduleName]) return false;
        return permissions[moduleName][action] === "Y";
    };

    const hasAnyPermission = (moduleName, actions = []) => {
        if (!permissions[moduleName]) return false;
        return actions.some(action => permissions[moduleName][action] === "Y");
    };

    const getModulePermissions = (moduleName) => {
        return permissions[moduleName] || {};
    };

    // Helper function to check if user has specific role
    const hasRole = (roleId) => {
        return userRole === roleId;
    };

    // Helper function to get role name
    const getRoleName = () => {
        const roleMap = {
            1: 'admin',
            2: 'client',
            3: 'classInvigilator'
        };
        return roleMap[userRole] || 'unknown';
    };

    const value = {
        permissions,
        userRole,
        loading,
        error,
        hasPermission,
        hasAnyPermission,
        getModulePermissions,
        hasRole,
        getRoleName,
        refetch: fetchPermissions
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};
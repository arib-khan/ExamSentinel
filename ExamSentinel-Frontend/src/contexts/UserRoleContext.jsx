// contexts/UserRoleContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const UserRoleContext = createContext();

export const useUserRole = () => {
    const context = useContext(UserRoleContext);
    if (!context) {
        throw new Error('useUserRole must be used within a UserRoleProvider');
    }
    return context;
};

export const UserRoleProvider = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    const [userRole, setUserRole] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            getUserInfo();
        } else {
            setUserRole(null);
            setUserInfo(null);
            setLoading(false);
        }
    }, [token]);

    const getUserInfo = () => {
        try {
            setLoading(true);

            // Get user info from sessionStorage
            const userData = sessionStorage.getItem("userData");
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                setUserInfo(parsedUserData);
                setUserRole(parsedUserData.user_role_id);
            } else if (token) {
                // Fallback: decode JWT token to get user info
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userFromToken = payload.user;
                setUserInfo(userFromToken);
                setUserRole(userFromToken?.role_id);
            }
        } catch (err) {
            console.error('Error getting user info:', err);
            setUserRole(null);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions
    const getRoleName = () => {
        const roleMap = {
            1: 'admin',
            2: 'client',
            3: 'classInvigilator',
            5: 'operator'
        };
        return roleMap[userRole] || 'unknown';
    };

    const getRoleDisplayName = () => {
        const roleMap = {
            1: 'Admin',
            2: 'Client',
            3: 'Class Invigilator',
            5: 'Operator'
        };
        return roleMap[userRole] || 'Unknown Role';
    };

    const isAdmin = () => userRole === 1;
    const isClient = () => userRole === 2;
    const isClassInvigilator = () => userRole === 3;
    const isOperator = () => userRole === 5;

    const getDefaultRoute = () => {
        switch (userRole) {
            case 1: return '/admin/dashboard';
            case 2: return '/client/dashboard';
            case 3: return '/class-invigilator/dashboard';
            case 5: return '/operator/dashboard';
            default: return '/login';
        }
    };

    const getBaseRoutePath = () => {
        switch (userRole) {
            case 1: return '/admin';
            case 2: return '/client';
            case 3: return '/class-invigilator';
            case 5: return '/operator';
            default: return '/';
        }
    };

    const value = {
        userRole,
        userInfo,
        loading,
        getRoleName,
        getRoleDisplayName,
        isAdmin,
        isClient,
        isClassInvigilator,
        isOperator,
        getDefaultRoute,
        getBaseRoutePath,
        refetch: getUserInfo
    };

    return (
        <UserRoleContext.Provider value={value}>
            {children}
        </UserRoleContext.Provider>
    );
};
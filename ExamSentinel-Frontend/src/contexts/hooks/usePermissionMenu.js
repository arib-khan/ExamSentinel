// // hooks/usePermissionMenu.js
// import { useMemo } from 'react';
// import { usePermissions } from '../PermissionContext';
// import { menuConfig } from '@/components/menuConfig';

// export const usePermissionMenu = () => {
//   const { hasPermission, hasAnyPermission, loading } = usePermissions();

//   const filteredMenu = useMemo(() => {
//     if (loading) return [];

//     const checkPermission = (permissionConfig) => {
//       if (!permissionConfig) return true; // No permission required

//       const { module, action, actions, requireAll = false } = permissionConfig;

//       if (actions && Array.isArray(actions)) {
//         if (requireAll) {
//           return actions.every(act => hasPermission(module, act));
//         } else {
//           return hasAnyPermission(module, actions);
//         }
//       } else if (action) {
//         return hasPermission(module, action);
//       }

//       return false;
//     };

//     return menuConfig
//       .filter(menuItem => checkPermission(menuItem.permission))
//       .map(menuItem => ({
//         ...menuItem,
//         items: menuItem.items?.filter(subItem => 
//           checkPermission(subItem.permission)
//         ) || []
//       }))
//       .filter(menuItem => 
//         !menuItem.items || menuItem.items.length > 0 || !menuItem.permission
//       );
//   }, [hasPermission, hasAnyPermission, loading]);

//   console.log('Filtered Menu:', filteredMenu);
  
//   return { filteredMenu, loading };
// };

// contexts/hooks/usePermissionMenu.js
import { useMemo } from 'react';
import { usePermissions } from '../PermissionContext';
import { getMenuConfigByRole } from '../menuConfig';

export const usePermissionMenu = () => {
  const { hasPermission, hasAnyPermission, loading, userRole } = usePermissions();

  const filteredMenu = useMemo(() => {
    if (loading || !userRole) return [];

    // Get menu configuration based on user role
    const menuConfig = getMenuConfigByRole(userRole);
    
    // console.log('User Role:', userRole);
    // console.log('Menu Config for Role:', menuConfig);

    const checkPermission = (permissionConfig) => {
      if (!permissionConfig) return true; // No permission required

      const { module, action, actions, requireAll = false } = permissionConfig;

      if (actions && Array.isArray(actions)) {
        if (requireAll) {
          return actions.every(act => hasPermission(module, act));
        } else {
          return hasAnyPermission(module, actions);
        }
      } else if (action) {
        return hasPermission(module, action);
      }

      return false;
    };

    const filteredMenuItems = menuConfig
      .filter(menuItem => checkPermission(menuItem.permission))
      .map(menuItem => ({
        ...menuItem,
        items: menuItem.items?.filter(subItem => 
          checkPermission(subItem.permission)
        ) || []
      }))
      .filter(menuItem => 
        !menuItem.items || menuItem.items.length > 0 || !menuItem.permission
      );

    // console.log('Filtered Menu:', filteredMenuItems);
    
    return filteredMenuItems;
  }, [hasPermission, hasAnyPermission, loading, userRole]);

  return { filteredMenu, loading };
};
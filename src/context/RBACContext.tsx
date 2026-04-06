import { createContext, useContext, ReactNode } from 'react';
import { useStore } from '../store/useStore';

type Role = 'owner' | 'employee';

interface RBACContextType {
  isOwner: boolean;
  isEmployee: boolean;
  role: Role | null;
  can: (permission: Permission) => boolean;
}

type Permission =
  | 'view:overview'
  | 'view:pos'
  | 'view:inventory'
  | 'view:warehouse'
  | 'view:suppliers'
  | 'view:orders'
  | 'view:customers'
  | 'view:employees'
  | 'view:reports'
  | 'view:settings'
  | 'action:delete_product'
  | 'action:add_product'
  | 'action:manage_orders'
  | 'action:manage_employees'
  | 'action:view_financials';

const PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'view:overview', 'view:pos', 'view:inventory', 'view:warehouse',
    'view:suppliers', 'view:orders', 'view:customers', 'view:employees',
    'view:reports', 'view:settings',
    'action:delete_product', 'action:add_product', 'action:manage_orders',
    'action:manage_employees', 'action:view_financials',
  ],
  employee: [
    'view:overview', 'view:pos', 'view:inventory',
    'action:add_product',
  ],
};

const RBACContext = createContext<RBACContextType>({
  isOwner: false,
  isEmployee: true,
  role: null,
  can: () => false,
});

export function RBACProvider({ children }: { children: ReactNode }) {
  const user = useStore(state => state.user);
  const role = (user?.role as Role) || 'employee';

  const can = (permission: Permission) => {
    return PERMISSIONS[role]?.includes(permission) ?? false;
  };

  return (
    <RBACContext.Provider value={{
      isOwner: role === 'owner',
      isEmployee: role === 'employee',
      role,
      can,
    }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  return useContext(RBACContext);
}

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'employee';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useStore(state => state.user);
  const isAuthReady = useStore(state => state.isAuthReady);

  // While checking auth, show nothing (handled by loading state in App.tsx)
  if (!isAuthReady) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

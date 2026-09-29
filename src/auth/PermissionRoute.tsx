import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function PermissionRoute({ permission, anyOf = [], children }: { permission?: string; anyOf?: string[]; children: ReactNode }) {
  const { can } = useAuth();
  const permissions = permission ? [permission] : anyOf;
  return permissions.some((item) => can(item)) ? children : <Navigate to="/" replace />;
}

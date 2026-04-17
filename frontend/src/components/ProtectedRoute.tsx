import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) return null; // Or a spinner
  
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // If not matching role, send to general listings (market)
    return <Navigate to="/listings" replace />;
  }

  return <Outlet />;
};

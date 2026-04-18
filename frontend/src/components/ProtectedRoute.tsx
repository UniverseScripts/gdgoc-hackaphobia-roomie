import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/listings" replace />;
  }

  // Onboarding gate: block access to downstream routes until profile is complete
  const onboardingPaths = ['/onboarding', '/persona-test'];
  const isOnboardingRoute = onboardingPaths.some(p => location.pathname.startsWith(p));
  if (!userProfile.profile_completed && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

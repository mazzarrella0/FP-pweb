import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../features/auth/api/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Redirect to login and save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

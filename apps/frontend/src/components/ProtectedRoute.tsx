import { Navigate } from 'react-router-dom';
import { getAuthToken, isTokenExpired } from '@/services';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAuthToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '@/services'; // Import the helper function

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAuthToken(); // Use the helper function to get the token

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  return children; // Render the protected content if authenticated
}
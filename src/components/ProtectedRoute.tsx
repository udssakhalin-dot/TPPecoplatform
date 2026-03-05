import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'TPP_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

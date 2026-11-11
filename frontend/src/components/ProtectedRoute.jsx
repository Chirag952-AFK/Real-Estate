import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal('login');
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return <p role="status">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;

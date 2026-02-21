import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RoleRoute = ({ children, allowedRoles }) => {
  const role = useAuthStore((state) => state.role);

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};


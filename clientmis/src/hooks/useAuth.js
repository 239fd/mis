import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  return {
    isAuthenticated: store.isAuthenticated,
    user: {
      id: store.userId,
      login: store.login,
      role: store.role,
    },
    role: store.role,
    login: store.setAuth,
    logout: store.logout,

    isAdmin: store.role === 'ADMIN',
    isPatient: store.role === 'PATIENT',
    isDoctor: store.role === 'DOCTOR',
    isReceptionist: store.role === 'RECEPTIONIST',
    isManager: store.role === 'MANAGER',

    hasRole: (roles) => roles.includes(store.role),
  };
};


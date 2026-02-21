import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      login: null,
      role: null,
      isAuthenticated: false,

      setAuth: (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userId', data.userId);
        const role = typeof data.role === 'object' ? data.role?.name : data.role;
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          login: data.login,
          role: role,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          login: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    { name: 'auth-storage' }
  )
);


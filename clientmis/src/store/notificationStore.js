import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notification: null,

  showNotification: (message, severity = 'info') => {
    set({ notification: { message, severity, open: true } });
  },

  showSuccess: (message) => {
    set({ notification: { message, severity: 'success', open: true } });
  },

  showError: (message) => {
    set({ notification: { message, severity: 'error', open: true } });
  },

  showWarning: (message) => {
    set({ notification: { message, severity: 'warning', open: true } });
  },

  hideNotification: () => {
    set({ notification: null });
  },
}));


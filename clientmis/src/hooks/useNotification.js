import { useNotificationStore } from '../store/notificationStore';

export const useNotification = () => {
  const store = useNotificationStore();

  return {
    notification: store.notification,
    showNotification: store.showNotification,
    showSuccess: store.showSuccess,
    showError: store.showError,
    showWarning: store.showWarning,
    hideNotification: store.hideNotification,
  };
};


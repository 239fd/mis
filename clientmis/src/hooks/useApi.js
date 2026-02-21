import { useState, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotificationStore();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { showErrorNotification = true, onSuccess, onError } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (response.data.status === false) {
        throw new Error(response.data.message || 'Произошла ошибка');
      }

      if (onSuccess) {
        onSuccess(response.data.data);
      }

      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Произошла ошибка';
      setError(errorMessage);

      if (showErrorNotification) {
        showError(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return {
    loading,
    error,
    execute,
  };
};

export const useApiData = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const { loading, error, execute } = useApi();

  const fetch = useCallback(async (apiCall, options = {}) => {
    const result = await execute(apiCall, options);
    setData(result);
    return result;
  }, [execute]);

  const reset = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    setData,
    loading,
    error,
    fetch,
    reset,
  };
};


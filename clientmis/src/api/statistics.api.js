import api from './axios';

export const statisticsApi = {
  getDashboard: () => api.get('/statistics/dashboard'),

  getAppointmentsByDateRange: (dateFrom, dateTo) =>
    api.get('/statistics/appointments/date-range', {
      params: { dateFrom, dateTo },
    }),

  getAppointmentsByStatus: (dateFrom, dateTo) =>
    api.get('/statistics/appointments/by-status', {
      params: { dateFrom, dateTo },
    }),

  getAppointmentsByEmployee: (dateFrom, dateTo) =>
    api.get('/statistics/appointments/by-employee', {
      params: { dateFrom, dateTo },
    }),

  getAppointmentsByService: (dateFrom, dateTo) =>
    api.get('/statistics/appointments/by-service', {
      params: { dateFrom, dateTo },
    }),

  getWorkloadToday: () => api.get('/statistics/workload/today'),

  getNoShowRate: (dateFrom, dateTo) =>
    api.get('/statistics/no-show-rate', {
      params: { dateFrom, dateTo },
    }),

  exportPDF: (data) =>
    api.post('/statistics/export/pdf', data, {
      responseType: 'blob',
    }),
};


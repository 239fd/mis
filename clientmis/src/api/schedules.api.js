import api from './axios';

export const schedulesApi = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  getByEmployee: (employeeId) => api.get(`/schedules/employee/${employeeId}`),
  getActiveByEmployeeAndDate: (employeeId, date) =>
    api.get(`/schedules/employee/${employeeId}/active`, { params: { date } }),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

export const scheduleExceptionsApi = {
  getAll: () => api.get('/schedules/exceptions'),
  getByEmployee: (employeeId) => api.get(`/schedules/exceptions/employee/${employeeId}`),
  getByEmployeeAndRange: (employeeId, dateFrom, dateTo) =>
    api.get(`/schedules/exceptions/employee/${employeeId}/range`, { params: { dateFrom, dateTo } }),
  getAffectedAppointments: ({ employeeId, dateFrom, dateTo }) =>
    api.get(`/schedules/exceptions/employee/${employeeId}/affected-appointments`, { params: { dateFrom, dateTo } }),
  create: (data) => api.post('/schedules/exceptions', data),
  delete: (id) => api.delete(`/schedules/exceptions/${id}`),
};

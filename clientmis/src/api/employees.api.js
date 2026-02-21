import api from './axios';

export const employeesApi = {
  getAll: () => api.get('/employees'),
  getActive: () => api.get('/employees/active'),
  getById: (id) => api.get(`/employees/${id}`),
  getBySpecialty: (specialtyId) => api.get(`/employees/specialty/${specialtyId}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  activate: (id) => api.patch(`/employees/${id}/activate`),
  deactivate: (id) => api.patch(`/employees/${id}/deactivate`),
  delete: (id) => api.delete(`/employees/${id}`),
};

import api from './axios';

export const servicesApi = {
  getAll: () => api.get('/services'),
  getActive: () => api.get('/services/active'),
  getById: (id) => api.get(`/services/${id}`),
  getDurations: (id) => api.get(`/services/${id}/durations`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  addDuration: (id, data) => api.post(`/services/${id}/durations`, data),
};

export const specialtiesApi = {
  getAll: () => api.get('/specialties'),
  getById: (id) => api.get(`/specialties/${id}`),
  create: (data) => api.post('/specialties', data),
  update: (id, data) => api.put(`/specialties/${id}`, data),
  delete: (id) => api.delete(`/specialties/${id}`),
};

export const doctorServicesApi = {
  getAll: () => api.get('/doctor-services'),
  getByEmployee: (employeeId) => api.get(`/doctor-services/employee/${employeeId}`),
  getActiveByEmployee: (employeeId) => api.get(`/doctor-services/employee/${employeeId}/active`),
  getByService: (serviceId) => api.get(`/doctor-services/service/${serviceId}`),
  create: (data) => api.post('/doctor-services', data),
  update: (id, data) => api.put(`/doctor-services/${id}`, data),
  deactivate: (id) => api.patch(`/doctor-services/${id}/deactivate`),
  delete: (id) => api.delete(`/doctor-services/${id}`),
};

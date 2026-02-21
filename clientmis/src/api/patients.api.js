import api from './axios';

export const patientsApi = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  getByUserId: (userId) => api.get(`/patients/user/${userId}`),
  searchByName: (name) => api.get('/patients/search', { params: { name } }),
  getByPassport: (series, number) =>
    api.get('/patients/passport', { params: { series, number } }),

  // Создание пациента (только для RECEPTIONIST/ADMIN)
  create: (data) => api.post('/patients', data),

  // Создание пациента с привязкой к пользователю (для PATIENT - атомарная операция)
  createWithLink: (data) => api.post('/patients/with-link', data),

  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),

  // Привязка/отвязка пациента к пользователю
  linkToUser: (data) => api.post('/patients/link', data),
  unlinkFromUser: (patientId) => api.delete(`/patients/unlink/${patientId}`),
};

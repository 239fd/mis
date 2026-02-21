import api from './axios';

export const appointmentsApi = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByPatientId: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getByEmployeeId: (employeeId) => api.get(`/appointments/employee/${employeeId}`),
  getByEmployeeAndDate: (employeeId, date) =>
    api.get(`/appointments/employee/${employeeId}/date/${date}`),
  getByDate: (date) => api.get(`/appointments/date/${date}`),
  getByStatus: (status) => api.get(`/appointments/status/${status}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status, reason) =>
    api.patch(`/appointments/${id}/status`, { status, reason }),
  delete: (id) => api.delete(`/appointments/${id}`),
  getHistory: (id) => api.get(`/appointments/${id}/history`),

  calculateAvailableSlots: async (employeeId, serviceId, date, schedules, existingAppointments, serviceDurationMin = 30) => {
    const dayOfWeek = new Date(date).getDay() || 7;

    const schedule = schedules.find(s => {
      if (s.dayOfWeek !== dayOfWeek) return false;

      const effectiveFrom = s.effectiveFrom;
      const effectiveTo = s.effectiveTo || '9999-12-31';

      return date >= effectiveFrom && date <= effectiveTo;
    });

    if (!schedule) return [];

    const slots = [];
    const startTime = schedule.startTime?.slice(0, 5);
    const endTime = schedule.endTime?.slice(0, 5);

    if (!startTime || !endTime) return [];

    const paidStartTime = schedule.paidStartTime?.slice(0, 5);
    const paidEndTime = schedule.paidEndTime?.slice(0, 5);

    const bookedRanges = existingAppointments.map(apt => {
      const start = apt.startTime?.slice(11, 16) || apt.startTime?.slice(0, 5);
      const end = apt.endTime?.slice(11, 16) || apt.endTime?.slice(0, 5);
      return { start, end };
    });

    const timeToMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const isSlotBooked = (slotStart, slotEnd) => {
      return bookedRanges.some(range => {
        return slotStart < range.end && slotEnd > range.start;
      });
    };

    const duration = serviceDurationMin;
    let currentMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = minutesToTime(currentMinutes);
      const slotEnd = minutesToTime(currentMinutes + duration);

      const isBooked = isSlotBooked(slotStart, slotEnd);

      if (!isBooked) {
        let isPaid = false;
        if (paidStartTime && paidEndTime) {
          const paidStartMinutes = timeToMinutes(paidStartTime);
          const paidEndMinutes = timeToMinutes(paidEndTime);
          const slotStartMinutes = currentMinutes;
          const slotEndMinutes = currentMinutes + duration;
          isPaid = slotStartMinutes >= paidStartMinutes && slotEndMinutes <= paidEndMinutes;
        }

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
          isPaid,
        });
      }

      currentMinutes += duration;
    }

    return slots;
  },
};

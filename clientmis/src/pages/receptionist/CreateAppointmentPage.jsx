import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { patientsApi } from '../../api/patients.api';
import { servicesApi, doctorServicesApi } from '../../api/services.api';
import { employeesApi } from '../../api/employees.api';
import { appointmentsApi } from '../../api/appointments.api';
import { schedulesApi } from '../../api/schedules.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useNotification } from '../../hooks/useNotification';
import { formatTime, formatFullName } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

export const CreateAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Данные для выбора
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Выбранные значения
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotFilter, setSlotFilter] = useState('all');
  const [source, setSource] = useState('PHONE');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadDoctors(selectedService.id);
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [patientsRes, servicesRes] = await Promise.all([
        patientsApi.getAll(),
        servicesApi.getActive(),
      ]);
      setPatients(patientsRes.data.data || []);
      setServices(servicesRes.data.data || []);

      // Если передан patientId в URL
      const patientId = searchParams.get('patientId');
      if (patientId) {
        const patient = (patientsRes.data.data || []).find(p => p.id === patientId);
        if (patient) {
          setSelectedPatient(patient);
        }
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async (serviceId) => {
    try {
      const doctorServicesRes = await doctorServicesApi.getByService(serviceId);
      const doctorServices = doctorServicesRes.data.data || [];
      const activeDoctorServices = doctorServices.filter(ds => ds.isActive !== false);

      const employeesRes = await employeesApi.getActive();
      const allEmployees = employeesRes.data.data || [];

      const employeeIds = activeDoctorServices.map(ds => ds.employeeId);
      const filteredDoctors = allEmployees.filter(emp => employeeIds.includes(emp.id));

      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');

      const schedulesRes = await schedulesApi.getByEmployee(selectedDoctor.id);
      const schedules = schedulesRes.data.data || [];

      let existingAppointments = [];
      try {
        const appointmentsRes = await appointmentsApi.getByEmployeeAndDate(selectedDoctor.id, dateStr);
        existingAppointments = (appointmentsRes.data.data || []).filter(
          a => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW'
        );
      } catch (error) {
        console.log('Cannot fetch appointments, using schedule only');
      }

      const serviceDuration = selectedService?.currentDurationMin || selectedService?.durationMin || 30;

      let slots = await appointmentsApi.calculateAvailableSlots(
        selectedDoctor.id,
        selectedService.id,
        dateStr,
        schedules,
        existingAppointments,
        serviceDuration
      );

      const isToday = selectedDate.isSame(dayjs(), 'day');
      if (isToday) {
        const now = dayjs();
        const currentTime = now.format('HH:mm');
        slots = slots.filter(slot => slot.startTime > currentTime);
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedService || !selectedDoctor || !selectedSlot) {
      showError('Заполните все обязательные поля');
      return;
    }

    try {
      setSubmitting(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      await appointmentsApi.create({
        patientId: selectedPatient.id,
        employeeId: selectedDoctor.id,
        serviceId: selectedService.id,
        appointmentDate: dateStr,
        startTime: `${dateStr}T${selectedSlot.startTime}:00`,
        endTime: `${dateStr}T${selectedSlot.endTime}:00`,
        source: source,
      });
      showSuccess('Запись успешно создана');
      navigate('/receptionist/appointments');
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка при создании записи'));
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Записи на приём', path: '/receptionist/appointments' },
    { label: 'Новая запись' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Новая запись на приём
      </Typography>

      <LoadingOverlay loading={loading}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  1. Выберите пациента
                </Typography>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) =>
                    `${option.fullName || formatFullName(option.lastName, option.firstName, option.middleName)} (${option.passportSeries} ${option.passportNumber})`
                  }
                  value={selectedPatient}
                  onChange={(e, value) => setSelectedPatient(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Пациент" placeholder="Начните вводить ФИО или номер паспорта" />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  2. Выберите услугу
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Услуга</InputLabel>
                  <Select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const service = services.find(s => s.id === e.target.value);
                      setSelectedService(service);
                      setSelectedDoctor(null);
                      setSelectedSlot(null);
                    }}
                    label="Услуга"
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 300 }
                      }
                    }}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  3. Выберите врача
                </Typography>
                {!selectedService ? (
                  <Alert severity="info">Сначала выберите услугу</Alert>
                ) : doctors.length === 0 ? (
                  <Alert severity="warning">Нет врачей, предоставляющих данную услугу</Alert>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel>Врач</InputLabel>
                    <Select
                      value={selectedDoctor?.id || ''}
                      onChange={(e) => {
                        const doctor = doctors.find(d => d.id === e.target.value);
                        setSelectedDoctor(doctor);
                        setSelectedSlot(null);
                      }}
                      label="Врач"
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 300 }
                        }
                      }}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {formatFullName(doctor.lastName, doctor.firstName, doctor.middleName)}
                          {doctor.cabinet && ` (каб. ${doctor.cabinet})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  4. Выберите дату и время
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <DatePicker
                    label="Дата приёма"
                    value={selectedDate}
                    onChange={(value) => {
                      setSelectedDate(value);
                      setSelectedSlot(null);
                    }}
                    minDate={dayjs()}
                    maxDate={dayjs().add(30, 'day')}
                    sx={{ width: '100%' }}
                  />
                </Box>

                {!selectedDoctor ? (
                  <Alert severity="info">Сначала выберите врача</Alert>
                ) : availableSlots.length === 0 ? (
                  <Alert severity="warning">
                    {selectedDate.isSame(dayjs(), 'day')
                      ? 'На сегодня нет доступных слотов'
                      : 'На выбранную дату нет доступных слотов'}
                  </Alert>
                ) : (
                  <>
                    {(availableSlots.some(s => s.isPaid) && availableSlots.some(s => !s.isPaid)) && (
                      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label="Все"
                          variant={slotFilter === 'all' ? 'filled' : 'outlined'}
                          onClick={() => setSlotFilter('all')}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          size="small"
                          color="primary"
                          label="Бесплатный"
                          variant={slotFilter === 'free' ? 'filled' : 'outlined'}
                          onClick={() => setSlotFilter('free')}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          size="small"
                          color="secondary"
                          label="Платный"
                          variant={slotFilter === 'paid' ? 'filled' : 'outlined'}
                          onClick={() => setSlotFilter('paid')}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableSlots
                        .filter(slot => {
                          if (slotFilter === 'free') return !slot.isPaid;
                          if (slotFilter === 'paid') return slot.isPaid;
                          return true;
                        })
                        .map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedSlot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                            color={slot.isPaid ? 'secondary' : 'primary'}
                            size="small"
                            onClick={() => setSelectedSlot(slot)}
                            disabled={!slot.available}
                            sx={{
                              bgcolor: selectedSlot?.startTime !== slot.startTime
                                ? (slot.isPaid ? 'rgba(156, 39, 176, 0.08)' : 'rgba(25, 118, 210, 0.08)')
                                : undefined,
                            }}
                          >
                            {formatTime(slot.startTime)}
                          </Button>
                        ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  5. Источник записи
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Источник</InputLabel>
                  <Select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    label="Источник"
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 300 }
                      }
                    }}
                  >
                    <MenuItem value="PHONE">Телефон</MenuItem>
                    <MenuItem value="WALK_IN">Личное обращение</MenuItem>
                    <MenuItem value="ONLINE">Онлайн</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Итого
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Пациент:</Typography>
                  <Typography variant="body1">
                    {selectedPatient?.fullName || formatFullName(selectedPatient?.lastName, selectedPatient?.firstName, selectedPatient?.middleName) || '—'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Услуга:</Typography>
                  <Typography variant="body1">{selectedService?.name || '—'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Врач:</Typography>
                  <Typography variant="body1">
                    {selectedDoctor ? formatFullName(selectedDoctor.lastName, selectedDoctor.firstName, selectedDoctor.middleName) : '—'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Дата и время:</Typography>
                  <Typography variant="body1">
                    {selectedDate?.format('DD.MM.YYYY')} {selectedSlot ? formatTime(selectedSlot.startTime) : '—'}
                  </Typography>
                </Box>
                {selectedSlot?.isPaid && (
                  <Chip label="Платный приём" color="secondary" sx={{ mb: 2 }} />
                )}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedPatient || !selectedService || !selectedDoctor || !selectedSlot || submitting}
                >
                  {submitting ? 'Создание...' : 'Создать запись'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </LoadingOverlay>
    </Box>
  );
};


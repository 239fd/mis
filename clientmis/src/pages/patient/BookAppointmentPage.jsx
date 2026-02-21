import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  MedicalServices,
  CheckCircle,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { patientsApi } from '../../api/patients.api';
import { servicesApi, doctorServicesApi } from '../../api/services.api';
import { employeesApi } from '../../api/employees.api';
import { appointmentsApi } from '../../api/appointments.api';
import { schedulesApi } from '../../api/schedules.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime, formatFullName } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

const steps = ['Пациент', 'Услуга', 'Врач', 'Дата и время', 'Подтверждение'];

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useAuthStore();
  const { showError } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotFilter, setSlotFilter] = useState('all');

  useEffect(() => {
    loadInitialData();
  }, [userId]);

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [searchParams, patients]);

  useEffect(() => {
    if (selectedDoctor && selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedService, selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [patientsRes, servicesRes] = await Promise.all([
        patientsApi.getByUserId(userId),
        servicesApi.getActive(),
      ]);
      setPatients(patientsRes.data.data || []);
      setServices(servicesRes.data.data || []);
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

  const handleNext = () => {
    if (activeStep === 1 && selectedService) {
      loadDoctors(selectedService.id);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
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
        source: 'ONLINE',
      });
      setSuccessDialogOpen(true);
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка при создании записи'));
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return !!selectedPatient;
      case 1: return !!selectedService;
      case 2: return !!selectedDoctor;
      case 3: return !!selectedSlot;
      default: return true;
    }
  };

  const breadcrumbs = [
    { label: 'Главная', path: '/patient/home' },
    { label: 'Запись на приём' },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Выберите пациента
            </Typography>
            {patients.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Пациенты не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Сначала добавьте пациента в разделе "Мои пациенты"
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {patients.map((patient) => (
                  <Grid item xs={12} sm={6} md={4} key={patient.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedPatient?.id === patient.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {patient.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {formatFullName(patient.lastName, patient.firstName, patient.middleName)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(patient.birthDate)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Выберите услугу
            </Typography>
            {services.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Услуги не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  В системе нет доступных услуг
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedService?.id === service.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MedicalServices color="primary" />
                          <Typography variant="body1" fontWeight={500}>
                            {service.name}
                          </Typography>
                        </Box>
                        {service.description && (
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                        )}
                        {service.duration && (
                          <Chip
                            label={`${service.duration} мин`}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Выберите врача
            </Typography>
            {doctors.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Врачи не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Для выбранной услуги нет доступных врачей
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {doctors.map((doctor) => (
                  <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedDoctor?.id === doctor.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                          {doctor.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {formatFullName(doctor.lastName, doctor.firstName, doctor.middleName)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.position || doctor.specialtyName}
                          </Typography>
                          {doctor.cabinet && (
                            <Typography variant="body2" color="text.secondary">
                              Кабинет: {doctor.cabinet}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Выберите дату и время
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Дата приёма"
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    setSelectedSlot(null);
                  }}
                  minDate={dayjs()}
                  maxDate={dayjs().add(30, 'day')}
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Доступное время
                </Typography>
                {availableSlots.length === 0 ? (
                  <Alert severity="info">
                    {selectedDate.isSame(dayjs(), 'day')
                      ? 'На сегодня нет доступных слотов. Попробуйте выбрать другую дату.'
                      : 'На выбранную дату расписание врача отсутствует. Пожалуйста, выберите другую дату.'}
                  </Alert>
                ) : (
                  <>
                    {(availableSlots.some(s => s.isPaid) && availableSlots.some(s => !s.isPaid)) && (
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label="Все"
                          color={slotFilter === 'all' ? 'default' : 'default'}
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
                    <Grid container spacing={1}>
                      {availableSlots
                        .filter(slot => {
                          if (slotFilter === 'free') return !slot.isPaid;
                          if (slotFilter === 'paid') return slot.isPaid;
                          return true;
                        })
                        .map((slot, index) => (
                          <Grid item xs={4} sm={3} md={2} key={index}>
                            <Button
                              variant={selectedSlot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                              color={slot.isPaid ? 'secondary' : 'primary'}
                              disabled={!slot.available}
                              fullWidth
                              onClick={() => setSelectedSlot(slot)}
                              sx={{
                                py: 1.5,
                                bgcolor: selectedSlot?.startTime !== slot.startTime
                                  ? (slot.isPaid ? 'rgba(156, 39, 176, 0.08)' : 'rgba(25, 118, 210, 0.08)')
                                  : undefined,
                              }}
                            >
                              {formatTime(slot.startTime)}
                            </Button>
                          </Grid>
                        ))}
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Подтверждение записи
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Пациент</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatFullName(selectedPatient?.lastName, selectedPatient?.firstName, selectedPatient?.middleName)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Услуга</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedService?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Врач</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatFullName(selectedDoctor?.lastName, selectedDoctor?.firstName, selectedDoctor?.middleName)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Кабинет</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedDoctor?.roomNumber || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Дата</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedDate?.format('DD MMMM YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Время</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Chip
                      label={selectedSlot?.isPaid ? 'Платный приём' : 'Бесплатный приём'}
                      color={selectedSlot?.isPaid ? 'secondary' : 'primary'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 2 }}>
              Пожалуйста, придите за 10-15 минут до назначенного времени
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Запись на приём
      </Typography>

      <LoadingOverlay loading={loading}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent sx={{ p: 3 }}>
            {renderStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Назад
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  Подтвердить запись
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Далее
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </LoadingOverlay>

      <Dialog open={successDialogOpen} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5">Запись создана!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary">
            Вы успешно записались на приём
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/patient/appointments')}
          >
            К моим записям
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


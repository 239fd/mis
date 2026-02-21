import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  Person,
  LocalHospital,
  MeetingRoom,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { patientsApi } from '../../api/patients.api';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime } from '../../utils/formatters';

export const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const patientsRes = await patientsApi.getByUserId(userId);
      const patientIds = (patientsRes.data.data || []).map(p => p.id);

      const allAppointments = [];
      for (const patientId of patientIds) {
        const res = await appointmentsApi.getByPatientId(patientId);
        allAppointments.push(...(res.data.data || []));
      }

      setAppointments(allAppointments.sort((a, b) =>
        new Date(b.appointmentDate) - new Date(a.appointmentDate)
      ));
    } catch (error) {
      showError('Ошибка загрузки записей');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await appointmentsApi.updateStatus(selectedAppointment.id, 'CANCELLED', 'Отменено пациентом');
      showSuccess('Запись отменена');
      setCancelDialogOpen(false);
      loadAppointments();
    } catch (error) {
      showError('Ошибка при отмене записи');
    }
  };

  const filterAppointments = () => {
    switch (tabValue) {
      case 0:
        return appointments.filter(a =>
          ['WAITING', 'IN_PROGRESS', 'RESCHEDULED'].includes(a.status)
        );
      case 1:
        return appointments.filter(a =>
          a.status === 'CANCELLED'
        );
      case 2:
        return appointments.filter(a =>
          ['COMPLETED', 'NO_SHOW'].includes(a.status)
        );
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments();

  const breadcrumbs = [
    { label: 'Главная', path: '/patient/home' },
    { label: 'Мои записи' },
  ];

  const AppointmentCard = ({ appointment }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="primary" />
            <Typography variant="h6">
              {formatDate(appointment.appointmentDate)}
            </Typography>
          </Box>
          <StatusChip status={appointment.status} />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2">
                {appointment.employee?.fullName || appointment.employeeName || '—'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalHospital fontSize="small" color="action" />
              <Typography variant="body2">
                {appointment.service?.name || appointment.serviceName || '—'}
              </Typography>
            </Box>
            {(appointment.employee?.cabinet || appointment.roomNumber) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MeetingRoom fontSize="small" color="action" />
                <Typography variant="body2">
                  Кабинет {appointment.employee?.cabinet || appointment.roomNumber}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
          >
            Подробнее
          </Button>
          {['WAITING', 'RESCHEDULED'].includes(appointment.status) && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => handleCancelClick(appointment)}
            >
              Отменить
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Мои записи
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Предстоящие" />
        <Tab label="Отменённые" />
        <Tab label="Прошедшие" />
      </Tabs>

      <LoadingOverlay loading={loading}>
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon="appointments"
            title="Нет записей"
            description={
              tabValue === 0
                ? 'У вас нет предстоящих записей на приём'
                : tabValue === 1
                ? 'У вас нет отменённых записей'
                : 'У вас нет прошедших записей'
            }
            action={tabValue === 0 ? () => navigate('/patient/book') : undefined}
            actionText={tabValue === 0 ? 'Записаться на приём' : undefined}
          />
        ) : (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} md={6} key={appointment.id}>
                <AppointmentCard appointment={appointment} />
              </Grid>
            ))}
          </Grid>
        )}
      </LoadingOverlay>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Отмена записи"
        message="Вы уверены, что хотите отменить запись на приём?"
        confirmText="Отменить запись"
        confirmColor="error"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};


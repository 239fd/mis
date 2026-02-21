import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Cancel,
  Person,
  LocalHospital,
  MeetingRoom,
  CalendarMonth,
} from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime } from '../../utils/formatters';

export const AppointmentDetailPage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const appointmentRes = await appointmentsApi.getById(id);
      setAppointment(appointmentRes.data.data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await appointmentsApi.updateStatus(id, 'CANCELLED');
      showSuccess('Запись отменена');
      setCancelDialogOpen(false);
      loadData();
    } catch (error) {
      showError('Ошибка при отмене записи');
    }
  };

  const breadcrumbs = [
    { label: 'Главная', path: '/patient/home' },
    { label: 'Мои записи', path: '/patient/appointments' },
    { label: `Запись #${id?.slice(0, 8)}...` },
  ];

  if (loading) {
    return <LoadingOverlay loading={true} />;
  }

  if (!appointment) {
    return (
      <Box>
        <Typography>Запись не найдена</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Запись на приём
          </Typography>
          <StatusChip status={appointment.status} size="medium" />
        </Box>
        {appointment.status === 'WAITING' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => setCancelDialogOpen(true)}
          >
            Отменить
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Информация о записи
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarMonth color="primary" />
                    <Typography variant="h5">
                      {formatDate(appointment.appointmentDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Время</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Тип</Typography>
                  <Chip
                    label={appointment.isPaid ? 'Платный' : 'Бесплатный'}
                    color={appointment.isPaid ? 'secondary' : 'primary'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Услуга
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocalHospital color="primary" />
                <Typography variant="body1" fontWeight={500}>
                  {appointment.service?.name || appointment.serviceName || '—'}
                </Typography>
              </Box>

              {(appointment.service?.description || appointment.serviceDescription) && (
                <Typography variant="body2" color="text.secondary">
                  {appointment.service?.description || appointment.serviceDescription}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Врач
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {appointment.employee?.fullName || appointment.employeeName || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.employee?.specialtyName || appointment.employee?.position || appointment.specialtyName || appointment.position || ''}
                  </Typography>
                </Box>
              </Box>

              {(appointment.employee?.cabinet || appointment.roomNumber) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MeetingRoom color="action" />
                  <Typography variant="body2">
                    Кабинет {appointment.employee?.cabinet || appointment.roomNumber}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Пациент
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" fontWeight={500}>
                {appointment.patient?.fullName || appointment.patientName || '—'}
              </Typography>
              {(appointment.patient?.phone || appointment.patientPhone) && (
                <Typography variant="body2" color="text.secondary">
                  {appointment.patient?.phone || appointment.patientPhone}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Отмена записи"
        message="Вы уверены, что хотите отменить запись на приём?"
        confirmText="Отменить запись"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};


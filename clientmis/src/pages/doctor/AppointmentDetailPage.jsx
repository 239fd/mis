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
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Cancel,
  Phone,
} from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime, calculateAge } from '../../utils/formatters';

export const DoctorAppointmentDetailPage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getById(id);
      setAppointment(response.data.data);

      if (response.data.data?.patientId) {
        const historyRes = await appointmentsApi.getByPatient(response.data.data.patientId);
        setPatientHistory((historyRes.data.data || []).filter(a => a.id !== id));
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      showSuccess('Статус обновлён');
      loadData();
    } catch (error) {
      showError('Ошибка при изменении статуса');
    }
    setConfirmDialog({ open: false, action: null });
  };

  const getStatusAction = () => {
    switch (appointment?.status) {
      case 'WAITING':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => setConfirmDialog({
                open: true,
                action: 'IN_PROGRESS',
                title: 'Начать приём',
                message: 'Начать приём пациента?'
              })}
            >
              Начать приём
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setConfirmDialog({
                open: true,
                action: 'NO_SHOW',
                title: 'Отметить неявку',
                message: 'Отметить пациента как неявившегося?'
              })}
            >
              Неявка
            </Button>
          </Box>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => setConfirmDialog({
              open: true,
              action: 'COMPLETED',
              title: 'Завершить приём',
              message: 'Завершить приём пациента?'
            })}
          >
            Завершить приём
          </Button>
        );
      default:
        return null;
    }
  };

  const breadcrumbs = [
    { label: 'Главная', path: '/doctor/home' },
    { label: 'Записи на приём', path: '/doctor/appointments' },
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
            Приём пациента
          </Typography>
          <StatusChip status={appointment.status} size="medium" />
        </Box>
        {getStatusAction()}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Информация о пациенте
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">ФИО</Typography>
                  <Typography variant="h6">{appointment.patient?.fullName || appointment.patientFullName || '—'}</Typography>
                </Grid>
                {(appointment.patient?.birthDate || appointment.patientBirthDate) && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Возраст</Typography>
                    <Typography variant="body1">
                      {calculateAge(appointment.patient?.birthDate || appointment.patientBirthDate)} лет
                    </Typography>
                  </Grid>
                )}
                {(appointment.patient?.phone || appointment.patientPhone) && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Телефон</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body1">{appointment.patient?.phone || appointment.patientPhone}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Информация о записи
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Дата</Typography>
                  <Typography variant="body1">{formatDate(appointment.appointmentDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Время</Typography>
                  <Typography variant="body1">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Услуга</Typography>
                  <Typography variant="body1">{appointment.service?.name || appointment.serviceName || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {patientHistory.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  История посещений пациента
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {patientHistory.slice(0, 5).map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              {formatDate(item.appointmentDate)}
                            </Typography>
                            <StatusChip status={item.status} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.service?.name || item.serviceName || '—'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Подтвердить"
        onConfirm={() => handleStatusChange(confirmDialog.action)}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />
    </Box>
  );
};


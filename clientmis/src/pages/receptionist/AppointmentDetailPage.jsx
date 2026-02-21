import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Cancel } from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime } from '../../utils/formatters';
import { STATUS_LABELS } from '../../utils/constants';

export const ReceptionistAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getById(id);
      setAppointment(response.data.data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      showSuccess('Статус обновлён');
      setStatusDialogOpen(false);
      loadData();
    } catch (error) {
      showError('Ошибка при изменении статуса');
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
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Записи на приём', path: '/receptionist/appointments' },
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setStatusDialogOpen(true)}
          >
            Изменить статус
          </Button>
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
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Услуга</Typography>
                  <Typography variant="body1">
                    {appointment.service?.name || appointment.serviceName || '—'}
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
                Пациент
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography
                variant="body1"
                fontWeight={500}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => navigate(`/receptionist/patients/${appointment.patient?.id || appointment.patientId}`)}
              >
                {appointment.patient?.fullName || appointment.patientFullName || appointment.patientName || '—'}
              </Typography>
              {(appointment.patient?.phone || appointment.patientPhone) && (
                <Typography variant="body2" color="text.secondary">
                  {appointment.patient?.phone || appointment.patientPhone}
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

              <Typography variant="body1" fontWeight={500}>
                {appointment.employee?.fullName || appointment.employeeFullName || appointment.employeeName || '—'}
              </Typography>
              {(appointment.employee?.specialtyName || appointment.specialtyName) && (
                <Typography variant="body2" color="text.secondary">
                  {appointment.employee?.specialtyName || appointment.specialtyName}
                </Typography>
              )}
              {(appointment.employee?.cabinet || appointment.roomNumber) && (
                <Typography variant="body2" color="text.secondary">
                  Кабинет: {appointment.employee?.cabinet || appointment.roomNumber}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Изменить статус</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Новый статус</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Новый статус"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleStatusChange} disabled={!newStatus}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Отменить запись"
        message="Вы уверены, что хотите отменить эту запись?"
        confirmText="Отменить запись"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};


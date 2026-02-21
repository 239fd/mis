import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { appointmentsApi } from '../../api/appointments.api';
import { employeesApi } from '../../api/employees.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { StatusChip } from '../../components/common/StatusChip';
import { useNotification } from '../../hooks/useNotification';
import { formatTime } from '../../utils/formatters';

export const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    loadEmployee();
  }, [userId]);

  useEffect(() => {
    if (employee) {
      loadAppointments();
    }
  }, [employee, selectedDate]);

  const loadEmployee = async () => {
    try {
      const employeesRes = await employeesApi.getActive();
      const employees = employeesRes.data.data || [];
      const currentEmployee = employees.find(e => e.userId === userId);
      setEmployee(currentEmployee);
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const date = selectedDate.format('YYYY-MM-DD');
      const response = await appointmentsApi.getByEmployeeAndDate(employee.id, date);
      const appointmentsData = response.data.data || [];

      const now = dayjs();
      const isToday = selectedDate.isSame(now, 'day');

      if (isToday) {
        for (const appointment of appointmentsData) {
          if (appointment.status === 'WAITING' || appointment.status === 'IN_PROGRESS') {
            const endTime = dayjs(appointment.endTime);
            if (endTime.isBefore(now)) {
              try {
                await appointmentsApi.updateStatus(appointment.id, 'COMPLETED', null);
                appointment.status = 'COMPLETED';
              } catch (err) {
                console.error('Ошибка автообновления статуса:', err);
              }
            }
          }
        }
      }

      setAppointments(appointmentsData);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentsApi.updateStatus(appointmentId, newStatus, null);
      showSuccess('Статус обновлён');
      loadAppointments();
    } catch (error) {
      showError('Ошибка при изменении статуса');
    }
  };

  const columns = [
    {
      id: 'startTime',
      label: 'Время',
      render: (value, row) => `${formatTime(value)} - ${formatTime(row.endTime)}`,
    },
    { id: 'patientName', label: 'Пациент' },
    { id: 'serviceName', label: 'Услуга' },
    {
      id: 'status',
      label: 'Статус',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'actions',
      label: 'Действия',
      sortable: false,
      render: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'WAITING' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row.id, 'IN_PROGRESS');
                }}
              >
                Начать
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row.id, 'NO_SHOW');
                }}
              >
                Неявка
              </Button>
            </>
          )}
          {row.status === 'IN_PROGRESS' && (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row.id, 'COMPLETED');
              }}
            >
              Завершить
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const breadcrumbs = [
    { label: 'Главная', path: '/doctor/home' },
    { label: 'Записи на приём' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Записи на приём
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Дата"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Сегодня"
                  clickable
                  color={selectedDate.isSame(dayjs(), 'day') ? 'primary' : 'default'}
                  onClick={() => setSelectedDate(dayjs())}
                />
                <Chip
                  label="Завтра"
                  clickable
                  color={selectedDate.isSame(dayjs().add(1, 'day'), 'day') ? 'primary' : 'default'}
                  onClick={() => setSelectedDate(dayjs().add(1, 'day'))}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        onRowClick={(row) => navigate(`/doctor/appointments/${row.id}`)}
        searchable={false}
        emptyMessage="На выбранную дату записей нет"
      />
    </Box>
  );
};


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add } from '@mui/icons-material';
import dayjs from 'dayjs';
import { appointmentsApi } from '../../api/appointments.api';
import { employeesApi } from '../../api/employees.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { StatusChip } from '../../components/common/StatusChip';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime } from '../../utils/formatters';

export const ReceptionistAppointmentsPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    date: dayjs(),
    employeeId: '',
    status: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getActive();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let response;

      if (filters.employeeId) {
        response = await appointmentsApi.getByEmployeeAndDate(
          filters.employeeId,
          filters.date.format('YYYY-MM-DD')
        );
      } else {
        response = await appointmentsApi.getByDate(filters.date.format('YYYY-MM-DD'));
      }

      let data = response.data.data || [];

      if (filters.status) {
        data = data.filter(a => a.status === filters.status);
      }

      setAppointments(data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const columns = [
    {
      id: 'startTime',
      label: 'Время',
      render: (value, row) => `${formatTime(value)} - ${formatTime(row.endTime)}`,
    },
    {
      id: 'patientName',
      label: 'Пациент',
      render: (value, row) => row.patient?.fullName || row.patientFullName || value || '—',
    },
    {
      id: 'employeeName',
      label: 'Врач',
      render: (value, row) => row.employee?.fullName || row.employeeFullName || value || '—',
    },
    {
      id: 'serviceName',
      label: 'Услуга',
      render: (value, row) => row.service?.name || value || '—',
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value) => <StatusChip status={value} />,
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
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
            <Grid item xs={12} sm="auto">
              <DatePicker
                label="Дата"
                value={filters.date}
                onChange={(value) => handleFilterChange('date', value)}
                sx={{ width: 200, minWidth: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ width: 200, minWidth: 200 }}>
                <InputLabel>Врач</InputLabel>
                <Select
                  value={filters.employeeId}
                  onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                  label="Врач"
                >
                  <MenuItem value="">Все</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.lastName} {emp.firstName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ width: 200, minWidth: 200 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="WAITING">Ожидание</MenuItem>
                  <MenuItem value="IN_PROGRESS">На приёме</MenuItem>
                  <MenuItem value="COMPLETED">Завершено</MenuItem>
                  <MenuItem value="NO_SHOW">Неявка</MenuItem>
                  <MenuItem value="CANCELLED">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Сегодня"
                  clickable
                  color={filters.date.isSame(dayjs(), 'day') ? 'primary' : 'default'}
                  onClick={() => handleFilterChange('date', dayjs())}
                />
                <Chip
                  label="Завтра"
                  clickable
                  color={filters.date.isSame(dayjs().add(1, 'day'), 'day') ? 'primary' : 'default'}
                  onClick={() => handleFilterChange('date', dayjs().add(1, 'day'))}
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
        onRowClick={(row) => navigate(`/receptionist/appointments/${row.id}`)}
        searchable={false}
        emptyMessage="На выбранную дату записей нет"
      />

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/receptionist/appointments/new')}
      >
        <Add />
      </Fab>
    </Box>
  );
};


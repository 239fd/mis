import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { employeesApi } from '../../api/employees.api';
import { schedulesApi, scheduleExceptionsApi } from '../../api/schedules.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatFullName } from '../../utils/formatters';
import { DAY_OF_WEEK_LABELS, EXCEPTION_TYPE_LABELS } from '../../utils/constants';

export const ManagerSchedulesPage = () => {
  const { showError } = useNotification();
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingExceptions, setLoadingExceptions] = useState(true);

  useEffect(() => {
    loadEmployees();
    loadAllExceptions();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadSchedules();
      loadExceptions();
    } else {
      setSchedules([]);
      loadAllExceptions();
    }
  }, [selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getActive();
      setEmployees(response.data.data || []);
    } catch {
      showError('Ошибка загрузки сотрудников');
    }
  };

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await schedulesApi.getByEmployee(selectedEmployee);
      setSchedules(response.data.data || []);
    } catch {
      showError('Ошибка загрузки расписания');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadExceptions = async () => {
    try {
      setLoadingExceptions(true);
      const response = await scheduleExceptionsApi.getByEmployee(selectedEmployee);
      setExceptions(response.data.data || []);
    } catch {
      showError('Ошибка загрузки исключений');
    } finally {
      setLoadingExceptions(false);
    }
  };

  const loadAllExceptions = async () => {
    try {
      setLoadingExceptions(true);
      const response = await scheduleExceptionsApi.getAll();
      setExceptions(response.data.data || []);
    } catch {
      showError('Ошибка загрузки исключений');
    } finally {
      setLoadingExceptions(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'VACATION': return 'primary';
      case 'SICK_LEAVE': return 'error';
      case 'DAY_OFF': return 'info';
      case 'DISMISSAL': return 'warning';
      default: return 'default';
    }
  };

  const scheduleColumns = [
    {
      id: 'dayOfWeek',
      label: 'День недели',
      render: (value) => DAY_OF_WEEK_LABELS[value] || value,
    },
    { id: 'startTime', label: 'Начало' },
    { id: 'endTime', label: 'Окончание' },
    {
      id: 'paidTime',
      label: 'Платные часы',
      render: (_, row) =>
        row.paidStartTime && row.paidEndTime
          ? `${row.paidStartTime} – ${row.paidEndTime}`
          : '—',
    },
    { id: 'cabinet', label: 'Кабинет', render: (value) => value || '—' },
    { id: 'effectiveFrom', label: 'Действует с' },
    {
      id: 'effectiveTo',
      label: 'Действует до',
      render: (value) => value || 'бессрочно',
    },
  ];

  const exceptionColumns = [
    {
      id: 'employeeName',
      label: 'Врач',
      render: (value, row) => row.employeeFullName || value || '—',
    },
    {
      id: 'exceptionType',
      label: 'Тип',
      render: (value) => (
        <Chip
          label={EXCEPTION_TYPE_LABELS[value] || value}
          color={getTypeColor(value)}
          size="small"
        />
      ),
    },
    { id: 'dateFrom', label: 'Начало', render: (value) => formatDate(value) },
    { id: 'dateTo', label: 'Окончание', render: (value) => formatDate(value) },
    { id: 'reason', label: 'Причина', render: (value) => value || '—' },
  ];

  const breadcrumbs = [
    { label: 'Аналитика', path: '/manager/analytics' },
    { label: 'Расписание врачей' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Расписание врачей
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl sx={{ width: 300 }}>
            <InputLabel>Врач</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="Врач"
            >
              <MenuItem value="">Все врачи</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {formatFullName(emp.lastName, emp.firstName, emp.middleName)}
                  {emp.position && ` — ${emp.position}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Расписание" />
        <Tab label="Исключения" />
      </Tabs>

      {tab === 0 && (
        <LoadingOverlay loading={loadingSchedules}>
          {selectedEmployee ? (
            <DataTable
              columns={scheduleColumns}
              data={schedules}
              searchable={false}
              emptyMessage="Расписание не настроено"
            />
          ) : (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Выберите врача для просмотра расписания
            </Typography>
          )}
        </LoadingOverlay>
      )}

      {tab === 1 && (
        <LoadingOverlay loading={loadingExceptions}>
          <DataTable
            columns={exceptionColumns}
            data={exceptions}
            searchable={false}
            emptyMessage="Исключений нет"
          />
        </LoadingOverlay>
      )}
    </Box>
  );
};
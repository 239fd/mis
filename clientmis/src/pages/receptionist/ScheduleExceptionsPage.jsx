import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Add, Warning } from '@mui/icons-material';
import { employeesApi } from '../../api/employees.api';
import { scheduleExceptionsApi } from '../../api/schedules.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusChip } from '../../components/common/StatusChip';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatFullName, formatTime } from '../../utils/formatters';
import { EXCEPTION_TYPE_LABELS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorTranslator';

export const ScheduleExceptionsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [exceptions, setExceptions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  const [affectedAppointments, setAffectedAppointments] = useState([]);
  const [loadingAffected, setLoadingAffected] = useState(false);
  const [formData, setFormData] = useState({
    exceptionType: '',
    dateFrom: '',
    dateTo: '',
    reason: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadExceptions();
    } else {
      loadAllExceptions();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (dialogOpen && selectedEmployee && formData.dateFrom && formData.dateTo) {
      loadAffectedAppointments();
    } else {
      setAffectedAppointments([]);
    }
  }, [dialogOpen, selectedEmployee, formData.dateFrom, formData.dateTo]);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getActive();
      setEmployees(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    }
  };

  const loadExceptions = async () => {
    try {
      setLoading(true);
      const response = await scheduleExceptionsApi.getByEmployee(selectedEmployee);
      setExceptions(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadAllExceptions = async () => {
    try {
      setLoading(true);
      const response = await scheduleExceptionsApi.getAll();
      setExceptions(response.data.data || []);
    } catch (error) {
      console.error('Error loading exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAffectedAppointments = async () => {
    setLoadingAffected(true);
    try {
      const response = await scheduleExceptionsApi.getAffectedAppointments({
        employeeId: selectedEmployee,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
      });
      const allAffected = response.data.data || [];
      const filteredAffected = allAffected.filter(
        apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW' && apt.status !== 'RESCHEDULED'
      );
      setAffectedAppointments(filteredAffected);
    } catch (error) {
      console.error('Error loading affected appointments:', error);
    } finally {
      setLoadingAffected(false);
    }
  };

  const handleOpenDialog = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      exceptionType: 'VACATION',
      dateFrom: today,
      dateTo: today,
      reason: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.dateFrom > formData.dateTo) {
      showError('Дата начала должна быть меньше или равна дате окончания');
      return;
    }

    try {
      await scheduleExceptionsApi.create({
        employeeId: selectedEmployee,
        ...formData,
      });
      showSuccess('Исключение добавлено');
      handleCloseDialog();
      loadExceptions();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const handleDeleteClick = (exception) => {
    setSelectedException(exception);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await scheduleExceptionsApi.delete(selectedException.id);
      showSuccess('Исключение удалено');
      setDeleteDialogOpen(false);
      if (selectedEmployee) {
        loadExceptions();
      } else {
        loadAllExceptions();
      }
    } catch (error) {
      showError('Ошибка при удалении');
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

  const columns = [
    {
      id: 'employeeName',
      label: 'Врач',
      render: (value, row) => row.employeeFullName || row.employee?.fullName || value || '—',
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
    {
      id: 'dateFrom',
      label: 'Начало',
      render: (value) => formatDate(value),
    },
    {
      id: 'dateTo',
      label: 'Окончание',
      render: (value) => formatDate(value),
    },
    {
      id: 'reason',
      label: 'Причина',
      render: (value) => value || '—',
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Исключения из расписания' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Исключения из расписания
        </Typography>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Warning />}
          onClick={() => navigate('/receptionist/affected-appointments')}
        >
          Записи для переноса
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl sx={{ width: 300, minWidth: 300 }}>
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
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <LoadingOverlay loading={loading}>
        <DataTable
          columns={columns}
          data={exceptions}
          searchable={false}
          onDelete={handleDeleteClick}
          emptyMessage="Исключений нет"
        />
      </LoadingOverlay>

      {selectedEmployee && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={handleOpenDialog}
        >
          <Add />
        </Fab>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить исключение</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Тип исключения</InputLabel>
                <Select
                  name="exceptionType"
                  value={formData.exceptionType}
                  onChange={handleChange}
                  label="Тип исключения"
                >
                  {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Дата начала"
                name="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Дата окончания"
                name="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Причина"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Укажите причину исключения"
              />
            </Grid>
          </Grid>

          <Alert severity="warning" sx={{ mt: 2 }}>
            При создании исключения записи на указанный период могут быть затронуты.
            Рекомендуется связаться с пациентами для переноса записей.
          </Alert>

          {loadingAffected ? (
            <CircularProgress size={24} sx={{ mt: 2 }} />
          ) : affectedAppointments.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Затронутых записей: {affectedAppointments.length}
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Время</TableCell>
                      <TableCell>Пациент</TableCell>
                      <TableCell>Услуга</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {affectedAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>{formatDate(apt.appointmentDate)}</TableCell>
                        <TableCell>{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</TableCell>
                        <TableCell>{apt.patientFullName || '—'}</TableCell>
                        <TableCell>{apt.serviceName || '—'}</TableCell>
                        <TableCell><StatusChip status={apt.status} size="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              На выбранный период записи не найдены.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить исключение"
        message="Вы уверены, что хотите удалить это исключение?"
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


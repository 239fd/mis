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
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Warning, Cancel, Edit } from '@mui/icons-material';
import dayjs from 'dayjs';
import { employeesApi } from '../../api/employees.api';
import { scheduleExceptionsApi } from '../../api/schedules.api';
import { appointmentsApi } from '../../api/appointments.api';
import { schedulesApi } from '../../api/schedules.api';
import { doctorServicesApi } from '../../api/services.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatTime, formatFullName } from '../../utils/formatters';
import { EXCEPTION_TYPE_LABELS } from '../../utils/constants';

export const AffectedAppointmentsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [affectedAppointments, setAffectedAppointments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorExceptions, setDoctorExceptions] = useState([]);
  const [slotFilter, setSlotFilter] = useState('all');
  const [editForm, setEditForm] = useState({
    employeeId: '',
    date: null,
    slot: null,
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadAffectedAppointments();
    } else {
      loadAllAffectedAppointments();
    }
  }, [selectedEmployee]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const employeesRes = await employeesApi.getActive();
      setEmployees(employeesRes.data.data || []);
      await loadAllAffectedAppointments();
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadAllAffectedAppointments = async () => {
    try {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DD');

      const exceptionsRes = await scheduleExceptionsApi.getAll();
      const activeExceptions = (exceptionsRes.data.data || []).filter(
        exc => exc.dateTo >= today
      );

      const allAffected = [];
      for (const exception of activeExceptions) {
        try {
          const response = await scheduleExceptionsApi.getAffectedAppointments({
            employeeId: exception.employeeId,
            dateFrom: exception.dateFrom > today ? exception.dateFrom : today,
            dateTo: exception.dateTo,
          });
          const appointments = response.data.data || [];
          appointments.forEach(apt => {
            apt.exceptionType = exception.exceptionType;
            apt.exceptionReason = exception.reason;
            apt.exceptionDateFrom = exception.dateFrom;
            apt.exceptionDateTo = exception.dateTo;
          });
          allAffected.push(...appointments);
        } catch (error) {
          console.error('Error loading affected appointments for exception:', exception.id);
        }
      }

      const uniqueAffected = allAffected.filter(
        (apt, index, self) => index === self.findIndex(a => a.id === apt.id)
      );

      const activeAppointments = uniqueAffected.filter(
        apt => !['CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
      );

      setAffectedAppointments(activeAppointments);
    } catch (error) {
      console.error('Error loading affected appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAffectedAppointments = async () => {
    try {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DD');

      const exceptionsRes = await scheduleExceptionsApi.getByEmployee(selectedEmployee);
      const activeExceptions = (exceptionsRes.data.data || []).filter(
        exc => exc.dateTo >= today
      );

      const allAffected = [];
      for (const exception of activeExceptions) {
        try {
          const response = await scheduleExceptionsApi.getAffectedAppointments({
            employeeId: exception.employeeId,
            dateFrom: exception.dateFrom > today ? exception.dateFrom : today,
            dateTo: exception.dateTo,
          });
          const appointments = response.data.data || [];
          appointments.forEach(apt => {
            apt.exceptionType = exception.exceptionType;
            apt.exceptionReason = exception.reason;
            apt.exceptionDateFrom = exception.dateFrom;
            apt.exceptionDateTo = exception.dateTo;
          });
          allAffected.push(...appointments);
        } catch (error) {
          console.error('Error loading affected appointments:', error);
        }
      }

      const uniqueAffected = allAffected.filter(
        (apt, index, self) => index === self.findIndex(a => a.id === apt.id)
      );

      const activeAppointments = uniqueAffected.filter(
        apt => !['CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
      );

      setAffectedAppointments(activeAppointments);
    } catch (error) {
      console.error('Error:', error);
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
      await appointmentsApi.updateStatus(
        selectedAppointment.id,
        'CANCELLED',
        'Отменено в связи с исключением из расписания врача'
      );
      showSuccess('Запись отменена');
      setCancelDialogOpen(false);
      if (selectedEmployee) {
        loadAffectedAppointments();
      } else {
        loadAllAffectedAppointments();
      }
    } catch (error) {
      showError('Ошибка при отмене записи');
    }
  };

  const handleEditClick = async (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      employeeId: '',
      date: dayjs().add(1, 'day'),
      slot: null,
    });
    setAvailableSlots([]);
    setDateError('');
    setDoctorExceptions([]);

    try {
      const doctorServicesRes = await doctorServicesApi.getByService(appointment.serviceId);
      const doctorServices = doctorServicesRes.data.data || [];
      const activeDoctorServices = doctorServices.filter(ds => ds.isActive !== false);

      const allEmployees = employees.length > 0 ? employees : (await employeesApi.getActive()).data.data || [];
      const employeeIds = activeDoctorServices.map(ds => ds.employeeId);
      const filteredDoctors = allEmployees.filter(emp => employeeIds.includes(emp.id));

      setAvailableDoctors(filteredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setAvailableDoctors(employees);
    }

    setEditDialogOpen(true);
  };

  const handleEditDoctorChange = async (employeeId) => {
    setEditForm({ ...editForm, employeeId, slot: null });
    setAvailableSlots([]);
    setDateError('');
    setDoctorExceptions([]);

    if (employeeId) {
      let activeExceptions = [];
      try {
        const exceptionsRes = await scheduleExceptionsApi.getByEmployee(employeeId);
        const today = dayjs().format('YYYY-MM-DD');
        activeExceptions = (exceptionsRes.data.data || []).filter(
          exc => exc.dateTo >= today
        );
        setDoctorExceptions(activeExceptions);
      } catch (error) {
        console.error('Error loading doctor exceptions:', error);
      }

      if (editForm.date) {
        const dateStr = editForm.date.format('YYYY-MM-DD');
        const exception = activeExceptions.find(
          exc => dateStr >= exc.dateFrom && dateStr <= exc.dateTo
        );

        if (exception) {
          const exceptionTypeName = EXCEPTION_TYPE_LABELS[exception.exceptionType] || exception.exceptionType;
          setDateError(`На эту дату у врача ${exceptionTypeName.toLowerCase()} (${formatDate(exception.dateFrom)} - ${formatDate(exception.dateTo)})`);
        } else {
          loadAvailableSlots(employeeId, editForm.date);
        }
      }
    }
  };

  const handleEditDateChange = (date) => {
    setEditForm({ ...editForm, date, slot: null });
    setAvailableSlots([]);
    setDateError('');

    if (editForm.employeeId && date) {
      const dateStr = date.format('YYYY-MM-DD');
      const exception = doctorExceptions.find(
        exc => dateStr >= exc.dateFrom && dateStr <= exc.dateTo
      );

      if (exception) {
        const exceptionTypeName = EXCEPTION_TYPE_LABELS[exception.exceptionType] || exception.exceptionType;
        setDateError(`На эту дату у врача ${exceptionTypeName.toLowerCase()} (${formatDate(exception.dateFrom)} - ${formatDate(exception.dateTo)})`);
        return;
      }

      loadAvailableSlots(editForm.employeeId, date);
    }
  };

  const loadAvailableSlots = async (employeeId, date) => {
    try {
      setLoadingSlots(true);
      const dateStr = date.format('YYYY-MM-DD');

      try {
        const exceptionsRes = await scheduleExceptionsApi.getByEmployee(employeeId);
        const today = dayjs().format('YYYY-MM-DD');
        const activeExceptions = (exceptionsRes.data.data || []).filter(
          exc => exc.dateTo >= today
        );

        const exception = activeExceptions.find(
          exc => dateStr >= exc.dateFrom && dateStr <= exc.dateTo
        );

        if (exception) {
          const exceptionTypeName = EXCEPTION_TYPE_LABELS[exception.exceptionType] || exception.exceptionType;
          setDateError(`На эту дату у врача ${exceptionTypeName.toLowerCase()} (${formatDate(exception.dateFrom)} - ${formatDate(exception.dateTo)})`);
          setAvailableSlots([]);
          setLoadingSlots(false);
          return;
        }
      } catch (error) {
        console.error('Error checking exceptions:', error);
      }

      const schedulesRes = await schedulesApi.getByEmployee(employeeId);
      const schedules = schedulesRes.data.data || [];

      let existingAppointments = [];
      try {
        const appointmentsRes = await appointmentsApi.getByEmployeeAndDate(employeeId, dateStr);
        existingAppointments = (appointmentsRes.data.data || []).filter(
          a => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW' && a.id !== selectedAppointment?.id
        );
      } catch (error) {
        console.log('No appointments for date');
      }

      const serviceDuration = selectedAppointment?.service?.currentDurationMin || 30;

      let slots = await appointmentsApi.calculateAvailableSlots(
        employeeId,
        selectedAppointment?.serviceId,
        dateStr,
        schedules,
        existingAppointments,
        serviceDuration
      );

      const isToday = date.isSame(dayjs(), 'day');
      if (isToday) {
        const now = dayjs();
        const currentTime = now.format('HH:mm');
        slots = slots.filter(slot => slot.startTime > currentTime);
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleEditConfirm = async () => {
    if (!editForm.employeeId || !editForm.date || !editForm.slot) {
      showError('Выберите врача, дату и время');
      return;
    }

    try {
      const dateStr = editForm.date.format('YYYY-MM-DD');

      await appointmentsApi.update(selectedAppointment.id, {
        employeeId: editForm.employeeId,
        appointmentDate: dateStr,
        startTime: `${dateStr}T${editForm.slot.startTime}:00`,
        endTime: `${dateStr}T${editForm.slot.endTime}:00`,
        status: 'RESCHEDULED',
      });

      showSuccess('Запись успешно перенесена');
      setEditDialogOpen(false);

      if (selectedEmployee) {
        loadAffectedAppointments();
      } else {
        loadAllAffectedAppointments();
      }
    } catch (error) {
      showError('Ошибка при переносе записи');
    }
  };

  const columns = [
    {
      id: 'appointmentDate',
      label: 'Дата',
      render: (value) => formatDate(value),
    },
    {
      id: 'startTime',
      label: 'Время',
      render: (value, row) => `${formatTime(value)} - ${formatTime(row.endTime)}`,
    },
    {
      id: 'patientFullName',
      label: 'Пациент',
      render: (value) => value || '—',
    },
    {
      id: 'employeeFullName',
      label: 'Врач',
      render: (value) => value || '—',
    },
    {
      id: 'serviceName',
      label: 'Услуга',
      render: (value) => value || '—',
    },
    {
      id: 'exceptionType',
      label: 'Причина исключения',
      render: (value) => (
        <Chip
          label={EXCEPTION_TYPE_LABELS[value] || value || '—'}
          size="small"
          color="warning"
        />
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value) => <StatusChip status={value} size="small" />,
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Edit />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
          >
            Перенести
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={(e) => {
              e.stopPropagation();
              handleCancelClick(row);
            }}
          >
            Отменить
          </Button>
        </Box>
      ),
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Записи для переноса' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Warning color="warning" sx={{ fontSize: 32 }} />
        <Typography variant="h4">
          Записи, требующие переноса
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        На этой странице отображаются записи, которые попадают под активные исключения из расписания врачей.
        Эти записи необходимо перенести на другое время или отменить.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
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
            </Grid>
            <Grid item xs={12} sm="auto">
              <Typography variant="body2" color="text.secondary">
                Найдено записей: <strong>{affectedAppointments.length}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <LoadingOverlay loading={loading}>
        {affectedAppointments.length === 0 ? (
          <Alert severity="success">
            Нет записей, требующих переноса. Все записи в порядке!
          </Alert>
        ) : (
          <DataTable
            columns={columns}
            data={affectedAppointments}
            searchable
            searchPlaceholder="Поиск по пациенту, врачу..."
            onRowClick={(row) => navigate(`/receptionist/appointments/${row.id}`)}
            emptyMessage="Записей не найдено"
          />
        )}
      </LoadingOverlay>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Отменить запись"
        message={`Вы уверены, что хотите отменить запись пациента ${selectedAppointment?.patientFullName} на ${formatDate(selectedAppointment?.appointmentDate)}?`}
        confirmText="Отменить запись"
        confirmColor="error"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelDialogOpen(false)}
      />

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Перенести запись</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Пациент: <strong>{selectedAppointment?.patientFullName}</strong><br />
              Услуга: <strong>{selectedAppointment?.serviceName}</strong><br />
              Текущая дата: <strong>{formatDate(selectedAppointment?.appointmentDate)}</strong>
              {editForm.slot && (
                <>
                  <br />
                  Новое время: <strong>{editForm.slot.startTime} - {editForm.slot.endTime}</strong>{' '}
                  <Chip
                    size="small"
                    color={editForm.slot.isPaid ? 'secondary' : 'primary'}
                    label={editForm.slot.isPaid ? 'Платный' : 'Бесплатный'}
                    sx={{ ml: 1 }}
                  />
                </>
              )}
            </Alert>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel>Новый врач</InputLabel>
                <Select
                  value={editForm.employeeId}
                  onChange={(e) => handleEditDoctorChange(e.target.value)}
                  label="Новый врач"
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300 }
                    }
                  }}
                >
                  {availableDoctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {formatFullName(doctor.lastName, doctor.firstName, doctor.middleName)}
                      {doctor.cabinet && ` (каб. ${doctor.cabinet})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <DatePicker
                label="Новая дата"
                value={editForm.date}
                onChange={handleEditDateChange}
                minDate={dayjs()}
                maxDate={dayjs().add(30, 'day')}
                sx={{ width: '100%' }}
              />
              {dateError && (
                <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                  {dateError}
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Доступное время:
              </Typography>
              {loadingSlots ? (
                <Typography variant="body2" color="text.secondary">Загрузка...</Typography>
              ) : !editForm.employeeId ? (
                <Alert severity="info" sx={{ py: 0.5 }}>Сначала выберите врача</Alert>
              ) : availableSlots.length === 0 ? (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  {editForm.date?.isSame(dayjs(), 'day')
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
                          variant={editForm.slot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                          color={slot.isPaid ? 'secondary' : 'primary'}
                          size="small"
                          onClick={() => setEditForm({ ...editForm, slot })}
                          disabled={!slot.available}
                          sx={{
                            bgcolor: editForm.slot?.startTime !== slot.startTime
                              ? (slot.isPaid ? 'rgba(156, 39, 176, 0.08)' : 'rgba(25, 118, 210, 0.08)')
                              : undefined,
                          }}
                        >
                          {slot.startTime}
                        </Button>
                      ))}
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleEditConfirm}
            disabled={!editForm.employeeId || !editForm.date || !editForm.slot || !!dateError}
          >
            Перенести
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


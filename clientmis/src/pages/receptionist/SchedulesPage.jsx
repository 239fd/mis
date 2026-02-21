import { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { employeesApi } from '../../api/employees.api';
import { schedulesApi } from '../../api/schedules.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatFullName } from '../../utils/formatters';
import { DAY_OF_WEEK_LABELS, DAYS_OF_WEEK } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorTranslator';

export const SchedulesPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    dayOfWeekTo: 1,
    useRange: false,
    startTime: '08:00',
    endTime: '16:00',
    paidStartTime: '',
    paidEndTime: '',
    cabinet: '',
    effectiveFrom: '',
    effectiveTo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadSchedules();
    }
  }, [selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getActive();
      setEmployees(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulesApi.getByEmployee(selectedEmployee);
      setSchedules(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки расписания');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      dayOfWeek: 1,
      dayOfWeekTo: 5,
      useRange: false,
      startTime: '08:00',
      endTime: '16:00',
      paidStartTime: '',
      paidEndTime: '',
      cabinet: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
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
    const selectedEmp = employees.find(e => e.id === selectedEmployee);
    if (selectedEmp?.hireDate && formData.effectiveFrom < selectedEmp.hireDate) {
      showError(`Дата начала действия не может быть раньше даты найма сотрудника (${selectedEmp.hireDate})`);
      return;
    }

    const hasPaidStart = formData.paidStartTime && formData.paidStartTime.trim() !== '';
    const hasPaidEnd = formData.paidEndTime && formData.paidEndTime.trim() !== '';

    if (hasPaidStart !== hasPaidEnd) {
      showError('Укажите оба поля платных часов (начало и окончание) или оставьте оба пустыми');
      return;
    }

    if (hasPaidStart && hasPaidEnd) {
      if (formData.paidStartTime < formData.startTime || formData.paidEndTime > formData.endTime) {
        showError('Платные часы должны быть в пределах рабочего времени');
        return;
      }
      if (formData.paidStartTime >= formData.paidEndTime) {
        showError('Время начала платных часов должно быть раньше времени окончания');
        return;
      }
    }

    if (formData.startTime >= formData.endTime) {
      showError('Время начала работы должно быть раньше времени окончания');
      return;
    }

    const daysToCreate = [];
    if (formData.useRange) {
      const from = formData.dayOfWeek;
      const to = formData.dayOfWeekTo;
      for (let day = from; day <= to; day++) {
        daysToCreate.push(day);
      }
    } else {
      daysToCreate.push(formData.dayOfWeek);
    }

    const newEffectiveFrom = formData.effectiveFrom;
    const newEffectiveTo = formData.effectiveTo || '9999-12-31';

    for (const day of daysToCreate) {
      const conflictingSchedule = schedules.find(schedule => {
        if (schedule.dayOfWeek !== day) return false;
        const existingFrom = schedule.effectiveFrom;
        const existingTo = schedule.effectiveTo || '9999-12-31';
        return newEffectiveFrom <= existingTo && newEffectiveTo >= existingFrom;
      });

      if (conflictingSchedule) {
        const dayName = DAY_OF_WEEK_LABELS[day];
        showError(`Расписание на ${dayName} пересекается с существующим (с ${conflictingSchedule.effectiveFrom})`);
        return;
      }
    }

    try {
      setSubmitting(true);

      for (const day of daysToCreate) {
        const data = {
          employeeId: selectedEmployee,
          dayOfWeek: day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          cabinet: formData.cabinet || null,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo || null,
        };

        if (hasPaidStart && hasPaidEnd) {
          data.paidStartTime = formData.paidStartTime;
          data.paidEndTime = formData.paidEndTime;
        }

        await schedulesApi.create(data);
      }

      showSuccess(daysToCreate.length > 1
        ? `Расписание добавлено на ${daysToCreate.length} дней`
        : 'Расписание добавлено'
      );
      handleCloseDialog();
      loadSchedules();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (schedule) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await schedulesApi.delete(selectedSchedule.id);
      showSuccess('Расписание удалено');
      setDeleteDialogOpen(false);
      loadSchedules();
    } catch (error) {
      showError('Ошибка при удалении');
    }
  };

  const columns = [
    {
      id: 'dayOfWeek',
      label: 'День недели',
      render: (value) => DAY_OF_WEEK_LABELS[value] || value,
    },
    {
      id: 'startTime',
      label: 'Начало',
    },
    {
      id: 'endTime',
      label: 'Окончание',
    },
    {
      id: 'paidTime',
      label: 'Платные часы',
      render: (_, row) => row.paidStartTime && row.paidEndTime
        ? `${row.paidStartTime} - ${row.paidEndTime}`
        : '—',
    },
    {
      id: 'cabinet',
      label: 'Кабинет',
      render: (value) => value || '—',
    },
    {
      id: 'effectiveFrom',
      label: 'Действует с',
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
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
          <FormControl sx={{ width: 300, minWidth: 300 }}>
            <InputLabel>Выберите врача</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="Выберите врача"
            >
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

      {selectedEmployee && (
        <LoadingOverlay loading={loading}>
          <DataTable
            columns={columns}
            data={schedules}
            searchable={false}
            onDelete={handleDeleteClick}
            emptyMessage="Расписание не настроено"
          />
        </LoadingOverlay>
      )}

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
        <DialogTitle>Добавить расписание</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useRange}
                    onChange={(e) => setFormData({ ...formData, useRange: e.target.checked })}
                  />
                }
                label="Выбрать диапазон дней (например, Пн-Пт)"
              />
            </Grid>

            {formData.useRange ? (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>С дня</InputLabel>
                    <Select
                      name="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={handleChange}
                      label="С дня"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>По день</InputLabel>
                    <Select
                      name="dayOfWeekTo"
                      value={formData.dayOfWeekTo}
                      onChange={handleChange}
                      label="По день"
                    >
                      {DAYS_OF_WEEK.filter(day => day.value >= formData.dayOfWeek).map((day) => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {formData.dayOfWeekTo >= formData.dayOfWeek && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ py: 0.5 }}>
                      Будет создано расписание на {formData.dayOfWeekTo - formData.dayOfWeek + 1} дней: {
                        DAYS_OF_WEEK
                          .filter(d => d.value >= formData.dayOfWeek && d.value <= formData.dayOfWeekTo)
                          .map(d => d.label)
                          .join(', ')
                      }
                    </Alert>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>День недели</InputLabel>
                  <Select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    label="День недели"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Начало работы"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Окончание работы"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Платные с"
                name="paidStartTime"
                type="time"
                value={formData.paidStartTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Опционально"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Платные до"
                name="paidEndTime"
                type="time"
                value={formData.paidEndTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Опционально"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Кабинет"
                name="cabinet"
                value={formData.cabinet}
                onChange={handleChange}
                placeholder="101"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Действует с"
                name="effectiveFrom"
                type="date"
                value={formData.effectiveFrom}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Действует до"
                name="effectiveTo"
                type="date"
                value={formData.effectiveTo}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Оставьте пустым для бессрочного"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Добавление...' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить расписание"
        message={`Удалить расписание на ${DAY_OF_WEEK_LABELS[selectedSchedule?.dayOfWeek]}?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


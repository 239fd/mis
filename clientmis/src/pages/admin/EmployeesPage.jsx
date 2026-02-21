import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Fab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { employeesApi } from '../../api/employees.api';
import { specialtiesApi } from '../../api/services.api';
import { usersApi } from '../../api/users.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatFullName } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    specialtyId: '',
    cabinet: '',
    hireDate: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes, specialtiesRes, usersRes] = await Promise.all([
        employeesApi.getAll(),
        specialtiesApi.getAll(),
        usersApi.getAll(),
      ]);
      setEmployees(employeesRes.data.data || []);
      setSpecialties(specialtiesRes.data.data || []);
      const allUsers = usersRes.data.data || [];
      setUsers(allUsers.filter(u => {
        const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
        return roleName === 'DOCTOR';
      }));
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setFormData({
        userId: employee.userId || '',
        lastName: employee.lastName || '',
        firstName: employee.firstName || '',
        middleName: employee.middleName || '',
        position: employee.position || '',
        specialtyId: employee.specialty?.id || '',
        cabinet: employee.cabinet || '',
        hireDate: employee.hireDate || '',
        isActive: employee.isActive !== false,
      });
      setSelectedEmployee(employee);
    } else {
      setFormData({
        userId: '',
        lastName: '',
        firstName: '',
        middleName: '',
        position: '',
        specialtyId: '',
        cabinet: '',
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
      setSelectedEmployee(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cabinet') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      if (!formData.userId) {
        showError('Выберите пользователя (аккаунт)');
        return;
      }
      if (!formData.lastName?.trim()) {
        showError('Введите фамилию');
        return;
      }
      if (!formData.firstName?.trim()) {
        showError('Введите имя');
        return;
      }
      if (!formData.position?.trim()) {
        showError('Введите должность');
        return;
      }
    }

    try {
      if (selectedEmployee) {
        const { userId, isActive, ...updateData } = formData;
        await employeesApi.update(selectedEmployee.id, updateData);

        if (selectedEmployee.isActive && !formData.isActive) {
          await employeesApi.deactivate(selectedEmployee.id);
          showSuccess('Сотрудник деактивирован');
        } else if (!selectedEmployee.isActive && formData.isActive) {
          await employeesApi.activate(selectedEmployee.id);
          showSuccess('Сотрудник активирован');
        } else {
          showSuccess('Сотрудник обновлён');
        }
      } else {
        await employeesApi.create(formData);
        showSuccess('Сотрудник создан');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await employeesApi.delete(selectedEmployee.id);
      showSuccess('Сотрудник удалён');
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      showError('Ошибка при удалении');
    }
  };

  const columns = [
    {
      id: 'fullName',
      label: 'ФИО',
      render: (_, row) => formatFullName(row.lastName, row.firstName, row.middleName),
    },
    { id: 'position', label: 'Должность' },
    {
      id: 'specialty',
      label: 'Специальность',
      render: (value) => value?.name || '—',
    },
    { id: 'cabinet', label: 'Кабинет' },
    {
      id: 'hireDate',
      label: 'Дата найма',
      render: (value) => formatDate(value),
    },
    {
      id: 'isActive',
      label: 'Статус',
      render: (value) => (
        <Chip
          label={value ? 'Активен' : 'Неактивен'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/admin/dashboard' },
    { label: 'Сотрудники' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Сотрудники
      </Typography>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        onRowClick={(row) => navigate(`/admin/employees/${row.id}`)}
        onEdit={(row) => handleOpenDialog(row)}
        onDelete={(row) => handleDeleteClick(row)}
        searchPlaceholder="Поиск по ФИО..."
        emptyMessage="Сотрудники не найдены."
      />

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
            width: '100%',
            alignItems: 'stretch'
          }}>
            {!selectedEmployee && (
              <FormControl fullWidth required sx={{ width: '100%' }}>
                <InputLabel>Пользователь (аккаунт)</InputLabel>
                <Select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  label="Пользователь (аккаунт)"
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300 }
                    }
                  }}
                >
                  <MenuItem value="">Выберите пользователя</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.login} (Врач)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              fullWidth
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Отчество"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Должность"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth sx={{ width: '100%' }}>
              <InputLabel>Специальность</InputLabel>
              <Select
                name="specialtyId"
                value={formData.specialtyId}
                onChange={handleChange}
                label="Специальность"
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 300 }
                  }
                }}
              >
                <MenuItem value="">Не указана</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Кабинет"
              name="cabinet"
              value={formData.cabinet}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Дата найма"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            {selectedEmployee && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="success"
                  />
                }
                label={
                  formData.isActive
                    ? selectedEmployee.isActive
                      ? 'Активен'
                      : 'Будет активирован'
                    : selectedEmployee.isActive
                      ? 'Будет деактивирован'
                      : 'Неактивен'
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedEmployee ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить сотрудника"
        message={`Вы уверены, что хотите удалить сотрудника ${selectedEmployee?.lastName} ${selectedEmployee?.firstName}?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


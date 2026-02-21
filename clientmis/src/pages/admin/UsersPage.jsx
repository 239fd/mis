import { useState, useEffect } from 'react';
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
import { usersApi } from '../../api/users.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../utils/errorTranslator';

const ROLE_LABELS = {
  ADMIN: 'Администратор',
  PATIENT: 'Пациент',
  DOCTOR: 'Врач',
  RECEPTIONIST: 'Сотрудник регистратуры',
  MANAGER: 'Руководитель',
};

// Роли доступные для создания администратором (без PATIENT - пациенты регистрируются сами)
const ADMIN_ASSIGNABLE_ROLES = {
  ADMIN: 'Администратор',
  DOCTOR: 'Врач',
  RECEPTIONIST: 'Сотрудник регистратуры',
  MANAGER: 'Руководитель',
};

export const UsersPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    email: '',
    phone: '',
    roleName: 'DOCTOR',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      // role может быть объектом {id, name, ...} или строкой
      const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
      setFormData({
        login: user.login || '',
        password: '',
        email: user.email || '',
        phone: user.phone || '',
        roleName: roleName || 'DOCTOR',
        isActive: user.isActive !== false,
      });
      setSelectedUser(user);
    } else {
      setFormData({
        login: '',
        password: '',
        email: '',
        phone: '',
        roleName: 'DOCTOR',
        isActive: true,
      });
      setSelectedUser(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      if (!formData.login?.trim()) {
        showError('Введите логин');
        return;
      }
      if (!formData.password?.trim()) {
        showError('Введите пароль');
        return;
      }
      if (formData.password.length < 6) {
        showError('Пароль должен быть не менее 6 символов');
        return;
      }
      if (!formData.email?.trim()) {
        showError('Введите email');
        return;
      }
      if (!formData.phone?.trim()) {
        showError('Введите телефон');
        return;
      }
    }

    try {
      if (selectedUser) {
        // При обновлении передаём только email и phone
        const updateData = {
          email: formData.email || null,
          phone: formData.phone || null,
        };
        await usersApi.update(selectedUser.id, updateData);

        // Если статус изменился - вызываем соответствующий endpoint
        if (selectedUser.isActive && !formData.isActive) {
          await usersApi.deactivate(selectedUser.id);
          showSuccess('Пользователь деактивирован');
        } else if (!selectedUser.isActive && formData.isActive) {
          await usersApi.activate(selectedUser.id);
          showSuccess('Пользователь активирован');
        } else {
          showSuccess('Пользователь обновлён');
        }
      } else {
        // При создании отправляем только нужные поля
        const createData = {
          login: formData.login,
          password: formData.password,
          email: formData.email || null,
          phone: formData.phone || null,
          roleName: formData.roleName,
        };
        await usersApi.create(createData);
        showSuccess('Пользователь создан');
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersApi.delete(selectedUser.id);
      showSuccess('Пользователь удалён');
      setDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      showError('Ошибка при удалении пользователя');
    }
  };


  const columns = [
    { id: 'login', label: 'Логин' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Телефон' },
    {
      id: 'role',
      label: 'Роль',
      render: (value) => {
        // role может быть объектом {id, name, ...} или строкой
        const roleName = typeof value === 'object' ? value?.name : value;
        return <Chip label={ROLE_LABELS[roleName] || roleName || '—'} size="small" />;
      },
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
    { label: 'Пользователи' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Пользователи
      </Typography>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onEdit={(row) => handleOpenDialog(row)}
        onDelete={(row) => handleDeleteClick(row)}
        searchPlaceholder="Поиск по логину, email..."
        emptyMessage="Пользователи не найдены"
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
          {selectedUser ? 'Редактировать пользователя' : 'Создать пользователя'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (typeof selectedUser.role === 'object' ? selectedUser.role?.name : selectedUser.role) === 'PATIENT' ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Редактирование данных пациента недоступно. Пациенты управляют своими данными самостоятельно.
              </Typography>
              <TextField
                fullWidth
                label="Логин"
                value={formData.login}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={formData.email || '—'}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone || '—'}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Роль"
                value="Пациент"
                disabled
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Логин"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
                disabled={!!selectedUser}
              />
              <TextField
                fullWidth
                label={selectedUser ? 'Новый пароль (оставьте пустым)' : 'Пароль'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!selectedUser}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required={!selectedUser}
              />
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={!selectedUser}
              />
              {!selectedUser && (
                <FormControl fullWidth>
                  <InputLabel>Роль</InputLabel>
                  <Select
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleChange}
                    label="Роль"
                  >
                    {Object.entries(ADMIN_ASSIGNABLE_ROLES).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedUser && (
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
                      ? selectedUser.isActive
                        ? 'Активен'
                        : 'Будет активирован'
                      : selectedUser.isActive
                        ? 'Будет деактивирован'
                        : 'Неактивен'
                  }
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          {!(selectedUser && (typeof selectedUser.role === 'object' ? selectedUser.role?.name : selectedUser.role) === 'PATIENT') && (
            <Button variant="contained" onClick={handleSubmit}>
              {selectedUser ? 'Сохранить' : 'Создать'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя ${selectedUser?.login}?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


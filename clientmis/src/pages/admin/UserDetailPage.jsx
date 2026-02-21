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
} from '@mui/material';
import { Delete, Block, CheckCircle, Person } from '@mui/icons-material';
import { usersApi } from '../../api/users.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDateTime } from '../../utils/formatters';

const ROLE_LABELS = {
  ADMIN: 'Администратор',
  PATIENT: 'Пациент',
  DOCTOR: 'Врач',
  RECEPTIONIST: 'Регистратура',
  MANAGER: 'Руководитель',
};

export const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(id);
      setUser(response.data.data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
        showSuccess('Пользователь деактивирован');
      } else {
        await usersApi.activate(user.id);
        showSuccess('Пользователь активирован');
      }
      loadUser();
    } catch (error) {
      showError('Ошибка при изменении статуса');
    }
  };

  const handleDelete = async () => {
    try {
      await usersApi.delete(user.id);
      showSuccess('Пользователь удалён');
      navigate('/admin/users');
    } catch (error) {
      showError('Ошибка при удалении');
    }
  };

  const breadcrumbs = [
    { label: 'Панель управления', path: '/admin/dashboard' },
    { label: 'Пользователи', path: '/admin/users' },
    { label: user?.login || 'Загрузка...' },
  ];

  if (loading) {
    return <LoadingOverlay loading={true} />;
  }

  if (!user) {
    return (
      <Box>
        <Typography>Пользователь не найден</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">{user.login}</Typography>
          <Chip
            label={user.active ? 'Активен' : 'Неактивен'}
            color={user.active ? 'success' : 'default'}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={user.active ? <Block /> : <CheckCircle />}
            onClick={handleToggleActive}
          >
            {user.active ? 'Деактивировать' : 'Активировать'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Удалить
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Логин</Typography>
                  <Typography variant="body1">{user.login}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Роль</Typography>
                  <Chip label={ROLE_LABELS[user.role] || user.role} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Телефон</Typography>
                  <Typography variant="body1">{user.phone || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Системная информация
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">ID пользователя</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{user.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Дата создания</Typography>
                  <Typography variant="body1">{formatDateTime(user.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Последнее обновление</Typography>
                  <Typography variant="body1">{formatDateTime(user.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {user.role === 'DOCTOR' && user.employeeId && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Связанные данные
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate(`/admin/employees/${user.employeeId}`)}
                >
                  Профиль сотрудника
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя ${user.login}?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


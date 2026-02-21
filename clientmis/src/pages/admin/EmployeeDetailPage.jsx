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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Delete, Block, CheckCircle, Add, Edit } from '@mui/icons-material';
import { employeesApi } from '../../api/employees.api';
import { doctorServicesApi, servicesApi } from '../../api/services.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatFullName } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [removeServiceDialogOpen, setRemoveServiceDialogOpen] = useState(false);
  const [selectedServiceToRemove, setSelectedServiceToRemove] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeeRes, servicesRes, allServicesRes] = await Promise.all([
        employeesApi.getById(id),
        doctorServicesApi.getByEmployee(id).catch(() => ({ data: { data: [] } })),
        servicesApi.getActive(),
      ]);
      setEmployee(employeeRes.data.data);
      setServices(servicesRes.data.data || []);
      setAllServices(allServicesRes.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (employee.isActive) {
        await employeesApi.deactivate(employee.id);
        showSuccess('Сотрудник деактивирован');
      } else {
        await employeesApi.activate(employee.id);
        showSuccess('Сотрудник активирован');
      }
      loadData();
    } catch (error) {
      showError('Ошибка при изменении статуса');
    }
  };

  const handleDelete = async () => {
    try {
      await employeesApi.delete(employee.id);
      showSuccess('Сотрудник удалён');
      navigate('/admin/employees');
    } catch (error) {
      showError('Ошибка при удалении');
    }
  };

  // Управление услугами
  const handleOpenAddServiceDialog = () => {
    setSelectedServiceId('');
    setAddServiceDialogOpen(true);
  };

  const handleAddService = async () => {
    if (!selectedServiceId) {
      showError('Выберите услугу');
      return;
    }
    try {
      await doctorServicesApi.create({
        employeeId: id,
        serviceId: selectedServiceId,
        isActive: true,
      });
      showSuccess('Услуга добавлена');
      setAddServiceDialogOpen(false);
      loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка добавления услуги'));
    }
  };

  const handleOpenRemoveServiceDialog = (service) => {
    setSelectedServiceToRemove(service);
    setRemoveServiceDialogOpen(true);
  };

  const handleRemoveService = async () => {
    try {
      await doctorServicesApi.delete(selectedServiceToRemove.id);
      showSuccess('Услуга удалена');
      setRemoveServiceDialogOpen(false);
      loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка удаления услуги'));
    }
  };

  const availableServices = allServices.filter(
    (s) => !services.some((ds) => ds.serviceId === s.id)
  );

  const breadcrumbs = [
    { label: 'Панель управления', path: '/admin/dashboard' },
    { label: 'Сотрудники', path: '/admin/employees' },
    { label: employee ? formatFullName(employee.lastName, employee.firstName, employee.middleName) : 'Загрузка...' },
  ];

  if (loading) {
    return <LoadingOverlay loading={true} />;
  }

  if (!employee) {
    return (
      <Box>
        <Typography>Сотрудник не найден</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            {formatFullName(employee.lastName, employee.firstName, employee.middleName)}
          </Typography>
          <Chip
            label={employee.isActive ? 'Активен' : 'Неактивен'}
            color={employee.isActive ? 'success' : 'default'}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/admin/employees?edit=${employee.id}`)}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            startIcon={employee.isActive ? <Block /> : <CheckCircle />}
            onClick={handleToggleActive}
          >
            {employee.isActive ? 'Деактивировать' : 'Активировать'}
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
                Персональные данные
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Фамилия</Typography>
                  <Typography variant="body1">{employee.lastName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Имя</Typography>
                  <Typography variant="body1">{employee.firstName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Отчество</Typography>
                  <Typography variant="body1">{employee.middleName || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Должность</Typography>
                  <Typography variant="body1">{employee.position}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Рабочая информация
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Специальность</Typography>
                  <Typography variant="body1">{employee.specialty?.name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Кабинет</Typography>
                  <Typography variant="body1">{employee.cabinet || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Дата найма</Typography>
                  <Typography variant="body1">{formatDate(employee.hireDate)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                  Предоставляемые услуги
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleOpenAddServiceDialog}
                  disabled={availableServices.length === 0}
                >
                  Добавить услугу
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {services.length === 0 ? (
                <Typography color="text.secondary">
                  Услуги не назначены. Нажмите "Добавить услугу" для назначения.
                </Typography>
              ) : (
                <List>
                  {services.map((service) => (
                    <ListItem key={service.id} divider>
                      <ListItemText
                        primary={service.serviceName}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={service.isActive ? 'Активна' : 'Неактивна'}
                              size="small"
                              color={service.isActive ? 'success' : 'default'}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Удалить услугу">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleOpenRemoveServiceDialog(service)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={addServiceDialogOpen} onClose={() => setAddServiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить услугу</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Услуга</InputLabel>
            <Select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              label="Услуга"
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 300 }
                }
              }}
            >
              {availableServices.length === 0 ? (
                <MenuItem disabled>Все услуги уже назначены</MenuItem>
              ) : (
                availableServices.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddServiceDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddService} disabled={!selectedServiceId}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={removeServiceDialogOpen}
        title="Удалить услугу"
        message={`Вы уверены, что хотите удалить услугу "${selectedServiceToRemove?.serviceName}" у сотрудника?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleRemoveService}
        onCancel={() => setRemoveServiceDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить сотрудника"
        message={`Вы уверены, что хотите удалить сотрудника ${employee.lastName} ${employee.firstName}?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


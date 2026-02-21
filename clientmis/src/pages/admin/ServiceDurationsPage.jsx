import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Chip,
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import dayjs from 'dayjs';
import { servicesApi } from '../../api/services.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatDuration } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

export const ServiceDurationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [durations, setDurations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    durationMin: 30,
    effectiveFrom: dayjs().format('YYYY-MM-DD'),
    effectiveTo: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [serviceRes, durationsRes] = await Promise.all([
        servicesApi.getById(id),
        servicesApi.getDurations(id),
      ]);
      setService(serviceRes.data.data);
      setDurations(durationsRes.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      durationMin: 30,
      effectiveFrom: dayjs().format('YYYY-MM-DD'),
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
    try {
      await servicesApi.addDuration(id, {
        serviceId: id,
        durationMin: parseInt(formData.durationMin),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      });
      showSuccess('Норма добавлена');
      handleCloseDialog();
      loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const getDurationStatus = (duration) => {
    const today = dayjs();
    const from = dayjs(duration.effectiveFrom);
    const to = duration.effectiveTo ? dayjs(duration.effectiveTo) : null;

    if (to && to.isBefore(today, 'day')) {
      return { label: 'Истекла', color: 'default' };
    }
    if (from.isAfter(today, 'day')) {
      return { label: 'Запланирована', color: 'info' };
    }
    return { label: 'Активна', color: 'success' };
  };

  const columns = [
    {
      id: 'durationMin',
      label: 'Длительность',
      render: (value) => formatDuration(value),
    },
    {
      id: 'effectiveFrom',
      label: 'Действует с',
      render: (value) => formatDate(value),
    },
    {
      id: 'effectiveTo',
      label: 'Действует до',
      render: (value) => value ? formatDate(value) : '—',
    },
    {
      id: 'status',
      label: 'Статус',
      render: (_, row) => {
        const status = getDurationStatus(row);
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      id: 'createdAt',
      label: 'Создано',
      render: (value) => formatDate(value),
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/admin/dashboard' },
    { label: 'Услуги', path: '/admin/services' },
    { label: service?.name || 'Загрузка...' },
    { label: 'Нормы длительности' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/services')}
        >
          К услугам
        </Button>
        <Typography variant="h4">
          Нормы длительности: {service?.name}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Название услуги
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {service?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Текущая длительность
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDuration(service?.currentDurationMin)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Статус
              </Typography>
              <Chip
                label={service?.isActive !== false ? 'Активна' : 'Неактивна'}
                color={service?.isActive !== false ? 'success' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <LoadingOverlay loading={loading}>
        <DataTable
          columns={columns}
          data={durations}
          searchable={false}
          emptyMessage="Нормы длительности не найдены"
        />
      </LoadingOverlay>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleOpenDialog}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить норму длительности</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Длительность (мин)"
                name="durationMin"
                type="number"
                value={formData.durationMin}
                onChange={handleChange}
                inputProps={{ min: 5, max: 480 }}
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
                helperText="Оставьте пустым для бессрочного действия"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


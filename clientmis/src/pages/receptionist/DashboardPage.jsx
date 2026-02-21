import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  EventNote,
  HourglassEmpty,
  MedicalServices,
  Warning,
} from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments.api';
import { formatDate } from '../../utils/formatters';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTotal: 0,
    waiting: 0,
    inProgress: 0,
    exceptionsCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentsApi.getByDate(today);
      const appointments = response.data.data || [];

      setStats({
        todayTotal: appointments.length,
        waiting: appointments.filter(a => a.status === 'WAITING').length,
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
        exceptionsCount: 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color = 'primary', onClick }) => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={600}>
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              borderRadius: '50%',
              p: 1.5,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {formatDate(new Date())}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventNote sx={{ fontSize: 32, color: 'primary.main' }} />}
            title="Записей на сегодня"
            value={stats.todayTotal}
            color="primary"
            onClick={() => navigate('/receptionist/appointments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HourglassEmpty sx={{ fontSize: 32, color: 'info.main' }} />}
            title="Ожидают приёма"
            value={stats.waiting}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MedicalServices sx={{ fontSize: 32, color: 'warning.main' }} />}
            title="На приёме"
            value={stats.inProgress}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Warning sx={{ fontSize: 32, color: 'error.main' }} />}
            title="Исключений"
            value={stats.exceptionsCount}
            color="error"
            onClick={() => navigate('/receptionist/schedule-exceptions')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={1}>
                {[
                  { label: 'Новый пациент', path: '/receptionist/patients' },
                  { label: 'Создать запись', path: '/receptionist/appointments' },
                  { label: 'Расписание врачей', path: '/receptionist/schedules' },
                  { label: 'Исключения', path: '/receptionist/schedule-exceptions' },
                ].map((action, index) => (
                  <Grid item xs={12} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="body2">{action.label}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


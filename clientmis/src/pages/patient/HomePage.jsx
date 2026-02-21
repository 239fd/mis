import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
} from '@mui/material';
import {
  EventNote,
  People,
  CalendarMonth,
  AccessTime,
  Person,
  LocalHospital,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { patientsApi } from '../../api/patients.api';
import { appointmentsApi } from '../../api/appointments.api';
import { formatDate, formatTime } from '../../utils/formatters';
import { StatusChip } from '../../components/common/StatusChip';

export const PatientHome = () => {
  const navigate = useNavigate();
  const { login, userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientsRes = await patientsApi.getByUserId(userId);
      setPatients(patientsRes.data.data || []);

      const patientIds = (patientsRes.data.data || []).map(p => p.id);
      const allAppointments = [];
      for (const patientId of patientIds) {
        try {
          const res = await appointmentsApi.getByPatientId(patientId);
          allAppointments.push(...(res.data.data || []));
        } catch (e) {
        }
      }

      const upcoming = allAppointments
        .filter(a => a.status === 'WAITING' && new Date(a.appointmentDate) >= new Date())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActionCard = ({ icon, title, description, onClick, color = 'primary' }) => (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: '50%',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Добро пожаловать, {login}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Управляйте записями на приём и данными пациентов
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Быстрые действия
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            icon={<EventNote sx={{ fontSize: 32, color: 'primary.main' }} />}
            title="Записаться на приём"
            description="Выберите врача и удобное время"
            onClick={() => navigate('/patient/book')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            icon={<CalendarMonth sx={{ fontSize: 32, color: 'success.main' }} />}
            title="Мои записи"
            description="Просмотр и управление записями"
            onClick={() => navigate('/patient/appointments')}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            icon={<People sx={{ fontSize: 32, color: 'info.main' }} />}
            title="Мои пациенты"
            description={`${patients.length} привязанных пациентов`}
            onClick={() => navigate('/patient/my-patients')}
            color="info"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Предстоящие записи
      </Typography>
      {upcomingAppointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CalendarMonth sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Нет предстоящих записей
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/patient/book')}
            >
              Записаться на приём
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {upcomingAppointments.map((appointment) => (
            <Grid item xs={12} md={4} key={appointment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth color="primary" />
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(appointment.appointmentDate)}
                      </Typography>
                    </Box>
                    <StatusChip status={appointment.status} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2">
                      {appointment.employeeName || 'Врач'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital fontSize="small" color="action" />
                    <Typography variant="body2">
                      {appointment.serviceName || 'Услуга'}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                  >
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};


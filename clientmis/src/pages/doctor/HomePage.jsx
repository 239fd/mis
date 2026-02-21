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
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  EventNote,
  CheckCircle,
  AccessTime,
  Person,
  PlayArrow,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { appointmentsApi } from '../../api/appointments.api';
import { employeesApi } from '../../api/employees.api';
import { StatusChip } from '../../components/common/StatusChip';
import { formatDate, formatTime } from '../../utils/formatters';

export const DoctorHome = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
    noShow: 0,
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeesRes = await employeesApi.getActive();
      const employees = employeesRes.data.data || [];
      const currentEmployee = employees.find(e => e.userId === userId);

      if (currentEmployee) {

        const today = new Date().toISOString().split('T')[0];
        const appointmentsRes = await appointmentsApi.getByEmployeeAndDate(currentEmployee.id, today);
        const appointments = appointmentsRes.data.data || [];

        setTodayAppointments(appointments);

        setStats({
          total: appointments.length,
          completed: appointments.filter(a => a.status === 'COMPLETED').length,
          remaining: appointments.filter(a => ['WAITING', 'IN_PROGRESS'].includes(a.status)).length,
          noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextAppointment = todayAppointments.find(a => a.status === 'WAITING');

  const StatCard = ({ icon, title, value, color = 'primary' }) => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <Skeleton width={40} height={40} sx={{ mx: 'auto' }} />
        ) : (
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Добро пожаловать!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {formatDate(new Date())} - Сегодняшний день
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<EventNote sx={{ color: 'primary.main' }} />}
            title="Всего записей"
            value={stats.total}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CheckCircle sx={{ color: 'success.main' }} />}
            title="Принято"
            value={stats.completed}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<AccessTime sx={{ color: 'warning.main' }} />}
            title="Осталось"
            value={stats.remaining}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<Person sx={{ color: 'error.main' }} />}
            title="Неявки"
            value={stats.noShow}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ближайший пациент
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : nextAppointment ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {nextAppointment.patientName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {nextAppointment.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(nextAppointment.startTime)} - {nextAppointment.serviceName}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    fullWidth
                    onClick={() => navigate(`/doctor/appointments/${nextAppointment.id}`)}
                  >
                    Начать приём
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Нет ожидающих пациентов
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Расписание на сегодня
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  Все записи
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />

              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : todayAppointments.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  На сегодня записей нет
                </Typography>
              ) : (
                <List dense disablePadding>
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                      }}
                      onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {formatTime(appointment.startTime)}
                            </Typography>
                            <Typography variant="body2">
                              {appointment.patientName}
                            </Typography>
                          </Box>
                        }
                        secondary={appointment.serviceName}
                      />
                      <StatusChip status={appointment.status} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


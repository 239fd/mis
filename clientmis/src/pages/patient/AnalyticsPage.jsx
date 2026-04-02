import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Divider,
  MenuItem,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { patientsApi } from '../../api/patients.api';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

const STATUS_COLORS = {
  WAITING: '#2196f3',
  IN_PROGRESS: '#ff9800',
  COMPLETED: '#4caf50',
  NO_SHOW: '#f44336',
  CANCELLED: '#9e9e9e',
  RESCHEDULED: '#ab47bc',
};

const STATUS_LABELS = {
  WAITING: 'Ожидание',
  IN_PROGRESS: 'На приёме',
  COMPLETED: 'Завершено',
  NO_SHOW: 'Неявка',
  CANCELLED: 'Отменено',
  RESCHEDULED: 'Перенесено',
};

const SERVICE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const PERIOD_OPTIONS = [
  { value: 3, label: 'За 3 месяца' },
  { value: 6, label: 'За 6 месяцев' },
  { value: 12, label: 'За год' },
  { value: 0, label: 'За всё время' },
];

export const PatientAnalyticsPage = () => {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [period, setPeriod] = useState(6);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientsRes = await patientsApi.getByUserId(userId);
      const patients = patientsRes.data.data || [];

      const allAppointments = [];
      for (const patient of patients) {
        try {
          const res = await appointmentsApi.getByPatientId(patient.id);
          allAppointments.push(...(res.data.data || []));
        } catch (e) {
          // пациент без записей
        }
      }
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (period === 0) return appointments;
    const cutoff = dayjs().subtract(period, 'month');
    return appointments.filter(a => dayjs(a.appointmentDate).isAfter(cutoff));
  }, [appointments, period]);

  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'CANCELLED').length;
    const noShow = filteredAppointments.filter(a => a.status === 'NO_SHOW').length;
    const waiting = filteredAppointments.filter(a => a.status === 'WAITING').length;
    return { total, completed, cancelled, noShow, waiting };
  }, [filteredAppointments]);

  const statusData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || '#808080',
    }));
  }, [filteredAppointments]);

  const monthlyData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach(a => {
      const month = dayjs(a.appointmentDate).format('YYYY-MM');
      counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: dayjs(month).format('MMM YYYY'),
        count,
      }));
  }, [filteredAppointments]);

  const serviceData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach(a => {
      const name = a.service?.name || a.serviceName || 'Неизвестно';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value], idx) => ({
        name,
        value,
        color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
      }));
  }, [filteredAppointments]);

  const doctorData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach(a => {
      const name = a.employee?.fullName || a.employeeName || 'Неизвестно';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [filteredAppointments]);

  const StatCard = ({ title, value, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={48} />
        ) : (
          <Typography variant="h4" fontWeight={600} color={`${color}.main`}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const breadcrumbs = [{ label: 'Аналитика' }];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Моя аналитика</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Период"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                fullWidth
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Всего записей" value={stats.total} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Завершено" value={stats.completed} color="success" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Отменено" value={stats.cancelled} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Неявки" value={stats.noShow} color="error" />
        </Grid>
      </Grid>

      <LoadingOverlay loading={loading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Динамика записей по месяцам */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика записей
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Записи"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Распределение по статусам */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение по статусам
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Популярные услуги */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Популярные услуги
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {serviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(250, serviceData.length * 50)}>
                  <BarChart data={serviceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={220} />
                    <Tooltip />
                    <Bar dataKey="value" name="Записей">
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Посещаемые врачи */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Посещаемые врачи
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {doctorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(250, doctorData.length * 50)}>
                  <BarChart data={doctorData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={220} />
                    <Tooltip />
                    <Bar dataKey="value" name="Визитов" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </LoadingOverlay>
    </Box>
  );
};


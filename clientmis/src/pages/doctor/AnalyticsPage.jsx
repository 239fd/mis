import { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton, Divider, MenuItem, TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { appointmentsApi } from '../../api/appointments.api';
import { employeesApi } from '../../api/employees.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { formatPercent } from '../../utils/formatters';

const STATUS_COLORS = {
  WAITING: '#2196f3', IN_PROGRESS: '#ff9800', COMPLETED: '#4caf50',
  NO_SHOW: '#f44336', CANCELLED: '#9e9e9e', RESCHEDULED: '#ab47bc',
};
const STATUS_LABELS = {
  WAITING: 'Ожидание', IN_PROGRESS: 'На приёме', COMPLETED: 'Завершено',
  NO_SHOW: 'Неявка', CANCELLED: 'Отменено', RESCHEDULED: 'Перенесено',
};
const SVC_COLORS = ['#8884d8','#82ca9d','#ffc658','#ff7300','#00C49F','#FFBB28','#FF8042','#0088FE'];
const PERIOD_OPTIONS = [
  { value: 3, label: 'За 3 месяца' }, { value: 6, label: 'За 6 месяцев' },
  { value: 12, label: 'За год' }, { value: 0, label: 'За всё время' },
];

export const DoctorAnalyticsPage = () => {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [period, setPeriod] = useState(6);

  useEffect(() => { loadData(); }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const empRes = await employeesApi.getActive();
      const emp = (empRes.data.data || []).find(e => e.userId === userId);
      if (emp) {
        const res = await appointmentsApi.getByEmployeeId(emp.id);
        setAppointments(res.data.data || []);
      }
    } catch (e) { console.error('Error loading analytics:', e); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (period === 0) return appointments;
    const cutoff = dayjs().subtract(period, 'month');
    return appointments.filter(a => dayjs(a.appointmentDate).isAfter(cutoff));
  }, [appointments, period]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter(a => a.status === 'COMPLETED').length;
    const noShow = filtered.filter(a => a.status === 'NO_SHOW').length;
    const uniquePatients = new Set(filtered.map(a => a.patient?.id || a.patientId || a.patientName)).size;
    const todayStr = dayjs().format('YYYY-MM-DD');
    const waitingToday = filtered.filter(a => a.status === 'WAITING' && a.appointmentDate === todayStr).length;
    return {
      total, completed, noShow, uniquePatients, waitingToday,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
    };
  }, [filtered]);

  const statusData = useMemo(() => {
    const c = {};
    filtered.forEach(a => { c[a.status] = (c[a.status] || 0) + 1; });
    return Object.entries(c).map(([s, v]) => ({ name: STATUS_LABELS[s] || s, value: v, color: STATUS_COLORS[s] || '#808080' }));
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const c = {};
    filtered.forEach(a => { const m = dayjs(a.appointmentDate).format('YYYY-MM'); c[m] = (c[m] || 0) + 1; });
    return Object.entries(c).sort(([a],[b]) => a.localeCompare(b)).map(([m, cnt]) => ({ month: dayjs(m).format('MMM YYYY'), count: cnt }));
  }, [filtered]);

  const serviceData = useMemo(() => {
    const c = {};
    filtered.forEach(a => { const n = a.service?.name || a.serviceName || 'Неизвестно'; c[n] = (c[n] || 0) + 1; });
    return Object.entries(c).sort(([,a],[,b]) => b - a).slice(0, 8)
      .map(([n, v], i) => ({ name: n, value: v, color: SVC_COLORS[i % SVC_COLORS.length] }));
  }, [filtered]);

  const getNoShowColor = r => r <= 5 ? 'success' : r <= 10 ? 'warning' : 'error';
  const getCompletionColor = r => r >= 80 ? 'success' : r >= 60 ? 'warning' : 'error';

  const StatCard = ({ title, value, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" gutterBottom>{title}</Typography>
        {loading ? <Skeleton width={80} height={48} /> : (
          <Typography variant="h4" fontWeight={600} color={`${color}.main`}>{value}</Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Breadcrumbs items={[{ label: 'Аналитика' }]} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Моя аналитика</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Период" value={period} onChange={e => setPeriod(Number(e.target.value))} fullWidth>
                {PERIOD_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><StatCard title="Всего приёмов" value={stats.total} color="primary" /></Grid>
        <Grid item xs={6} sm={3}><StatCard title="Уникальных пациентов" value={stats.uniquePatients} color="info" /></Grid>
        <Grid item xs={6} sm={3}><StatCard title="Завершено" value={stats.completed} color="success" /></Grid>
        <Grid item xs={6} sm={3}><StatCard title="Ожидают сегодня" value={stats.waitingToday} color="warning" /></Grid>
      </Grid>

      <LoadingOverlay loading={loading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Показатели эффективности */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>Процент завершённых</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h1" fontWeight={600} color={`${getCompletionColor(stats.completionRate)}.main`}>
                    {formatPercent(stats.completionRate)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>от общего числа приёмов</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>Показатель неявок</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h1" fontWeight={600} color={`${getNoShowColor(stats.noShowRate)}.main`}>
                    {formatPercent(stats.noShowRate)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {stats.noShow} из {stats.total} приёмов
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Динамика приёмов */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Динамика приёмов</Typography>
              <Divider sx={{ mb: 2 }} />
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" /><YAxis allowDecimals={false} />
                    <Tooltip /><Legend />
                    <Line type="monotone" dataKey="count" name="Приёмы" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>Нет данных за выбранный период</Typography>
              )}
            </CardContent>
          </Card>

          {/* Распределение по статусам */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Распределение по статусам</Typography>
              <Divider sx={{ mb: 2 }} />
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>Нет данных за выбранный период</Typography>
              )}
            </CardContent>
          </Card>

          {/* Оказываемые услуги */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Оказываемые услуги</Typography>
              <Divider sx={{ mb: 2 }} />
              {serviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(250, serviceData.length * 50)}>
                  <BarChart data={serviceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={220} />
                    <Tooltip />
                    <Bar dataKey="value" name="Приёмов">
                      {serviceData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>Нет данных за выбранный период</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </LoadingOverlay>
    </Box>
  );
};


import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PictureAsPdf } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { statisticsApi } from '../../api/statistics.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useNotification } from '../../hooks/useNotification';
import { formatPercent } from '../../utils/formatters';

const STATUS_COLORS = {
  WAITING: '#2196f3',
  IN_PROGRESS: '#ff9800',
  COMPLETED: '#4caf50',
  NO_SHOW: '#f44336',
  CANCELLED: '#9e9e9e',
};

const STATUS_LABELS = {
  WAITING: 'Ожидание',
  IN_PROGRESS: 'На приёме',
  COMPLETED: 'Завершено',
  NO_SHOW: 'Неявка',
  CANCELLED: 'Отменено',
};

const SERVICE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const EXPORT_SECTIONS = [
  { id: 'dashboard', label: 'Общая статистика' },
  { id: 'dynamics', label: 'Динамика записей за период' },
  { id: 'statuses', label: 'Распределение по статусам' },
  { id: 'services', label: 'Популярность услуг' },
  { id: 'employees', label: 'Нагрузка по врачам' },
  { id: 'noShow', label: 'Показатель неявок' },
  { id: 'workload', label: 'Загрузка сегодня' },
];

export const AnalyticsPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(30, 'day'));
  const [dateTo, setDateTo] = useState(dayjs());
  const [dashboard, setDashboard] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [dateRangeData, setDateRangeData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [noShowRate, setNoShowRate] = useState(null);
  const [workloadData, setWorkloadData] = useState([]);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSections, setExportSections] = useState(
    EXPORT_SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const from = dateFrom.format('YYYY-MM-DD');
      const to = dateTo.format('YYYY-MM-DD');

      const [dashboardRes, statusRes, employeeRes, dateRangeRes, serviceRes, noShowRes, workloadRes] = await Promise.all([
        statisticsApi.getDashboard(),
        statisticsApi.getAppointmentsByStatus(from, to),
        statisticsApi.getAppointmentsByEmployee(from, to),
        statisticsApi.getAppointmentsByDateRange(from, to),
        statisticsApi.getAppointmentsByService(from, to),
        statisticsApi.getNoShowRate(from, to),
        statisticsApi.getWorkloadToday(),
      ]);

      setDashboard(dashboardRes.data.data);

      const statusArray = Object.entries(statusRes.data.data || {}).map(([name, value]) => ({
        name: STATUS_LABELS[name] || name,
        value,
        color: STATUS_COLORS[name] || '#808080',
      }));
      setStatusData(statusArray);

      const rawEmployeeData = employeeRes.data.data || [];
      setEmployeeData(rawEmployeeData.map(e => ({
        employeeName: e.employeeName || e.fullName || '—',
        totalAppointments: e.totalAppointments || 0,
      })));

      const byDate = dateRangeRes.data.data?.byDate || {};
      const dateArray = Object.entries(byDate).map(([date, count]) => ({
        date: dayjs(date).format('DD.MM'),
        count,
      }));
      setDateRangeData(dateArray);

      const rawServiceData = serviceRes.data.data || [];
      setServiceData(rawServiceData.map((s, idx) => ({
        name: s.serviceName || s.name || '—',
        value: s.totalAppointments || 0,
        color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
      })));

      const noShowData = noShowRes.data.data;
      setNoShowRate({
        totalAppointments: noShowData?.totalAppointments || 0,
        noShowCount: noShowData?.noShowCount || 0,
        rate: noShowData?.noShowRate || 0,
      });

      const rawWorkload = workloadRes.data.data || [];
      const processedWorkload = rawWorkload.map(item => {
        const totalAppointments = item.totalAppointments || 0;
        const waiting = item.waiting || 0;
        const inProgress = item.inProgress || 0;
        const completed = item.completed || 0;

        return {
          employeeName: item.employeeName || '—',
          specialtyName: item.specialty || item.specialtyName || '—',
          cabinet: item.cabinet || '—',
          totalAppointments: totalAppointments,
          waiting: waiting,
          inProgress: inProgress,
          completed: completed,
        };
      });
      setWorkloadData(processedWorkload);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCheckboxChange = (sectionId) => {
    setExportSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleExportPDF = async () => {
    const selectedSections = Object.entries(exportSections)
      .filter(([, checked]) => checked)
      .map(([id]) => id);

    if (selectedSections.length === 0) {
      showError('Выберите хотя бы один раздел для экспорта');
      return;
    }

    setExporting(true);
    try {
      const response = await statisticsApi.exportPDF({
        dateFrom: dateFrom.format('YYYY-MM-DD'),
        dateTo: dateTo.format('YYYY-MM-DD'),
        sections: selectedSections,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${dateFrom.format('YYYY-MM-DD')}_${dateTo.format('YYYY-MM-DD')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      showSuccess('Отчёт успешно экспортирован');
      setExportDialogOpen(false);
    } catch (error) {
      showError('Ошибка экспорта. Функция пока не реализована на сервере.');
    } finally {
      setExporting(false);
    }
  };

  const getNoShowColor = (rate) => {
    if (rate <= 5) return 'success';
    if (rate <= 10) return 'warning';
    return 'error';
  };

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

  const totalWorkloadStats = workloadData.reduce(
    (acc, item) => ({
      totalAppointments: acc.totalAppointments + (item.totalAppointments || 0),
      waiting: acc.waiting + (item.waiting || 0),
      inProgress: acc.inProgress + (item.inProgress || 0),
      completed: acc.completed + (item.completed || 0),
    }),
    { totalAppointments: 0, waiting: 0, inProgress: 0, completed: 0 }
  );

  const breadcrumbs = [
    { label: 'Аналитика' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Аналитика
        </Typography>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => setExportDialogOpen(true)}
        >
          Экспорт в PDF
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата начала"
                value={dateFrom}
                onChange={(value) => setDateFrom(value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата окончания"
                value={dateTo}
                onChange={(value) => setDateTo(value)}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Всего пациентов" value={dashboard?.totalPatients || 0} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Записей сегодня" value={dashboard?.todayAppointmentsCount || 0} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Активных врачей" value={dashboard?.activeEmployees || 0} color="success" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Всего врачей" value={dashboard?.totalEmployees || 0} color="warning" />
        </Grid>
      </Grid>

      <LoadingOverlay loading={loading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика записей за период
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dateRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Записи" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение по статусам
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Популярность услуг
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    dataKey="value"
                    label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-service-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Нагрузка по врачам
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {employeeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(250, employeeData.length * 60)}>
                  <BarChart data={employeeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="employeeName" width={250} />
                    <Tooltip />
                    <Bar dataKey="totalAppointments" name="Приёмов" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет данных за выбранный период
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Показатель неявок
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h1" fontWeight={600} color={`${getNoShowColor(noShowRate?.rate || 0)}.main`}>
                  {formatPercent(noShowRate?.rate || 0)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Процент неявок за выбранный период
                </Typography>
                <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 400, mx: 'auto' }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Всего записей</Typography>
                    <Typography variant="h5">{noShowRate?.totalAppointments || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Неявок</Typography>
                    <Typography variant="h5" color="error.main">{noShowRate?.noShowCount || 0}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Загрузка сегодня
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Всего записей</Typography>
                  <Typography variant="h5">{totalWorkloadStats.totalAppointments}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Ожидание</Typography>
                  <Typography variant="h5" color="info.main">{totalWorkloadStats.waiting}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">На приёме</Typography>
                  <Typography variant="h5" color="warning.main">{totalWorkloadStats.inProgress}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Завершено</Typography>
                  <Typography variant="h5" color="success.main">{totalWorkloadStats.completed}</Typography>
                </Grid>
              </Grid>
              {workloadData.length > 0 ? (
                <Box sx={{ maxWidth: 800 }}>
                  {workloadData.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight={500}>{item.employeeName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Кабинет: {item.cabinet}
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Записей</Typography>
                          <Typography variant="h6">{item.totalAppointments}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Ожидание</Typography>
                          <Typography variant="h6" color="info.main">{item.waiting}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">На приёме</Typography>
                          <Typography variant="h6" color="warning.main">{item.inProgress}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Завершено</Typography>
                          <Typography variant="h6" color="success.main">{item.completed}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  Нет данных о загрузке
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </LoadingOverlay>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Экспорт в PDF</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выберите разделы для экспорта:
          </Typography>
          <FormGroup>
            {EXPORT_SECTIONS.map((section) => (
              <FormControlLabel
                key={section.id}
                control={
                  <Checkbox
                    checked={exportSections[section.id]}
                    onChange={() => handleExportCheckboxChange(section.id)}
                  />
                }
                label={section.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? 'Экспорт...' : 'Экспортировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { FileDownload } from '@mui/icons-material';
import { statisticsApi } from '../../api/statistics.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { formatPercent } from '../../utils/formatters';

export const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(30, 'day'));
  const [dateTo, setDateTo] = useState(dayjs());
  const [noShowRate, setNoShowRate] = useState(null);
  const [sourceData, setSourceData] = useState([]);
  const [noShowByDay, setNoShowByDay] = useState([]);
  const [noShowByDoctor, setNoShowByDoctor] = useState([]);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      const from = dateFrom.format('YYYY-MM-DD');
      const to = dateTo.format('YYYY-MM-DD');

      const response = await statisticsApi.getNoShowRate(from, to);
      const data = response.data.data;

      setNoShowRate({
        totalAppointments: data?.totalAppointments || 0,
        noShowCount: data?.noShowCount || 0,
        rate: data?.noShowRate || 0,
      });

      setSourceData([]);
      setNoShowByDay([]);
      setNoShowByDoctor([]);
    } catch (error) {
      console.error('Error loading reports:', error);
      setNoShowRate({
        totalAppointments: 0,
        noShowCount: 0,
        rate: 0,
      });
    } finally {
      setLoading(false);
    }
  };


  const getNoShowColor = (rate) => {
    if (rate <= 5) return 'success';
    if (rate <= 10) return 'warning';
    return 'error';
  };

  const handleExport = () => {
    // Заглушка для экспорта
    alert('Функция экспорта в разработке');
  };

  const breadcrumbs = [
    { label: 'Аналитика', path: '/manager/analytics' },
    { label: 'Отчёты' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Отчёты
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={handleExport}
        >
          Экспорт в Excel
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

      <LoadingOverlay loading={loading}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Отчёт по неявкам
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h2" fontWeight={600} color={`${getNoShowColor(noShowRate?.rate || 0)}.main`}>
                    {formatPercent(noShowRate?.rate || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общий показатель неявок
                  </Typography>
                </Box>

                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Всего записей</Typography>
                    <Typography variant="h6">{noShowRate?.totalAppointments || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Неявок</Typography>
                    <Typography variant="h6" color="error.main">{noShowRate?.noShowCount || 0}</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Шкала неявок
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Box sx={{ flex: 1, bgcolor: 'success.light', height: 8, borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: 'warning.light', height: 8, borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: 'error.light', height: 8, borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">0-5% (норма)</Typography>
                    <Typography variant="caption">5-10% (внимание)</Typography>
                    <Typography variant="caption">&gt;10% (критично)</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {sourceData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Источники записи
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {noShowByDay.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Неявки по дням недели
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={noShowByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" name="% неявок" fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {noShowByDoctor.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Неявки по врачам
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={noShowByDoctor} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit="%" />
                      <YAxis type="category" dataKey="name" width={200} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" name="% неявок" fill="#ff9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </LoadingOverlay>
    </Box>
  );
};


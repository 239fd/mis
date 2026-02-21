import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { statisticsApi } from '../../api/statistics.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { formatPercent } from '../../utils/formatters';

export const WorkloadPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [workloadData, setWorkloadData] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await statisticsApi.getWorkloadToday();
      const rawData = response.data.data || [];

      const processedData = rawData.map(item => {
        const total = item.totalAppointments || 0;
        const waiting = item.waiting || 0;
        const inProgress = item.inProgress || 0;
        const completed = item.completed || 0;
        const booked = waiting + inProgress + completed;
        const totalSlots = total > 0 ? total : booked;

        return {
          employeeName: item.employeeName || '—',
          specialtyName: item.specialty || item.specialtyName || '—',
          cabinet: item.cabinet || '—',
          totalSlots: totalSlots,
          bookedSlots: booked,
          freeSlots: Math.max(0, totalSlots - booked),
          loadPercent: totalSlots > 0 ? (booked / totalSlots) * 100 : 0,
        };
      });

      setWorkloadData(processedData);
    } catch (error) {
      console.error('Error loading workload:', error);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  };


  const getLoadColor = (percent) => {
    if (percent >= 90) return 'error';
    if (percent >= 70) return 'warning';
    return 'success';
  };

  const columns = [
    { id: 'employeeName', label: 'Врач' },
    { id: 'specialtyName', label: 'Специальность' },
    { id: 'totalSlots', label: 'Всего слотов' },
    { id: 'bookedSlots', label: 'Занято' },
    { id: 'freeSlots', label: 'Свободно' },
    {
      id: 'loadPercent',
      label: '% загрузки',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 100 }}>
            <LinearProgress
              variant="determinate"
              value={value}
              color={getLoadColor(value)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" fontWeight={500}>
            {formatPercent(value)}
          </Typography>
        </Box>
      ),
    },
  ];

  // Рассчитываем общую статистику
  const totalStats = workloadData.reduce(
    (acc, item) => ({
      totalSlots: acc.totalSlots + (item.totalSlots || 0),
      bookedSlots: acc.bookedSlots + (item.bookedSlots || 0),
      freeSlots: acc.freeSlots + (item.freeSlots || 0),
    }),
    { totalSlots: 0, bookedSlots: 0, freeSlots: 0 }
  );
  const avgLoad = totalStats.totalSlots > 0
    ? (totalStats.bookedSlots / totalStats.totalSlots) * 100
    : 0;

  const breadcrumbs = [
    { label: 'Аналитика', path: '/manager/analytics' },
    { label: 'Нагрузка' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Нагрузка врачей
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата"
                value={selectedDate}
                onChange={(value) => setSelectedDate(value)}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Всего слотов
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {totalStats.totalSlots}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Занято
              </Typography>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {totalStats.bookedSlots}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Свободно
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {totalStats.freeSlots}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Средняя загрузка
              </Typography>
              <Typography variant="h4" fontWeight={600} color={`${getLoadColor(avgLoad)}.main`}>
                {formatPercent(avgLoad)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <LoadingOverlay loading={loading}>
        <DataTable
          columns={columns}
          data={workloadData}
          searchable={false}
          emptyMessage="Данные о нагрузке отсутствуют"
        />
      </LoadingOverlay>
    </Box>
  );
};


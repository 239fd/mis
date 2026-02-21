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
} from '@mui/material';
import { Edit, EventNote, Phone, Email, Home } from '@mui/icons-material';
import { patientsApi } from '../../api/patients.api';
import { appointmentsApi } from '../../api/appointments.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DataTable } from '../../components/common/DataTable';
import { StatusChip } from '../../components/common/StatusChip';
import { formatDate, formatTime, calculateAge, formatFullName } from '../../utils/formatters';
import { GENDER_LABELS } from '../../utils/constants';

export const ReceptionistPatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientRes, appointmentsRes] = await Promise.all([
        patientsApi.getById(id),
        appointmentsApi.getByPatientId(id).catch(() => ({ data: { data: [] } })),
      ]);
      setPatient(patientRes.data.data);
      setAppointments(appointmentsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const appointmentColumns = [
    {
      id: 'appointmentDate',
      label: 'Дата',
      render: (value) => formatDate(value),
    },
    {
      id: 'startTime',
      label: 'Время',
      render: (value, row) => {
        return `${formatTime(value)} - ${formatTime(row.endTime)}`;
      },
    },
    {
      id: 'employeeName',
      label: 'Врач',
      render: (value, row) => row.employee?.fullName || row.employeeFullName || value || '—',
    },
    {
      id: 'serviceName',
      label: 'Услуга',
      render: (value, row) => row.service?.name || value || '—',
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value) => <StatusChip status={value} />,
    },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Пациенты', path: '/receptionist/patients' },
    { label: patient ? formatFullName(patient.lastName, patient.firstName, patient.middleName) : 'Загрузка...' },
  ];

  if (loading) {
    return <LoadingOverlay loading={true} />;
  }

  if (!patient) {
    return (
      <Box>
        <Typography>Пациент не найден</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {formatFullName(patient.lastName, patient.firstName, patient.middleName)}
        </Typography>
        <Button
          variant="contained"
          startIcon={<EventNote />}
          onClick={() => navigate(`/receptionist/appointments?patientId=${patient.id}`)}
        >
          Записать на приём
        </Button>
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
                  <Typography variant="body2" color="text.secondary">Дата рождения</Typography>
                  <Typography variant="body1">
                    {formatDate(patient.birthDate)} ({patient.age || calculateAge(patient.birthDate)} лет)
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Пол</Typography>
                  <Typography variant="body1">{GENDER_LABELS[patient.gender] || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Паспорт</Typography>
                  <Typography variant="body1">
                    {patient.passportSeries} {patient.passportNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Контактные данные
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="action" />
                  <Typography>{patient.phone || 'Не указан'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email color="action" />
                  <Typography>{patient.email || 'Не указан'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home color="action" />
                  <Typography>{patient.address || 'Не указан'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История записей
              </Typography>
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                searchable={false}
                onRowClick={(row) => navigate(`/receptionist/appointments/${row.id}`)}
                emptyMessage="Нет записей на приём"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


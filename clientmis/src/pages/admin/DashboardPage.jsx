import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
} from '@mui/material';
import {
  People,
  Person,
  MedicalServices,
  LocalHospital,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { usersApi } from '../../api/users.api';
import { employeesApi } from '../../api/employees.api';
import { servicesApi } from '../../api/services.api';
import { specialtiesApi } from '../../api/services.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEmployees: 0,
    services: 0,
    specialties: 0,
    usersByRole: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [usersRes, employeesRes, servicesRes, specialtiesRes] = await Promise.all([
        usersApi.getAll(),
        employeesApi.getActive(),
        servicesApi.getActive(),
        specialtiesApi.getAll(),
      ]);

      const users = usersRes.data.data || [];
      const roleCount = users.reduce((acc, user) => {
        // role может быть объектом {id, name, ...} или строкой
        const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
        if (roleName) {
          acc[roleName] = (acc[roleName] || 0) + 1;
        }
        return acc;
      }, {});

      const roleLabels = {
        ADMIN: 'Администраторы',
        PATIENT: 'Пациенты',
        DOCTOR: 'Врачи',
        RECEPTIONIST: 'Регистратура',
        MANAGER: 'Руководители',
      };

      setStats({
        totalUsers: users.length,
        activeEmployees: (employeesRes.data.data || []).length,
        services: (servicesRes.data.data || []).length,
        specialties: (specialtiesRes.data.data || []).length,
        usersByRole: Object.entries(roleCount).map(([role, count]) => ({
          name: roleLabels[role] || role,
          value: count,
        })),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, onClick, color = 'primary' }) => (
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const breadcrumbs = [
    { label: 'Панель управления' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People sx={{ fontSize: 32, color: 'primary.main' }} />}
            title="Всего пользователей"
            value={stats.totalUsers}
            onClick={() => navigate('/admin/users')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Person sx={{ fontSize: 32, color: 'success.main' }} />}
            title="Активных сотрудников"
            value={stats.activeEmployees}
            onClick={() => navigate('/admin/employees')}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MedicalServices sx={{ fontSize: 32, color: 'info.main' }} />}
            title="Услуг в системе"
            value={stats.services}
            onClick={() => navigate('/admin/services')}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LocalHospital sx={{ fontSize: 32, color: 'warning.main' }} />}
            title="Специальностей"
            value={stats.specialties}
            onClick={() => navigate('/admin/specialties')}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение пользователей по ролям
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {stats.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  { label: 'Добавить пользователя', path: '/admin/users', icon: <People /> },
                  { label: 'Добавить сотрудника', path: '/admin/employees', icon: <Person /> },
                  { label: 'Добавить услугу', path: '/admin/services', icon: <MedicalServices /> },
                  { label: 'Добавить специальность', path: '/admin/specialties', icon: <LocalHospital /> },
                ].map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                        {action.icon}
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


import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorTranslator';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      if (response.data.status) {
        setAuth(response.data.data);
        // role может быть объектом {id, name, ...} или строкой
        const roleData = response.data.data.role;
        const role = typeof roleData === 'object' ? roleData?.name : roleData;

        switch (role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'PATIENT':
            navigate('/patient/home');
            break;
          case 'DOCTOR':
            navigate('/doctor/home');
            break;
          case 'RECEPTIONIST':
            navigate('/receptionist/dashboard');
            break;
          case 'MANAGER':
            navigate('/manager/analytics');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(response.data.message || 'Ошибка входа');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка входа. Проверьте логин и пароль.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              МИС
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Медицинская информационная система
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Логин"
              name="login"
              value={formData.login}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
            </Button>
          </form>

          <Typography align="center" variant="body2">
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Зарегистрироваться
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};


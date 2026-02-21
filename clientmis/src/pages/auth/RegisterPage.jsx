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
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorTranslator';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.login || formData.login.length < 3) {
      newErrors.login = 'Логин должен быть не менее 3 символов';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    if (!formData.email) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    if (!formData.phone) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...data } = formData;
      const response = await authApi.register(data);

      if (response.data.status) {
        navigate('/login', {
          state: { message: 'Регистрация успешна! Теперь вы можете войти.' }
        });
      } else {
        setError(response.data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка регистрации'));
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
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              Регистрация
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создайте аккаунт пациента
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Логин"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
                error={!!errors.login}
                helperText={errors.login}
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                label="Повторите пароль"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="+375291234567"
                autoComplete="tel"
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
            </Button>
          </form>

          <Typography align="center" variant="body2">
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Войти
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};


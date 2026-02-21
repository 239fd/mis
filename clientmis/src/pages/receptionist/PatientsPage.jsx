import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { patientsApi } from '../../api/patients.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatFullName } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorTranslator';

export const ReceptionistPatientsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    gender: 'MALE',
    passportSeries: '',
    passportNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getAll();
      setPatients(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      gender: 'MALE',
      passportSeries: '',
      passportNumber: '',
      phone: '',
      email: '',
      address: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Для номера паспорта - только цифры
    if (name === 'passportNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly });
      return;
    }

    // Для телефона - только цифры и +
    if (name === 'phone') {
      const phoneChars = value.replace(/[^\d+]/g, '');
      setFormData({ ...formData, [name]: phoneChars });
      return;
    }

    // Для серии паспорта - только буквы, приводим к верхнему регистру
    if (name === 'passportSeries') {
      const lettersOnly = value.replace(/[^a-zA-Zа-яА-Я]/g, '').toUpperCase();
      setFormData({ ...formData, [name]: lettersOnly });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.lastName?.trim()) {
      showError('Фамилия обязательна для заполнения');
      return false;
    }
    if (!formData.firstName?.trim()) {
      showError('Имя обязательно для заполнения');
      return false;
    }
    if (!formData.birthDate) {
      showError('Дата рождения обязательна для заполнения');
      return false;
    }
    if (!formData.passportSeries?.trim()) {
      showError('Серия паспорта обязательна для заполнения');
      return false;
    }
    if (!/^[A-ZА-Я]{2}$/i.test(formData.passportSeries)) {
      showError('Серия паспорта должна содержать 2 буквы (например: MP, AB)');
      return false;
    }
    if (!formData.passportNumber?.trim()) {
      showError('Номер паспорта обязателен для заполнения');
      return false;
    }
    if (!/^\d{7}$/.test(formData.passportNumber)) {
      showError('Номер паспорта должен содержать 7 цифр');
      return false;
    }
    if (!formData.phone?.trim()) {
      showError('Телефон обязателен для заполнения');
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      showError('Некорректный формат телефона (введите 10-15 цифр)');
      return false;
    }
    if (!formData.email?.trim()) {
      showError('Email обязателен для заполнения');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError('Некорректный формат email');
      return false;
    }
    if (!formData.address?.trim()) {
      showError('Адрес обязателен для заполнения');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await patientsApi.create(formData);
      showSuccess('Пациент создан');
      handleCloseDialog();
      loadPatients();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const columns = [
    {
      id: 'fullName',
      label: 'ФИО',
      render: (_, row) => formatFullName(row.lastName, row.firstName, row.middleName),
    },
    {
      id: 'birthDate',
      label: 'Дата рождения',
      render: (value) => formatDate(value),
    },
    {
      id: 'passport',
      label: 'Паспорт',
      render: (_, row) => row.passportSeries && row.passportNumber
        ? `${row.passportSeries} ${row.passportNumber}`
        : '—',
    },
    { id: 'phone', label: 'Телефон' },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/receptionist/dashboard' },
    { label: 'Пациенты' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Пациенты
      </Typography>

      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        onRowClick={(row) => navigate(`/receptionist/patients/${row.id}`)}
        searchPlaceholder="Поиск по ФИО, паспорту, телефону..."
        emptyMessage="Пациенты не найдены"
      />

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleOpenDialog}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Добавить пациента</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Отчество"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Дата рождения"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Пол</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Пол"
                >
                  <MenuItem value="MALE">Мужской</MenuItem>
                  <MenuItem value="FEMALE">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+375291234567"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Серия паспорта"
                name="passportSeries"
                value={formData.passportSeries}
                onChange={handleChange}
                placeholder="AB"
                inputProps={{ maxLength: 2 }}
                helperText="2 буквы"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Номер паспорта"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="1234567"
                inputProps={{ maxLength: 7 }}
                helperText="7 цифр"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.by"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="г. Минск, ул. Примерная, д. 1, кв. 1"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


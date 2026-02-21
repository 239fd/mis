import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
} from '@mui/material';
import { Add, Edit, Delete, EventNote } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { patientsApi } from '../../api/patients.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, calculateAge } from '../../utils/formatters';
import { RELATIONSHIP_LABELS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errorTranslator';

export const MyPatientsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    relationship: 'SELF',
  });

  useEffect(() => {
    loadPatients();
  }, [userId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getByUserId(userId);
      setPatients(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (patient = null) => {
    if (patient) {
      setFormData({
        lastName: patient.lastName || '',
        firstName: patient.firstName || '',
        middleName: patient.middleName || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || 'MALE',
        passportSeries: patient.passportSeries || '',
        passportNumber: patient.passportNumber || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        relationship: patient.relationship || 'RELATIVE',
      });
      setSelectedPatient(patient);
    } else {
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
        relationship: 'SELF',
      });
      setSelectedPatient(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPatient(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'passportNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly });
      return;
    }

    if (name === 'phone') {
      const phoneChars = value.replace(/[^\d+]/g, '');
      setFormData({ ...formData, [name]: phoneChars });
      return;
    }

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

  const hasSelfPatient = patients.some(p => p.relationship === 'SELF');

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!selectedPatient && formData.relationship === 'SELF' && hasSelfPatient) {
      showError('У вас уже есть пациент "Я сам(а)". Можно добавить только одного.');
      return;
    }

    try {
      const { relationship, ...patientData } = formData;

      if (selectedPatient) {
        await patientsApi.update(selectedPatient.id, patientData);
        showSuccess('Данные пациента обновлены');
      } else {
        await patientsApi.createWithLink({
          userId,
          ...patientData,
          relationship,
        });
        showSuccess('Пациент добавлен');
      }
      handleCloseDialog();
      loadPatients();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await patientsApi.unlinkFromUser(selectedPatient.id);
      showSuccess('Пациент отвязан');
      setDeleteDialogOpen(false);
      loadPatients();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка при отвязке пациента'));
    }
  };

  const breadcrumbs = [
    { label: 'Главная', path: '/patient/home' },
    { label: 'Мои пациенты' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Мои пациенты
      </Typography>

      <LoadingOverlay loading={loading}>
        {patients.length === 0 ? (
          <EmptyState
            icon="patients"
            title="Нет привязанных пациентов"
            description="Добавьте себя или родственника для записи на приём"
            action={() => handleOpenDialog()}
            actionText="Добавить пациента"
          />
        ) : (
          <Grid container spacing={3}>
            {patients.map((patient) => {
              const relationshipLabel = patient.relationship
                ? RELATIONSHIP_LABELS[patient.relationship]
                : null;

              return (
              <Grid item xs={12} sm={6} md={4} key={patient.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        {patient.lastName?.charAt(0)}{patient.firstName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {patient.lastName} {patient.firstName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {patient.middleName}
                        </Typography>
                        {relationshipLabel && (
                          <Chip
                            label={relationshipLabel}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Дата рождения: {formatDate(patient.birthDate)}
                        {patient.birthDate && ` (${calculateAge(patient.birthDate)} лет)`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Пол: {patient.gender === 'MALE' ? 'Мужской' : patient.gender === 'FEMALE' ? 'Женский' : '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Телефон: {patient.phone || '—'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EventNote />}
                        onClick={() => navigate(`/patient/book?patientId=${patient.id}`)}
                      >
                        Записать
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(patient)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(patient)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        )}
      </LoadingOverlay>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPatient ? 'Редактировать пациента' : 'Добавить пациента'}
        </DialogTitle>
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
            {!selectedPatient && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Кем приходится</InputLabel>
                  <Select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    label="Кем приходится"
                  >
                    <MenuItem value="SELF" disabled={hasSelfPatient}>
                      Я сам(а) {hasSelfPatient && '(уже добавлен)'}
                    </MenuItem>
                    <MenuItem value="CHILD">Ребёнок</MenuItem>
                    <MenuItem value="SPOUSE">Супруг(а)</MenuItem>
                    <MenuItem value="PARENT">Родитель</MenuItem>
                    <MenuItem value="RELATIVE">Родственник</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedPatient ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Отвязать пациента"
        message={`Вы уверены, что хотите отвязать пациента ${selectedPatient?.lastName} ${selectedPatient?.firstName}?`}
        confirmText="Отвязать"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


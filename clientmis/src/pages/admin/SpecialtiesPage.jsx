import { useState, useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { specialtiesApi } from '../../api/services.api';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../utils/errorTranslator';

export const SpecialtiesPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const response = await specialtiesApi.getAll();
      setSpecialties(response.data.data || []);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (specialty = null) => {
    if (specialty) {
      setFormData({
        name: specialty.name || '',
        description: specialty.description || '',
      });
      setSelectedSpecialty(specialty);
    } else {
      setFormData({
        name: '',
        description: '',
      });
      setSelectedSpecialty(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSpecialty(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedSpecialty) {
        await specialtiesApi.update(selectedSpecialty.id, formData);
        showSuccess('Специальность обновлена');
      } else {
        await specialtiesApi.create(formData);
        showSuccess('Специальность создана');
      }
      handleCloseDialog();
      loadSpecialties();
    } catch (error) {
      showError(getErrorMessage(error, 'Ошибка сохранения'));
    }
  };

  const handleDeleteClick = (specialty) => {
    setSelectedSpecialty(specialty);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await specialtiesApi.delete(selectedSpecialty.id);
      showSuccess('Специальность удалена');
      setDeleteDialogOpen(false);
      loadSpecialties();
    } catch (error) {
      showError('Ошибка при удалении');
    }
  };

  const columns = [
    { id: 'name', label: 'Название' },
    { id: 'description', label: 'Описание' },
  ];

  const breadcrumbs = [
    { label: 'Панель управления', path: '/admin/dashboard' },
    { label: 'Специальности' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" gutterBottom>
        Специальности
      </Typography>

      <DataTable
        columns={columns}
        data={specialties}
        loading={loading}
        onEdit={(row) => handleOpenDialog(row)}
        onDelete={(row) => handleDeleteClick(row)}
        searchPlaceholder="Поиск по названию..."
        emptyMessage="Специальности не найдены. Добавьте первую специальность."
      />

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSpecialty ? 'Редактировать специальность' : 'Добавить специальность'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Название"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedSpecialty ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить специальность"
        message={`Вы уверены, что хотите удалить специальность "${selectedSpecialty?.name}"?`}
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};


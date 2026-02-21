import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    Fab,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    IconButton,
    Tooltip,
} from '@mui/material';
import {Add, History} from '@mui/icons-material';
import {servicesApi} from '../../api/services.api';
import {Breadcrumbs} from '../../components/layout/Breadcrumbs';
import {DataTable} from '../../components/common/DataTable';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {useNotification} from '../../hooks/useNotification';
import {formatDuration} from '../../utils/formatters';
import {getErrorMessage} from '../../utils/errorTranslator';

export const ServicesPage = () => {
    const navigate = useNavigate();
    const {showSuccess, showError} = useNotification();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        durationMin: 30,
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await servicesApi.getAll();
            setServices(response.data.data || []);
        } catch (error) {
            showError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (service = null) => {
        if (service) {
            setFormData({
                name: service.name || '',
                description: service.description || '',
                durationMin: service.currentDurationMin || 30,
            });
            setSelectedService(service);
        } else {
            setFormData({
                name: '',
                description: '',
                durationMin: 30,
            });
            setSelectedService(null);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedService(null);
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async () => {
        try {
            const serviceData = {
                name: formData.name,
                description: formData.description,
            };

            if (selectedService) {
                await servicesApi.update(selectedService.id, serviceData);

                // Если длительность изменилась, создаём новую норму
                if (formData.durationMin !== selectedService.currentDurationMin) {
                    await servicesApi.addDuration(selectedService.id, {
                        serviceId: selectedService.id,
                        durationMin: parseInt(formData.durationMin),
                        effectiveFrom: new Date().toISOString().split('T')[0],
                    });
                }
                showSuccess('Услуга обновлена');
            } else {
                const response = await servicesApi.create(serviceData);
                const newServiceId = response.data.data.id;

                await servicesApi.addDuration(newServiceId, {
                    serviceId: newServiceId,
                    durationMin: parseInt(formData.durationMin),
                    effectiveFrom: new Date().toISOString().split('T')[0],
                });
                showSuccess('Услуга создана');
            }
            handleCloseDialog();
            loadServices();
        } catch (error) {
            showError(getErrorMessage(error, 'Ошибка сохранения'));
        }
    };

    const handleDeleteClick = (service) => {
        setSelectedService(service);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await servicesApi.delete(selectedService.id);
            showSuccess('Услуга удалена');
            setDeleteDialogOpen(false);
            loadServices();
        } catch (error) {
            showError('Ошибка при удалении');
        }
    };

    const columns = [
        {id: 'name', label: 'Название'},
        {id: 'description', label: 'Описание'},
        {
            id: 'currentDurationMin',
            label: 'Длительность',
            render: (value) => value ? formatDuration(value) : '—',
        },
        {
            id: 'isActive',
            label: 'Статус',
            render: (value) => (
                <Chip
                    label={value !== false ? 'Активна' : 'Неактивна'}
                    color={value !== false ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            id: 'durations',
            label: 'Нормы',
            sortable: false,
            render: (_, row) => (
                <Tooltip title="История норм длительности">
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/services/${row.id}/durations`);
                        }}
                    >
                        <History />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    const breadcrumbs = [
        {label: 'Панель управления', path: '/admin/dashboard'},
        {label: 'Услуги'},
    ];

    return (
        <Box>
            <Breadcrumbs items={breadcrumbs}/>
            <Typography variant="h4" gutterBottom>
                Услуги
            </Typography>

            <DataTable
                columns={columns}
                data={services}
                loading={loading}
                onEdit={(row) => handleOpenDialog(row)}
                onDelete={(row) => handleDeleteClick(row)}
                searchPlaceholder="Поиск по названию..."
                emptyMessage="Услуги не найдены. Добавьте первую услугу."
            />

            <Fab
                color="primary"
                sx={{position: 'fixed', bottom: 24, right: 24}}
                onClick={() => handleOpenDialog()}
            >
                <Add/>
            </Fab>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedService ? 'Редактировать услугу' : 'Добавить услугу'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Название"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Описание"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Длительность (мин)"
                                name="durationMin"
                                type="number"
                                value={formData.durationMin}
                                onChange={handleChange}
                                inputProps={{min: 5, max: 480}}
                            />
                        </Grid>
                        {selectedService && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    При изменении длительности будет создана новая норма с сегодняшней даты
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {selectedService ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Удалить услугу"
                message={`Вы уверены, что хотите удалить услугу "${selectedService?.name}"?`}
                confirmText="Удалить"
                confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </Box>
    );
};


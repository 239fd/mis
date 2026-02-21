import {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
} from '@mui/material';
import {ChevronLeft, ChevronRight} from '@mui/icons-material';
import dayjs from 'dayjs';
import {useAuthStore} from '../../store/authStore';
import {schedulesApi} from '../../api/schedules.api';
import {appointmentsApi} from '../../api/appointments.api';
import {employeesApi} from '../../api/employees.api';
import {Breadcrumbs} from '../../components/layout/Breadcrumbs';
import {LoadingOverlay} from '../../components/common/LoadingOverlay';
import {formatTime} from '../../utils/formatters';
import {DAYS_OF_WEEK} from '../../utils/constants';

export const DoctorSchedulePage = () => {
    const {userId} = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
    const [schedule, setSchedule] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        loadEmployee();
    }, [userId]);

    useEffect(() => {
        if (employee) {
            loadWeekData();
        }
    }, [employee, currentWeek]);

    const loadEmployee = async () => {
        try {
            const employeesRes = await employeesApi.getActive();
            const employees = employeesRes.data.data || [];
            const currentEmployee = employees.find(e => e.userId === userId);
            setEmployee(currentEmployee);
        } catch (error) {
            console.error('Error loading employee:', error);
        }
    };

    const loadWeekData = async () => {
        try {
            setLoading(true);

            const [scheduleRes] = await Promise.all([
                schedulesApi.getByEmployee(employee.id),
            ]);

            setSchedule(scheduleRes.data.data || []);

            const weekAppointments = [];
            for (let i = 0; i < 7; i++) {
                const date = currentWeek.add(i, 'day').format('YYYY-MM-DD');
                try {
                    const res = await appointmentsApi.getByEmployeeAndDate(employee.id, date);
                    weekAppointments.push(...(res.data.data || []));
                } catch (error) {
                }
            }
            setAppointments(weekAppointments);
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevWeek = () => {
        setCurrentWeek(currentWeek.subtract(1, 'week'));
    };

    const handleNextWeek = () => {
        setCurrentWeek(currentWeek.add(1, 'week'));
    };

    const getScheduleForDay = (dayOfWeek) => {
        return schedule.find(s => s.dayOfWeek === dayOfWeek);
    };

    const getAppointmentsForDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        return appointments.filter(a =>
            a.appointmentDate === dateStr &&
            a.status !== 'CANCELLED' &&
            a.status !== 'NO_SHOW'
        );
    };

    const breadcrumbs = [
        {label: 'Главная', path: '/doctor/home'},
        {label: 'Моё расписание'},
    ];

    const weekDays = DAYS_OF_WEEK.map((day, index) => ({
        ...day,
        date: currentWeek.add(index, 'day'),
    }));

    return (
        <Box>
            <Breadcrumbs items={breadcrumbs}/>
            <Typography variant="h4" gutterBottom>
                Моё расписание
            </Typography>

            <Card sx={{mb: 3}}>
                <CardContent sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <IconButton onClick={handlePrevWeek}>
                        <ChevronLeft/>
                    </IconButton>
                    <Typography variant="h6">
                        {currentWeek.format('DD MMMM')} - {currentWeek.add(6, 'day').format('DD MMMM YYYY')}
                    </Typography>
                    <IconButton onClick={handleNextWeek}>
                        <ChevronRight/>
                    </IconButton>
                </CardContent>
            </Card>

            <LoadingOverlay loading={loading}>
                <Grid container spacing={2}>
                    {weekDays.map((day) => {
                        const daySchedule = getScheduleForDay(day.value);
                        const dayAppointments = getAppointmentsForDate(day.date);
                        const isToday = day.date.isSame(dayjs(), 'day');

                        return (
                            <Grid item xs={12} sm={6} md={4} lg={12 / 7} key={day.value}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        bgcolor: isToday ? 'primary.light' : 'background.paper',
                                        color: isToday ? 'primary.contrastText' : 'text.primary',
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            {day.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            {day.date.format('DD.MM')}
                                        </Typography>

                                        {daySchedule ? (
                                            <Box sx={{mb: 2}}>
                                                <Chip
                                                    label={`${formatTime(daySchedule.startTime)} - ${formatTime(daySchedule.endTime)}`}
                                                    size="small"
                                                    color={isToday ? 'default' : 'primary'}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color={isToday ? 'inherit' : 'text.secondary'}>
                                                Выходной
                                            </Typography>
                                        )}

                                        {dayAppointments.length > 0 && (
                                            <Box>
                                                <Typography variant="caption" display="block" sx={{mb: 1}}>
                                                    Записей: {dayAppointments.length}
                                                </Typography>
                                                {dayAppointments.slice(0, 3).map((apt) => (
                                                    <Typography
                                                        key={apt.id}
                                                        variant="caption"
                                                        display="block"
                                                        sx={{
                                                            bgcolor: isToday ? 'rgba(255,255,255,0.2)' : 'grey.100',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        {formatTime(apt.startTime)} {(apt.patientFullName || apt.patient?.fullName || apt.patientName || '')?.split(' ')[0]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </LoadingOverlay>
        </Box>
    );
};


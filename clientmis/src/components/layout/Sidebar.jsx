import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  Person,
  EventNote,
  CalendarMonth,
  MedicalServices,
  Analytics,
  Settings,
  LocalHospital,
  Assignment,
  Home,
  PersonAdd,
  Warning,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

export const drawerWidth = 260;

const menuItems = {
  ADMIN: [
    { text: 'Панель управления', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Пользователи', icon: <People />, path: '/admin/users' },
    { text: 'Сотрудники', icon: <Person />, path: '/admin/employees' },
    { text: 'Услуги', icon: <MedicalServices />, path: '/admin/services' },
    { text: 'Специальности', icon: <LocalHospital />, path: '/admin/specialties' },
  ],
  PATIENT: [
    { text: 'Главная', icon: <Home />, path: '/patient/home' },
    { text: 'Мои пациенты', icon: <People />, path: '/patient/my-patients' },
    { text: 'Запись на приём', icon: <PersonAdd />, path: '/patient/book' },
    { text: 'Мои записи', icon: <Assignment />, path: '/patient/appointments' },
  ],
  DOCTOR: [
    { text: 'Главная', icon: <Home />, path: '/doctor/home' },
    { text: 'Моё расписание', icon: <CalendarMonth />, path: '/doctor/schedule' },
    { text: 'Записи на приём', icon: <EventNote />, path: '/doctor/appointments' },
  ],
  RECEPTIONIST: [
    { text: 'Панель управления', icon: <Dashboard />, path: '/receptionist/dashboard' },
    { text: 'Пациенты', icon: <People />, path: '/receptionist/patients' },
    { text: 'Записи на приём', icon: <EventNote />, path: '/receptionist/appointments' },
    { text: 'Записи для переноса', icon: <Warning />, path: '/receptionist/affected-appointments' },
    { text: 'Расписание врачей', icon: <CalendarMonth />, path: '/receptionist/schedules' },
    { text: 'Исключения', icon: <Settings />, path: '/receptionist/schedule-exceptions' },
  ],
  MANAGER: [
    { text: 'Аналитика', icon: <Analytics />, path: '/manager/analytics' },
  ],
};

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const role = useAuthStore((state) => state.role);
  const login = useAuthStore((state) => state.login);

  const items = menuItems[role] || [];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onMobileClose?.();
    }
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          МИС
        </Typography>
      </Toolbar>
      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={500}>
          {login}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {role === 'ADMIN' && 'Администратор'}
          {role === 'PATIENT' && 'Пациент'}
          {role === 'DOCTOR' && 'Врач'}
          {role === 'RECEPTIONIST' && 'Сотрудник регистратуры'}
          {role === 'MANAGER' && 'Руководитель'}
        </Typography>
      </Box>
      <Divider />

      <List sx={{ pt: 1 }}>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};


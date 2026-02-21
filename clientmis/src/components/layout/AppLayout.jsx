import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, Snackbar, Alert } from '@mui/material';
import { Sidebar, drawerWidth } from './Sidebar';
import { Header } from './Header';
import { useNotificationStore } from '../../store/notificationStore';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notification, hideNotification } = useNotificationStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Snackbar
        open={notification?.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};


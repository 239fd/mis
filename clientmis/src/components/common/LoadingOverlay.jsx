import { Box, CircularProgress, Backdrop } from '@mui/material';

export const LoadingOverlay = ({ loading, children, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <>
        {children}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export const LoadingSpinner = ({ size = 40 }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    }}
  >
    <CircularProgress size={size} />
  </Box>
);


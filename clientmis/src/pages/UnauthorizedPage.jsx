import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block } from '@mui/icons-material';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Доступ запрещён
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        У вас нет прав для просмотра этой страницы
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Вернуться назад
      </Button>
    </Box>
  );
};


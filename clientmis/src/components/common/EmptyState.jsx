import { Box, Typography, Button } from '@mui/material';
import { Inbox, Search, EventBusy, People } from '@mui/icons-material';

const icons = {
  default: Inbox,
  search: Search,
  appointments: EventBusy,
  patients: People,
};

export const EmptyState = ({
  title = 'Нет данных',
  description = 'Данные отсутствуют',
  icon = 'default',
  action,
  actionText,
}) => {
  const IconComponent = icons[icon] || icons.default;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        textAlign: 'center',
        p: 4,
      }}
    >
      <IconComponent
        sx={{
          fontSize: 80,
          color: 'grey.400',
          mb: 2,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {action && actionText && (
        <Button variant="contained" onClick={action}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};


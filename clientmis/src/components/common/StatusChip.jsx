import { Chip } from '@mui/material';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

export const StatusChip = ({ status, size = 'small' }) => {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || 'default';

  return (
    <Chip
      label={label}
      color={color}
      size={size}
    />
  );
};


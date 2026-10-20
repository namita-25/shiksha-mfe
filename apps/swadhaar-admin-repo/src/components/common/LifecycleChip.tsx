import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

export type LifecycleState =
  | 'Draft'
  | 'draft'
  | 'Submitted for Review'
  | 'submitted'
  | 'Changes Requested'
  | 'changes_requested'
  | 'Approved'
  | 'approved'
  | 'Published'
  | 'published'
  | 'Active'
  | 'active'
  | 'Suspended'
  | 'suspended'
  | 'Blocked'
  | 'blocked'
  | 'Archived'
  | 'archived'
  | 'Deleted'
  | 'deleted';

interface LifecycleChipProps {
  state: LifecycleState | string;
  size?: 'small' | 'medium';
}

interface StateStyleConfig {
  label: string;
  bg: string;
  color: string;
  dotColor: string;
}

const getStateConfig = (state: string): StateStyleConfig => {
  const normalized = state?.toLowerCase() || '';

  if (normalized === 'published' || normalized === 'live') {
    return {
      label: 'Published',
      bg: '#DCFCE7',
      color: '#15803D',
      dotColor: '#15803D',
    };
  }
  if (normalized === 'active') {
    return {
      label: 'Active',
      bg: '#DCFCE7',
      color: '#15803D',
      dotColor: '#15803D',
    };
  }
  if (normalized.includes('draft')) {
    return {
      label: 'Draft',
      bg: '#FFF8E1',
      color: '#B78103',
      dotColor: '#B78103',
    };
  }
  if (normalized.includes('review') || normalized === 'submitted') {
    return {
      label: 'In Review',
      bg: '#E3F2FD',
      color: '#1565C0',
      dotColor: '#1976D2',
    };
  }
  if (normalized.includes('change')) {
    return {
      label: 'Changes Requested',
      bg: '#FFF3E0',
      color: '#E65100',
      dotColor: '#E65100',
    };
  }
  if (normalized === 'approved') {
    return {
      label: 'Approved',
      bg: '#E0F2F1',
      color: '#00695C',
      dotColor: '#00897B',
    };
  }
  if (normalized === 'archived') {
    return {
      label: 'Archived',
      bg: 'rgba(159, 18, 57, 0.12)',
      color: '#9F1239',
      dotColor: '#9F1239',
    };
  }
  if (normalized === 'suspended' || normalized === 'blocked' || normalized === 'deleted') {
    return {
      label: normalized === 'deleted' ? 'Deleted' : 'Blocked',
      bg: '#FFEBEE',
      color: '#C62828',
      dotColor: '#D32F2F',
    };
  }

  return {
    label: state || 'Unknown',
    bg: '#F5F5F5',
    color: '#616161',
    dotColor: '#9E9E9E',
  };
};

export const LifecycleChip: React.FC<LifecycleChipProps> = ({ state, size = 'small' }) => {
  const config = getStateConfig(state);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.8,
        px: size === 'small' ? 1.2 : 1.6,
        py: size === 'small' ? 0.35 : 0.6,
        borderRadius: '16px',
        backgroundColor: config.bg,
        border: `1px solid ${config.dotColor}33`,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: config.color,
          fontWeight: 600,
          fontSize: size === 'small' ? '11px' : '12px',
          lineHeight: 1.2,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
};

export default LifecycleChip;

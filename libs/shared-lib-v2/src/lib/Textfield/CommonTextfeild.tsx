'use client';
import React from 'react';
import { TextField, InputAdornment, Typography } from '@mui/material';
interface CommonTextFieldProps {
  label?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  helperText?: string;
  error?: boolean;
  type?: string;
  variant?: string;
  width?: string;
  supportingText?: string;
  fullWidth?: boolean;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  multiline?: boolean;
  rows?: string | number;
}
export const CommonTextField: React.FC<CommonTextFieldProps> = ({
  label,
  value = '',
  onChange,
  type = 'text',
  variant = 'outlined',
  helperText = '',
  width = '100%',
  error = false,
  supportingText = '',
  fullWidth = true,
  fontSize = '14px',
  fontWeight = 400,
  color = '#000000',
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        variant={
          variant === 'standard' ||
          variant === 'filled' ||
          variant === 'outlined'
            ? variant
            : 'outlined'
        }
        fullWidth
        helperText={helperText}
        error={error}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }}
        sx={{ width: width }}
        {...props}
      />
      {supportingText && (
        <Typography
          variant="h1"
          fontSize="14px"
          color="#1D1B20"
          fontWeight={400}
        >
          {supportingText}
        </Typography>
      )}
    </div>
  );
};

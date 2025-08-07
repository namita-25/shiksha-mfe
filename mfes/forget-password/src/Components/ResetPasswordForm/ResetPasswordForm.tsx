'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import { showToastMessage } from '../ToastComponent/Toastify';

interface ResetPasswordFormProps {
  onSubmit: (password: string, confirmPassword: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setShowValidation(!!e.target.value);
  };

  const handleFormSubmit = () => {
    if (password !== confirmPassword) {
      showToastMessage('Passwords do not match', 'error');
      return;
    }

    if (!validatePassword(password)) {
      showToastMessage('Password does not meet requirements', 'error');
      return;
    }

    onSubmit(password, confirmPassword);
  };

  const validatePassword = (value: string) => {
    return (
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
      value.length >= 8
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      // justifyContent="center"
      minHeight="100vh"
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '24px',
          mb: 2,
          textAlign: 'center',
        }}
      >
        Create a strong password
      </Typography>

      <Typography
        sx={{
          fontWeight: 400,
          fontSize: '16px',
          color: 'text.secondary',
          mb: 3,
          textAlign: 'center',
          m: '10px',
        }}
      >
        Create a new, strong password that you don't use for other websites
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: 350 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {showValidation && !validatePassword(password) && (
            <Box pl={1} pt={1}>
              <ValidationItem
                valid={/[A-Z]/.test(password) && /[a-z]/.test(password)}
                label="Include both uppercase and lowercase letters"
              />
              <ValidationItem
                valid={/\d/.test(password)}
                label="Include at least one number"
              />
              <ValidationItem
                valid={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                label="Include at least one special character"
              />
              <ValidationItem
                valid={password.length >= 8}
                label="At least 8 characters"
              />
            </Box>
          )}

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: '#FFC107',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#ffb300',
              },
            }}
            onClick={handleFormSubmit}
            disabled={!validatePassword(password)}
          >
            Reset Password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

const ValidationItem = ({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      color={valid ? 'green' : 'error.main'}
      fontSize="14px"
      fontWeight={400}
      mb={0.5}
    >
      <CheckIcon sx={{ fontSize: 16 }} />
      {label}
    </Box>
  );
};

export default ResetPasswordForm;

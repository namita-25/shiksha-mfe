'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Loader, useTranslation } from '@shared-lib'; // Updated import

interface LoginComponentProps {
  onLogin: (data: {
    username: string;
    password: string;
    remember: boolean;
  }) => void;
  handleAddAccount?: () => void;
  handleForgotPassword?: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  onLogin,
  handleAddAccount,
  handleForgotPassword,
}) => {
  const { t } = useTranslation(); // Initialize translation function

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = () => {
    if (onLogin) onLogin(formData);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        p: 3,
        borderRadius: 2,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '0px',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {t('LEARNER_APP.LOGIN.login_title')} {/* Internationalized title */}
        </Typography>

        <TextField
          label={t('LEARNER_APP.LOGIN.username_label')}
          name="username"
          value={formData.username}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <TextField
          label={t('LEARNER_APP.LOGIN.password_label')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          autoComplete="new-password" // <-- Prevent browser from injecting its UI
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box mt={1}>
          {/* <Typography
            variant="body2"
            color="secondary"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={handleForgotPassword}
          >
            {t('LEARNER_APP.LOGIN.forgot_password')}{' '}
        
          </Typography> */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.remember}
                onChange={handleChange}
                name="remember"
              />
            }
            label={t('LEARNER_APP.LOGIN.remember_me')}
          />
        </Box>

        <Button
          type="submit"
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
        >
          {t('LEARNER_APP.LOGIN.login_button')}
        </Button>

        {/* <Typography
          variant="body2"
          color="secondary"
          align="center"
          mt={2}
          sx={{ cursor: 'pointer' }}
          onClick={handleAddAccount}
        >
          {t('LEARNER_APP.LOGIN.no_account')}
        </Typography> */}
      </form>
    </Paper>
  );
};

export default LoginComponent;

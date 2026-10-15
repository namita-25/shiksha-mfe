import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  MenuItem,
  Select,
  Menu,
  Avatar,
  Chip,
  Tooltip,
  useColorScheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LogoIcon from '../logo/LogoIcon';
import LayoutService, { UserProfileSummary } from '@/services/LayoutService';

interface HeaderProps {
  toggleMobileSidebar?: () => void;
  sx?: any;
}

export const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar, sx }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const [profile, setProfile] = useState<UserProfileSummary>({
    userId: 'admin-01',
    name: '[Admin name]',
    username: 'admin',
    roles: ['Super Admin'],
    tenantId: 'swadhaar-tenant',
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    LayoutService.getUserProfile().then((data) => {
      if (data) {
        setProfile({
          ...data,
          name: data.name && data.name !== 'Administrator' ? data.name : '[Admin name]',
          roles: data.roles?.length ? data.roles : ['Super Admin'],
        });
      }
    });
  }, []);

  const handleLanguageChange = (e: any) => {
    const newLocale = e.target.value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLocale);
      localStorage.setItem('swadhaarLanguage', newLocale);
    }
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  const toggleThemeMode = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('swadhaar_theme_mode', nextMode);
    }
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    router.push('/logout');
  };

  // Dynamic route badge like 'People / Users' in screenshot
  const getRouteBadge = () => {
    const path = router.pathname;
    if (path.includes('cohort') || path.includes('group')) return 'People / Groups';
    if (path.includes('user') || path === '/' || path.includes('dashboard')) return 'People / Users';
    if (path.includes('course')) return 'Learning / Courses';
    if (path.includes('content')) return 'Learning / Content';
    if (path.includes('question')) return 'Learning / Question Sets';
    if (path.includes('analytics')) return 'Operations / Analytics';
    if (path.includes('notification')) return 'Operations / Notifications';
    return '';
  };

  const getInitials = () => {
    if (profile.roles?.includes('Super Admin')) return 'SA';
    if (!profile.name || profile.name === '[Admin name]') return 'SA';
    const parts = profile.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return profile.name.slice(0, 2).toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        boxShadow: 'none',
        borderBottom: '1px solid #E5E7EB',
        zIndex: 1201,
        ...sx,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px !important',
          height: '64px',
          px: 0,
        }}
      >
        {/* Top Left Corner: LogoIcon in 260px zone with right border divider */}
        <Box
          sx={{
            width: { xs: 'auto', lg: 260 },
            minWidth: { lg: 260 },
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderRight: { xs: 'none', lg: '1px solid #E5E7EB' },
            flexShrink: 0,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleMobileSidebar}
            sx={{ display: { lg: 'none' }, mr: 1, color: '#374151' }}
          >
            <MenuIcon />
          </IconButton>
          <LogoIcon />
        </Box>

        {/* Center Section: Route Badge (People / Users) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <Box
            sx={{
              // backgroundColor: '#5C4CE6',
              color: '#000',
              px: 1.5,
              py: 0.45,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {getRouteBadge()}
          </Box>
        </Box>

        {/* Top Right Corner: Language & Profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            pr: { xs: 1.5, sm: 3 },
            flexShrink: 0,
          }}
        >
          {/* Theme Toggle Button */}
          <Tooltip title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>
            <IconButton onClick={toggleThemeMode} sx={{ color: '#4B5563' }} size="small">
              {mode === 'dark' ? (
                <LightModeOutlinedIcon sx={{ fontSize: 20 }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Language Switcher */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              px: 1,
              py: 0.2,
            }}
          >
            <TranslateIcon sx={{ fontSize: 16, mr: 0.5, color: '#E6873C' }} />
            <Select
              value={router.locale || 'en'}
              onChange={handleLanguageChange}
              size="small"
              variant="standard"
              disableUnderline
              sx={{
                color: '#1F2937',
                fontSize: '13px',
                fontWeight: 600,
                '& .MuiSelect-icon': { color: '#6B7280' },
              }}
            >
              <MenuItem value="en">English (EN)</MenuItem>
              <MenuItem value="mr">मराठी (MR)</MenuItem>
              <MenuItem value="hi">हिंदी (HI)</MenuItem>
            </Select>
          </Box>

          {/* User Profile: SA Avatar + Name & Role */}
          <Box
            onClick={handleOpenUserMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              py: 0.5,
              px: 0.8,
              borderRadius: '8px',
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: '#F3F4F6' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2D3748',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {getInitials()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', textAlign: 'left' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#1F2937',
                  lineHeight: 1.2,
                }}
              >
                {profile.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  color: '#6B7280',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {profile.roles?.[0] || 'Super Admin'}
              </Typography>
            </Box>
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              sx: {
                width: 220,
                mt: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                {profile.name}
              </Typography>
              <Chip
                label={profile.roles?.[0] || 'Super Admin'}
                size="small"
                sx={{
                  mt: 0.5,
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                }}
              />
            </Box>

            <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main', fontSize: '13px', fontWeight: 500 }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.2 }} />
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;


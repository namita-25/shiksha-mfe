import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  Grid,
  Divider,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import { getUserDetailsInfo } from '@/services/UserService';

export default function UserDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const userId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);

  // Modal & Feedback states
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [dialogType, setDialogType] = useState<'block' | 'unblock' | 'delete' | 'remove_group' | 'remove_review' | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: 'delete' | 'block' | 'unblock' | 'remove_group' | 'remove_review';
  }>({
    open: false,
    title: '',
    description: '',
    actionType: 'block',
  });

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserDetailsInfo(userId);
      const user = res?.result?.userData || res?.userData || res;
      setUserData(user);
    } catch (err) {
      console.error('Failed to load user details:', err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  // Extract parsed fields from userData
  const parsedUser = useMemo(() => {
    if (!userData) {
      return {
        fullName: '-',
        initials: 'U',
        email: '-',
        phone: '-',
        empId: '-',
        gender: '-',
        state: '-',
        district: '-',
        branch: '-',
        program: '-',
        role: 'Student',
        status: 'active',
      };
    }

    const fn = userData.firstName ? String(userData.firstName).trim() : '';
    const mn = userData.middleName ? String(userData.middleName).trim() : '';
    const ln = userData.lastName ? String(userData.lastName).trim() : '';
    const fullName = [fn, mn, ln].filter(Boolean).join(' ') || userData.name || userData.username || '-';

    const firstInitial = fn ? fn.charAt(0) : userData.username ? userData.username.charAt(0) : 'U';
    const lastInitial = ln ? ln.charAt(0) : '';
    const initials = (firstInitial + lastInitial).toUpperCase();

    const email = userData.email || userData.username || '-';
    const phone = userData.mobile || userData.phone || '-';

    // Employee ID
    const rawEmpId = userData.employeeId;
    const empId = rawEmpId || (!/^\d{10}$/.test(userData.username) ? userData.username : '-');

    const gender = userData.gender
      ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)
      : '-';

    const role =
      userData.role ||
      userData.tenantData?.[0]?.roleName ||
      'Student';

    const status = (userData.status || 'active').toLowerCase();

    // Extract custom fields
    const cFields = Array.isArray(userData.customFields)
      ? userData.customFields
      : Array.isArray(userData.customField)
        ? userData.customField
        : [];

    let state = userData.state ? String(userData.state).trim() : '';
    let district = userData.district
      ? String(userData.district).trim()
      : userData.city
        ? String(userData.city).trim()
        : '';
    let branch = userData.branch ? String(userData.branch).trim() : '';
    let program = userData.program ? String(userData.program).trim() : '';

    for (const cf of cFields) {
      const label = (cf.label || cf.name || '').toLowerCase();
      const rawVal = cf.value ?? cf.code;
      const val = Array.isArray(rawVal) ? rawVal[0] : rawVal;
      if (val && typeof val === 'string' && val.trim()) {
        const trimmed = val.trim();
        if (!state && (label === 'state' || label.includes('state'))) {
          state = trimmed;
        }
        if (!district && (label === 'city' || label === 'district')) {
          district = trimmed;
        }
        if (
          !branch &&
          (label.includes('university') ||
            label.includes('college') ||
            label.includes('branch') ||
            label.includes('line 1') ||
            label.includes('line 2'))
        ) {
          if (!trimmed.startsWith('http')) {
            branch = trimmed;
          }
        }
        if (
          !program &&
          (label.includes('field(s) of study') ||
            label.includes('field of study') ||
            label.includes('course') ||
            label === 'program' ||
            label.includes('level of education'))
        ) {
          program = trimmed;
        }
      }
    }

    if (!state) state = userData.currentCountry || userData.country || '-';
    if (!district) district = '-';
    if (!branch) branch = '-';
    if (!program) program = role;

    return {
      fullName,
      initials,
      email,
      phone,
      empId,
      gender,
      state,
      district,
      branch,
      program,
      role,
      status,
    };
  }, [userData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
        <CircularProgress size={36} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>Loading user details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1.5, px: { xs: 1, md: 2 } }}>
      {/* 1. Breadcrumbs Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9CA3AF' }} />}
          aria-label="breadcrumb"
          sx={{ fontSize: '13px' }}
        >
          <MuiLink
            underline="hover"
            color="inherit"
            onClick={() => router.push('/users')}
            sx={{ cursor: 'pointer', color: '#6B7280', '&:hover': { color: 'primary.main' } }}
          >
            People
          </MuiLink>
          <MuiLink
            underline="hover"
            color="inherit"
            onClick={() => router.push('/users')}
            sx={{ cursor: 'pointer', color: '#6B7280', '&:hover': { color: 'primary.main' } }}
          >
            Users
          </MuiLink>
          <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}>
            {parsedUser.email}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              py: 0.4,
              px: 1.5,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              SA
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                Admin
              </Typography>
              <Typography sx={{ fontSize: '10px', color: '#6B7280', lineHeight: 1 }}>
                Super Admin
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Top User Card Matching Image 2 */}
      <Card
        sx={{
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          p: 2.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Avatar Pill / Circle */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '10px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              [{parsedUser.initials}]
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '20px' }}>
                  [{parsedUser.fullName}]
                </Typography>

                <Chip
                  label={parsedUser.status === 'active' ? 'Active' : parsedUser.status.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: parsedUser.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                    color: parsedUser.status === 'active' ? '#047857' : '#4B5563',
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '6px',
                    height: '22px',
                  }}
                />

                <Chip
                  label={parsedUser.role}
                  size="small"
                  sx={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '6px',
                    height: '22px',
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '13px' }}>
                {parsedUser.email} · {parsedUser.empId} · {parsedUser.state}, {parsedUser.district} · {parsedUser.branch}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons matching Image 2 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFeedback({ open: true, message: 'Notification modal opened', severity: 'info' })
              }
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
                '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
              }}
            >
              Send notification
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFeedback({ open: true, message: 'Edit user profile opened', severity: 'info' })
              }
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
                '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
              }}
            >
              Edit
            </Button>

            {parsedUser.status === 'blocked' ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDialogType('unblock')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#374151',
                  borderColor: '#D1D5DB',
                  backgroundColor: '#FFFFFF',
                  '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
                }}
              >
                Unblock
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDialogType('block')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#374151',
                  borderColor: '#D1D5DB',
                  backgroundColor: '#FFFFFF',
                  '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
                }}
              >
                Block
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              onClick={() => setDialogType('delete')}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#E11D48',
                borderColor: '#FECDD3',
                backgroundColor: '#FFFFFF',
                '&:hover': { backgroundColor: '#FFF1F2', borderColor: '#FDA4AF' },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 3. Two-Column Grid Matching Image 2 */}
      <Grid container spacing={2.5}>
        {/* Left Column: Profile, Location & Program, Role */}
        <Grid item xs={12} md={6}>
          {/* Card 1: Profile */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Profile
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Full name</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.fullName}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Email (login ID)</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  {parsedUser.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Phone</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.phone}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Employee ID</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.empId}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Gender</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.gender}]
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Card 2: Location and program */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Location and program
              </Typography>
              <Chip
                label="CLIENT REVIEW"
                size="small"
                sx={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '6px',
                  height: '20px',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>State</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.state}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>District</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.district}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Branch</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.branch}]
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Program</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  [{parsedUser.program}]
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Card 3: Role */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Role
              </Typography>
              <Chip
                label="CLIENT REVIEW"
                size="small"
                sx={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '6px',
                  height: '20px',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>Role</Typography>
                <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                  {parsedUser.role} · company role
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 140, fontSize: '13px', color: '#6B7280' }}>
                  Learner / Reviewer
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                  Set per group – see Groups
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Groups, Reviews, Learning Progress */}
        <Grid item xs={12} md={6}>
          {/* Card 4: Groups */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Groups
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setFeedback({ open: true, message: 'Add to group dialog opened', severity: 'info' })
                }
                sx={{
                  textTransform: 'none',
                  fontSize: '12px',
                  borderRadius: '6px',
                  borderColor: '#D1D5DB',
                  color: '#374151',
                }}
              >
                Add to group
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Group A */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.8,
                  borderBottom: '1px solid #F3F4F6',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => router.push('/cohorts')}
                >
                  [Group A]
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label="Reviewer"
                    size="small"
                    sx={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '11px', height: '22px' }}
                  />
                  <Chip
                    label="Learner"
                    size="small"
                    sx={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '11px', height: '22px' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: 'Remove from Group A',
                        description: 'Remove this user from [Group A]?',
                        actionType: 'remove_group',
                      })
                    }
                    sx={{ color: '#9CA3AF', p: 0.3 }}
                  >
                    <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Group B */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.8,
                  borderBottom: '1px solid #F3F4F6',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => router.push('/cohorts')}
                >
                  [Group B]
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label="Learner"
                    size="small"
                    sx={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '11px', height: '22px' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: 'Remove from Group B',
                        description: 'Remove this user from [Group B]?',
                        actionType: 'remove_group',
                      })
                    }
                    sx={{ color: '#9CA3AF', p: 0.3 }}
                  >
                    <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Bottom footnote */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                  A user can be both Reviewer and Learner.
                </Typography>
                <Chip
                  label="CLIENT REVIEW"
                  size="small"
                  sx={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontWeight: 700,
                    fontSize: '10px',
                    borderRadius: '6px',
                    height: '18px',
                  }}
                />
              </Box>
            </Box>
          </Card>

          {/* Card 5: Reviews */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Reviews
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setFeedback({ open: true, message: 'Add individual user dialog opened', severity: 'info' })
                }
                sx={{
                  textTransform: 'none',
                  fontSize: '12px',
                  borderRadius: '6px',
                  borderColor: '#D1D5DB',
                  color: '#374151',
                }}
              >
                Add individual user
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              {/* Review 1 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => router.push('/cohorts')}
                  >
                    [Group A]
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>
                    Whole group · from the Reviewer role in that group
                  </Typography>
                </Box>
                <Chip
                  label="Group"
                  size="small"
                  sx={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '11px', height: '22px' }}
                />
              </Box>

              {/* Review 2 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    ankur@swadhaar.org
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>
                    Individual user
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      title: 'Remove Reviewer',
                      description: 'Remove ankur@swadhaar.org from reviews list?',
                      actionType: 'remove_review',
                    })
                  }
                  sx={{ color: '#9CA3AF', p: 0.3 }}
                >
                  <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Card>

          {/* Card 6: Learning progress */}
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827', mb: 2 }}>
              Learning progress
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                  [Learning item]
                </Typography>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#6B7280' }}>
                  [75%]
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary.main',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            <MuiLink
              underline="hover"
              onClick={() => router.push('/reports')}
              sx={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'primary.main',
                cursor: 'pointer',
              }}
            >
              View in Insights
            </MuiLink>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================================ */}
      {/* Block User Dialog (Image 2)                                  */}
      {/* ============================================================ */}
      <Dialog
        open={dialogType === 'block'}
        onClose={() => setDialogType(null)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            p: 3,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            mb: 2,
          }}
        >
          Block {parsedUser.fullName}?
        </Typography>

        <Typography
          sx={{
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.5,
            mb: 2,
          }}
        >
          Their platform access is revoked immediately. The account and its data are not deleted, and
          you can unblock at any time.
        </Typography>

        <Typography
          sx={{
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          They will see a message when they try to log in.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogType(null)}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              borderColor: '#D1D5DB',
              backgroundColor: '#FFFFFF',
              px: 2.2,
              py: 0.8,
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#9CA3AF',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setUserData((prev: any) => ({ ...prev, status: 'blocked' }));
              setDialogType(null);
              setFeedback({
                open: true,
                message: `[${parsedUser.fullName}] has been blocked.`,
                severity: 'success',
              });
            }}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              px: 2.4,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#27272A',
                boxShadow: 'none',
              },
            }}
          >
            Block user
          </Button>
        </Box>
      </Dialog>

      {/* ============================================================ */}
      {/* Unblock User Dialog (Image 4)                                */}
      {/* ============================================================ */}
      <Dialog
        open={dialogType === 'unblock'}
        onClose={() => setDialogType(null)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            p: 3,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            mb: 2,
          }}
        >
          Unblock [{parsedUser.fullName}]?
        </Typography>

        <Typography
          sx={{
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          Their platform access is restored immediately with their existing roles, groups and progress.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogType(null)}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              borderColor: '#D1D5DB',
              backgroundColor: '#FFFFFF',
              px: 2.2,
              py: 0.8,
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#9CA3AF',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setUserData((prev: any) => ({ ...prev, status: 'active' }));
              setDialogType(null);
              setFeedback({
                open: true,
                message: `[${parsedUser.fullName}] has been unblocked.`,
                severity: 'success',
              });
            }}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              px: 2.4,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#27272A',
                boxShadow: 'none',
              },
            }}
          >
            Unblock user
          </Button>
        </Box>
      </Dialog>

      {/* ============================================================ */}
      {/* Delete User Dialog (Image 3)                                 */}
      {/* ============================================================ */}
      <Dialog
        open={dialogType === 'delete'}
        onClose={() => setDialogType(null)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            p: 3,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            mb: 1.5,
          }}
        >
          Delete [{parsedUser.fullName}]?
        </Typography>

        <Typography
          sx={{
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.5,
            mb: 2,
          }}
        >
          The user can no longer log in. Their record is kept for audit.
        </Typography>

        {/* Shaded gray retention box matching Image 3 */}
        <Box
          sx={{
            backgroundColor: '#F4F4F5',
            border: '1px solid #E4E4E7',
            borderRadius: '8px',
            px: 2,
            py: 1.5,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: '13.5px',
              color: '#52525B',
            }}
          >
            Retention period and access to retained data
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogType(null)}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              borderColor: '#D1D5DB',
              backgroundColor: '#FFFFFF',
              px: 2.2,
              py: 0.8,
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#9CA3AF',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDialogType(null);
              router.push('/users');
            }}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#9F1239',
              color: '#FFFFFF',
              px: 2.4,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#881337',
                boxShadow: 'none',
              },
            }}
          >
            Delete user
          </Button>
        </Box>
      </Dialog>

      {/* Confirmation Dialog for group/review removal */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        PaperProps={{ sx: { borderRadius: '12px', p: 1, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13.5px', color: '#4B5563' }}>
            {confirmDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
            sx={{ textTransform: 'none', color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              setFeedback({
                open: true,
                message: `Action executed: ${confirmDialog.title}`,
                severity: 'success',
              });
            }}
            sx={{ textTransform: 'none', borderRadius: '6px' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          severity={feedback.severity}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'], nextI18NextConfig as any)),
    },
  };
};

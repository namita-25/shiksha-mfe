import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import {
  getCohortById,
  getCohortMemberListApplication,
} from '@/services/CohortService';

export interface MemberRowItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  stateDistrict: string;
  branch: string;
  program: string;
  status: string;
}

const mapMemberToRow = (user: any, index: number): MemberRowItem => {
  const userId = user.userId || user.id || `member-${index}`;
  const fn = user.firstName ? String(user.firstName).trim() : '';
  const mn = user.middleName ? String(user.middleName).trim() : '';
  const ln = user.lastName ? String(user.lastName).trim() : '';
  const uUsername = user.username ? String(user.username).trim() : '';
  const fullName = [fn, mn, ln].filter(Boolean).join(' ') || user.name || uUsername || '-';
  const email = user.email && user.email !== '-' ? String(user.email).trim() : (uUsername || '-');
  const role = user.role || 'Student';
  const status = (user.status || 'applied').toLowerCase();

  // Extract custom fields (check both customField and customFields)
  const cFields = Array.isArray(user.customField)
    ? user.customField
    : Array.isArray(user.customFields)
      ? user.customFields
      : [];

  let state = user.state ? String(user.state).trim() : '';
  let district = user.district ? String(user.district).trim() : (user.city ? String(user.city).trim() : '');
  let branch = user.branch ? String(user.branch).trim() : '';
  let program = user.program ? String(user.program).trim() : '';

  for (const cf of cFields) {
    const label = (cf.label || cf.name || '').toLowerCase();
    const rawVal = cf.value ?? cf.code;
    const val = Array.isArray(rawVal) ? rawVal[0] : rawVal;
    if (val && typeof val === 'string' && val.trim()) {
      const trimmed = val.trim();
      // State
      if (!state && (label === 'state' || label.includes('choose your state'))) {
        state = trimmed;
      }
      // District / City
      if (!district && (label === 'city' || label === 'district')) {
        district = trimmed;
      }
      // Branch / University / College
      if (
        !branch &&
        (label.includes('university or college') ||
          label.includes('university/college') ||
          label.includes('name of university') ||
          label.includes('branch') ||
          label.includes('institution'))
      ) {
        if (!trimmed.startsWith('http')) {
          branch = trimmed;
        }
      }
      // Program / Field of study
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

  const locParts = [state, district].filter(Boolean);
  const stateDistrict =
    locParts.length > 0
      ? locParts.join(' · ')
      : user.country || user.permanentCountry || user.currentCountry || user.applicationCountry || '-';

  if (!branch) {
    branch = district || user.district || '-';
  }
  if (!program) {
    program = user.form?.title || '-';
  }

  return {
    id: userId,
    userId,
    fullName,
    email,
    role,
    stateDistrict,
    branch,
    program,
    status,
  };
};

export default function GroupDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const cohortId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [cohort, setCohort] = useState<any>(null);
  const [members, setMembers] = useState<MemberRowItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog & Notification feedback states
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: 'delete' | 'remove' | 'role' | 'notify';
  }>({
    open: false,
    title: '',
    description: '',
    actionType: 'remove',
  });

  // Fetch cohort metadata
  const fetchCohortDetails = useCallback(async () => {
    if (!cohortId) return;
    try {
      const cohortData = await getCohortById(cohortId);
      if (cohortData) {
        setCohort(cohortData);
      }
    } catch (err) {
      console.error('Failed to load cohort details:', err);
    }
  }, [cohortId]);

  // Fetch cohort members list via Aspire application API
  const fetchMembers = useCallback(async () => {
    if (!cohortId) return;
    setLoading(true);
    try {
      const payload: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        filters: {
          cohortId: [cohortId],
          status: ['applied'],
          role: 'Student',
        },
      };

      const res = await getCohortMemberListApplication(payload);
      const userDetails = res?.result?.userDetails || [];
      const total = res?.result?.totalCount ?? userDetails.length;
      setTotalCount(total);

      const mapped = userDetails.map((u: any, idx: number) => mapMemberToRow(u, idx));
      setMembers(mapped);
    } catch (err) {
      console.error('Failed to load cohort members:', err);
      setMembers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [cohortId, page, rowsPerPage]);

  useEffect(() => {
    if (cohortId) {
      fetchCohortDetails();
      fetchMembers();
    }
  }, [cohortId, fetchCohortDetails, fetchMembers]);

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(members.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (rowId: string) => {
    setSelectedIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const groupName = cohort?.name || 'Group Details';
  const groupStatus = cohort?.status || 'active';

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
            onClick={() => router.push('/cohorts')}
            sx={{ cursor: 'pointer', color: '#6B7280', '&:hover': { color: 'primary.main' } }}
          >
            Groups
          </MuiLink>
          <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}>
            [{groupName}]
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

      {/* 2. Group Header Card with Title, Badges, and Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '24px' }}>
              [{groupName}]
            </Typography>
            <Chip
              label="BRD §4.3"
              size="small"
              sx={{
                backgroundColor: '#F3E8FF',
                color: '#7E22CE',
                fontWeight: 700,
                fontSize: '11px',
                borderRadius: '6px',
                height: '22px',
              }}
            />

            <Chip
              label={groupStatus.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: groupStatus === 'active' ? '#ECFDF5' : '#F3F4F6',
                color: groupStatus === 'active' ? '#047857' : '#4B5563',
                fontWeight: 600,
                fontSize: '11px',
                borderRadius: '6px',
                height: '22px',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '13px' }}>
            [Cohort group] · {totalCount} members
          </Typography>
        </Box>

        {/* Action Buttons matching Image 1 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              setFeedback({ open: true, message: 'Notification draft created', severity: 'info' })
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
              setFeedback({ open: true, message: 'Edit Group Dialog opened', severity: 'info' })
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

          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Delete Group',
                description: `Are you sure you want to delete [${groupName}]? This action cannot be undone.`,
                actionType: 'delete',
              })
            }
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

          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setFeedback({ open: true, message: 'Add members dialog opened', severity: 'info' })
            }
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#111827',
              color: '#FFFFFF',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#1F2937', boxShadow: 'none' },
            }}
          >
            Add members
          </Button>
        </Box>
      </Box>

      {/* 3. Main Grid Layout: Left (Members Table) + Right (Reviewers & Learning Paths) */}
      <Grid container spacing={2.5}>
        {/* Left Column: Members Table Card */}
        <Grid item xs={12} lg={8.5}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              p: 2.5,
            }}
          >
            {/* Top Toolbar of Members Card */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                Members ({totalCount})
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '12.5px', color: '#6B7280' }}>
                  {selectedIds.length} selected
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  disabled={selectedIds.length === 0}
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      title: 'Change Role in Group',
                      description: `Update the group role for ${selectedIds.length} selected member(s).`,
                      actionType: 'role',
                    })
                  }
                  sx={{
                    textTransform: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#374151',
                    borderColor: '#D1D5DB',
                  }}
                >
                  Change role in group
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  disabled={selectedIds.length === 0}
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      title: 'Remove from Group',
                      description: `Are you sure you want to remove ${selectedIds.length} member(s) from this group? Progress data will be retained.`,
                      actionType: 'remove',
                    })
                  }
                  sx={{
                    textTransform: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#DC2626',
                    borderColor: '#FCA5A5',
                    '&:hover': { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
                  }}
                >
                  Remove from group
                </Button>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer sx={{ minHeight: 320 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E5E7EB' }}>
                      <Checkbox
                        size="small"
                        indeterminate={
                          selectedIds.length > 0 && selectedIds.length < members.length
                        }
                        checked={members.length > 0 && selectedIds.length === members.length}
                        onChange={handleSelectAll}
                        sx={{
                          color: '#9CA3AF',
                          '&.Mui-checked': { color: 'primary.main' },
                          '&.MuiCheckbox-indeterminate': { color: 'primary.main' },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      FULL NAME
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      EMAIL (LOGIN ID)
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      ROLE
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      STATE · DISTRICT
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      BRANCH
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      PROGRAM
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #E5E7EB',
                        py: 1.2,
                      }}
                    >
                      STATUS
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress size={32} sx={{ color: 'primary.main', mb: 1 }} />
                        <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                          Loading cohort members...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                          No members found for this group.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((row) => {
                      const isSelected = selectedIds.includes(row.id);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={isSelected}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&.Mui-selected': { backgroundColor: 'primary.50' },
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #F3F4F6' }}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(row.id)}
                              sx={{
                                color: '#9CA3AF',
                                '&.Mui-checked': { color: 'primary.main' },
                              }}
                            />
                          </TableCell>

                          {/* 1. Full name */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Box
                              sx={{ cursor: 'pointer', display: 'inline-block' }}
                              onClick={() => router.push(`/users/${row.userId}`)}
                            >
                              <Typography
                                sx={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: 'primary.main',
                                  whiteSpace: 'nowrap',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                    color: '#B85D1B',
                                  },
                                }}
                              >
                                {row.fullName}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* 2. Email (login ID) */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Tooltip title={row.email}>
                              <Typography
                                sx={{
                                  fontSize: '12.5px',
                                  color: '#374151',
                                  maxWidth: 160,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.email}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* 3. Role */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Typography sx={{ fontSize: '12.5px', color: '#4B5563' }}>
                              {row.role}
                            </Typography>
                          </TableCell>

                          {/* 4. State · District */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Typography sx={{ fontSize: '12.5px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                              {row.stateDistrict}
                            </Typography>
                          </TableCell>

                          {/* 5. Branch */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Typography sx={{ fontSize: '12.5px', color: '#4B5563', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row.branch}
                            </Typography>
                          </TableCell>

                          {/* 6. Program */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Typography sx={{ fontSize: '12.5px', color: '#4B5563', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row.program}
                            </Typography>
                          </TableCell>

                          {/* 7. Status */}
                          <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.3 }}>
                            <Chip
                              label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '11px',
                                borderRadius: '12px',
                                height: '22px',
                                backgroundColor:
                                  row.status === 'active'
                                    ? '#ECFDF5'
                                    : row.status === 'applied'
                                      ? '#EFF6FF'
                                      : row.status === 'completed'
                                        ? '#F0FDF4'
                                        : '#F3F4F6',
                                color:
                                  row.status === 'active'
                                    ? '#047857'
                                    : row.status === 'applied'
                                      ? '#1D4ED8'
                                      : row.status === 'completed'
                                        ? '#15803D'
                                        : '#4B5563',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footnote matching Image 1 */}
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 2, color: '#6B7280', fontSize: '12px' }}
            >
              Progress data is kept when a user is removed from a group (BRD §4.3).
            </Typography>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ borderTop: '1px solid #F3F4F6', mt: 1 }}
            />
          </Card>
        </Grid>

        {/* Right Column: Reviewers & Learning Paths Cards matching Image 1 */}
        <Grid item xs={12} lg={3.5}>
          {/* Reviewers Card */}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Reviewers
              </Typography>

            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => router.push('/users')}
                >
                  aman@swadhaar.org
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                  DI · Reviewer and Learner
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                  [Full name]
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                  ARM - Reviewer
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '11.5px',
                  color: '#9CA3AF',
                  pt: 1.5,
                  borderTop: '1px solid #F3F4F6',
                  lineHeight: 1.4,
                }}
              >
                Members with the Reviewer role in this group. Notifier distinction
              </Typography>
            </Box>
          </Card>

          {/* Learning Paths Card */}
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
              Learning paths
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.5,
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
                onClick={() => router.push('/learning-paths')}
              >
                [Learning path]
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                Enrolled from Learning
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
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
            color={confirmDialog.actionType === 'delete' || confirmDialog.actionType === 'remove' ? 'error' : 'primary'}
            onClick={() => {
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              setFeedback({
                open: true,
                message: `Action executed successfully: ${confirmDialog.title}`,
                severity: 'success',
              });
              if (confirmDialog.actionType === 'remove') {
                setSelectedIds([]);
              }
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

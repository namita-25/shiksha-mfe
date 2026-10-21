import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SDBVHierarchyFilter, { SDBVFilterValues } from '@/components/common/SDBVHierarchyFilter';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import CreateUserModal from '@/components/common/CreateUserModal';
import { getUserList } from '@/services/UserService';

export interface UserRowItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  stateDistrict: string;
  branch: string;
  program: string;
  status: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  username?: string;
  mobile?: string;
  phone?: string;
  employeeId?: string;
  gender?: string;
  state?: string;
  district?: string;
  rawUser?: any;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRowItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Common Hierarchy & Search Filter State
  const [filters, setFilters] = useState<SDBVFilterValues>({
    search: '',
    status: 'all',
    role: 'all',
    state: 'all',
    district: 'all',
    branch: 'all',
    program: 'all',
  });

  // Dynamic status and role options extracted from API response
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(['active', 'inactive']);
  const [availableRoles, setAvailableRoles] = useState<string[]>(['Student']);

  // Action menu state for row actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeUser, setActiveUser] = useState<UserRowItem | null>(null);

  // Dialog state for Block, Unblock, Delete
  const [dialogType, setDialogType] = useState<'block' | 'unblock' | 'delete' | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserRowItem | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Create & Edit modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        filters: {
          role: filters.role && filters.role !== 'all' ? [filters.role] : ['Student'],
          status:
            filters.status && filters.status !== 'all'
              ? [filters.status.toLowerCase()]
              : ['active', 'inactive'],
        },
        sort: ['name', 'asc'],
      };

      const response = await getUserList(payload);
      if (response?.result?.getUserDetails) {
        const rawList = response.result.getUserDetails;

        // Collect unique statuses and roles directly from API response
        const apiStatuses: string[] = Array.from(
          new Set(
            rawList
              .map((u: any) => u.status?.toLowerCase())
              .filter((s: any) => typeof s === 'string' && s.length > 0)
          )
        );
        if (apiStatuses.length > 0) {
          setAvailableStatuses((prev) => Array.from(new Set([...prev, ...apiStatuses])));
        }

        const apiRoles: string[] = Array.from(
          new Set(
            rawList
              .map((u: any) => u.role)
              .filter((r: any) => typeof r === 'string' && r.length > 0)
          )
        );
        if (apiRoles.length > 0) {
          setAvailableRoles((prev) => Array.from(new Set([...prev, ...apiRoles])));
        }

        const toStr = (val: any): string => (val !== null && val !== undefined ? String(val).trim() : '');

        const mappedUsers: UserRowItem[] = rawList.map((u: any, idx: number) => {
          const userId = toStr(u.userId || u.id || `user-${idx}`);
          const fn = toStr(u.firstName);
          const ln = toStr(u.lastName);
          const mn = toStr(u.middleName);
          const uUsername = toStr(u.username);
          const name =
            toStr(u.name) ||
            [fn, mn, ln].filter(Boolean).join(' ') ||
            uUsername ||
            '-';
          const email = u.email && u.email !== '-' ? toStr(u.email) : (uUsername || '-');
          const actualRole = toStr(u.role || u.tenantData?.[0]?.roleName) || 'Student';

          // Extract phone/mobile as clean string
          const rawMobile = toStr(u.mobile || u.phone);
          const mobile = rawMobile || (/^\d{10}$/.test(uUsername) ? uUsername : '');

          // Extract employeeId as clean string
          const rawEmpId = toStr(u.employeeId);
          const employeeId =
            rawEmpId ||
            (!/^\d{10}$/.test(uUsername) && uUsername ? uUsername : '');

          // Extract location fields from customFields, direct properties, and country fields
          let userState = toStr(u.state);
          let userDistrict = toStr(u.district || u.city);
          let userBranch = toStr(u.branch || u.block);
          let userProgram = toStr(u.program);

          if (Array.isArray(u.customFields)) {
            const stateField = u.customFields.find(
              (cf: any) =>
                cf.fieldId === '1c5e2836-4831-4b34-b963-8aeffd1c14f7' ||
                cf.fieldId === 'c572783a-4a0b-4936-8172-c2009d2453e3' ||
                cf.fieldId === '800265b1-9058-482a-94f4-726197e1dfe4' ||
                cf.label?.toLowerCase() === 'state' ||
                cf.name?.toLowerCase() === 'state'
            );
            if (stateField && stateField.value) {
              const val = Array.isArray(stateField.value) ? stateField.value[0] : stateField.value;
              if (val) userState = toStr(val);
            }

            const districtField = u.customFields.find(
              (cf: any) =>
                cf.fieldId === '56ce5f2b-1d81-4d60-9eba-798f764008d3' ||
                cf.fieldId === 'd0368400-8529-407e-b8c6-f41c29297fa6' ||
                cf.label?.toLowerCase() === 'city' ||
                cf.label?.toLowerCase() === 'district' ||
                cf.name?.toLowerCase() === 'city' ||
                cf.name?.toLowerCase() === 'district'
            );
            if (districtField && districtField.value) {
              const val = Array.isArray(districtField.value) ? districtField.value[0] : districtField.value;
              if (val) userDistrict = toStr(val);
            }

            const branchField = u.customFields.find(
              (cf: any) =>
                cf.fieldId === '2b5da81a-b803-4550-9af3-f4c61e8f8ca1' ||
                cf.fieldId === 'ac8dcb40-8c45-4acb-b4ea-4d6282c51c22' ||
                cf.label?.toLowerCase().includes('university or college') ||
                cf.label?.toLowerCase() === 'branch' ||
                cf.label?.toLowerCase() === 'block' ||
                cf.name?.toLowerCase() === 'branch' ||
                cf.name?.toLowerCase() === 'block'
            );
            if (branchField && branchField.value) {
              const val = Array.isArray(branchField.value) ? branchField.value[0] : branchField.value;
              if (val) userBranch = toStr(val);
            }

            const programField = u.customFields.find(
              (cf: any) =>
                cf.fieldId === '1b92932d-648b-4b26-9f12-f43cec5416ef' ||
                cf.fieldId === 'a64e51c9-082f-498f-a824-2c8fad206eae' ||
                cf.label?.toLowerCase().includes('field(s) of study') ||
                cf.label?.toLowerCase() === 'program' ||
                cf.name?.toLowerCase() === 'program'
            );
            if (programField && programField.value) {
              const val = Array.isArray(programField.value) ? programField.value[0] : programField.value;
              if (val) userProgram = toStr(val);
            }
          }

          // Build stateDistrict display string
          const locParts = [userState, userDistrict].filter(Boolean);
          const stateDistrict =
            locParts.length > 0
              ? locParts.join(' · ')
              : toStr(u.country || u.permanentCountry || u.currentCountry || '-');

          return {
            id: userId,
            userId: userId,
            fullName: name,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            middleName: u.middleName || '',
            username: u.username || '',
            email: email,
            role: actualRole,
            mobile: mobile,
            phone: mobile,
            employeeId: employeeId,
            gender: u.gender || '',
            state: userState,
            district: userDistrict,
            branch: userBranch && userBranch !== '[Branch]' ? userBranch : '-',
            program: userProgram && userProgram !== '[Program]' ? userProgram : '-',
            stateDistrict: stateDistrict,
            status: u.status || 'Active',
            rawUser: u,
          };
        });

        setUsers(mappedUsers);
        const count =
          Number(response.result.totalCount) ||
          Number(rawList[0]?.total_count) ||
          mappedUsers.length;
        setTotalCount(count);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('API fetch failed:', err);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, filters.role, filters.status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side search by typing name or email across the loaded dataset
  const displayedUsers = useMemo(() => {
    return users.filter((user) => {
      if (!filters.search?.trim()) return true;
      const term = filters.search.toLowerCase().trim();
      const matchesName = user.fullName.toLowerCase().includes(term);
      const matchesEmail = user.email.toLowerCase().includes(term);
      return matchesName || matchesEmail;
    });
  }, [users, filters.search]);

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, user: UserRowItem) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveUser(user);
  };

  const handleCloseActionMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    setMenuAnchorEl(null);
    setIsEditModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedUserForAction) {
      const uid = selectedUserForAction.userId;
      setBlockedUserIds((prev) => new Set([...prev, uid]));
      setUsers((prev) =>
        prev.map((u) => (u.userId === uid ? { ...u, status: 'blocked' } : u))
      );
      if (activeUser && activeUser.userId === uid) {
        setActiveUser({ ...activeUser, status: 'blocked' });
      }
      setSnackbar({
        open: true,
        message: `[${selectedUserForAction.fullName || 'User'}] has been blocked.`,
        severity: 'success',
      });
    }
    setDialogType(null);
  };

  const handleConfirmUnblock = () => {
    if (selectedUserForAction) {
      const uid = selectedUserForAction.userId;
      setBlockedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
      setUsers((prev) =>
        prev.map((u) => (u.userId === uid ? { ...u, status: 'active' } : u))
      );
      if (activeUser && activeUser.userId === uid) {
        setActiveUser({ ...activeUser, status: 'active' });
      }
      setSnackbar({
        open: true,
        message: `[${selectedUserForAction.fullName || 'User'}] has been unblocked.`,
        severity: 'success',
      });
    }
    setDialogType(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUserForAction) {
      const uid = selectedUserForAction.userId;
      setUsers((prev) => prev.filter((u) => u.userId !== uid));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setSnackbar({
        open: true,
        message: `[${selectedUserForAction.fullName || 'User'}] has been deleted.`,
        severity: 'success',
      });
    }
    setDialogType(null);
  };

  // Status chip colors matching exact user specification
  const getStatusChipStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'archived' || s === 'inactive') {
      return {
        color: '#9F1239',
        backgroundColor: 'rgba(159, 18, 57, 0.12)', // faint shade of #9F1239
      };
    }
    if (s === 'active') {
      return {
        color: '#15803D',
        backgroundColor: '#DCFCE7',
      };
    }
    if (s === 'draft') {
      return {
        color: '#B45309',
        backgroundColor: '#FEF3C7',
      };
    }
    if (s === 'blocked') {
      return {
        color: '#DC2626',
        backgroundColor: '#FEE2E2',
      };
    }
    return {
      color: '#374151',
      backgroundColor: '#F3F4F6',
    };
  };

  // Common Table Columns Definition
  const columns: ColumnDef<UserRowItem>[] = useMemo(
    () => [
      {
        id: 'fullName',
        label: 'FULL NAME',
        minWidth: 160,
        render: (row) => (
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
        ),
      },
      {
        id: 'email',
        label: 'EMAIL (LOGIN ID)',
        minWidth: 180,
        render: (row) => (
          <Tooltip title={row.email} arrow placement="top">
            <Typography
              sx={{
                fontSize: '13px',
                color: '#1F2937',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {row.email}
            </Typography>
          </Tooltip>
        ),
      },
      {
        id: 'role',
        label: 'ROLE',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#1F2937', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {row.role}
          </Typography>
        ),
      },
      {
        id: 'stateDistrict',
        label: 'STATE · DISTRICT',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563', whiteSpace: 'nowrap' }}>
            {row.stateDistrict}
          </Typography>
        ),
      },
      {
        id: 'branch',
        label: 'BRANCH',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563', whiteSpace: 'nowrap' }}>
            {row.branch}
          </Typography>
        ),
      },
      {
        id: 'program',
        label: 'PROGRAM',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563', whiteSpace: 'nowrap' }}>
            {row.program}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'STATUS',
        render: (row) => {
          const isBlocked =
            blockedUserIds.has(row.userId) || row.status?.toLowerCase() === 'blocked';
          const effectiveStatus = isBlocked ? 'blocked' : row.status;
          const chipStyle = getStatusChipStyles(effectiveStatus);
          const displayStatus =
            effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1).toLowerCase();

          return (
            <Chip
              label={displayStatus}
              size="small"
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '12px',
                height: '24px',
                px: 0.5,
                ...chipStyle,
              }}
            />
          );
        },
      },
      {
        id: 'actions',
        label: '',
        align: 'right',
        render: (row) => (
          <IconButton
            size="small"
            onClick={(e) => handleOpenActionMenu(e, row)}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              p: 0.4,
              color: '#6B7280',
              '&:hover': { backgroundColor: '#F9FAFB' },
            }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ py: 1 }}>
      {/* 1. Header with Badges and Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '24px' }}>
              Users
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '13px' }}>
            Create, update and control platform access for users.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => router.push('/users/bulk-upload')}
            sx={{
              borderColor: '#D4752A',
              color: '#374151',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#9CA3AF',
              },
            }}
          >
            Bulk upload
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              backgroundColor: '#D4752A',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              '&:hover': { backgroundColor: '#D4752A' },
            }}
          >
            Create user
          </Button>
        </Box>
      </Box>

      {/* 2. Common Filter Component: SDBVHierarchyFilter with search and hierarchy */}
      <SDBVHierarchyFilter
        values={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(0);
        }}
        showSearch={true}
        searchPlaceholder="Name or email"
        showStatus={true}
        statusOptions={availableStatuses}
        showRole={true}
        roleOptions={availableRoles}
        showBranch={true}
        showProgram={true}
        onClear={() => {
          setFilters({
            search: '',
            status: 'all',
            role: 'all',
            state: 'all',
            district: 'all',
            branch: 'all',
            program: 'all',
          });
          setPage(0);
        }}
      />

      {/* 3. Subtitle Row with Count and Proposal badge */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          px: 0.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '13px', fontWeight: 500 }}>
          Showing {totalCount > 0 ? page * rowsPerPage + 1 : 0}–
          {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} users
        </Typography>
      </Box>

      {/* 4. Common Table Component: SwadhaarDataTable */}
      <SwadhaarDataTable<UserRowItem>
        columns={columns}
        data={displayedUsers}
        keyExtractor={(row) => row.id}
        loading={loading}
        hideToolbar={true}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
        emptyMessage="No users found matching the filter criteria."
      />

      {/* 5. Action Menu (View details, Edit, Block, Delete) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseActionMenu}
        PaperProps={{
          sx: {
            width: 150,
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            py: 0.5,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const uid = activeUser?.userId;
            handleCloseActionMenu();
            if (uid) router.push(`/users/${uid}`);
          }}
          sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
        >
          View details
        </MenuItem>
        <MenuItem
          onClick={handleEditClick}
          sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
        >
          Edit
        </MenuItem>
        {activeUser &&
        (blockedUserIds.has(activeUser.userId) ||
          activeUser.status?.toLowerCase() === 'blocked') ? (
          <MenuItem
            onClick={() => {
              setSelectedUserForAction(activeUser);
              setDialogType('unblock');
              handleCloseActionMenu();
            }}
            sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
          >
            Unblock
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setSelectedUserForAction(activeUser);
              setDialogType('block');
              handleCloseActionMenu();
            }}
            sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
          >
            Block
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setSelectedUserForAction(activeUser);
            setDialogType('delete');
            handleCloseActionMenu();
          }}
          sx={{ fontSize: '13px', py: 0.8, color: '#DC2626', fontWeight: 500 }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* 6. Create User Modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUsers}
        availableRoles={availableRoles}
      />

      {/* 7. Edit User Modal */}
      {activeUser && (
        <CreateUserModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setActiveUser(null);
          }}
          onSuccess={fetchUsers}
          availableRoles={availableRoles}
          initialData={activeUser}
          isEdit={true}
        />
      )}

      {/* ============================================================ */}
      {/* 8. Block User Dialog (Image 2)                               */}
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
          Block [{selectedUserForAction?.fullName || 'Full name'}]?
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
            onClick={handleConfirmBlock}
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
      {/* 9. Unblock User Dialog (Image 4)                             */}
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
          Unblock [{selectedUserForAction?.fullName || 'Full name'}]?
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
            onClick={handleConfirmUnblock}
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
      {/* 10. Delete User Dialog (Image 3)                             */}
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
          Delete [{selectedUserForAction?.fullName || 'Full name'}]?
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
            onClick={handleConfirmDelete}
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

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'], nextI18NextConfig as any)),
    },
  };
};

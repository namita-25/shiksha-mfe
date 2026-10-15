import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SDBVHierarchyFilter, { SDBVFilterValues } from '@/components/common/SDBVHierarchyFilter';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import { getUserList } from '@/services/UserService';

interface UserRowItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  stateDistrict: string;
  branch: string;
  program: string;
  status: string;
}

export default function UsersPage() {
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
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(['active', 'archived']);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Action menu state for row actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [, setActiveUser] = useState<UserRowItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        filters: {},
      };

      if (filters.status && filters.status !== 'all') {
        payload.filters.status = filters.status.toLowerCase();
      }
      if (filters.role && filters.role !== 'all') {
        payload.filters.role = filters.role;
      }

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

        const mappedUsers: UserRowItem[] = rawList.map((u: any, idx: number) => {
          const name =
            u.name ||
            `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
            (u.username ? u.username : '-');
          const email = u.email || (u.username ? `${u.username}@swadhaar.org` : '-');
          const actualRole = u.role || '-';

          return {
            id: u.userId || `user-${idx}`,
            fullName: name,
            email: email,
            role: actualRole,
            stateDistrict:
              u.state && u.district ? `${u.state} · ${u.district}` : '[State] · [District]',
            branch: u.branch || '[Branch]',
            program: u.program || '[Program]',
            status: u.status || 'Active',
          };
        });

        setUsers(mappedUsers);
        setTotalCount(response.result.totalCount || mappedUsers.length);
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
    setActiveUser(null);
  };

  // Status chip colors matching exact user specification
  const getStatusChipStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'archived') {
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
        render: (row) => (
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
            {row.fullName}
          </Typography>
        ),
      },
      {
        id: 'email',
        label: 'EMAIL (LOGIN ID)',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#1F2937' }}>
            {row.email}
          </Typography>
        ),
      },
      {
        id: 'role',
        label: 'ROLE',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
            {row.role}
          </Typography>
        ),
      },
      {
        id: 'stateDistrict',
        label: 'STATE · DISTRICT',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563' }}>
            {row.stateDistrict}
          </Typography>
        ),
      },
      {
        id: 'branch',
        label: 'BRANCH',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563' }}>
            {row.branch}
          </Typography>
        ),
      },
      {
        id: 'program',
        label: 'PROGRAM',
        render: (row) => (
          <Typography sx={{ fontSize: '13px', color: '#4B5563' }}>
            {row.program}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'STATUS',
        render: (row) => {
          const chipStyle = getStatusChipStyles(row.status);
          const displayStatus =
            row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase();

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
            sx={{
              borderColor: '#D1D5DB',
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
            sx={{
              backgroundColor: '#1F1F1E',
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

        <Box
          sx={{
            border: '1px dashed #9CA3AF',
            borderRadius: '4px',
            px: 1.2,
            py: 0.4,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
            PROPOSAL · District / Branch / Program filters here too
          </Typography>
        </Box>
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
          onClick={handleCloseActionMenu}
          sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
        >
          View details
        </MenuItem>
        <MenuItem
          onClick={handleCloseActionMenu}
          sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleCloseActionMenu}
          sx={{ fontSize: '13px', py: 0.8, color: '#1F2937', fontWeight: 500 }}
        >
          Block
        </MenuItem>
        <MenuItem
          onClick={handleCloseActionMenu}
          sx={{ fontSize: '13px', py: 0.8, color: '#DC2626', fontWeight: 500 }}
        >
          Delete
        </MenuItem>
      </Menu>
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'next-i18next';
import { getCohortSearch } from '@/services/CohortService';
import { getUserList } from '@/services/UserService';
import TenantService from '@/services/TenantService';
import { SWADHAAR_TENANT_ID } from '@/utils/app.constant';
import { BRAND, NEUTRAL } from '@/styles/customTheme';
import CommonButton from './CommonButton';
import CommonTextField from './CommonTextField';

type EnrolTab = 'groups' | 'users';

interface EnrolLearningPathModalProps {
  open: boolean;
  onClose: () => void;
  learningPathTitle?: string;
  onEnrolSuccess?: (count: number, type: EnrolTab) => void;
}

interface GroupRow {
  id: string;
  name: string;
  members: string;
  alreadyEnrolled: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  alreadyEnrolled: string;
}

const NOT_ENROLLED = '—';
/** Sentinels for prototype values; translated at render time. */
const ENROLLED_MARKER = 'Enrolled';
const N_USERS_MARKER = '[N] users';
const N_PLACEHOLDER = '[N]';

const FALLBACK_GROUPS: GroupRow[] = [
  { id: 'group-a', name: '[Group A]', members: N_PLACEHOLDER, alreadyEnrolled: NOT_ENROLLED },
  { id: 'group-b', name: '[Group B]', members: N_PLACEHOLDER, alreadyEnrolled: N_USERS_MARKER },
  { id: 'group-c', name: '[Group C]', members: N_PLACEHOLDER, alreadyEnrolled: NOT_ENROLLED },
  { id: 'group-d', name: '[Trainer Cohort 2026]', members: '18', alreadyEnrolled: NOT_ENROLLED },
];

const FALLBACK_USERS: UserRow[] = [
  { id: 'u-1', name: 'Aman Sharma', email: 'aman@swadhaar.org', role: 'Trainer', alreadyEnrolled: ENROLLED_MARKER },
  { id: 'u-2', name: 'Pooja Verma', email: 'pooja.v@swadhaar.org', role: 'DI', alreadyEnrolled: NOT_ENROLLED },
  { id: 'u-3', name: 'Rajesh Patil', email: 'rajesh.p@swadhaar.org', role: 'ARM', alreadyEnrolled: NOT_ENROLLED },
  { id: 'u-4', name: 'Sunita Gaikwad', email: 'sunita.g@swadhaar.org', role: 'Trainer', alreadyEnrolled: NOT_ENROLLED },
];

const HEADER_CELL_SX = {
  backgroundColor: NEUTRAL.canvas,
  fontWeight: 600,
  fontSize: '12px',
  color: NEUTRAL.muted,
} as const;
const CHECKBOX_SX = { color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } } as const;
const MUTED_CELL_SX = { fontSize: '13px', color: NEUTRAL.muted } as const;
const EMPTY_CELL_SX = { py: 3, color: NEUTRAL.muted } as const;

/** Returns the i18n key suffix for "group(s)/user(s)" wording. */
const getCountSuffix = (tab: EnrolTab, count: number): string => {
  const singular = count === 1;
  if (tab === 'groups') return singular ? 'GROUP' : 'GROUPS';
  return singular ? 'USER' : 'USERS';
};

export const EnrolLearningPathModal: React.FC<EnrolLearningPathModalProps> = ({
  open,
  onClose,
  learningPathTitle,
  onEnrolSuccess,
}) => {
  const { t } = useTranslation();
  const pathTitle = learningPathTitle ?? t('ENROL_LEARNING_PATH.DEFAULT_TITLE');
  const [activeTab, setActiveTab] = useState<EnrolTab>('groups');

  // Groups state
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(['group-a', 'group-b']);

  // Users state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Feedback state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Fetch Groups from CohortService
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const tenantId =
        (typeof window !== 'undefined' && localStorage.getItem('tenantId')) ||
        TenantService.getTenantId() ||
        SWADHAAR_TENANT_ID;

      const payload = {
        limit: 50,
        offset: 0,
        filters: {
          type: 'ADHOC-Group',
          tenantId: tenantId,
        },
      };

      const response = await getCohortSearch(payload);
      const rawList = response?.result?.results?.cohortDetails || [];

      // If API returns groups, map them
      if (rawList.length > 0) {
        const enriched: GroupRow[] = rawList.map((g: any, idx: number) => ({
          id: g.cohortId || `group-${idx}`,
          name: g.name || t('ENROL_LEARNING_PATH.GROUP_FALLBACK_NAME', { letter: String.fromCharCode(65 + idx) }),
          members: N_PLACEHOLDER,
          alreadyEnrolled: idx === 1 ? N_USERS_MARKER : NOT_ENROLLED,
        }));
        setGroups(enriched);
      } else {
        // Prototype fallback groups
        setGroups(FALLBACK_GROUPS);
      }
    } catch (err) {
      console.warn('Could not fetch live groups, using fallback data:', err);
      setGroups(FALLBACK_GROUPS);
    } finally {
      setLoadingGroups(false);
    }
  }, [t]);

  // Fetch Users from UserService
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const payload = {
        limit: 50,
        offset: 0,
        filters: {},
      };

      const response = await getUserList(payload);
      const rawUsers = response?.result?.getUserDetails || [];

      if (rawUsers.length > 0) {
        const mapped: UserRow[] = rawUsers.map((u: any, idx: number) => {
          const fn = u.firstName || '';
          const ln = u.lastName || '';
          const name =
            u.name ||
            [fn, ln].filter(Boolean).join(' ') ||
            u.username ||
            t('ENROL_LEARNING_PATH.USER_FALLBACK_NAME', { index: idx + 1 });
          const role = u.role || u.tenantData?.[0]?.roleName || 'Trainer';
          return {
            id: u.userId || u.id || `user-${idx}`,
            name,
            email: u.email && u.email !== '-' ? u.email : u.username || NOT_ENROLLED,
            role,
            alreadyEnrolled: idx === 0 ? ENROLLED_MARKER : NOT_ENROLLED,
          };
        });
        setUsers(mapped);
      } else {
        setUsers(FALLBACK_USERS);
      }
    } catch (err) {
      console.warn('Could not fetch live users, using fallback:', err);
      setUsers(FALLBACK_USERS);
    } finally {
      setLoadingUsers(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      fetchGroups();
      fetchUsers();
      setFeedbackMessage(null);
    }
  }, [open, fetchGroups, fetchUsers]);

  // Filtered lists
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
  }, [groups, groupSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  // Selection handlers
  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.length === filteredGroups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(filteredGroups.map((g) => g.id));
    }
  };

  const handleToggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const isGroupsTab = activeTab === 'groups';
  const currentSelectionCount = isGroupsTab ? selectedGroupIds.length : selectedUserIds.length;
  const currentTotalFound = isGroupsTab ? filteredGroups.length : filteredUsers.length;
  const currentSearch = isGroupsTab ? groupSearch : userSearch;

  const formatEnrolled = (value: string) => {
    if (value === ENROLLED_MARKER) return t('ENROL_LEARNING_PATH.ENROLLED');
    if (value === N_USERS_MARKER) return t('ENROL_LEARNING_PATH.N_USERS');
    return value;
  };

  const handleSearchChange = (value: string) => {
    if (isGroupsTab) setGroupSearch(value);
    else setUserSearch(value);
  };

  const handleEnrol = () => {
    const count = currentSelectionCount;
    setFeedbackMessage(
      t(`ENROL_LEARNING_PATH.SUCCESS_${getCountSuffix(activeTab, count)}`, { count, title: pathTitle })
    );
    if (onEnrolSuccess) {
      onEnrolSuccess(count, activeTab);
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderLoader = () => (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={28} sx={{ color: 'primary.main' }} />
    </Box>
  );

  const renderGroupsTable = () => (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow sx={{ backgroundColor: NEUTRAL.canvas }}>
          <TableCell padding="checkbox" sx={{ backgroundColor: NEUTRAL.canvas }}>
            <Checkbox
              size="small"
              checked={filteredGroups.length > 0 && selectedGroupIds.length === filteredGroups.length}
              indeterminate={selectedGroupIds.length > 0 && selectedGroupIds.length < filteredGroups.length}
              onChange={handleSelectAllGroups}
              sx={CHECKBOX_SX}
            />
          </TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.GROUP')}</TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.MEMBERS')}</TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.ALREADY_ENROLLED')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredGroups.map((g) => {
          const isSelected = selectedGroupIds.includes(g.id);
          return (
            <TableRow
              key={g.id}
              hover
              onClick={() => handleToggleGroup(g.id)}
              sx={{ cursor: 'pointer', backgroundColor: isSelected ? BRAND.primarySoft : 'inherit' }}
            >
              <TableCell padding="checkbox">
                <Checkbox size="small" checked={isSelected} sx={CHECKBOX_SX} />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: NEUTRAL.ink }}>{g.name}</TableCell>
              <TableCell sx={MUTED_CELL_SX}>{g.members}</TableCell>
              <TableCell sx={MUTED_CELL_SX}>{formatEnrolled(g.alreadyEnrolled)}</TableCell>
            </TableRow>
          );
        })}
        {filteredGroups.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} align="center" sx={EMPTY_CELL_SX}>
              {t('ENROL_LEARNING_PATH.NO_GROUPS')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderUsersTable = () => (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow sx={{ backgroundColor: NEUTRAL.canvas }}>
          <TableCell padding="checkbox" sx={{ backgroundColor: NEUTRAL.canvas }}>
            <Checkbox
              size="small"
              checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
              indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length}
              onChange={handleSelectAllUsers}
              sx={CHECKBOX_SX}
            />
          </TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.USER')}</TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.ROLE')}</TableCell>
          <TableCell sx={HEADER_CELL_SX}>{t('ENROL_LEARNING_PATH.COLUMNS.ALREADY_ENROLLED')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredUsers.map((u) => {
          const isSelected = selectedUserIds.includes(u.id);
          return (
            <TableRow
              key={u.id}
              hover
              onClick={() => handleToggleUser(u.id)}
              sx={{ cursor: 'pointer', backgroundColor: isSelected ? BRAND.primarySoft : 'inherit' }}
            >
              <TableCell padding="checkbox">
                <Checkbox size="small" checked={isSelected} sx={CHECKBOX_SX} />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '13px', color: NEUTRAL.ink }}>{u.name}</Typography>
                  <Typography variant="caption" sx={{ color: NEUTRAL.muted, fontSize: '11px' }}>
                    {u.email}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={u.role}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    fontWeight: 500,
                    height: 20,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                  }}
                />
              </TableCell>
              <TableCell sx={MUTED_CELL_SX}>{formatEnrolled(u.alreadyEnrolled)}</TableCell>
            </TableRow>
          );
        })}
        {filteredUsers.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} align="center" sx={EMPTY_CELL_SX}>
              {t('ENROL_LEARNING_PATH.NO_USERS')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderTableContent = () => {
    if (isGroupsTab) return loadingGroups ? renderLoader() : renderGroupsTable();
    return loadingUsers ? renderLoader() : renderUsersTable();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 1.5,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: NEUTRAL.ink, fontSize: '19px' }}>
              {t('ENROL_LEARNING_PATH.TITLE', { title: pathTitle })}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: NEUTRAL.muted, fontSize: '13px' }}>
            {t('ENROL_LEARNING_PATH.SUBTITLE')}
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label={t('COMMON.CLOSE')} sx={{ color: '#3D3B37' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs Row */}
      <Box sx={{ px: 3, borderBottom: `1px solid ${NEUTRAL.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: NEUTRAL.muted,
              px: 2,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab value="groups" label={t('ENROL_LEARNING_PATH.TAB_GROUPS')} />
          <Tab value="users" label={t('ENROL_LEARNING_PATH.TAB_USERS')} />
        </Tabs>
      </Box>

      {/* Dialog Body */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {feedbackMessage && (
          <Alert severity="success" sx={{ mb: 1 }}>
            {feedbackMessage}
          </Alert>
        )}

        {/* Search Input */}
        <CommonTextField
          placeholder={
            isGroupsTab ? t('ENROL_LEARNING_PATH.SEARCH_GROUPS') : t('ENROL_LEARNING_PATH.SEARCH_USERS')
          }
          value={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: NEUTRAL.subtle, fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: currentSearch ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t('COMMON.CLEAR')}
                  onClick={() => handleSearchChange('')}
                >
                  <ClearIcon fontSize="small" sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Counter Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: NEUTRAL.muted }}>
          <Typography variant="body2" sx={{ color: NEUTRAL.muted, fontSize: '13px' }}>
            {t('ENROL_LEARNING_PATH.FOUND', { count: currentTotalFound })} ·{' '}
            <strong style={{ color: NEUTRAL.ink }}>
              {t('ENROL_LEARNING_PATH.SELECTED', { count: currentSelectionCount })}
            </strong>
          </Typography>
        </Box>

        {/* Table Container */}
        <TableContainer
          sx={{
            border: `1px solid ${NEUTRAL.border}`,
            borderRadius: '8px',
            maxHeight: 340,
            overflowY: 'auto',
          }}
        >
          {renderTableContent()}
        </TableContainer>

        {/* Footer Hint */}
        <Typography variant="caption" sx={{ color: NEUTRAL.muted, fontSize: '12px' }}>
          {t('ENROL_LEARNING_PATH.DATES_HINT')}
        </Typography>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${NEUTRAL.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.2,
        }}
      >
        <CommonButton variant="outlined" onClick={onClose}>
          {t('COMMON.CANCEL')}
        </CommonButton>

        <CommonButton variant="primary" onClick={handleEnrol} disabled={currentSelectionCount === 0}>
          {t(`ENROL_LEARNING_PATH.ENROL_${getCountSuffix(activeTab, currentSelectionCount)}`, {
            count: currentSelectionCount,
          })}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
};

export default EnrolLearningPathModal;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
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
import { getCohortSearch, getCohortMemberList } from '@/services/CohortService';
import { getUserList } from '@/services/UserService';
import TenantService from '@/services/TenantService';
import { SWADHAAR_TENANT_ID } from '@/utils/app.constant';

interface EnrolLearningPathModalProps {
  open: boolean;
  onClose: () => void;
  learningPathTitle?: string;
  onEnrolSuccess?: (count: number, type: 'groups' | 'users') => void;
}

export const EnrolLearningPathModal: React.FC<EnrolLearningPathModalProps> = ({
  open,
  onClose,
  learningPathTitle = 'Financial Inclusion Training Programme',
  onEnrolSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');

  // Groups state
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(['group-a', 'group-b']);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
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
        const enriched = rawList.map((g: any, idx: number) => ({
          id: g.cohortId || `group-${idx}`,
          name: g.name || `[Group ${String.fromCharCode(65 + idx)}]`,
          members: '[N]',
          alreadyEnrolled: idx === 1 ? '[N] users' : '—',
        }));
        setGroups(enriched);
      } else {
        // Prototype fallback groups
        setGroups([
          { id: 'group-a', name: '[Group A]', members: '[N]', alreadyEnrolled: '—' },
          { id: 'group-b', name: '[Group B]', members: '[N]', alreadyEnrolled: '[N] users' },
          { id: 'group-c', name: '[Group C]', members: '[N]', alreadyEnrolled: '—' },
          { id: 'group-d', name: '[Trainer Cohort 2026]', members: '18', alreadyEnrolled: '—' },
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch live groups, using fallback data:', err);
      setGroups([
        { id: 'group-a', name: '[Group A]', members: '[N]', alreadyEnrolled: '—' },
        { id: 'group-b', name: '[Group B]', members: '[N]', alreadyEnrolled: '[N] users' },
        { id: 'group-c', name: '[Group C]', members: '[N]', alreadyEnrolled: '—' },
        { id: 'group-d', name: '[Trainer Cohort 2026]', members: '18', alreadyEnrolled: '—' },
      ]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

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
        const mapped = rawUsers.map((u: any, idx: number) => {
          const fn = u.firstName || '';
          const ln = u.lastName || '';
          const name = u.name || [fn, ln].filter(Boolean).join(' ') || u.username || `User ${idx + 1}`;
          const role = u.role || u.tenantData?.[0]?.roleName || 'Trainer';
          return {
            id: u.userId || u.id || `user-${idx}`,
            name,
            email: u.email && u.email !== '-' ? u.email : u.username || '—',
            role,
            alreadyEnrolled: idx === 0 ? 'Enrolled' : '—',
          };
        });
        setUsers(mapped);
      } else {
        setUsers([
          { id: 'u-1', name: 'Aman Sharma', email: 'aman@swadhaar.org', role: 'Trainer', alreadyEnrolled: 'Enrolled' },
          { id: 'u-2', name: 'Pooja Verma', email: 'pooja.v@swadhaar.org', role: 'DI', alreadyEnrolled: '—' },
          { id: 'u-3', name: 'Rajesh Patil', email: 'rajesh.p@swadhaar.org', role: 'ARM', alreadyEnrolled: '—' },
          { id: 'u-4', name: 'Sunita Gaikwad', email: 'sunita.g@swadhaar.org', role: 'Trainer', alreadyEnrolled: '—' },
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch live users, using fallback:', err);
      setUsers([
        { id: 'u-1', name: 'Aman Sharma', email: 'aman@swadhaar.org', role: 'Trainer', alreadyEnrolled: 'Enrolled' },
        { id: 'u-2', name: 'Pooja Verma', email: 'pooja.v@swadhaar.org', role: 'DI', alreadyEnrolled: '—' },
        { id: 'u-3', name: 'Rajesh Patil', email: 'rajesh.p@swadhaar.org', role: 'ARM', alreadyEnrolled: '—' },
        { id: 'u-4', name: 'Sunita Gaikwad', email: 'sunita.g@swadhaar.org', role: 'Trainer', alreadyEnrolled: '—' },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

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

  const currentSelectionCount = activeTab === 'groups' ? selectedGroupIds.length : selectedUserIds.length;
  const currentTotalFound = activeTab === 'groups' ? filteredGroups.length : filteredUsers.length;

  const handleEnrol = () => {
    const count = currentSelectionCount;
    setFeedbackMessage(
      `Successfully enrolled ${count} ${activeTab === 'groups' ? (count === 1 ? 'group' : 'groups') : count === 1 ? 'user' : 'users'
      } in ${learningPathTitle}!`
    );
    if (onEnrolSuccess) {
      onEnrolSuccess(count, activeTab);
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Dialog Header matching Image 3 */}
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F1E1C', fontSize: '19px' }}>
              Enrol in {learningPathTitle}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
            Enrol whole groups or individual users.
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#3D3B37' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs Row */}
      <Box sx={{ px: 3, borderBottom: '1px solid #ECEAE5' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              backgroundColor: '#E6873C',
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#6B6862',
              px: 2,
              '&.Mui-selected': {
                color: '#E6873C',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab value="groups" label="Groups" />
          <Tab value="users" label="Users" />
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
        <TextField
          fullWidth
          size="small"
          placeholder={activeTab === 'groups' ? 'Search groups' : 'Search users by name or email'}
          value={activeTab === 'groups' ? groupSearch : userSearch}
          onChange={(e) => {
            if (activeTab === 'groups') setGroupSearch(e.target.value);
            else setUserSearch(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8A867F', fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: (activeTab === 'groups' ? groupSearch : userSearch) ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (activeTab === 'groups') setGroupSearch('');
                    else setUserSearch('');
                  }}
                >
                  <ClearIcon fontSize="small" sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              '& fieldset': { borderColor: '#D6D3CC' },
              '&:hover fieldset': { borderColor: '#E6873C' },
              '&.Mui-focused fieldset': { borderColor: '#E6873C' },
            },
          }}
        />

        {/* Counter Info matching Image 3 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6B6862' }}>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
            Found: {currentTotalFound} ·{' '}
            <strong style={{ color: '#1F1E1C' }}>Selected: {currentSelectionCount}</strong>
          </Typography>
        </Box>

        {/* Table Container */}
        <TableContainer
          sx={{
            border: '1px solid #D6D3CC',
            borderRadius: '8px',
            maxHeight: 340,
            overflowY: 'auto',
          }}
        >
          {activeTab === 'groups' ? (
            loadingGroups ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} sx={{ color: '#E6873C' }} />
              </Box>
            ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#FAF9F6' }}>
                    <TableCell padding="checkbox" sx={{ backgroundColor: '#FAF9F6' }}>
                      <Checkbox
                        size="small"
                        checked={
                          filteredGroups.length > 0 &&
                          selectedGroupIds.length === filteredGroups.length
                        }
                        indeterminate={
                          selectedGroupIds.length > 0 &&
                          selectedGroupIds.length < filteredGroups.length
                        }
                        onChange={handleSelectAllGroups}
                        sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                      GROUP
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                      MEMBERS
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                      ALREADY ENROLLED
                    </TableCell>
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
                        sx={{ cursor: 'pointer', backgroundColor: isSelected ? '#FDF3E9' : 'inherit' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#1F1E1C' }}>
                          {g.name}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#6B6862' }}>
                          {g.members}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#6B6862' }}>
                          {g.alreadyEnrolled}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredGroups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#6B6862' }}>
                        No groups found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )
          ) : loadingUsers ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} sx={{ color: '#E6873C' }} />
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#FAF9F6' }}>
                  <TableCell padding="checkbox" sx={{ backgroundColor: '#FAF9F6' }}>
                    <Checkbox
                      size="small"
                      checked={
                        filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                      }
                      indeterminate={
                        selectedUserIds.length > 0 &&
                        selectedUserIds.length < filteredUsers.length
                      }
                      onChange={handleSelectAllUsers}
                      sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                    USER
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                    ROLE
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#FAF9F6', fontWeight: 600, fontSize: '12px', color: '#6B6862' }}>
                    ALREADY ENROLLED
                  </TableCell>
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
                      sx={{ cursor: 'pointer', backgroundColor: isSelected ? '#FDF3E9' : 'inherit' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1F1E1C' }}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '11px' }}>
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
                      <TableCell sx={{ fontSize: '13px', color: '#6B6862' }}>
                        {u.alreadyEnrolled}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#6B6862' }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Footer Hint matching Image 3 */}
        <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px' }}>
          Dates come from the learning path (start, end, completion deadline).
        </Typography>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #ECEAE5',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: '#D6D3CC',
            color: '#1F1E1C',
            fontWeight: 600,
            fontSize: '13px',
            textTransform: 'none',
            borderRadius: '6px',
            height: 38,
            '&:hover': { borderColor: '#E6873C', backgroundColor: '#FDF3E9' },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleEnrol}
          disabled={currentSelectionCount === 0}
          sx={{
            backgroundColor: '#E6873C',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            textTransform: 'none',
            borderRadius: '6px',
            height: 38,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#C66C23', boxShadow: 'none' },
            '&.Mui-disabled': {
              backgroundColor: '#E2DFD8',
              color: '#8A867F',
            },
          }}
        >
          Enrol {currentSelectionCount}{' '}
          {activeTab === 'groups'
            ? currentSelectionCount === 1
              ? 'group'
              : 'groups'
            : currentSelectionCount === 1
              ? 'user'
              : 'users'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrolLearningPathModal;

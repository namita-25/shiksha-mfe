import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SDBVHierarchyFilter, { SDBVFilterValues } from '@/components/common/SDBVHierarchyFilter';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import LifecycleChip from '@/components/common/LifecycleChip';
import CommonDialog from '@/components/common/CommonDialog';
import EditCohortModal from '@/components/common/EditCohortModal';
import {
  getCohortSearch,
  deleteCohort,
} from '@/services/CohortService';

export interface CohortItem {
  id: string;
  cohortId: string;
  name: string;
  branch: string;
  location: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  membersCount: number;
  contentCount: number;
  trainer: string;
  status: 'Active' | 'Draft' | 'Archived';
  startDate: string;
  rawCohort?: any;
}

const extractLocation = (customFields?: any[]) => {
  let state = '';
  let district = '';
  let block = '';
  let village = '';

  if (Array.isArray(customFields)) {
    for (const cf of customFields) {
      const label = (cf.label || cf.name || '').toLowerCase();
      const val = cf.selectedValues?.[0]?.value || cf.value?.[0] || cf.value || '';
      if (typeof val === 'string') {
        if (label === 'state') state = val;
        else if (label === 'district' || label === 'city') district = val;
        else if (label === 'block' || label === 'branch') block = val;
        else if (label === 'village') village = val;
      }
    }
  }

  const parts = [block, district, state].filter(Boolean);
  const locationSummary = parts.length > 0 ? parts.join(' · ') : (state || district || '-');

  return { state, district, block, village, locationSummary };
};

export default function CohortsPage() {
  const router = useRouter();
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal & Action states
  const [editingCohort, setEditingCohort] = useState<CohortItem | null>(null);
  const [deletingCohort, setDeletingCohort] = useState<CohortItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Common Hierarchy & Search Filter State
  const [filters, setFilters] = useState<SDBVFilterValues>({
    search: '',
    status: 'all',
    state: 'all',
    district: 'all',
    block: 'all',
    branch: 'all',
    village: 'all',
    program: 'all',
  });

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        sort: ['updatedAt', 'desc'],
        filters: {
          start_year: '2026',
          status:
            filters.status && filters.status !== 'all'
              ? [filters.status.toLowerCase()]
              : ['active', 'draft', 'archived'],
        },
      };

      const response = await getCohortSearch(payload);
      const rawCohortDetails = response?.result?.results?.cohortDetails || [];
      const total = response?.result?.count ?? rawCohortDetails.length;
      setTotalCount(total);

      const enrichedCohorts: CohortItem[] = rawCohortDetails.map((cohort: any) => {
        const cid = cohort.cohortId;
        const loc = extractLocation(cohort.customFields);

        const rawStatus = (cohort.status || 'active').toLowerCase();
        const displayStatus: 'Active' | 'Draft' | 'Archived' =
          rawStatus === 'draft' ? 'Draft' : rawStatus === 'archived' ? 'Archived' : 'Active';

        const formattedDate = cohort.cohort_startDate
          ? new Date(cohort.cohort_startDate).toISOString().split('T')[0]
          : cohort.createdAt
          ? new Date(cohort.createdAt).toISOString().split('T')[0]
          : '-';

        return {
          id: cid,
          cohortId: cid,
          name: cohort.name || 'Untitled Group',
          branch: loc.block || loc.district || '-',
          location: loc.locationSummary,
          state: loc.state,
          district: loc.district,
          block: loc.block,
          village: loc.village,
          membersCount: cohort.youthCount ?? 0,
          contentCount: cohort.isFormCreated ? 1 : 0,
          trainer: '-',
          status: displayStatus,
          startDate: formattedDate,
          rawCohort: cohort,
        };
      });

      setCohorts(enrichedCohorts);
    } catch (err) {
      console.error('Failed to fetch cohorts:', err);
      setCohorts([]);
      setTotalCount(0);
      setFetchError('Failed to load cohorts from the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, filters.status]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  // Client-side search and filtering across loaded cohorts
  const displayedCohorts = useMemo(() => {
    return cohorts.filter((cohort) => {
      // 1. Text search
      if (filters.search?.trim()) {
        const term = filters.search.toLowerCase().trim();
        const matchesName = cohort.name.toLowerCase().includes(term);
        const matchesBranch = cohort.branch.toLowerCase().includes(term);
        const matchesTrainer = cohort.trainer.toLowerCase().includes(term);
        const matchesLocation = cohort.location.toLowerCase().includes(term);
        if (!matchesName && !matchesBranch && !matchesTrainer && !matchesLocation) {
          return false;
        }
      }
      // 2. State filter
      if (filters.state && filters.state !== 'all') {
        const s = filters.state.toLowerCase();
        if (cohort.state?.toLowerCase() !== s && !cohort.location.toLowerCase().includes(s)) {
          return false;
        }
      }
      // 3. District filter
      if (filters.district && filters.district !== 'all') {
        const d = filters.district.toLowerCase();
        if (cohort.district?.toLowerCase() !== d && !cohort.location.toLowerCase().includes(d)) {
          return false;
        }
      }
      // 4. Branch / Block filter
      const branchFilter = filters.branch || filters.block;
      if (branchFilter && branchFilter !== 'all') {
        const b = branchFilter.toLowerCase();
        if (
          cohort.block?.toLowerCase() !== b &&
          cohort.branch?.toLowerCase() !== b &&
          !cohort.location.toLowerCase().includes(b)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [cohorts, filters]);

  const handleConfirmDelete = async () => {
    if (!deletingCohort) return;
    setDeleteLoading(true);
    try {
      await deleteCohort(deletingCohort.cohortId);
      setFeedback({
        open: true,
        message: `Group "${deletingCohort.name}" archived successfully.`,
        severity: 'success',
      });
      setDeletingCohort(null);
      fetchCohorts();
    } catch (err: any) {
      setFeedback({
        open: true,
        message: err?.response?.data?.message || err?.message || 'Failed to archive group.',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: ColumnDef<CohortItem>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'GROUP / COHORT NAME',
        sortable: true,
        render: (row) => (
          <Box
            sx={{ cursor: 'pointer', display: 'inline-block' }}
            onClick={() => router.push(`/cohorts/${row.cohortId}`)}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '13.5px',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#B85D1B',
                },
              }}
            >
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '12px' }}>
              {row.location}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'membersCount',
        label: 'LEARNERS',
        sortable: true,
        render: (row) => (
          <Chip
            label={`${row.membersCount} Members`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              borderRadius: '12px',
              height: '24px',
            }}
          />
        ),
      },
      {
        id: 'contentCount',
        label: 'COURSES / CONTENT',
        sortable: true,
        render: (row) => (
          <Chip
            label={`${row.contentCount} ${row.contentCount === 1 ? 'Content' : 'Contents'}`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: '12px',
              height: '24px',
            }}
          />
        ),
      },
      {
        id: 'trainer',
        label: 'ASSIGNED TRAINER',
        render: (row) => (
          <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '13px' }}>
            {row.trainer}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'STATUS',
        sortable: true,
        render: (row) => <LifecycleChip state={row.status} />,
      },
      {
        id: 'startDate',
        label: 'START DATE',
        sortable: true,
        render: (row) => (
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '12px' }}>
            {row.startDate}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: '',
        align: 'right',
        render: (row) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title="Add members">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/cohorts/create?cohortId=${row.cohortId}&mode=addMembers`);
                }}
                sx={{ color: '#4B5563', '&:hover': { color: 'primary.main' } }}
              >
                <PersonAddOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Group">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCohort(row);
                }}
                sx={{ color: '#6B7280', '&:hover': { color: '#1F2937' } }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive / Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingCohort(row);
                }}
                sx={{ color: '#EF4444', '&:hover': { color: '#DC2626' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [router]
  );

  return (
    <Box sx={{ py: 1 }}>
      {/* 1. Header with Page Title and Create Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '24px' }}>
            Groups & Cohorts
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '13px', mt: 0.3 }}>
            Manage training batches, beneficiary groups, and field cohorts.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => router.push('/cohorts/create')}
          startIcon={<GroupAddOutlinedIcon />}
          sx={{
            backgroundColor: '#D4752A',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#B85D1A' },
          }}
        >
          Create Group
        </Button>
      </Box>

      {/* 2. Common Filter Component: SDBVHierarchyFilter */}
      <Box sx={{ mb: 2 }}>
        <SDBVHierarchyFilter
          values={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            setPage(0);
          }}
          showSearch={true}
          searchPlaceholder="Search by group name, location, or trainer..."
          showStatus={true}
          statusOptions={['active', 'draft', 'archived']}
          showBranch={true}
          showProgram={true}
          onClear={() => {
            setFilters({
              search: '',
              status: 'all',
              state: 'all',
              district: 'all',
              block: 'all',
              branch: 'all',
              village: 'all',
              program: 'all',
            });
            setPage(0);
          }}
        />
      </Box>

      {/* 3. Subtitle Row with Count */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          px: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '13px', fontWeight: 500 }}>
          Showing {totalCount > 0 ? page * rowsPerPage + 1 : 0}–
          {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} cohorts
        </Typography>
      </Box>

      {/* 4. Common Table Component: SwadhaarDataTable */}
      <SwadhaarDataTable<CohortItem>
        columns={columns}
        data={displayedCohorts}
        keyExtractor={(item) => item.id}
        loading={loading}
        error={fetchError}
        onRetry={fetchCohorts}
        hideToolbar={true}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
        emptyMessage="No cohorts or groups found matching the filter criteria."
      />

      {/* Edit Cohort Modal */}
      {editingCohort && (
        <EditCohortModal
          open={Boolean(editingCohort)}
          onClose={() => setEditingCohort(null)}
          onSuccess={() => {
            setFeedback({
              open: true,
              message: 'Group updated successfully.',
              severity: 'success',
            });
            fetchCohorts();
          }}
          cohort={editingCohort}
        />
      )}

      {/* Confirm Delete / Archive Dialog */}
      <CommonDialog
        open={Boolean(deletingCohort)}
        onClose={() => setDeletingCohort(null)}
        title="Archive Group"
        subtitle={`Are you sure you want to archive group "${deletingCohort?.name}"?`}
        confirmLabel={deleteLoading ? 'Archiving...' : 'Archive Group'}
        confirmVariant="error"
        confirmDisabled={deleteLoading}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      >
        <Typography sx={{ fontSize: '13.5px', color: '#4B5563' }}>
          This will set the group status to archived. Associated learners and historical progress will be preserved.
        </Typography>
      </CommonDialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
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

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'], nextI18NextConfig as any)),
    },
  };
};

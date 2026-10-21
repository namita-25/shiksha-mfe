import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SDBVHierarchyFilter, { SDBVFilterValues } from '@/components/common/SDBVHierarchyFilter';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import LifecycleChip from '@/components/common/LifecycleChip';
import TenantService from '@/services/TenantService';
import { SWADHAAR_TENANT_ID } from '@/utils/app.constant';
import {
  getCohortSearch,
  getCohortMemberList,
  getCohortContentSearch,
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
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
              : ['active'],
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
        render: (_row) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title="Edit Group">
              <IconButton size="small" sx={{ color: '#6B7280', '&:hover': { color: '#1F2937' } }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton size="small" sx={{ color: '#EF4444', '&:hover': { color: '#DC2626' } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
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

import React, { useState } from 'react';
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

interface CohortItem {
  id: string;
  name: string;
  branch: string;
  membersCount: number;
  trainer: string;
  status: 'Active' | 'Draft' | 'Archived';
  startDate: string;
}

const mockCohorts: CohortItem[] = [
  {
    id: 'grp-01',
    name: 'Pune Batch A - Financial Literacy',
    branch: 'Haveli Branch',
    membersCount: 28,
    trainer: 'Ramesh Patil',
    status: 'Active',
    startDate: '2026-03-01',
  },
  {
    id: 'grp-02',
    name: 'Nagpur Rural Women Empowerment',
    branch: 'Kamptee Branch',
    membersCount: 35,
    trainer: 'Sunita Gaikwad',
    status: 'Active',
    startDate: '2026-03-10',
  },
  {
    id: 'grp-03',
    name: 'Nashik Agri-Micro Finance 2026',
    branch: 'Dindori Branch',
    membersCount: 22,
    trainer: 'Vijay Kadam',
    status: 'Draft',
    startDate: '2026-04-01',
  },
];

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<CohortItem[]>(mockCohorts);
  const [filters, setFilters] = useState<SDBVFilterValues>({
    state: '',
    district: '',
    block: '',
    village: '',
    program: '',
  });

  const columns: ColumnDef<CohortItem>[] = [
    {
      id: 'name',
      label: 'Group / Cohort Name',
      sortable: true,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.branch}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'membersCount',
      label: 'Learners',
      sortable: true,
      render: (row) => (
        <Chip
          label={`${row.membersCount} Members`}
          size="small"
          sx={{ fontWeight: 600, fontSize: '11px', backgroundColor: '#F3F4F6' }}
        />
      ),
    },
    {
      id: 'trainer',
      label: 'Assigned Trainer',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
          {row.trainer}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <LifecycleChip state={row.status} />,
    },
    {
      id: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
          {row.startDate}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Group">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive">
            <IconButton size="small" sx={{ color: 'error.main' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
            Groups & Cohorts
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mt: 0.3 }}>
            Manage training batches, beneficiary groups, and field cohorts
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<GroupAddOutlinedIcon />}
          sx={{
            backgroundColor: '#E6873C',
            color: '#FFFFFF',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            '&:hover': { backgroundColor: '#D4752A' },
          }}
        >
          Create Group
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SDBVHierarchyFilter
          values={filters}
          onChange={setFilters}
        />
      </Box>

      <SwadhaarDataTable<CohortItem>
        columns={columns}
        data={cohorts}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by group name, branch, or trainer..."
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

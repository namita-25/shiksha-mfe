import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../../next-i18next.config.js';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import LifecycleChip from '@/components/common/LifecycleChip';

interface CourseItem {
  id: string;
  title: string;
  category: string;
  modulesCount: number;
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
}

const mockCourses: CourseItem[] = [
  {
    id: 'crs-01',
    title: 'Financial Basics for Rural Entrepreneurs',
    category: 'Financial Literacy',
    modulesCount: 6,
    status: 'Active',
    lastUpdated: '2026-03-10',
  },
  {
    id: 'crs-02',
    title: 'Digital Payments & UPI Security',
    category: 'Digital Banking',
    modulesCount: 4,
    status: 'Active',
    lastUpdated: '2026-03-18',
  },
  {
    id: 'crs-03',
    title: 'Micro-enterprise Bookkeeping & Cash Flow',
    category: 'Business Planning',
    modulesCount: 8,
    status: 'Draft',
    lastUpdated: '2026-03-22',
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>(mockCourses);

  const columns: ColumnDef<CourseItem>[] = [
    {
      id: 'title',
      label: 'Course Title',
      sortable: true,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {row.title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.category}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'modulesCount',
      label: 'Modules',
      sortable: true,
      render: (row) => (
        <Chip
          label={`${row.modulesCount} Modules`}
          size="small"
          sx={{ fontWeight: 600, fontSize: '11px', backgroundColor: '#F3F4F6' }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <LifecycleChip state={row.status} />,
    },
    {
      id: 'lastUpdated',
      label: 'Updated',
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
          {row.lastUpdated}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Course">
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
            Courses
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mt: 0.3 }}>
            Manage curriculum, lessons, question sets, and certifications
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            backgroundColor: '#E6873C',
            color: '#FFFFFF',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            '&:hover': { backgroundColor: '#D4752A' },
          }}
        >
          Create Course
        </Button>
      </Box>

      <SwadhaarDataTable<CourseItem>
        columns={columns}
        data={courses}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search courses by title or category..."
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

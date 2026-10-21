import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Alert,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import { getCourseList, CourseItem } from '@/services/CourseService';
import EnrolLearningPathModal from '@/components/common/EnrolLearningPathModal';

export interface LearningPathItem {
  id: string;
  name: string;
  codeRange?: string;
  steps: string;
  enrolled: string;
  startDate: string;
  endDate: string;
  certificate: string;
  coursesCount?: number;
}

export default function LearningPathsListPage() {
  const router = useRouter();

  const [learningPaths, setLearningPaths] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Enrol modal state
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState<boolean>(false);
  const [activePathTitle, setActivePathTitle] = useState<string>('Financial Inclusion Training Programme');

  // Fetch courses from composite search API to build pathways
  const fetchLearningPaths = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseList({
        limit: 20,
        filters: {
          primaryCategory: ['Course'],
        },
      });

      const courses: CourseItem[] = response.content || [];
      const totalCourses = courses.length || 7;

      // 1. Primary flagship learning path as specified in the prototype (Financial Inclusion Training Programme)
      const primaryPath: LearningPathItem = {
        id: 'financial-inclusion-training-programme',
        name: 'Financial Inclusion Training Programme',
        codeRange: `Courses 0 → ${Math.max(courses.length - 1, 6)}`,
        steps: `${totalCourses} courses + assessments`,
        enrolled: '[N] groups · [N] users',
        startDate: '01 Nov 2026',
        endDate: '31 Dec 2026',
        certificate: 'On completion',
        coursesCount: totalCourses,
      };

      // 2. Additional tracks derived from live Sunbird courses
      const otherPaths: LearningPathItem[] = courses.slice(0, 2).map((c, idx) => ({
        id: c.identifier || `path-${idx}`,
        name: `${c.cleanTitle || c.name} Track`,
        codeRange: c.courseCode || `Module ${idx + 1}`,
        steps: `${c.leafNodesCount || 4} sections + assessment`,
        enrolled: idx === 0 ? '[N] groups' : '[N] users',
        startDate: '[date]',
        endDate: '[date]',
        certificate: idx === 0 ? 'On completion' : '[—]',
        coursesCount: 1,
      }));

      setLearningPaths([primaryPath, ...otherPaths]);
    } catch (err: any) {
      console.error('Error fetching courses for learning paths:', err);
      setError('Unable to load live course data. Showing default learning paths.');
      setLearningPaths([
        {
          id: 'financial-inclusion-training-programme',
          name: 'Financial Inclusion Training Programme',
          codeRange: 'Courses 0 → 6',
          steps: '7 courses + assessments',
          enrolled: '[N] groups · [N] users',
          startDate: '[date]',
          endDate: '[date]',
          certificate: 'On completion',
          coursesCount: 7,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLearningPaths();
  }, [fetchLearningPaths]);

  const handleOpenEnrol = (path: LearningPathItem) => {
    setActivePathTitle(path.name);
    setIsEnrolModalOpen(true);
  };

  // Table Columns matching Prototype Image 1 (#scr-paths)
  const columns: ColumnDef<LearningPathItem>[] = [
    {
      id: 'name',
      label: 'Learning path',
      sortable: true,
      minWidth: 320,
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Link
            href={`/learning-paths/builder?id=${row.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                color: '#1F1E1C',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': {
                  color: '#E6873C',
                  textDecoration: 'underline',
                },
              }}
            >
              {row.name}
            </Typography>
          </Link>
          {row.codeRange && (
            <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px' }}>
              {row.codeRange}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'steps',
      label: 'Steps',
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.steps}
        </Typography>
      ),
    },
    {
      id: 'enrolled',
      label: 'Enrolled',
      minWidth: 160,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.enrolled}
        </Typography>
      ),
    },
    {
      id: 'dates',
      label: 'Start – end',
      minWidth: 160,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
          {row.startDate} – {row.endDate}
        </Typography>
      ),
    },
    {
      id: 'certificate',
      label: 'Certificate',
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.certificate}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 140,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
          {/* Right Arrow: Open Sequence Page */}
          <Tooltip title="Open sequence & prerequisites">
            <IconButton
              size="small"
              onClick={() => router.push(`/learning-paths/builder?id=${row.id}`)}
              sx={{
                color: '#1F1E1C',
                border: '1px solid #D6D3CC',
                borderRadius: '6px',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#FDF3E9',
                  borderColor: '#E6873C',
                  color: '#E6873C',
                },
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Enrol button: Open Enrol Dialog */}
          <Tooltip title="Enrol users or groups">
            <IconButton
              size="small"
              onClick={() => handleOpenEnrol(row)}
              sx={{
                color: '#1F1E1C',
                border: '1px solid #D6D3CC',
                borderRadius: '6px',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#FDF3E9',
                  borderColor: '#E6873C',
                  color: '#E6873C',
                },
              }}
            >
              <PersonAddAlt1OutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 1 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
          Learning
        </Typography>
        <Typography variant="body2" sx={{ color: '#8A867F', fontSize: '13px' }}>
          /
        </Typography>
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px', fontWeight: 600 }}>
          Learning paths
        </Typography>
      </Box>

      {/* Header & Create CTA */}
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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F1E1C', fontSize: '26px' }}>
              Learning paths
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#E0E7FF',
                color: '#1E3A8A',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                px: 1,
                py: 0.2,
              }}
            >
              BRD §10
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '14px' }}>
            Sequence courses and assessments, set dates and certificates, and enrol users or groups.
          </Typography>
        </Box>

        <Button
          variant="contained"
          // startIcon={<AddCircleOutlineIcon />}
          onClick={() => router.push('/learning-paths/builder')}
          sx={{
            backgroundColor: '#E6873C',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            textTransform: 'none',
            borderRadius: '6px',
            height: 38,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#C66C23',
              boxShadow: 'none',
            },
          }}
        >
          Create learning path
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Swadhaar Data Table */}
      <SwadhaarDataTable<LearningPathItem>
        columns={columns}
        data={learningPaths}
        keyExtractor={(item) => item.id}
        loading={loading}
        hideToolbar={true}
        emptyMessage="No learning paths found."
      />

      {/* Enrol Dialog */}
      <EnrolLearningPathModal
        open={isEnrolModalOpen}
        onClose={() => setIsEnrolModalOpen(false)}
        learningPathTitle={activePathTitle}
        onEnrolSuccess={(count, type) => {
          setLearningPaths((prev) =>
            prev.map((item) =>
              item.name === activePathTitle
                ? {
                  ...item,
                  enrolled:
                    type === 'groups'
                      ? `${count} groups · [N] users`
                      : `[N] groups · ${count} users`,
                }
                : item
            )
          );
        }}
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../../next-i18next.config.js';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import LifecycleChip from '@/components/common/LifecycleChip';
import {
  getCourseList,
  CourseItem,
  CourseSearchParams,
  CourseTabCounts,
  fetchCourseTabCounts,
} from '@/services/CourseService';

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tabCounts, setTabCounts] = useState<CourseTabCounts>({
    all: 50,
    published: 4,
    draft: 46,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Tab Filter ('all' | 'published' | 'draft')
  const [statusTab, setStatusTab] = useState<'all' | 'published' | 'draft'>('all');

  // Search & Language filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  // Server Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tab counts for All, Published, and Drafts
  useEffect(() => {
    fetchCourseTabCounts(debouncedSearch).then((counts) => {
      setTabCounts(counts);
    });
  }, [debouncedSearch]);

  // Fetch courses from Aspire LMS search API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine status filter based on active tab
      let statusParam: string | undefined = undefined;
      if (statusTab === 'published') {
        statusParam = 'published';
      } else if (statusTab === 'draft') {
        statusParam = 'unpublished';
      }

      const params: CourseSearchParams = {
        query: debouncedSearch.trim(),
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        status: statusParam,
      };

      const response = await getCourseList(params);
      let content = response.content || [];

      // Filter by language client-side if selected
      if (languageFilter !== 'all') {
        content = content.filter(
          (c) => c.detectedLanguage?.toLowerCase() === languageFilter.toLowerCase()
        );
      }

      setCourses(content);
      const activeCount = response.count !== undefined ? response.count : content.length;
      setTotalCount(activeCount);
      setTabCounts((prev) => ({
        ...prev,
        [statusTab]: activeCount,
      }));
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses from LMS server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusTab, debouncedSearch, languageFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleStatusTabChange = (_: React.SyntheticEvent, newValue: 'all' | 'published' | 'draft') => {
    setStatusTab(newValue);
    setPage(0);
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Table Columns matching Swadhaar_Admin_Prototype (2).html:
  // Course | Sections | Duration | Language | Status | Updated | Actions
  const columns: ColumnDef<CourseItem>[] = [
    {
      id: 'name',
      label: 'Course',
      sortable: true,
      minWidth: 320,
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          {row.courseCode && (
            <Typography
              variant="caption"
              sx={{ color: '#6B6862', fontSize: '12px', fontWeight: 500 }}
            >
              {row.courseCode}
            </Typography>
          )}
          <Link
            href={`/content/courses/${row.courseId || row.identifier}`}
            style={{ textDecoration: 'none' }}
          >
            <Typography
              variant="body2"
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
              {row.cleanTitle || row.title || row.name}
            </Typography>
          </Link>
        </Box>
      ),
    },
    {
      id: 'sections',
      label: 'Sections',
      sortable: true,
      minWidth: 100,
      render: (row) => {
        const count =
          row.moduleCount !== undefined
            ? `${row.moduleCount} modules`
            : (row.leafNodesCount !== undefined ? row.leafNodesCount : (row.childNodes?.length || '—'));
        return (
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F1E1C', fontSize: '13px' }}>
            {count}
          </Typography>
        );
      },
    },
    {
      id: 'duration',
      label: 'Duration',
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
          {row.enrolledUsersCount !== undefined ? `${row.enrolledUsersCount.toLocaleString()} enrolled` : (row.formattedDuration || '—')}
        </Typography>
      ),
    },
    {
      id: 'language',
      label: 'Language',
      minWidth: 110,
      render: (row) => (
        <Chip
          label={row.detectedLanguage || 'English'}
          size="small"
          sx={{
            fontWeight: 500,
            fontSize: '11px',
            backgroundColor: '#F3F4F6',
            color: '#374151',
            borderRadius: '4px',
            height: 22,
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      render: (row) => <LifecycleChip state={row.status || 'Live'} />,
    },
    {
      id: 'lastUpdatedOn',
      label: 'Updated',
      sortable: true,
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '12px' }}>
          {formatDate(row.lastUpdatedOn || row.createdOn)}
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
          <Tooltip title="Open Course Structure">
            <IconButton
              size="small"
              onClick={() => router.push(`/content/courses/${row.courseId || row.identifier}`)}
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

          <Tooltip title="Edit details">
            <IconButton
              size="small"
              onClick={() => router.push(`/content/courses/${row.courseId || row.identifier}`)}
              sx={{
                color: '#6B6862',
                border: '1px solid #D6D3CC',
                borderRadius: '6px',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  color: '#1F1E1C',
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 1 }}>
      {/* Page Title & Action Bar */}
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
              Courses
            </Typography>

          </Box>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '14px' }}>
            Courses from the Financial Inclusion Training Programme.
          </Typography>
        </Box>

        <Button
          variant="contained"
          // startIcon={<AddCircleOutlineIcon />}
          onClick={() => router.push('/content/courses/create')}
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
          + Create course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs and Toolbar Row matching Prototype */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid #D6D3CC',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Status Tabs */}
        <Tabs
          value={statusTab}
          onChange={handleStatusTabChange}
          textColor="inherit"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              backgroundColor: '#1F1E1C',
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#6B6862',
              px: 2,
              '&.Mui-selected': {
                color: '#1F1E1C',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab
            value="all"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>All</span>
                <Chip
                  label={tabCounts.all}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            }
          />
          <Tab
            value="published"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Published</span>
                <Chip
                  label={tabCounts.published}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            }
          />
          <Tab
            value="draft"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Drafts</span>
                <Chip
                  label={tabCounts.draft}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            }
          />
        </Tabs>

        {/* Search & Language Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          {/* Language Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setPage(0);
              }}
              displayEmpty
              sx={{
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                height: 36,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D6D3CC',
                },
              }}
            >
              <MenuItem value="all">All Languages</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="hindi">Hindi</MenuItem>
            </Select>
          </FormControl>

          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8A867F', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              width: 260,
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                height: 36,
                borderRadius: '6px',
                fontSize: '13px',
                '& fieldset': {
                  borderColor: '#D6D3CC',
                },
                '&:hover fieldset': {
                  borderColor: '#1F1E1C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E6873C',
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Swadhaar Data Table */}
      <SwadhaarDataTable<CourseItem>
        columns={columns}
        data={courses}
        keyExtractor={(item) => item.identifier}
        loading={loading}
        hideToolbar={true}
        emptyMessage="No courses found matching criteria"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
      />

      {/* Prototype Footer Note */}
      <Box sx={{ mt: 1.5, px: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '11px' }}>
          Titles, section counts and durations from the course document table of contents. Statuses are illustrative (Course 0 has sections “to be designed later”).
        </Typography>
      </Box>
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

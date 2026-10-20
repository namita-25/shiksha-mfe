import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Alert,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import LifecycleChip from '@/components/common/LifecycleChip';
import {
  searchContentLibrary,
  fetchContentTabCounts,
  ContentItem,
  ContentTabType,
  ContentTabCounts,
} from '@/services/ContentLibraryService';

export default function ContentLibraryPage() {
  const router = useRouter();
  const initialTab = (router.query.tab as ContentTabType) || 'videos';

  const [activeTab, setActiveTab] = useState<ContentTabType>(initialTab);
  const [assessmentSubTab, setAssessmentSubTab] = useState<'assessments' | 'questions' | 'results'>('assessments');

  const [tabCounts, setTabCounts] = useState<ContentTabCounts>({
    videos: 15,
    pdfs: 0,
    assessments: 87,
  });

  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sync tab with router query
  useEffect(() => {
    if (router.query.tab && (router.query.tab === 'videos' || router.query.tab === 'pdfs' || router.query.tab === 'assessments')) {
      setActiveTab(router.query.tab as ContentTabType);
    }
  }, [router.query.tab]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load counts once
  useEffect(() => {
    fetchContentTabCounts().then((counts) => {
      setTabCounts(counts);
    });
  }, []);

  // Fetch content for current active tab
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchContentLibrary({
        tab: activeTab,
        query: debouncedSearch.trim(),
        courseFilter,
        languageFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });

      setContentList(response.content || []);
      setTotalCount(response.count || 0);

      // Update current tab count
      setTabCounts((prev) => ({
        ...prev,
        [activeTab]: response.count !== undefined ? response.count : prev[activeTab],
      }));
    } catch (err) {
      console.error('Failed to fetch content library items:', err);
      setError('Unable to load items from Sunbird server. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, courseFilter, languageFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ContentTabType) => {
    setActiveTab(newValue);
    setPage(0);
    router.replace({ pathname: '/content', query: { tab: newValue } }, undefined, { shallow: true });
  };

  const handleDeleteItem = (id: string) => {
    setContentList((prev) => prev.filter((item) => item.identifier !== id));
  };

  // Columns for Videos and PDFs matching Prototype Image 1 with Swadhaar Theme
  const videoPdfColumns: ColumnDef<ContentItem>[] = [
    {
      id: 'name',
      label: activeTab === 'videos' ? 'Video' : 'Document',
      sortable: true,
      minWidth: 320,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 58,
              height: 34,
              borderRadius: '4px',
              backgroundColor: '#FDF3E9',
              border: '1px solid #FBE3CD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#E6873C',
              letterSpacing: '0.5px',
              flexShrink: 0,
            }}
          >
            {activeTab === 'videos' ? 'VIDEO' : 'PDF'}
          </Box>
          <Link
            href={
              activeTab === 'videos'
                ? `/content/create-video?id=${row.identifier}`
                : `/content/create-pdf?id=${row.identifier}`
            }
            style={{ textDecoration: 'none' }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1F1E1C',
                lineHeight: 1.35,
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
        </Box>
      ),
    },
    {
      id: 'duration',
      label: activeTab === 'videos' ? 'Duration' : 'Reading time',
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.formattedDuration || '—'}
        </Typography>
      ),
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.source || 'YouTube'}
        </Typography>
      ),
    },
    {
      id: 'usedIn',
      label: 'Used in',
      minWidth: 140,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.usedIn || 'Course 0 · 0.1'}
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
      minWidth: 110,
      render: (row) => <LifecycleChip state={row.status || 'Live'} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 110,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
          <Tooltip title="Edit content">
            <IconButton
              size="small"
              onClick={() => {
                if (activeTab === 'videos') {
                  router.push(`/content/create-video?id=${row.identifier}`);
                } else {
                  router.push(`/content/create-pdf?id=${row.identifier}`);
                }
              }}
              sx={{
                color: '#6B6862',
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
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteItem(row.identifier)}
              sx={{
                color: '#6B6862',
                border: '1px solid #D6D3CC',
                borderRadius: '6px',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#FEE2E2',
                  borderColor: '#BA1A1A',
                  color: '#BA1A1A',
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Columns for Assessments matching Prototype Image 5 with Swadhaar Theme
  const assessmentColumns: ColumnDef<ContentItem>[] = [
    {
      id: 'name',
      label: 'Assessment',
      sortable: true,
      minWidth: 320,
      render: (row) => (
        <Link
          href={`/content/assessments/${row.identifier}`}
          style={{ textDecoration: 'none' }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1F1E1C',
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
      ),
    },
    {
      id: 'linkedTo',
      label: 'Linked to',
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.linkedTo || 'Course 1'}
        </Typography>
      ),
    },
    {
      id: 'questions',
      label: 'Questions',
      minWidth: 90,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px', fontWeight: 600 }}>
          {row.questionsCount || 10}
        </Typography>
      ),
    },
    {
      id: 'passMark',
      label: 'Pass mark',
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.passMark || '70%'}
        </Typography>
      ),
    },
    {
      id: 'attempts',
      label: 'Attempts',
      minWidth: 90,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.attempts || 'Unlimited'}
        </Typography>
      ),
    },
    {
      id: 'timeLimit',
      label: 'Time limit',
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.timeLimit || '—'}
        </Typography>
      ),
    },
    {
      id: 'assignedTo',
      label: 'Assigned to',
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px' }}>
          {row.assignedTo || '[N] groups'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (row) => <LifecycleChip state={row.status || 'Live'} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 110,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
          <Tooltip title="Edit assessment">
            <IconButton
              size="small"
              onClick={() => router.push(`/content/assessments/${row.identifier}`)}
              sx={{
                color: '#6B6862',
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
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Results & Analytics">
            <IconButton
              size="small"
              onClick={() => alert(`Results for: ${row.name}`)}
              sx={{
                color: '#6B6862',
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
              <BarChartOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const currentColumns = activeTab === 'assessments' ? assessmentColumns : videoPdfColumns;
  const searchPlaceholder =
    activeTab === 'videos'
      ? 'Search videos'
      : activeTab === 'pdfs'
        ? 'Search PDFs'
        : 'Search assessments';

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
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
          Content library
        </Typography>
        <Typography variant="body2" sx={{ color: '#8A867F', fontSize: '13px' }}>
          /
        </Typography>
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px', fontWeight: 600 }}>
          {activeTab === 'videos' ? 'Videos' : activeTab === 'pdfs' ? 'PDFs' : 'Assessments'}
        </Typography>
      </Box>

      {/* Header & Create CTAs with Swadhaar Theme */}
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
              Content library
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '14px' }}>
            Reusable content. Add items to course sections from here or from the section editor.
          </Typography>
        </Box>

        {/* Create Options Group routing to Full Pages with Swadhaar Theme */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px', mr: 0.5 }}>
            Create
          </Typography>
          <Button
            variant={activeTab === 'videos' ? 'contained' : 'outlined'}
            onClick={() => router.push('/content/create-video')}
            sx={{
              backgroundColor: activeTab === 'videos' ? '#E6873C' : '#FFFFFF',
              color: activeTab === 'videos' ? '#FFFFFF' : '#E6873C',
              borderColor: '#E6873C',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              height: 38,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: activeTab === 'videos' ? '#C66C23' : '#FDF3E9',
                borderColor: '#C66C23',
                boxShadow: 'none',
              },
            }}
          >
            + Video
          </Button>

          <Button
            variant={activeTab === 'pdfs' ? 'contained' : 'outlined'}
            onClick={() => router.push('/content/create-pdf')}
            sx={{
              backgroundColor: activeTab === 'pdfs' ? '#E6873C' : '#FFFFFF',
              color: activeTab === 'pdfs' ? '#FFFFFF' : '#E6873C',
              borderColor: '#E6873C',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              height: 38,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: activeTab === 'pdfs' ? '#C66C23' : '#FDF3E9',
                borderColor: '#C66C23',
                boxShadow: 'none',
              },
            }}
          >
            + PDF
          </Button>

          <Button
            variant={activeTab === 'assessments' ? 'contained' : 'outlined'}
            onClick={() => router.push('/content/create-assessment')}
            sx={{
              backgroundColor: activeTab === 'assessments' ? '#E6873C' : '#FFFFFF',
              color: activeTab === 'assessments' ? '#FFFFFF' : '#E6873C',
              borderColor: '#E6873C',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              height: 38,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: activeTab === 'assessments' ? '#C66C23' : '#FDF3E9',
                borderColor: '#C66C23',
                boxShadow: 'none',
              },
            }}
          >
            + Assessment
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Tabs (Videos | PDFs | Assessments) with Swadhaar Orange Theme */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="inherit"
        sx={{
          minHeight: 44,
          borderBottom: '1px solid #D6D3CC',
          mb: activeTab === 'assessments' ? 1.5 : 2,
          '& .MuiTabs-indicator': {
            backgroundColor: '#E6873C',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            color: '#6B6862',
            px: 2,
            '&.Mui-selected': {
              color: '#E6873C',
              fontWeight: 600,
            },
            '&:hover': {
              color: '#E6873C',
            },
          },
        }}
      >
        <Tab
          value="videos"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Videos</span>
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'videos' ? '#FDF3E9' : '#F3F4F6',
                  color: activeTab === 'videos' ? '#E6873C' : '#6B6862',
                  transition: 'all 0.2s',
                }}
              >
                {tabCounts.videos}
              </Box>
            </Box>
          }
        />
        <Tab
          value="pdfs"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>PDFs</span>
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'pdfs' ? '#FDF3E9' : '#F3F4F6',
                  color: activeTab === 'pdfs' ? '#E6873C' : '#6B6862',
                  transition: 'all 0.2s',
                }}
              >
                {tabCounts.pdfs}
              </Box>
            </Box>
          }
        />
        <Tab
          value="assessments"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Assessments</span>
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'assessments' ? '#FDF3E9' : '#F3F4F6',
                  color: activeTab === 'assessments' ? '#E6873C' : '#6B6862',
                  transition: 'all 0.2s',
                }}
              >
                {tabCounts.assessments}
              </Box>
            </Box>
          }
        />
      </Tabs>

      {/* Sub-tabs if Assessments is active (matching Image 5 with Swadhaar Theme) */}
      {activeTab === 'assessments' && (
        <Box sx={{ display: 'flex', gap: 1, borderBottom: '1px solid #ECEAE5', mb: 2 }}>
          <Button
            size="small"
            onClick={() => setAssessmentSubTab('assessments')}
            sx={{
              textTransform: 'none',
              fontWeight: assessmentSubTab === 'assessments' ? 600 : 500,
              color: assessmentSubTab === 'assessments' ? '#E6873C' : '#6B6862',
              borderBottom: assessmentSubTab === 'assessments' ? '2px solid #E6873C' : '2px solid transparent',
              borderRadius: 0,
              pb: 1,
              '&:hover': { color: '#E6873C', backgroundColor: 'transparent' },
            }}
          >
            Assessments
          </Button>
          <Button
            size="small"
            onClick={() => setAssessmentSubTab('questions')}
            sx={{
              textTransform: 'none',
              fontWeight: assessmentSubTab === 'questions' ? 600 : 500,
              color: assessmentSubTab === 'questions' ? '#E6873C' : '#6B6862',
              borderBottom: assessmentSubTab === 'questions' ? '2px solid #E6873C' : '2px solid transparent',
              borderRadius: 0,
              pb: 1,
              '&:hover': { color: '#E6873C', backgroundColor: 'transparent' },
            }}
          >
            Question bank
          </Button>
          <Button
            size="small"
            onClick={() => setAssessmentSubTab('results')}
            sx={{
              textTransform: 'none',
              fontWeight: assessmentSubTab === 'results' ? 600 : 500,
              color: assessmentSubTab === 'results' ? '#E6873C' : '#6B6862',
              borderBottom: assessmentSubTab === 'results' ? '2px solid #E6873C' : '2px solid transparent',
              borderRadius: 0,
              pb: 1,
              '&:hover': { color: '#E6873C', backgroundColor: 'transparent' },
            }}
          >
            Results
          </Button>
        </Box>
      )}

      {/* Toolbar: Search & Filter dropdowns with Swadhaar Theme */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <TextField
            size="small"
            placeholder={searchPlaceholder}
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
                height: 38,
                borderRadius: '6px',
                fontSize: '13px',
                '& fieldset': { borderColor: '#D6D3CC' },
                '&:hover fieldset': { borderColor: '#E6873C' },
                '&.Mui-focused fieldset': { borderColor: '#E6873C' },
              },
            }}
          />

          {/* Filter 1: All Courses */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(0);
              }}
              displayEmpty
              sx={{
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                height: 38,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6D3CC' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
              }}
            >
              <MenuItem value="all">All courses</MenuItem>
              <MenuItem value="course 0">Course 0</MenuItem>
              <MenuItem value="course 1">Course 1</MenuItem>
            </Select>
          </FormControl>

          {/* Filter 2: All Languages */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
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
                height: 38,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6D3CC' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
              }}
            >
              <MenuItem value="all">All languages</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="hindi">Hindi</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Counter Hint (matching Prototype Image 1) */}
        <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
          {activeTab === 'videos'
            ? `Showing ${contentList.length} of ${totalCount} · videos from Courses 0–1 of the course document`
            : activeTab === 'pdfs'
              ? `Showing ${contentList.length} of ${totalCount} · PDFs`
              : `Showing ${contentList.length} of ${totalCount} · assessments from Courses 0–1`}
        </Typography>
      </Box>

      {/* Swadhaar Data Table */}
      <SwadhaarDataTable<ContentItem>
        columns={currentColumns}
        data={contentList}
        keyExtractor={(item) => item.identifier}
        loading={loading}
        hideToolbar={true}
        emptyMessage={`No ${activeTab} found matching criteria`}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
      />

      {/* Prototype Footer Note (matching Image 5) */}
      <Box sx={{ mt: 1.5, px: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '11px' }}>
          {activeTab === 'assessments'
            ? 'Live practice question sets from Sunbird composite search API (primaryCategory: Practice Question Set).'
            : 'Titles, section counts and durations from the course document table of contents.'}
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

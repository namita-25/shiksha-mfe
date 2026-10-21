import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Skeleton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../../next-i18next.config.js';
import {
  getCourseHierarchy,
  CourseHierarchy,
  CourseHierarchyChild,
  parseCourseName,
} from '@/services/CourseService';
import LifecycleChip from '@/components/common/LifecycleChip';
import ContentPreviewModal from '@/components/common/ContentPreviewModal';

const getLessonIcon = (format?: string, subFormat?: string | null) => {
  const f = (format || '').toLowerCase();
  const sf = (subFormat || '').toLowerCase();
  if (f === 'video' || sf.includes('youtube')) {
    return <PlayCircleOutlineIcon sx={{ color: '#E6873C', fontSize: 20 }} />;
  }
  if (f === 'document' || sf.includes('pdf')) {
    return <DescriptionOutlinedIcon sx={{ color: '#0284C7', fontSize: 20 }} />;
  }
  if (f === 'test' || sf.includes('quiz') || sf.includes('assessment') || sf.includes('feedback')) {
    return <QuizOutlinedIcon sx={{ color: '#7C3AED', fontSize: 20 }} />;
  }
  return <PlayCircleOutlineIcon sx={{ color: '#E6873C', fontSize: 20 }} />;
};

export default function CourseDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';

  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<CourseHierarchy | null>(null);
  const [sections, setSections] = useState<CourseHierarchyChild[]>([]);
  const [courseLevelItems, setCourseLevelItems] = useState<CourseHierarchyChild[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit Course Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAudience, setEditAudience] = useState('');

  // Native In-App Preview Modal State (No external player/workspace MFE)
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const fetchHierarchy = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);

    // If new course initialized from Create Course page
    if (courseId === 'new' || courseId.startsWith('new')) {
      const title = (router.query.title as string) || 'New Course';
      const audience = (router.query.audience as string) || 'New field trainers and Community Resource Persons';
      setCourse({
        courseId: courseId,
        identifier: courseId,
        title: title,
        name: title,
        status: 'Draft',
        audience: audience,
        leafNodesCount: 0,
        children: [],
      });
      setEditTitle(title);
      setEditAudience(audience);
      setSections([]);
      setCourseLevelItems([
        { identifier: 'item-faq', name: 'Course FAQs & Transition', primaryCategory: 'Explanation' },
        { identifier: 'item-summary', name: 'Course Summary & Key Takeaways', primaryCategory: 'Explanation' },
        { identifier: 'item-assessment', name: 'Course Assessment (linked from Assessments)', primaryCategory: 'Practice Question Set' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const data = await getCourseHierarchy(courseId);
      setCourse(data);
      setEditTitle(data.title || data.name || '');
      setEditAudience(
        Array.isArray(data.audience)
          ? data.audience.join(', ')
          : data.audience || 'Field trainers and learners'
      );

      // In Aspire LMS, course children are the modules, and module children are lessons
      const allChildren = data.children || [];
      setSections(allChildren);
      setCourseLevelItems([
        { identifier: 'item-faq', name: 'Course FAQs', primaryCategory: 'Explanation' },
        { identifier: 'item-summary', name: 'Course Summary', primaryCategory: 'Explanation' },
        { identifier: 'item-assessment', name: 'Assessment', primaryCategory: 'Practice Question Set' },
        { identifier: 'item-transition', name: 'Transition', primaryCategory: 'Explanation' },
      ]);
    } catch (err: any) {
      console.error('Failed to load course hierarchy:', err);
      setError('Unable to load course structure from LMS server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  // Handle section reordering (visual demo)
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections);
  };

  const handleToggleExpand = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleSaveEditCourse = () => {
    if (course) {
      setCourse({
        ...course,
        name: editTitle,
        audience: editAudience,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteSection = (secId: string) => {
    setSections(sections.filter((s) => s.identifier !== secId));
  };

  const parsedName = parseCourseName(course?.name || '');
  const courseCode = parsedName.code || 'Course 1';
  const cleanTitle = parsedName.title || course?.name || 'Introduction to Saving';
  const audienceText =
    Array.isArray(course?.audience)
      ? course.audience.join(', ')
      : course?.audience || 'field trainers';
  const languageText = course?.detectedLanguage || (course?.language ? course.language[0] : 'English');

  return (
    <Box sx={{ py: 1, backgroundColor: '#F4F3EF', minHeight: 'calc(100vh - 120px)', m: -2, p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Link href="/content/courses" style={{ textDecoration: 'none' }}>
          <Typography
            variant="body2"
            sx={{
              color: '#6B6862',
              fontSize: '13px',
              fontWeight: 500,
              '&:hover': { color: '#E6873C' },
            }}
          >
            Learning
          </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: '#8A867F', fontSize: '13px' }}>
          /
        </Typography>
        <Link href="/content/courses" style={{ textDecoration: 'none' }}>
          <Typography
            variant="body2"
            sx={{
              color: '#6B6862',
              fontSize: '13px',
              fontWeight: 500,
              '&:hover': { color: '#E6873C' },
            }}
          >
            Courses
          </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: '#8A867F', fontSize: '13px' }}>
          /
        </Typography>
        <Typography variant="body2" sx={{ color: '#1F1E1C', fontSize: '13px', fontWeight: 600 }}>
          {courseCode} · {cleanTitle}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ maxWidth: '70%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.8 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F1E1C', fontSize: '26px' }}>
              {loading ? <Skeleton width={320} /> : cleanTitle}
            </Typography>

            {!loading && (
              <>
                <Chip
                  label={courseCode}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D6D3CC',
                    color: '#1F1E1C',
                    height: 24,
                  }}
                />
                <LifecycleChip state={course?.status || 'published'} />
              </>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '14px' }}>
            {loading ? (
              <Skeleton width={260} />
            ) : (
              `Audience: ${audienceText} · ${languageText} · ${sections.length} modules`
            )}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditModalOpen(true)}
            sx={{
              borderColor: '#D6D3CC',
              color: '#1F1E1C',
              backgroundColor: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              height: 38,
              '&:hover': { borderColor: '#1F1E1C', backgroundColor: '#F9F9F8' },
            }}
          >
            Edit details
          </Button>

          <Button
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            sx={{
              borderColor: '#D6D3CC',
              color: '#1F1E1C',
              backgroundColor: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: '6px',
              height: 38,
              '&:hover': { borderColor: '#1F1E1C', backgroundColor: '#F9F9F8' },
            }}
            onClick={() => {
              // Preview first available lesson or course overview
              const firstSection = sections[0];
              const firstLesson = firstSection?.children?.[0];
              if (firstLesson) {
                setPreviewItem({
                  name: firstLesson.name,
                  type: firstLesson.format || firstLesson.subFormat || 'video',
                  description: firstLesson.description || `${cleanTitle} · ${firstSection.name}`,
                  duration: firstLesson.idealTime ? `${firstLesson.idealTime} min` : undefined,
                });
              } else {
                setPreviewItem({
                  name: cleanTitle,
                  type: 'video',
                  description: course?.description || 'Course overview preview.',
                });
              }
            }}
          >
            Preview
          </Button>

          <Button
            variant="contained"
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
            }}
            onClick={() => alert(`Course changes published successfully!`)}
          >
            Publish changes
          </Button>
        </Box>
      </Box>

      {/* Main Grid: Left Column 2/3, Right Column 1/3 */}
      <Grid container spacing={3}>
        {/* Left Column (Sections & Course-level items) */}
        <Grid item xs={12} md={8}>
          {/* Sections Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '17px', fontWeight: 600, color: '#1F1E1C' }}>
              Sections
            </Typography>
            <Button
              variant="outlined"
              size="small"
              // startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={() => {
                const basePath = router.asPath.startsWith('/courses') ? '/courses' : '/content/courses';
                router.push(`${basePath}/${courseId}/sections/create`);
              }}
              sx={{
                borderColor: '#D6D3CC',
                color: '#1F1E1C',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'none',
                borderRadius: '6px',
                py: 0.5,
                px: 1.5,
                '&:hover': { borderColor: '#1F1E1C', backgroundColor: '#F9F9F8' },
              }}
            >
              + Add section
            </Button>
          </Box>

          {/* Section List */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} variant="rectangular" height={72} sx={{ borderRadius: '10px' }} />
              ))}
            </Box>
          ) : sections.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
              }}
            >
              <Typography variant="body1" sx={{ color: '#6B6862' }}>
                No sections defined for this course. Click "+ Add section" to start building your curriculum.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {sections.map((section, idx) => {
                const isExpanded = expandedSection === section.identifier;
                const childUnits = section.children || [];
                const subUnitNames = childUnits.map((u) => u.name).join(' · ');

                return (
                  <Box
                    key={section.identifier}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Reorder Buttons (Up & Down) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.8 }}>
                      <IconButton
                        size="small"
                        aria-label={`Move section ${idx + 1} up`}
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '4px',
                          border: '1px solid #D6D3CC',
                          backgroundColor: '#FFFFFF',
                          color: '#1F1E1C',
                          '&:hover': { backgroundColor: '#F3F4F6' },
                          '&.Mui-disabled': { opacity: 0.4 },
                        }}
                      >
                        <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Move section ${idx + 1} down`}
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveSection(idx, 'down')}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '4px',
                          border: '1px solid #D6D3CC',
                          backgroundColor: '#FFFFFF',
                          color: '#1F1E1C',
                          '&:hover': { backgroundColor: '#F3F4F6' },
                          '&.Mui-disabled': { opacity: 0.4 },
                        }}
                      >
                        <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    {/* Section Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        flexGrow: 1,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D6D3CC',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                      }}
                    >
                      <Box
                        sx={{
                          p: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleToggleExpand(section.identifier)}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                            {section.name}
                          </Typography>
                          <Typography sx={{ fontSize: '13px', color: '#6B6862' }}>
                            {section.duration ? `${section.duration} min · ` : ''}
                            {childUnits.length > 0
                              ? `${childUnits.length} lessons · ${childUnits.slice(0, 3).map((u) => u.name).join(' · ')}`
                              : (section.description?.replace(/<[^>]+>/g, '').trim() || 'Module content')}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                          <Chip
                            label={section.status === 'published' ? 'Active' : (section.status || 'Active')}
                            size="small"
                            sx={{
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              fontWeight: 600,
                              fontSize: '11px',
                              height: 22,
                            }}
                          />
                          <Tooltip title="Edit content">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Editing content for: ${section.name}`);
                              }}
                              sx={{
                                color: '#6B6862',
                                '&:hover': { color: '#E6873C' },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.identifier);
                              }}
                              sx={{
                                color: '#BA1A1A',
                                '&:hover': { backgroundColor: '#FEE2E2' },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small" sx={{ color: '#8A867F' }}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Expandable Child Units */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #ECEAE5', p: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#6B6862',
                              letterSpacing: '0.5px',
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            Module Lessons & Learning Assets ({childUnits.length})
                          </Typography>
                          {childUnits.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#8A867F', fontSize: '13px' }}>
                              No lessons found in this module.
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {childUnits.map((unit, uIdx) => (
                                <Box
                                  key={unit.identifier || uIdx}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.2,
                                    px: 2,
                                    borderRadius: '6px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {getLessonIcon(unit.format, unit.subFormat)}
                                    <Box>
                                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                                        {unit.name}
                                      </Typography>
                                      <Typography sx={{ fontSize: '11px', color: '#6B6862' }}>
                                        {unit.subFormat
                                          ? unit.subFormat.replace('.', ' ').toUpperCase()
                                          : (unit.format ? unit.format.toUpperCase() : (unit.primaryCategory || 'LESSON'))}
                                        {unit.idealTime ? ` · ${unit.idealTime} min` : ''}
                                        {unit.totalMarks ? ` · Marks: ${unit.passingMarks || 0}/${unit.totalMarks}` : ''}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={unit.status || 'Active'}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#F3F4F6',
                                        color: '#4B5563',
                                        fontSize: '10px',
                                        height: 20,
                                      }}
                                    />
                                    <Tooltip title="Preview lesson">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setPreviewItem({
                                            name: unit.name,
                                            type: unit.format || unit.subFormat || 'video',
                                            description: unit.description || `${cleanTitle} · Lesson`,
                                            duration: unit.idealTime ? `${unit.idealTime} min` : undefined,
                                            totalMarks: unit.totalMarks,
                                            passingMarks: unit.passingMarks,
                                          });
                                        }}
                                        sx={{
                                          color: '#6B6862',
                                          width: 28,
                                          height: 28,
                                          '&:hover': {
                                            backgroundColor: '#FDF3E9',
                                            color: '#E6873C',
                                          },
                                        }}
                                      >
                                        <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Course-level items */}
          <Box sx={{ mt: 3.5, mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontSize: '17px', fontWeight: 600, color: '#1F1E1C' }}>
              Course-level items
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D6D3CC',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {/* FAQs */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '12px 18px',
                borderBottom: '1px solid #ECEAE5',
              }}
            >
              <Typography sx={{ fontSize: '14px', color: '#1F1E1C' }}>
                <strong style={{ fontWeight: 600 }}>FAQs</strong>{' '}
                <span style={{ color: '#6B6862' }}>· 10 questions</span>
              </Typography>
              <Tooltip title="Edit FAQs">
                <IconButton size="small" sx={{ color: '#6B6862' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Summary */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '12px 18px',
                borderBottom: '1px solid #ECEAE5',
              }}
            >
              <Typography sx={{ fontSize: '14px', color: '#1F1E1C' }}>
                <strong style={{ fontWeight: 600 }}>Summary</strong>
              </Typography>
              <Tooltip title="Edit Summary">
                <IconButton size="small" sx={{ color: '#6B6862' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Assessment */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '12px 18px',
                borderBottom: '1px solid #ECEAE5',
              }}
            >
              <Typography sx={{ fontSize: '14px', color: '#1F1E1C', display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong style={{ fontWeight: 600 }}>Assessment</strong>
                <span style={{ color: '#6B6862' }}>· Course 1 Assessment · 10 MCQs</span>
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#D6D3CC',
                  color: '#1F1E1C',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '6px',
                  py: 0.4,
                  px: 1.5,
                  '&:hover': { borderColor: '#1F1E1C', backgroundColor: '#F9F9F8' },
                }}
                onClick={() => alert('Opening assessment builder / questionset')}
              >
                Open in Assessments
              </Button>
            </Box>

            {/* Transition */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '12px 18px',
              }}
            >
              <Typography sx={{ fontSize: '14px', color: '#1F1E1C' }}>
                <strong style={{ fontWeight: 600 }}>Transition</strong>{' '}
                <span style={{ color: '#6B6862' }}>· bridge to the next course</span>
              </Typography>
              <Tooltip title="Edit Transition">
                <IconButton size="small" sx={{ color: '#6B6862' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (Publishing & Used in learning paths) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Publishing Card */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: '14px 20px',
                  borderBottom: '1px solid #ECEAE5',
                }}
              >
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Publishing
                </Typography>
              </Box>

              <Box sx={{ p: '16px 20px', display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '14px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B6862' }}>
                    Status
                  </Typography>
                  <LifecycleChip state={course?.status || 'published'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B6862' }}>
                    Modules
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F1E1C' }}>
                    {sections.length} modules
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B6862' }}>
                    Total Lessons
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F1E1C' }}>
                    {sections.reduce((acc, s) => acc + (s.children?.length || 0), 0)} lessons
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Used in learning paths Card */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: '14px 20px', borderBottom: '1px solid #ECEAE5' }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Used in learning paths
                </Typography>
              </Box>

              <Box sx={{ p: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1F1E1C',
                    cursor: 'pointer',
                    '&:hover': { color: '#E6873C', textDecoration: 'underline' },
                  }}
                  onClick={() => alert('Navigating to Financial Inclusion Training Programme')}
                >
                  Financial Inclusion Training Programme
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B6862' }}>
                  Step 2 of 7
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Edit Details Dialog */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1F1E1C' }}>Edit Course Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            fullWidth
            label="Course Name"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            label="Target Audience"
            value={editAudience}
            onChange={(e) => setEditAudience(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsEditModalOpen(false)} sx={{ color: '#6B6862' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditCourse}
            variant="contained"
            sx={{
              backgroundColor: '#E6873C',
              color: '#FFFFFF',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#C66C23' },
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Native In-App Content Preview Modal (No MFE required) */}
      <ContentPreviewModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        content={previewItem}
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

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

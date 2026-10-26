import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Radio,
  Alert,
  Chip,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import {
  getContentRead,
  createContent,
  updateContent,
  inferCourseUsage,
  resolveEditableDuration,
} from '@/services/ContentLibraryService';
import { detectLanguage } from '@/services/CourseService';
import useUnsavedChangesGuard from '@/hooks/useUnsavedChangesGuard';

const toLanguageOption = (language: string): 'Hindi' | 'English' => (language === 'Hindi' ? 'Hindi' : 'English');

const detectSourceType = (url: string): 'link' | 'upload' =>
  url.includes('youtube') || url.includes('youtu.be') || url.startsWith('http') ? 'link' : 'upload';

export default function CreateVideoPage() {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [sourceType, setSourceType] = useState<'link' | 'upload'>('link');
  const [videoUrl, setVideoUrl] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [usedIn, setUsedIn] = useState<string>((router.query.usedIn as string) || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [initialData, setInitialData] = useState<{
    title: string;
    description: string;
    duration: string;
    language: string;
    videoUrl: string;
    sourceType: string;
  } | null>(null);

  // Navigation guard against unsaved changes
  const isDirty = Boolean(
    !successMsg &&
    !loading &&
    (isEditing && initialData
      ? title !== initialData.title ||
        description !== initialData.description ||
        duration !== initialData.duration ||
        language !== initialData.language ||
        videoUrl !== initialData.videoUrl ||
        sourceType !== initialData.sourceType
      : title.trim() || videoUrl.trim())
  );
  useUnsavedChangesGuard(
    isDirty,
    'You have unsaved changes to this video. Are you sure you want to leave this page?'
  );

  useEffect(() => {
    if (router.query.usedIn && typeof router.query.usedIn === 'string') {
      setUsedIn(router.query.usedIn);
    }
  }, [router.query.usedIn]);

  // Load existing video details if editing
  useEffect(() => {
    if (id && typeof id === 'string') {
      setLoading(true);
      getContentRead(id)
        .then((res: any) => {
          const content = res?.content || res;
          if (content) {
            const loadedTitle = content.name || content.title || '';
            const loadedDesc = content.description || '';
            const loadedUrl = content.artifactUrl || content.downloadUrl || content.previewUrl || '';
            const loadedDur = resolveEditableDuration(content);
            const loadedLang = detectLanguage(loadedTitle, content.language || content.languageCode);
            const loadedSrc = detectSourceType(loadedUrl);
            const courseUsage = (router.query.usedIn as string) || inferCourseUsage(content);

            setTitle(loadedTitle);
            setDescription(loadedDesc);
            setVideoUrl(loadedUrl);
            setDuration(loadedDur);
            setLanguage(toLanguageOption(loadedLang));
            setSourceType(loadedSrc);
            setUsedIn(courseUsage);

            setInitialData({
              title: loadedTitle,
              description: loadedDesc,
              duration: loadedDur,
              language: toLanguageOption(loadedLang),
              videoUrl: loadedUrl,
              sourceType: loadedSrc,
            });
          }
        })
        .catch((err) => {
          console.error('Failed to load video details:', err);
          setError('Failed to load video details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, router.query.usedIn]);

  const handleSave = async (isDraft = false) => {
    if (!title.trim()) {
      setError('Video title is required.');
      return;
    }
    if (sourceType === 'link' && !videoUrl.trim()) {
      setError('Video URL is required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const mimeType = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
        ? 'video/x-youtube'
        : 'video/mp4';

      if (isEditing && typeof id === 'string') {
        await updateContent(id, {
          name: title.trim(),
          description: description.trim(),
          artifactUrl: videoUrl.trim(),
          duration: duration.trim() || undefined,
          language: [language],
          status: isDraft ? 'Draft' : 'Live',
        });
        setSuccessMsg('Video updated successfully.');
      } else {
        await createContent({
          name: title.trim(),
          description: description.trim(),
          mimeType,
          primaryCategory: 'Learning Resource',
          artifactUrl: videoUrl.trim(),
          duration: duration.trim() || undefined,
          language: [language],
          status: isDraft ? 'Draft' : 'Live',
        });
        setSuccessMsg(isDraft ? `Video saved as draft.` : `Video created successfully.`);
      }
      setTimeout(() => {
        router.push('/content?tab=videos');
      }, 900);
    } catch (err: any) {
      console.error('Failed to save video:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save video.');
    } finally {
      setLoading(false);
    }
  };

  // Convert youtube watch url to embed if possible
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <Box sx={{ py: 1, maxWidth: 1400, mx: 'auto' }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2, fontSize: '13px', color: '#6B6862' }}>
        <span>Learning</span>
        <span>/</span>
        <Link
          href="/content"
          style={{ color: '#6B6862', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E6873C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6862')}
        >
          Content library
        </Link>
        <span>/</span>
        <Link
          href="/content?tab=videos"
          style={{ color: '#6B6862', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E6873C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6862')}
        >
          Videos
        </Link>
        <span>/</span>
        <Typography component="span" sx={{ color: '#1F1E1C', fontWeight: 600, fontSize: '13px' }}>
          {isEditing ? 'Edit video' : 'Create video'}
        </Typography>
      </Box>

      {/* Header & Action Bar */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F1E1C', fontSize: '26px' }}>
            {isEditing ? 'Edit video' : 'Create video'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/content?tab=videos')}
            sx={{
              borderColor: '#D6D3CC',
              color: '#1F1E1C',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '6px',
              height: 38,
              px: 2.2,
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#F3F4F6',
                borderColor: '#BDB9B1',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleSave(true)}
            sx={{
              borderColor: '#D6D3CC',
              color: '#1F1E1C',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '6px',
              height: 38,
              px: 2.2,
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#FDF3E9',
                borderColor: '#E6873C',
                color: '#E6873C',
              },
            }}
          >
            Save as draft
          </Button>

          <Button
            variant="contained"
            onClick={() => handleSave(false)}
            sx={{
              backgroundColor: '#E6873C',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '6px',
              height: 38,
              px: 2.5,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#C66C23',
                boxShadow: 'none',
              },
            }}
          >
            Save video
          </Button>
        </Box>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '6px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '6px' }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Main 2-Column Grid matching Prototype */}
      <Grid container spacing={3}>
        {/* Left Column (8 cols): Video Details + Video Source */}
        <Grid item xs={12} lg={8}>
          {/* Card 1: Video details */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #D6D3CC',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              mb: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #ECEAE5' }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                Video details
              </Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              {/* Title */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Title *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Life Cycle Needs | Episode 3 | Budgeting"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      fontSize: '14px',
                      '& fieldset': { borderColor: '#BDB9B1' },
                      '&:hover fieldset': { borderColor: '#1F1E1C' },
                      '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                    },
                  }}
                />
              </Box>

              {/* Description with Toolbar */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Description (optional)
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 0.8,
                    backgroundColor: '#FAF9F6',
                    border: '1px solid #BDB9B1',
                    borderBottom: 'none',
                    borderRadius: '6px 6px 0 0',
                    color: '#6B6862',
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>B</Box>
                  <Box component="span" sx={{ fontStyle: 'italic', fontSize: '13px', cursor: 'pointer' }}>I</Box>
                  <Box component="span" sx={{ textDecoration: 'underline', fontSize: '13px', cursor: 'pointer' }}>U</Box>
                  <Box sx={{ width: '1px', height: 16, backgroundColor: '#D6D3CC' }} />
                  <Box component="span" sx={{ fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>• List</Box>
                  <Box component="span" sx={{ fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>Link</Box>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the video content..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0 0 6px 6px',
                      backgroundColor: '#FFFFFF',
                      fontSize: '14px',
                      '& fieldset': { borderColor: '#BDB9B1' },
                      '&:hover fieldset': { borderColor: '#1F1E1C' },
                      '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                    },
                  }}
                />
              </Box>

              {/* Duration and Language */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Duration
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 1:43 or 45 min"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          fontSize: '14px',
                          '& fieldset': { borderColor: '#BDB9B1' },
                          '&:hover fieldset': { borderColor: '#1F1E1C' },
                          '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px' }}>
                      Shown to learners, as in the course document
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Language *
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          fontSize: '14px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#BDB9B1' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1F1E1C' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
                        }}
                      >
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="English">English</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Card 2: Video source */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #D6D3CC',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #ECEAE5' }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                Video source *
              </Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    onClick={() => setSourceType('link')}
                    elevation={0}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: sourceType === 'link' ? '2px solid #1F1E1C' : '1px solid #BDB9B1',
                      backgroundColor: sourceType === 'link' ? '#FAF9F6' : '#FFFFFF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Radio
                      checked={sourceType === 'link'}
                      sx={{ p: 0, '&.Mui-checked': { color: '#1F1E1C' } }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C' }}>
                        Video link
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
                        YouTube (as in the course document)
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    onClick={() => setSourceType('upload')}
                    elevation={0}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: sourceType === 'upload' ? '2px solid #1F1E1C' : '1px solid #BDB9B1',
                      backgroundColor: sourceType === 'upload' ? '#FAF9F6' : '#FFFFFF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Radio
                      checked={sourceType === 'upload'}
                      sx={{ p: 0, '&.Mui-checked': { color: '#1F1E1C' } }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C' }}>
                        Upload file
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
                        MP4, WebM formats
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {sourceType === 'link' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                    Video URL *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        fontSize: '14px',
                        '& fieldset': { borderColor: '#BDB9B1' },
                        '&:hover fieldset': { borderColor: '#1F1E1C' },
                        '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    component="label"
                    sx={{
                      border: '2px dashed #BDB9B1',
                      borderRadius: '10px',
                      backgroundColor: '#FAF9F6',
                      py: 4,
                      px: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        backgroundColor: '#F5F4F0',
                        borderColor: '#E6873C',
                      },
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: '#3D3B37' }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C' }}>
                      Drop a video here or browse
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
                      MP4, WebM up to 500MB
                    </Typography>
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFileName(file.name);
                      }}
                    />
                  </Box>
                  {fileName && (
                    <Typography sx={{ fontSize: '13px', color: '#1F1E1C', fontWeight: 500 }}>
                      Selected file: <strong>{fileName}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (4 cols): Preview + Used in */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card 3: Preview */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #ECEAE5' }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Preview
                </Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                {sourceType === 'link' && videoUrl.includes('youtube') ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 Aspect Ratio
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#1F1E1C',
                    }}
                  >
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      title="YouTube video player"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      aspectRatio: '16/9',
                      borderRadius: '6px',
                      backgroundColor: '#E2DFD8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      color: '#6B6862',
                      fontSize: '13px',
                    }}
                  >
                    <PlayCircleOutlineIcon sx={{ fontSize: 40, color: '#8A867F' }} />
                    <span>Video preview</span>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Card 4: Used in */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #ECEAE5' }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Used in
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {usedIn && usedIn !== 'Not used in any course yet' ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label="In course"
                        size="small"
                        sx={{
                          backgroundColor: '#E8F5E9',
                          color: '#2E7D32',
                          fontWeight: 600,
                          fontSize: '11px',
                          borderRadius: '4px',
                          height: 22,
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C' }}>
                        {usedIn}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px' }}>
                      This video is linked and used in the course curriculum.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label="Not in course"
                        size="small"
                        sx={{
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          fontWeight: 600,
                          fontSize: '11px',
                          borderRadius: '4px',
                          height: 22,
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', color: '#6B6862' }}>
                        Not used in any course yet.
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '12px' }}>
                      Add it to a section from the section editor (+ Video).
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
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

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
  FormControlLabel,
  Checkbox,
  Tooltip,
  Alert,
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import { getContentRead } from '@/services/ContentLibraryService';

export default function CreatePdfPage() {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [fileName, setFileName] = useState<string | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing PDF details if editing
  useEffect(() => {
    if (id && typeof id === 'string') {
      setLoading(true);
      getContentRead(id)
        .then((res: any) => {
          const content = res?.content || res;
          if (content) {
            if (content.name) setTitle(content.name);
            if (content.description) setDescription(content.description);
            if (content.duration) setReadingTime(String(content.duration));
            if (content.artifactUrl) setFileName(content.artifactUrl.split('/').pop() || 'document.pdf');
            if (content.language && content.language.length > 0) {
              setLanguage(content.language[0]);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load PDF details:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = (isDraft = false) => {
    if (!title.trim()) {
      setError('PDF title is required.');
      return;
    }
    setError(null);
    setSuccessMsg(
      isDraft
        ? `PDF "${title}" saved as draft.`
        : `PDF "${title}" saved successfully.`
    );
    setTimeout(() => {
      router.push('/content?tab=pdfs');
    }, 1000);
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
          href="/content?tab=pdfs"
          style={{ color: '#6B6862', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E6873C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6862')}
        >
          PDFs
        </Link>
        <span>/</span>
        <Typography component="span" sx={{ color: '#1F1E1C', fontWeight: 600, fontSize: '13px' }}>
          {isEditing ? 'Edit PDF' : 'Create PDF'}
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
            {isEditing ? 'Edit PDF' : 'Create PDF'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/content?tab=pdfs')}
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
            Save PDF
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
        {/* Left Column (8 cols): PDF Details + File */}
        <Grid item xs={12} lg={8}>
          {/* Card 1: PDF details */}
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
                PDF details
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
                  placeholder="e.g. Swadhaar FinAccess Training Manual"
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
                  placeholder="Provide an overview of the document..."
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

              {/* Reading Time and Language */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Reading time (min)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={readingTime}
                      onChange={(e) => setReadingTime(e.target.value)}
                      placeholder="e.g. 10"
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
                      Optional, like video durations
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

          {/* Card 2: File Upload */}
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
                File *
              </Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Drop a PDF here or browse
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
                  PDF only, up to 25MB
                </Typography>
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
              </Box>

              {fileName && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    border: '1px solid #ECEAE5',
                    borderRadius: '8px',
                    backgroundColor: '#FAF9F6',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 44,
                        borderRadius: '4px',
                        backgroundColor: '#F4F3EF',
                        border: '1px solid #D6D3CC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: '11px',
                        color: '#3D3B37',
                      }}
                    >
                      PDF
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1F1E1C' }}>
                        {fileName}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
                        Ready to view · Document format
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    component="label"
                    variant="outlined"
                    sx={{
                      borderColor: '#D6D3CC',
                      color: '#1F1E1C',
                      textTransform: 'none',
                      fontSize: '12px',
                      height: 30,
                    }}
                  >
                    Replace
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFileName(file.name);
                      }}
                    />
                  </Button>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    sx={{ '&.Mui-checked': { color: '#E6873C' } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '13px', color: '#1F1E1C' }}>
                    Allow learners to download this PDF
                  </Typography>
                }
              />
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
                <Box
                  sx={{
                    aspectRatio: '3/4',
                    maxHeight: 260,
                    margin: '0 auto',
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
                  <PictureAsPdfOutlinedIcon sx={{ fontSize: 40, color: '#8A867F' }} />
                  <span>{fileName ? fileName : 'First page'}</span>
                </Box>
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

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '14px', color: '#6B6862' }}>
                  Not used in any course yet.
                </Typography>
                <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '12px' }}>
                  Add it to a section from the section editor (+ PDF).
                </Typography>
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

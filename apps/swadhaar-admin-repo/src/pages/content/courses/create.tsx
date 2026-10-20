import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
  Alert,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../../next-i18next.config.js';

interface ObjectiveItem {
  id: string;
  text: string;
}

export default function CreateCoursePage() {
  const router = useRouter();

  // Form States matching Prototype
  const [courseName, setCourseName] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>(
    'New field trainers and Community Resource Persons joining Swadhaar FinAccess'
  );
  const [learningDuration, setLearningDuration] = useState<string>('45');
  const [assessmentDuration, setAssessmentDuration] = useState<string>('15');
  const [deliveryMode, setDeliveryMode] = useState<string>('Online learning via LMS');
  const [introduction, setIntroduction] = useState<string>(
    'Welcome to your very first step as a Swadhaar FinAccess field trainer…'
  );
  const [howItWorks, setHowItWorks] = useState<string>(
    'Complete each section and pass its assessment. Score 70% or above on the final assessment to progress to the next course…'
  );

  // Objectives List
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([
    {
      id: 'obj-1',
      text: 'Enhanced understanding of Swadhaar FinAccess, what it does, and why its work matters…',
    },
    {
      id: 'obj-2',
      text: "Describe Swadhaar's reach, history, and values…",
    },
    {
      id: 'obj-3',
      text: 'Introduce and explain the Swadhaar Saathi Chatbot to clients…',
    },
  ]);

  // Language state (single select)
  const [language, setLanguage] = useState<string>('english');

  // UI feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Objectives reordering
  const handleMoveObjective = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= objectives.length) return;

    const updated = [...objectives];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setObjectives(updated);
  };

  const handleUpdateObjective = (index: number, text: string) => {
    const updated = [...objectives];
    updated[index].text = text;
    setObjectives(updated);
  };

  const handleAddObjective = () => {
    setObjectives((prev) => [
      ...prev,
      {
        id: `obj-${Date.now()}`,
        text: '',
      },
    ]);
  };

  const handleDeleteObjective = (index: number) => {
    if (objectives.length <= 1) return;
    setObjectives((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save actions
  const validateForm = () => {
    if (!courseName.trim()) {
      setError('Course name is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSaveAsDraft = () => {
    if (!validateForm()) return;
    setSuccessMsg(`Course "${courseName}" saved as draft successfully.`);
    setTimeout(() => {
      router.push('/content/courses');
    }, 1200);
  };

  const handleSaveAndAddSections = () => {
    if (!validateForm()) return;
    setSuccessMsg('Course created. Opening course structure...');
    setTimeout(() => {
      router.push({
        pathname: '/content/courses/new',
        query: {
          title: courseName,
          audience: targetAudience,
          language: language,
        },
      });
    }, 1000);
  };

  return (
    <Box sx={{ py: 1, maxWidth: 1400, mx: 'auto' }}>
      {/* Breadcrumb Navigation matching prototype */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2, fontSize: '13px', color: '#6B6862' }}>
        <span>Learning</span>
        <span>/</span>
        <Link
          href="/content/courses"
          style={{ color: '#6B6862', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E6873C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6862')}
        >
          Courses
        </Link>
        <span>/</span>
        <Typography component="span" sx={{ color: '#1F1E1C', fontWeight: 600, fontSize: '13px' }}>
          Create course
        </Typography>
      </Box>

      {/* Header and Actions Bar */}
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
            Create course
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#EEF2FF',
              color: '#3730A3',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 600,
              px: 1,
              py: 0.4,
              borderRadius: '4px',
            }}
          >
            Course doc · Course overview
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/content/courses')}
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
            onClick={handleSaveAsDraft}
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
            onClick={handleSaveAndAddSections}
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
            Save and add sections
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

      {/* 2-Column Layout matching Prototype */}
      <Grid container spacing={2.5}>
        {/* Left Column (8 cols): Course Overview + Objectives */}
        <Grid item xs={12} lg={8}>
          {/* Card 1: Course Overview */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #D6D3CC',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              mb: 2.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.8,
                borderBottom: '1px solid #ECEAE5',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                Course overview
              </Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              {/* Course Name */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Course name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Introduction to Swadhaar FinAccess & Its Digital Platform"
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

              {/* Target Audience */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Target audience
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="New field trainers and Community Resource Persons joining Swadhaar FinAccess"
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

              {/* 3-column Durations & Mode */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Learning content (min)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={learningDuration}
                      onChange={(e) => setLearningDuration(e.target.value)}
                      placeholder="45"
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
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Assessment (min)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={assessmentDuration}
                      onChange={(e) => setAssessmentDuration(e.target.value)}
                      placeholder="15"
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
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Delivery mode
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      placeholder="Online learning via LMS"
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
                </Grid>
              </Grid>

              {/* Introduction with Rich Text Toolbar */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Introduction
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
                  <Tooltip title="Bold">
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                        px: 0.6,
                        py: 0.2,
                        borderRadius: '3px',
                        '&:hover': { backgroundColor: '#EEEDE9', color: '#1F1E1C' },
                      }}
                    >
                      B
                    </Box>
                  </Tooltip>

                  <Tooltip title="Italic">
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        fontStyle: 'italic',
                        fontSize: '13px',
                        px: 0.6,
                        py: 0.2,
                        borderRadius: '3px',
                        '&:hover': { backgroundColor: '#EEEDE9', color: '#1F1E1C' },
                      }}
                    >
                      I
                    </Box>
                  </Tooltip>

                  <Tooltip title="Underline">
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '13px',
                        px: 0.6,
                        py: 0.2,
                        borderRadius: '3px',
                        '&:hover': { backgroundColor: '#EEEDE9', color: '#1F1E1C' },
                      }}
                    >
                      U
                    </Box>
                  </Tooltip>

                  <Box sx={{ width: '1px', height: 16, backgroundColor: '#D6D3CC' }} />

                  <Tooltip title="Bulleted List">
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        px: 0.6,
                        py: 0.2,
                        borderRadius: '3px',
                        '&:hover': { backgroundColor: '#EEEDE9', color: '#1F1E1C' },
                      }}
                    >
                      • List
                    </Box>
                  </Tooltip>

                  <Tooltip title="Insert Link">
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        px: 0.6,
                        py: 0.2,
                        borderRadius: '3px',
                        '&:hover': { backgroundColor: '#EEEDE9', color: '#1F1E1C' },
                      }}
                    >
                      Link
                    </Box>
                  </Tooltip>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Welcome to your very first step as a Swadhaar FinAccess field trainer…"
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

              {/* How it works */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  How it works
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={howItWorks}
                  onChange={(e) => setHowItWorks(e.target.value)}
                  placeholder="Complete each section and pass its assessment. Score 70% or above on the final assessment to progress to the next course…"
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
            </Box>
          </Paper>

          {/* Card 2: Course Objectives */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #D6D3CC',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid #ECEAE5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                Course objectives
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddObjective}
                sx={{
                  borderColor: '#D6D3CC',
                  color: '#1F1E1C',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '6px',
                  height: 30,
                  px: 1.5,
                  backgroundColor: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#E6873C',
                    backgroundColor: '#FDF3E9',
                    color: '#E6873C',
                  },
                }}
              >
                Add objective
              </Button>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {objectives.map((obj, index) => (
                <Box
                  key={obj.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                  }}
                >
                  {/* Reorder Buttons Up/Down */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Tooltip title="Move up">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => handleMoveObjective(index, 'up')}
                          sx={{
                            width: 22,
                            height: 18,
                            padding: 0,
                            borderRadius: '3px',
                            border: '1px solid #D6D3CC',
                            backgroundColor: '#FFFFFF',
                            color: '#3D3B37',
                            '&:hover': { backgroundColor: '#F3F4F6' },
                            '&.Mui-disabled': { opacity: 0.35 },
                          }}
                        >
                          <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === objectives.length - 1}
                          onClick={() => handleMoveObjective(index, 'down')}
                          sx={{
                            width: 22,
                            height: 18,
                            padding: 0,
                            borderRadius: '3px',
                            border: '1px solid #D6D3CC',
                            backgroundColor: '#FFFFFF',
                            color: '#3D3B37',
                            '&:hover': { backgroundColor: '#F3F4F6' },
                            '&.Mui-disabled': { opacity: 0.35 },
                          }}
                        >
                          <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Objective Input */}
                  <TextField
                    fullWidth
                    size="small"
                    value={obj.text}
                    onChange={(e) => handleUpdateObjective(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
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

                  {/* Delete Objective button */}
                  {objectives.length > 1 && (
                    <Tooltip title="Remove objective">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteObjective(index)}
                        sx={{
                          color: '#8A867F',
                          '&:hover': { color: '#DC2626', backgroundColor: '#FEE2E2' },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}

              {/* Bottom hint matching prototype */}
              <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '12px', mt: 0.5 }}>
                + 3 more in the course document
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (4 cols): Language + Added after saving */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Card 3: Language */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.8,
                  borderBottom: '1px solid #ECEAE5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Language *
                </Typography>
              </Box>

              <Box sx={{ p: 2.5 }}>
                <RadioGroup
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{ gap: 1 }}
                >
                  <FormControlLabel
                    value="hindi"
                    control={
                      <Radio
                        sx={{
                          color: '#BDB9B1',
                          '&.Mui-checked': { color: '#E6873C' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '14px', color: '#1F1E1C', fontWeight: 500 }}>
                        Hindi
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="english"
                    control={
                      <Radio
                        sx={{
                          color: '#BDB9B1',
                          '&.Mui-checked': { color: '#E6873C' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '14px', color: '#1F1E1C', fontWeight: 500 }}>
                        English
                      </Typography>
                    }
                  />
                </RadioGroup>

                <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px', display: 'block', mt: 1.5 }}>
                  One language per course. Other languages are separate courses.
                </Typography>
              </Box>
            </Paper>

            {/* Card 4: Added after saving */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #D6D3CC',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.8,
                  borderBottom: '1px solid #ECEAE5',
                }}
              >
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F1E1C' }}>
                  Added after saving
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Typography sx={{ fontSize: '14px', color: '#1F1E1C' }}>
                  Sections with their learning content
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#1F1E1C' }}>
                  FAQs · Summary · Transition
                </Typography>
                <Box>
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: '#E0E7FF',
                      color: '#1E3A8A',
                      fontSize: '13px',
                      fontWeight: 600,
                      px: 0.9,
                      py: 0.3,
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    Course assessment (linked from Assessments)
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#6B6862', fontSize: '12px', display: 'block', mt: 1 }}>
                  All appear in every course in the course document.
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

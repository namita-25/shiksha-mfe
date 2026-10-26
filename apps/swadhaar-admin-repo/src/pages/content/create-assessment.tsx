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
  Radio,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';
import { createContent } from '@/services/ContentLibraryService';
import { getCourseList } from '@/services/CourseService';
import useUnsavedChangesGuard from '@/hooks/useUnsavedChangesGuard';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  type: string;
  tags: string;
  prompt: string;
  options: QuestionOption[];
}

export default function CreateAssessmentPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [linkedContent, setLinkedContent] = useState('None');
  const [linkedOptions, setLinkedOptions] = useState<string[]>(['None']);
  const [timeLimit, setTimeLimit] = useState('15');
  const [description, setDescription] = useState(
    'Let us now test your understanding of the concepts covered in this course.'
  );

  // Settings
  const [passMark, setPassMark] = useState('70%');
  const [attempts, setAttempts] = useState('Unlimited');
  const [shuffle, setShuffle] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  // Loading & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Navigation guard against unsaved changes
  const isDirty = Boolean(name.trim() && !successMsg && !loading);
  useUnsavedChangesGuard(
    isDirty,
    'You have unsaved changes to this assessment. Are you sure you want to leave this page?'
  );

  // Load actual courses for linkedContent dropdown
  useEffect(() => {
    getCourseList({ limit: 50 })
      .then((res) => {
        if (res?.content?.length > 0) {
          const names = res.content.map((c) => c.name).filter(Boolean);
          setLinkedOptions(['None', ...names]);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses for assessment:', err);
      });
  }, []);

  // Questions List
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([
    {
      id: 'q-1',
      questionNumber: 1,
      type: 'Multiple choice – single answer',
      tags: 'Topic: General · Difficulty: Medium',
      prompt: '',
      options: [
        { id: 'opt-1-1', text: '', isCorrect: true },
        { id: 'opt-1-2', text: '', isCorrect: false },
      ],
    },
  ]);

  // Question actions
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((q, idx) => {
      q.questionNumber = idx + 1;
    });
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newQ: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      questionNumber: questions.length + 1,
      type: 'Multiple choice – single answer',
      tags: 'Topic: General · Difficulty: Medium',
      prompt: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
      ],
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, idx) => idx !== index);
    updated.forEach((q, idx) => {
      q.questionNumber = idx + 1;
    });
    setQuestions(updated);
  };

  const handleUpdatePrompt = (index: number, prompt: string) => {
    const updated = [...questions];
    updated[index].prompt = prompt;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optIndex;
    });
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({
      id: `opt-${Date.now()}`,
      text: '',
      isCorrect: false,
    });
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Assessment name is required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createContent({
        name: name.trim(),
        description: description.trim(),
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Practice Question Set',
        duration: timeLimit ? Number(timeLimit) : undefined,
        passMark,
        attempts,
        shuffle,
        showExplanations,
        linkedTo: linkedContent !== 'None' ? linkedContent : undefined,
        questionsCount: questions.length,
      });

      setSuccessMsg(`Assessment "${name}" created successfully.`);
      setTimeout(() => {
        router.push('/content?tab=assessments');
      }, 900);
    } catch (err: any) {
      console.error('Failed to save assessment:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create assessment.');
    } finally {
      setLoading(false);
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
          href="/content?tab=assessments"
          style={{ color: '#6B6862', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E6873C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6862')}
        >
          Assessments
        </Link>
        <span>/</span>
        <Typography component="span" sx={{ color: '#1F1E1C', fontWeight: 600, fontSize: '13px' }}>
          Create assessment
        </Typography>
      </Box>

      {/* Header and Actions */}
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
            Create assessment
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/content?tab=assessments')}
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
            onClick={handleSave}
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
            Save
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
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
            Save and assign
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

      {/* Main 2-Column Grid matching Prototype L10 */}
      <Grid container spacing={3}>
        {/* Left Column (8 cols): Assessment Details + Questions List */}
        <Grid item xs={12} lg={8}>
          {/* Card 1: Details */}
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
                Details
              </Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              {/* Name */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Course 1 Assessment – Introduction to Saving"
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

              {/* Linked Content & Time limit */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Linked content
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={linkedContent}
                        onChange={(e) => setLinkedContent(e.target.value)}
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          fontSize: '14px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#BDB9B1' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1F1E1C' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E6873C' },
                        }}
                      >
                        {linkedOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt === 'None' ? 'None (Standalone assessment)' : opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                      Time limit (min)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      placeholder="e.g. 15"
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

              {/* Description */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instructions shown to learners before starting..."
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

          {/* Questions Section Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#1F1E1C' }}>
              Questions ({questions.length})
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddQuestion}
                sx={{
                  borderColor: '#D6D3CC',
                  color: '#1F1E1C',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '6px',
                  height: 32,
                  px: 1.5,
                  backgroundColor: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#E6873C',
                    backgroundColor: '#FDF3E9',
                    color: '#E6873C',
                  },
                }}
              >
                + New question
              </Button>
            </Box>
          </Box>

          {/* Questions List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((q, qIndex) => (
              <Box key={q.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                {/* Up/Down Arrow Stack */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', pt: 1 }}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={qIndex === 0}
                        onClick={() => handleMoveQuestion(qIndex, 'up')}
                        sx={{
                          width: 24,
                          height: 20,
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
                        disabled={qIndex === questions.length - 1}
                        onClick={() => handleMoveQuestion(qIndex, 'down')}
                        sx={{
                          width: 24,
                          height: 20,
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

                {/* Question Card */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    border: '1px solid #D6D3CC',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 2.2,
                      py: 1.5,
                      borderBottom: '1px solid #ECEAE5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#FAF9F6',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C' }}>
                      Question {q.questionNumber}
                    </Typography>

                    {questions.length > 1 && (
                      <Tooltip title="Remove question">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveQuestion(qIndex)}
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

                  <Box sx={{ p: 2.2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Prompt */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                        Question prompt *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={q.prompt}
                        onChange={(e) => handleUpdatePrompt(qIndex, e.target.value)}
                        placeholder="Type the question text here..."
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

                    {/* Options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6B6862' }}>
                        Options (select the correct answer)
                      </Typography>

                      {q.options.map((opt, optIndex) => (
                        <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="Mark as correct answer">
                            <Radio
                              checked={opt.isCorrect}
                              onChange={() => handleSetCorrectOption(qIndex, optIndex)}
                              sx={{
                                color: '#BDB9B1',
                                '&.Mui-checked': { color: '#16A34A' },
                              }}
                            />
                          </Tooltip>

                          <TextField
                            fullWidth
                            size="small"
                            value={opt.text}
                            onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                backgroundColor: opt.isCorrect ? '#F0FDF4' : '#FFFFFF',
                                fontSize: '13px',
                                '& fieldset': { borderColor: opt.isCorrect ? '#86EFAC' : '#D6D3CC' },
                                '&:hover fieldset': { borderColor: '#1F1E1C' },
                                '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                              },
                            }}
                          />
                        </Box>
                      ))}

                      <Box sx={{ mt: 0.5 }}>
                        <Button
                          size="small"
                          onClick={() => handleAddOption(qIndex)}
                          sx={{
                            color: '#E6873C',
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            p: 0,
                            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          + Add option
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right Column (4 cols): Settings & Assigned To */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card 2: Settings */}
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
                  Settings
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                    Passing score
                  </Typography>
                  <TextField
                    size="small"
                    value={passMark}
                    onChange={(e) => setPassMark(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        fontSize: '13px',
                        '& fieldset': { borderColor: '#BDB9B1' },
                        '&:hover fieldset': { borderColor: '#1F1E1C' },
                        '&.Mui-focused fieldset': { borderColor: '#E6873C' },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                    Attempts allowed
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={attempts}
                      onChange={(e) => setAttempts(e.target.value)}
                      sx={{
                        borderRadius: '6px',
                        fontSize: '13px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#BDB9B1' },
                      }}
                    >
                      <MenuItem value="Unlimited">Unlimited</MenuItem>
                      <MenuItem value="3">3 attempts</MenuItem>
                      <MenuItem value="2">2 attempts</MenuItem>
                      <MenuItem value="1">1 attempt</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shuffle}
                      onChange={(e) => setShuffle(e.target.checked)}
                      sx={{ '&.Mui-checked': { color: '#E6873C' } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '13px', color: '#1F1E1C' }}>
                      Shuffle questions for learners
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showExplanations}
                      onChange={(e) => setShowExplanations(e.target.checked)}
                      sx={{ '&.Mui-checked': { color: '#E6873C' } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '13px', color: '#1F1E1C' }}>
                      Show correct answers after submission
                    </Typography>
                  }
                />
              </Box>
            </Paper>

            {/* Card 3: Assigned to */}
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
                  Assigned to
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '14px', color: '#6B6862' }}>
                  Not assigned to any groups yet.
                </Typography>
                <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '12px' }}>
                  Assign to groups or learners using &ldquo;Save and assign&rdquo;.
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

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

export interface PreviewContentData {
  identifier?: string;
  name?: string;
  title?: string;
  type?: 'video' | 'pdf' | 'assessment' | 'document' | 'test' | string;
  mimeType?: string;
  artifactUrl?: string;
  streamingUrl?: string;
  downloadUrl?: string;
  duration?: string | number | null;
  language?: string[];
  description?: string;
  // Assessment fields
  questionsCount?: number;
  passMark?: string | number;
  timeLimit?: string;
  totalMarks?: number | null;
  passingMarks?: number | null;
  questions?: Array<{
    id: string;
    questionNumber: number;
    prompt: string;
    type?: string;
    tags?: string;
    explanation?: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

interface ContentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  content: PreviewContentData | null;
}

// Helper to extract YouTube embed URL
function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
  }
  return null;
}

// Fallback questions for Swadhaar assessments if not provided
const DEFAULT_ASSESSMENT_QUESTIONS = [
  {
    id: 'q-1',
    questionNumber: 1,
    prompt: 'What is the primary reason to maintain an emergency saving fund?',
    type: 'Multiple choice – single answer',
    tags: 'Topic: Saving · Module: Course 1',
    explanation: 'An emergency fund prevents families from falling into high-interest debt during sudden crises or income disruptions.',
    options: [
      { id: 'opt-1-1', text: 'To fund unexpected medical or household crises without borrowing', isCorrect: true },
      { id: 'opt-1-2', text: 'To invest in high-risk speculative schemes', isCorrect: false },
      { id: 'opt-1-3', text: 'To avoid maintaining a bank savings account', isCorrect: false },
    ],
  },
  {
    id: 'q-2',
    questionNumber: 2,
    prompt: 'Which of the following is a key feature of formal savings in a regulated bank?',
    type: 'Multiple choice – single answer',
    tags: 'Topic: Banking · Module: Course 1',
    explanation: 'Formal bank deposits are insured and regulated by statutory authorities, offering safety and periodic interest.',
    options: [
      { id: 'opt-2-1', text: 'Safe deposit with regulated interest and government insurance', isCorrect: true },
      { id: 'opt-2-2', text: 'High risk of complete capital loss', isCorrect: false },
      { id: 'opt-2-3', text: 'No record or passbook of deposited funds', isCorrect: false },
    ],
  },
  {
    id: 'q-3',
    questionNumber: 3,
    prompt: 'What should be prioritized first when creating a monthly household budget?',
    type: 'Multiple choice – single answer',
    tags: 'Topic: Budgeting · Module: Course 1',
    explanation: 'Separating non-negotiable household needs from discretionary wants is the fundamental cornerstone of disciplined budgeting.',
    options: [
      { id: 'opt-3-1', text: 'Essential living expenses (food, rent, healthcare, utility bills)', isCorrect: true },
      { id: 'opt-3-2', text: 'Entertainment and luxury expenditures', isCorrect: false },
      { id: 'opt-3-3', text: 'Immediate borrowing from informal money lenders', isCorrect: false },
    ],
  },
];

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({ open, onClose, content }) => {
  const [assessmentMode, setAssessmentMode] = useState<'review' | 'interactive'>('review');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!content) return null;

  // Determine item type
  const rawType = (content.type || '').toLowerCase();
  const mime = (content.mimeType || '').toLowerCase();
  const isVideo =
    rawType === 'video' ||
    mime.includes('video') ||
    mime.includes('youtube') ||
    Boolean(content.artifactUrl && (content.artifactUrl.includes('youtube') || content.artifactUrl.includes('youtu.be') || content.artifactUrl.endsWith('.mp4')));

  const isPdf =
    rawType === 'pdf' ||
    rawType === 'document' ||
    mime === 'application/pdf' ||
    Boolean(content.artifactUrl && content.artifactUrl.toLowerCase().endsWith('.pdf'));

  const isAssessment =
    rawType === 'assessment' ||
    rawType === 'test' ||
    rawType.includes('quiz') ||
    mime.includes('questionset') ||
    (!isVideo && !isPdf);

  const displayTitle = content.name || content.title || 'Content Preview';
  const rawUrl = content.artifactUrl || content.streamingUrl || content.downloadUrl || '';
  const youtubeEmbedUrl = getYouTubeEmbedUrl(rawUrl);

  const questionsList = content.questions && content.questions.length > 0
    ? content.questions
    : DEFAULT_ASSESSMENT_QUESTIONS;

  const handleOptionSelect = (qId: string, optId: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleResetAssessment = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questionsList.forEach((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt && userAnswers[q.id] === correctOpt.id) {
        correct++;
      }
    });
    return {
      score: correct,
      total: questionsList.length,
      percentage: Math.round((correct / questionsList.length) * 100),
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isVideo ? 'md' : isPdf ? 'lg' : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          backgroundColor: '#1C2B4A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {isVideo && <PlayCircleOutlineIcon sx={{ color: '#E6873C', fontSize: 24 }} />}
          {isPdf && <PictureAsPdfOutlinedIcon sx={{ color: '#E6873C', fontSize: 24 }} />}
          {isAssessment && <QuizOutlinedIcon sx={{ color: '#E6873C', fontSize: 24 }} />}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayTitle}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#B0B8C4' }}>
              {isVideo ? 'Video Resource · Native Player' : isPdf ? 'PDF Document · In-App Viewer' : 'Assessment · Native Evaluator'}
              {content.duration ? ` · ${content.duration}` : ''}
              {content.timeLimit ? ` · Time: ${content.timeLimit}` : ''}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#FFFFFF', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content Body */}
      <DialogContent sx={{ p: 0, backgroundColor: '#FAF9F6' }}>
        {/* 1. Video Player */}
        {isVideo && (
          <Box sx={{ p: 2.5 }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: '#000000',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={displayTitle}
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
              ) : rawUrl ? (
                <video
                  controls
                  autoPlay
                  src={rawUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src="https://www.youtube.com/embed/EUPk_ThuWXI?autoplay=1&rel=0"
                  title={displayTitle}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  allowFullScreen
                />
              )}
            </Box>

            {content.description && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECEAE5' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                  Description
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B6862', lineHeight: 1.5 }}>
                  {content.description}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* 2. PDF Viewer */}
        {isPdf && (
          <Box sx={{ p: 2.5 }}>
            {rawUrl ? (
              <Box
                sx={{
                  width: '100%',
                  height: '620px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #D6D3CC',
                  backgroundColor: '#525659',
                }}
              >
                <iframe
                  src={`${rawUrl}#toolbar=1&navpanes=0`}
                  title={displayTitle}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1px dashed #D6D3CC',
                  borderRadius: '8px',
                }}
              >
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 60, color: '#E6873C', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#1F1E1C', mb: 1 }}>
                  {displayTitle}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B6862', maxWidth: 500, mx: 'auto', mb: 3 }}>
                  This PDF document is registered in the Swadhaar training catalog. You can download or preview it directly in your browser.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<OpenInNewIcon />}
                  sx={{
                    backgroundColor: '#E6873C',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: '#CC722B' },
                  }}
                  onClick={() => window.open(rawUrl || '/sample.pdf', '_blank')}
                >
                  Open in New Tab
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* 3. Assessment Viewer / Evaluator */}
        {isAssessment && (
          <Box sx={{ p: 3 }}>
            {/* Top Stats Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6D3CC',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Questions: ${questionsList.length}`}
                  size="small"
                  sx={{ backgroundColor: '#F3F4F6', fontWeight: 600, color: '#1C2B4A' }}
                />
                <Chip
                  label={`Passing Mark: ${content.passMark || '70%'}`}
                  size="small"
                  sx={{ backgroundColor: '#FDF3E9', fontWeight: 600, color: '#E6873C' }}
                />
                <Chip
                  label={`Time Limit: ${content.timeLimit || '15 min'}`}
                  size="small"
                  sx={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}
                />
              </Box>

              {/* Mode Toggle */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={assessmentMode === 'review' ? 'contained' : 'outlined'}
                  sx={{
                    fontSize: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: assessmentMode === 'review' ? '#1C2B4A' : '#FFFFFF',
                    borderColor: '#1C2B4A',
                    color: assessmentMode === 'review' ? '#FFFFFF' : '#1C2B4A',
                    '&:hover': {
                      backgroundColor: assessmentMode === 'review' ? '#142038' : '#F9F9F8',
                    },
                  }}
                  onClick={() => setAssessmentMode('review')}
                >
                  Answer Key Mode
                </Button>
                <Button
                  size="small"
                  variant={assessmentMode === 'interactive' ? 'contained' : 'outlined'}
                  sx={{
                    fontSize: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: assessmentMode === 'interactive' ? '#E6873C' : '#FFFFFF',
                    borderColor: '#E6873C',
                    color: assessmentMode === 'interactive' ? '#FFFFFF' : '#E6873C',
                    '&:hover': {
                      backgroundColor: assessmentMode === 'interactive' ? '#CC722B' : '#FDF3E9',
                    },
                  }}
                  onClick={() => setAssessmentMode('interactive')}
                >
                  Interactive Test Mode
                </Button>
              </Box>
            </Paper>

            {/* Interactive Mode Score Banner */}
            {assessmentMode === 'interactive' && submitted && (
              <Alert
                severity={calculateScore().percentage >= 70 ? 'success' : 'warning'}
                sx={{ mb: 3, borderRadius: '8px' }}
                action={
                  <Button color="inherit" size="small" onClick={handleResetAssessment}>
                    Try Again
                  </Button>
                }
              >
                <strong>
                  Score: {calculateScore().score} / {calculateScore().total} ({calculateScore().percentage}%)
                </strong>
                {' — '}
                {calculateScore().percentage >= 70
                  ? 'Learner passed! Meets the Swadhaar certification threshold.'
                  : 'Score below passing mark. Learner needs review before retaking.'}
              </Alert>
            )}

            {/* Questions List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {questionsList.map((q, idx) => {
                const selectedOptId = userAnswers[q.id];
                const correctOpt = q.options.find((o) => o.isCorrect);

                return (
                  <Paper
                    key={q.id || idx}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #ECEAE5',
                      borderRadius: '8px',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1F1E1C' }}>
                        Question {idx + 1}
                      </Typography>
                      {q.tags && (
                        <Typography sx={{ fontSize: '11px', color: '#8A867F' }}>
                          {q.tags}
                        </Typography>
                      )}
                    </Box>

                    <Typography sx={{ fontSize: '14px', color: '#1F1E1C', mb: 2, fontWeight: 500 }}>
                      {q.prompt}
                    </Typography>

                    {/* Options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {q.options.map((opt) => {
                        const isSelected = selectedOptId === opt.id;
                        const isAnswerKey = assessmentMode === 'review';
                        const showCorrect = isAnswerKey || (submitted && opt.isCorrect);
                        const showIncorrect = submitted && isSelected && !opt.isCorrect;

                        return (
                          <Box
                            key={opt.id}
                            onClick={() => {
                              if (assessmentMode === 'interactive') {
                                handleOptionSelect(q.id, opt.id);
                              }
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1.5,
                              px: 2,
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor: showCorrect
                                ? '#16A34A'
                                : showIncorrect
                                ? '#DC2626'
                                : isSelected
                                ? '#E6873C'
                                : '#E5E7EB',
                              backgroundColor: showCorrect
                                ? '#F0FDF4'
                                : showIncorrect
                                ? '#FEF2F2'
                                : isSelected
                                ? '#FDF3E9'
                                : '#FFFFFF',
                              cursor: assessmentMode === 'interactive' && !submitted ? 'pointer' : 'default',
                              transition: 'all 0.15s ease-in-out',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Radio
                                checked={isSelected || (isAnswerKey && opt.isCorrect)}
                                disabled={assessmentMode === 'review' || submitted}
                                size="small"
                                sx={{
                                  p: 0,
                                  color: showCorrect ? '#16A34A' : '#D6D3CC',
                                  '&.Mui-checked': {
                                    color: showCorrect ? '#16A34A' : '#E6873C',
                                  },
                                }}
                              />
                              <Typography sx={{ fontSize: '13px', color: '#1F1E1C' }}>
                                {opt.text}
                              </Typography>
                            </Box>

                            {showCorrect && (
                              <Chip
                                label="Correct Answer"
                                size="small"
                                sx={{
                                  backgroundColor: '#DCFCE7',
                                  color: '#166534',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Explanation */}
                    {q.explanation && (assessmentMode === 'review' || (submitted && assessmentMode === 'interactive')) && (
                      <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #1C2B4A' }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1C2B4A', mb: 0.3 }}>
                          Explanation:
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#4B5563' }}>
                          {q.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>

            {assessmentMode === 'interactive' && !submitted && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#E6873C',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '6px',
                    px: 3,
                    '&:hover': { backgroundColor: '#CC722B' },
                  }}
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  Submit Assessment
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #ECEAE5', backgroundColor: '#FFFFFF', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '12px', color: '#6B6862' }}>
          Swadhaar In-App Native Viewer · No external player/workspace MFE required
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isPdf && rawUrl && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon fontSize="small" />}
              sx={{
                borderColor: '#D6D3CC',
                color: '#1F1E1C',
                textTransform: 'none',
                borderRadius: '6px',
                '&:hover': { borderColor: '#1F1E1C', backgroundColor: '#F9F9F8' },
              }}
              onClick={() => window.open(rawUrl, '_blank')}
            >
              Open in New Window
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#1C2B4A',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              '&:hover': { backgroundColor: '#142038' },
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ContentPreviewModal;

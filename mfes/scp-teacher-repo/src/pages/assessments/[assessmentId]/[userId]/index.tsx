import React, { useState } from 'react';
import Header from '@/components/Header';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/router';

const AssessmentDetails = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanel(isExpanded ? panel : false);
    };

  const [assessmentData] = useState({
    studentName: 'Bharat Kumar',
    examType: 'Mid Term Exam',
    date: '2 Feb, 2024',
    totalMarks: 250,
    marksObtained: 210,
    percentage: 88,
    uploadedImages: 4,
    questions: [
      {
        id: 1,
        question: 'What is the derivative of x²?',
        marks: 3,
        score: 0,
        answer: '788',
        explanation:
          'The derivative of x² is 2x. This is because to find the derivative you take the number x is being powered to, in this case 2, and move it to the front of the variable. After doing this you subtract the number x is being powered to by one.',
        isCorrect: false,
      },
      {
        id: 2,
        question: 'What is the derivative of x⁵?',
        marks: 3,
        score: 3,
        answer: '2x',
        isCorrect: true,
      },
      {
        id: 3,
        question: 'What is the derivative of x³?',
        marks: 3,
        score: 3,
        answer: 'A long question answer here just for example.',
        isCorrect: true,
      },
      {
        id: 4,
        question: 'What is the derivative of x⁴?',
        marks: 3,
        score: 0,
        answer: '788',
        explanation:
          'The derivative of x² is 2x. This is because to find the derivative you take the number x is being powered to, in this case 2, and move it to the front of the variable. After doing this you subtract the number x is being powered to by one.',
        isCorrect: false,
      },
    ],
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
      <Header />
      <Box
        component="header"
        sx={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          padding: { xs: '12px 12px 8px 4px', md: '16px 24px 12px 16px' },
          bgcolor: '#FFFFFF',
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            width: '48px',
            height: '48px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& .MuiSvgIcon-root': {
              color: '#4D4639',
              width: '24px',
              height: '24px',
            },
          }}
        >
          <KeyboardBackspaceOutlinedIcon />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 0 0',
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#4D4639',
              fontSize: { xs: '22px', md: '24px' },
              lineHeight: 1.27,
              fontWeight: 400,
            }}
          >
            {assessmentData.studentName}
          </Typography>
          <Typography
            sx={{
              color: '#7C766F',
              fontSize: { xs: '14px', md: '16px' },
              lineHeight: 1.43,
              fontWeight: 500,
              letterSpacing: '0.71%',
            }}
          >
            {assessmentData.examType}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mx: '16px', my: '16px' }}>
        {/* Images Info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #DBDBDB',
            borderRadius: '12px',
            p: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
          }}
        >
          <Box>
            <Typography
              sx={{
                color: '#000000',
                fontSize: { xs: '14px', md: '16px' },
                fontWeight: 500,
                letterSpacing: '0.71%',
                lineHeight: 1.43,
              }}
            >
              {assessmentData.uploadedImages} images uploaded
            </Typography>
            <Typography
              sx={{
                color: '#7C766F',
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 500,
                letterSpacing: '4.17%',
                lineHeight: 1.33,
              }}
            >
              {assessmentData.date}
            </Typography>
          </Box>
          <IconButton
            sx={{
              color: '#1F1B13',
              p: 0,
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 24, md: 28 },
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>

        {/* Approve Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#FDBE16',
            color: '#4D4639',
            textTransform: 'none',
            borderRadius: '100px',
            height: { xs: '40px', md: '48px' },
            fontSize: { xs: '14px', md: '16px' },
            fontWeight: 500,
            letterSpacing: '0.71%',
            maxWidth: { xs: '100%', md: '400px' },
            display: 'block',
            margin: '0 auto',
            '&:hover': {
              bgcolor: '#FDBE16',
            },
          }}
        >
          Approve Marks & Notify Learner
        </Button>
      </Box>

      <Box
        sx={{
          bgcolor: '#F8EFE7',
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
          pt: { xs: 2, md: 3 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            // maxWidth: { xs: '360px', md: '800px' },
            margin: '0 auto',
            px: { xs: 2, md: 3 },
          }}
        >
          {/* Marks Display */}
          <Typography
            sx={{
              color: '#1F1B13',
              fontSize: { xs: '14px', md: '16px' },
              fontWeight: 500,
              letterSpacing: '0.71%',
              lineHeight: 1.43,
              mb: { xs: 2, md: 3 },
            }}
          >
            Marks : {assessmentData.marksObtained}/{assessmentData.totalMarks} (
            {assessmentData.percentage}%)
          </Typography>

          {/* Awaiting Approval Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              mb: { xs: 2, md: 3 },
            }}
          >
            <Box
              component="span"
              sx={{
                width: { xs: 18, md: 20 },
                height: { xs: 18, md: 20 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': {
                  width: { xs: 15, md: 16 },
                  height: { xs: 15, md: 16 },
                  color: '#1C1B1F',
                },
              }}
            >
              <KeyboardArrowDownIcon />
            </Box>
            <Typography
              sx={{
                color: '#1F1B13',
                fontSize: { xs: '14px', md: '16px' },
                fontWeight: 400,
                letterSpacing: '1.79%',
                lineHeight: 1.43,
              }}
            >
              Awaiting Your Approval
            </Typography>
          </Box>

          {/* Assessment Info */}
          <Box
            sx={{
              bgcolor: '#F8EFE7',
              borderRadius: '16px',
              p: { xs: 2, md: 3 },
              mb: { xs: 2, md: 3 },
            }}
          >
            <Typography
              sx={{
                color: '#7C766F',
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 500,
                letterSpacing: '4.17%',
                lineHeight: 1.33,
                mb: { xs: 1.5, md: 2 },
              }}
            >
              AI Evaluation On : {assessmentData.date}
            </Typography>

            <Divider sx={{ borderColor: '#D0C5B4', mb: { xs: 1.5, md: 2 } }} />

            <Typography
              sx={{
                color: '#7C766F',
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 500,
                letterSpacing: '4.17%',
                lineHeight: 1.33,
                mb: { xs: 2, md: 3 },
              }}
            >
              {assessmentData.questions.filter((q) => q.isCorrect).length} out
              of {assessmentData.questions.length} correct answers
            </Typography>

            {/* Questions List */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: '16px', md: '24px' },
              }}
            >
              {assessmentData.questions.map((question, index) => (
                <Box
                  key={question.id}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: '16px', md: '24px' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: question.explanation ? { xs: 1, md: 1.5 } : 0,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: '#1F1B13',
                          fontSize: { xs: '14px', md: '16px' },
                          fontWeight: 400,
                          letterSpacing: '1.79%',
                          lineHeight: 1.43,
                          mb: { xs: 0.5, md: 1 },
                        }}
                      >
                        Q{index + 1}. {question.question}
                      </Typography>
                      <Typography
                        sx={{
                          color: question.isCorrect ? '#1A8825' : '#BA1A1A',
                          fontSize: { xs: '16px', md: '18px' },
                          fontWeight: 500,
                          letterSpacing: '0.94%',
                          lineHeight: 1.5,
                        }}
                      >
                        {question.answer}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: { xs: '4px 8px', md: '6px 12px' },
                        bgcolor: question.isCorrect ? '#1A8825' : '#BA1A1A',
                        borderRadius: '4px',
                        border: '1px solid #FFFFFF',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#FFFFFF',
                          fontSize: { xs: '14px', md: '16px' },
                        }}
                      >
                        {question.score}/{question.marks}
                      </Typography>
                      <BorderColorIcon
                        sx={{
                          color: '#FFFFFF',
                          fontSize: { xs: 18, md: 20 },
                        }}
                      />
                    </Box>
                  </Box>

                  {!question.isCorrect && question.explanation && (
                    <Accordion
                      expanded={expandedPanel === `panel-${question.id}`}
                      onChange={handleAccordionChange(`panel-${question.id}`)}
                      sx={{
                        bgcolor: '#F7F7F7',
                        border: '1px solid #D0C5B4',
                        borderRadius: '8px !important',
                        boxShadow: 'none',
                        '&:before': {
                          display: 'none',
                        },
                        '& .MuiAccordionSummary-root': {
                          minHeight: { xs: '48px', md: '56px' },
                          p: 0,
                        },
                        '& .MuiAccordionSummary-content': {
                          m: 0,
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          expandedPanel === `panel-${question.id}` ? (
                            <KeyboardArrowUpIcon sx={{ color: '#1C1B1F' }} />
                          ) : (
                            <KeyboardArrowDownIcon sx={{ color: '#1C1B1F' }} />
                          )
                        }
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: { xs: 1, md: 1.5 },
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#1F1B13',
                            fontSize: { xs: '14px', md: '16px' },
                            fontWeight: 500,
                          }}
                        >
                          Explanation
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: { xs: 1, md: 1.5 },
                          borderTop: '1px solid #D0C5B4',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#1F1B13',
                            fontSize: { xs: '14px', md: '16px' },
                            fontWeight: 400,
                            letterSpacing: '1.79%',
                            lineHeight: 1.43,
                          }}
                        >
                          {question.explanation}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
  locale,
}: {
  params: any;
  locale: string;
}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default AssessmentDetails;

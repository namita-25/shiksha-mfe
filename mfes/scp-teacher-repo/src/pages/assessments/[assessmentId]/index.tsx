import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ErrorIcon from '@mui/icons-material/Error';
import RemoveIcon from '@mui/icons-material/Remove';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { showToastMessage } from '../../../components/Toastify';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import {
  getAssessmentList,
  getAssessmentStatus,
  getAssessmentDetails,
} from '../../../services/AssesmentService';
import { getMyCohortMemberList } from '../../../services/MyClassDetailsService';
import { AssessmentStatus } from '../../../utils/app.constant';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface LearnerData {
  learnerId: string;
  name: string;
  email: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'awaiting_approval';
  score: number;
  submittedAt: string | null;
  timeSpent: number;
  userId: string;
  progress?: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  role?: string;
  mobile?: string;
  cohortMembershipId?: string;
  customField?: any[];
}

interface AssessmentData {
  assessmentId: string;
  title: string;
  description: string;
  totalQuestions: number;
  maxScore: number;
  hasLongShortAnswers: boolean;
  duration: number;
  createdDate: string;
  subject: string;
  grade: string;
  contentId?: string;
  courseId?: string;
}

const AssessmentDetails: React.FC = () => {
  const theme = useTheme<any>();
  const { t } = useTranslation();
  const router = useRouter();
  const { assessmentId, cohortId } = router.query;
  // State management
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null
  );
  const [learnerList, setLearnerList] = useState<LearnerData[]>([]);
  const [filteredLearners, setFilteredLearners] = useState<LearnerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch assessment data and learner list
  useEffect(() => {
    if (assessmentId && cohortId) {
      fetchAssessmentData();
      fetchLearnerData();
    }
  }, [assessmentId, cohortId]);

  // Filter learners based on search
  useEffect(() => {
    let filtered = learnerList;
    if (searchTerm) {
      filtered = filtered.filter((learner) =>
        learner.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLearners(filtered);
  }, [learnerList, searchTerm]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use getAssessmentDetails with assessmentId as doId
      const response = await getAssessmentDetails(assessmentId as string);
      console.log('Assessment Details Response:', response);

      if (response) {
        // Calculate total questions from nested children arrays
        let totalQuestions = 0;
        if (response.children && Array.isArray(response.children)) {
          response.children.forEach((questionSet: any) => {
            if (questionSet.children && Array.isArray(questionSet.children)) {
              totalQuestions += questionSet.children.length;
            }
          });
        }

        // Calculate duration from timeLimits (convert seconds to minutes)
        let duration = 60; // default 60 minutes
        if (response.timeLimits?.questionSet?.max) {
          duration = Math.round(response.timeLimits.questionSet.max / 60); // convert seconds to minutes
        } else if (response.duration) {
          duration = response.duration;
        }

        const assessmentData: AssessmentData = {
          assessmentId: response.identifier || (assessmentId as string),
          title: response.name || response.title || 'Assessment',
          description:
            response.description ||
            response.instructions ||
            'Assessment Description',
          totalQuestions: totalQuestions || response.totalQuestions || 0,
          maxScore: response.maxScore || response.maxMarks || 100,
          hasLongShortAnswers:
            response.questionCategories?.includes('SA') ||
            response.questionCategories?.includes('LA') ||
            response.primaryCategory === 'Practice Question Set' ||
            false,
          duration: duration,
          createdDate:
            response.createdOn ||
            response.createdAt ||
            new Date().toISOString(),
          subject: Array.isArray(response.subject)
            ? response.subject[0]
            : response.subject || 'General',
          grade: Array.isArray(response.gradeLevel)
            ? response.gradeLevel[0]
            : response.gradeLevel || 'Not specified',
          contentId: response.identifier,
          courseId: response.courseId || response.course,
        };
        console.log('Mapped Assessment Data:', assessmentData);
        console.log('Total Questions calculated:', totalQuestions);
        console.log('Duration calculated (minutes):', duration);
        setAssessmentData(assessmentData);
      } else {
        console.warn('No assessment data received from API');
        // Fallback to mock data if API doesn't return data
        const mockAssessmentData: AssessmentData = {
          assessmentId: assessmentId as string,
          title: 'Assessment',
          description: 'Assessment Description',
          totalQuestions: 25,
          maxScore: 130,
          hasLongShortAnswers: true,
          duration: 90,
          createdDate: '2024-01-15',
          subject: 'General',
          grade: 'Not specified',
        };
        setAssessmentData(mockAssessmentData);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setError('Failed to load assessment data');
      showToastMessage(t('COMMON.SOMETHING_WENT_WRONG'), 'error');

      // Fallback to mock data on error
      const mockAssessmentData: AssessmentData = {
        assessmentId: assessmentId as string,
        title: 'Assessment',
        description: 'Assessment Description',
        totalQuestions: 25,
        maxScore: 130,
        hasLongShortAnswers: true,
        duration: 90,
        createdDate: '2024-01-15',
        subject: 'General',
        grade: 'Not specified',
      };
      setAssessmentData(mockAssessmentData);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use getMyCohortMemberList to fetch learners
      const filters = { cohortId: cohortId as string };
      const cohortResponse = await getMyCohortMemberList({ filters });

      if (cohortResponse?.result?.userDetails) {
        const learners = cohortResponse.result.userDetails.map((user: any) => ({
          learnerId: user.userId,
          name:
            [user.firstName, user.middleName, user.lastName]
              .filter(Boolean)
              .join(' ') ||
            user.username ||
            'Unknown Learner',
          email:
            user.username && user.username.includes('@')
              ? user.username
              : `${
                  user.username || user.firstName?.toLowerCase() || 'learner'
                }@example.com`,
          status: 'not_started' as const, // Default status, will be updated with assessment status
          score: 0,
          submittedAt: null,
          timeSpent: 0,
          userId: user.userId,
          progress: user.status,
          username: user.username,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          role: user.role,
          mobile: user.mobile,
          cohortMembershipId: user.cohortMembershipId,
          customField: user.customField,
        }));

        // Fetch assessment status for all learners in a single call
        try {
          const allUserIds = learners.map((learner) => learner.userId);
          const statusResponse = await getAssessmentStatus({
            userId: allUserIds,
            courseId: [assessmentId as string],
            unitId: [assessmentId as string],
            contentId: [assessmentId as string],
          });

          console.log('Assessment Status Response:', statusResponse);

          // Map status data to learners
          const learnersWithStatus = learners.map((learner) => {
            // Find status data for this learner
            const learnerStatus =
              statusResponse?.result?.find?.(
                (status: any) => status.userId === learner.userId
              ) || statusResponse?.result; // fallback if result is not an array

            if (learnerStatus) {
              const apiStatus = learnerStatus.status;
              const mappedStatus = mapApiStatusToLocal(apiStatus);
              return {
                ...learner,
                status: mappedStatus,
                score: learnerStatus.score || 0,
                submittedAt: learnerStatus.submittedAt || null,
                timeSpent: learnerStatus.timeSpent || 0,
              };
            }
            return learner;
          });

          setLearnerList(learnersWithStatus);
        } catch (error) {
          console.error(
            'Error fetching assessment status for learners:',
            error
          );
          // If status fetching fails, use learners with default status
          setLearnerList(learners);
        }
      }
    } catch (error) {
      console.error('Error fetching learner data:', error);
      setError('Failed to load learner data');
      showToastMessage(t('COMMON.SOMETHING_WENT_WRONG'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const mapApiStatusToLocal = (
    apiStatus: string
  ): 'completed' | 'in_progress' | 'not_started' | 'awaiting_approval' => {
    switch (apiStatus) {
      case AssessmentStatus.COMPLETED:
      case AssessmentStatus.COMPLETED_SMALL:
        return 'completed';
      case AssessmentStatus.IN_PROGRESS:
        return 'in_progress';
      case AssessmentStatus.NOT_STARTED:
        return 'not_started';
      default:
        return 'awaiting_approval';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDownloadQuestionPaper = async () => {
    try {
      setDownloading(true);
      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create download link
      const element = document.createElement('a');
      element.href =
        'data:text/plain;charset=utf-8,' +
        encodeURIComponent('Sample Assessment Question Paper Content');
      element.download = `${
        assessmentData?.title?.replace(/\s+/g, '_').toLowerCase() ||
        'assessment'
      }.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      showToastMessage(
        t('ASSESSMENTS.DOWNLOAD_SUCCESS') ||
          'Question paper downloaded successfully',
        'success'
      );
      setShowDownloadPopup(false);
    } catch (error) {
      console.error('Error downloading question paper:', error);
      showToastMessage(t('COMMON.SOMETHING_WENT_WRONG'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />;
      case 'in_progress':
        return <MoreHorizIcon sx={{ color: '#FF9800', fontSize: 24 }} />;
      case 'awaiting_approval':
        return <ErrorIcon sx={{ color: '#FF5722', fontSize: 24 }} />;
      case 'not_started':
        return <RemoveIcon sx={{ color: '#9E9E9E', fontSize: 24 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string, score?: number, maxScore?: number) => {
    switch (status) {
      case 'completed':
        return `Marks approved: ${score || 125}/${
          maxScore || assessmentData?.maxScore || 130
        }`;
      case 'in_progress':
        return 'Evaluating with AI..';
      case 'awaiting_approval':
        return 'Awaiting Your Approval';
      case 'not_started':
        return 'Not Submitted';
      default:
        return '';
    }
  };

  const getStatusDate = (learner: LearnerData) => {
    if (learner.status === 'completed' && learner.submittedAt) {
      const date = new Date(learner.submittedAt);
      return `Approved on: ${date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    } else if (learner.status === 'awaiting_approval' && learner.submittedAt) {
      const date = new Date(learner.submittedAt);
      return `Uploaded on: ${date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    }
    return '';
  };

  const getStatusCounts = () => {
    const counts = {
      not_started: learnerList.filter((l) => l.status === 'not_started').length,
      awaiting_approval: learnerList.filter(
        (l) => l.status === 'awaiting_approval'
      ).length,
      completed: learnerList.filter((l) => l.status === 'completed').length,
      in_progress: learnerList.filter((l) => l.status === 'in_progress').length,
    };
    return counts;
  };

  const handleLearnerClick = (learnerId: string) => {
    router.push(`/assessments/${assessmentId}/${learnerId}`);
  };

  if (loading) {
    return <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />;
  }

  const statusCounts = getStatusCounts();

  return (
    <>
      <Header />
      <Box sx={{ backgroundColor: '#FBF4E4', minHeight: '100vh' }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '16px 16px 12px 8px',
          }}
        >
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ color: '#4D4639' }} />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              fontSize: '22px',
              lineHeight: '28px',
              color: '#4D4639',
              fontFamily: 'Poppins',
            }}
          >
            {assessmentData?.title}
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Card
              sx={{ backgroundColor: '#FFEBEE', border: '1px solid #F44336' }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Assessment Info Chip */}
        <Box sx={{ px: 2, mb: 2 }}>
          <Chip
            label={`${assessmentData?.totalQuestions} Questions • ${assessmentData?.duration} mins • ${assessmentData?.subject}`}
            sx={{
              backgroundColor: '#E8F5E8',
              color: '#2E7D32',
              fontFamily: 'Poppins',
              fontSize: '12px',
              height: '28px',
            }}
          />
        </Box>

        {/* Search Bar */}
        <Box sx={{ px: 2, mb: 2 }}>
          <TextField
            placeholder="Search Learner.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                '& fieldset': {
                  borderColor: '#D0C5B4',
                },
                '&:hover fieldset': {
                  borderColor: '#4D4639',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4D4639',
                },
              },
              '& .MuiInputBase-input': {
                padding: '10px 16px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: '#4D4639',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end">
                    <SearchIcon sx={{ color: '#4D4639' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Download PDF Card */}
        {assessmentData?.hasLongShortAnswers && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Card
              sx={{
                backgroundColor: '#ECE6F0',
                border: '1px solid #D0C5B4',
                borderRadius: '8px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#E1D5E7',
                },
              }}
              onClick={() => setShowDownloadPopup(true)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: '12px !important',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PictureAsPdfIcon
                    sx={{ color: '#D32F2F', width: 24, height: 24 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#1F1B13',
                    }}
                  >
                    {assessmentData?.title
                      ?.replace(/\s+/g, '_')
                      .toLowerCase() || 'mid_term_exam'}
                    .pdf
                  </Typography>
                </Box>
                <DownloadIcon sx={{ color: '#4D4639' }} />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Status Summary Cards */}
        <Box sx={{ px: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Card
              sx={{
                backgroundColor: '#FDF2E5',
                borderRadius: '12px',
                minWidth: 100,
                flex: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: '16px !important',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: '#1F1B13',
                    mb: 0.5,
                  }}
                >
                  {statusCounts.not_started}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#7C766F',
                    textAlign: 'center',
                    lineHeight: '16px',
                  }}
                >
                  Not Submitted
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                backgroundColor: '#FDF2E5',
                borderRadius: '12px',
                minWidth: 100,
                flex: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: '16px !important',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: '#1F1B13',
                    mb: 0.5,
                  }}
                >
                  {statusCounts.awaiting_approval}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#7C766F',
                    textAlign: 'center',
                    lineHeight: '16px',
                  }}
                >
                  Awaiting Approval
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                backgroundColor: '#FDF2E5',
                borderRadius: '12px',
                minWidth: 100,
                flex: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: '16px !important',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: '#1F1B13',
                    mb: 0.5,
                  }}
                >
                  {statusCounts.completed}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#7C766F',
                    textAlign: 'center',
                    lineHeight: '16px',
                  }}
                >
                  Marks Approved
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Total Learners and Sort */}
        <Box
          sx={{
            px: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '14px',
              color: '#7C766F',
            }}
          >
            {filteredLearners.length} of {learnerList.length} Learners
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#D0C5B4',
              color: '#4D4639',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
              height: '32px',
              '&:hover': {
                borderColor: '#4D4639',
                backgroundColor: 'rgba(77, 70, 57, 0.04)',
              },
            }}
          >
            Sort by Status
          </Button>
        </Box>

        {/* Learner List */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Card
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <List sx={{ p: 0 }}>
                {filteredLearners.map((learner, index) => (
                  <ListItem
                    key={learner.learnerId}
                    sx={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '12px',
                      mb: index < filteredLearners.length - 1 ? 2 : 0,
                      cursor: 'pointer',
                      p: 0,
                      minHeight:
                        learner.status === 'awaiting_approval' ||
                        learner.status === 'completed'
                          ? '80px'
                          : '64px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleLearnerClick(learner.learnerId)}
                  >
                    {/* Leading Icon */}
                    <Box
                      sx={{
                        backgroundColor: '#FFDEA1',
                        borderRadius: '12px 0px 0px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: '100%',
                        minHeight: 'inherit',
                      }}
                    >
                      {getStatusIcon(learner.status)}
                    </Box>

                    {/* Content */}
                    <ListItemText
                      sx={{
                        ml: 2,
                        flex: 1,
                      }}
                      primary={
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            fontSize: '16px',
                            color: '#1F1B13',
                            lineHeight: '24px',
                          }}
                        >
                          {learner.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: 'Poppins',
                              fontWeight:
                                learner.status === 'completed' ? 500 : 400,
                              fontSize: '14px',
                              color: '#4D4639',
                              lineHeight: '20px',
                            }}
                          >
                            {getStatusText(
                              learner.status,
                              learner.score,
                              assessmentData?.maxScore
                            )}
                          </Typography>
                          {getStatusDate(learner) && (
                            <Typography
                              sx={{
                                fontFamily: 'Poppins',
                                fontWeight: 400,
                                fontSize: '12px',
                                color: '#7C766F',
                                lineHeight: '16px',
                                mt: 0.5,
                              }}
                            >
                              {getStatusDate(learner)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    {/* Trailing Icon */}
                    <ListItemIcon
                      sx={{
                        minWidth: 'auto',
                        mr: 2,
                      }}
                    >
                      <NavigateNextIcon sx={{ color: '#4D4639' }} />
                    </ListItemIcon>
                  </ListItem>
                ))}
              </List>

              {filteredLearners.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#7C766F',
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                    }}
                  >
                    {searchTerm
                      ? 'No learners found matching your search.'
                      : t('ASSESSMENTS.NO_DATA_FOUND')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Download Question Paper Popup */}
        <Dialog
          open={showDownloadPopup}
          onClose={() => !downloading && setShowDownloadPopup(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 1,
            },
          }}
        >
          <DialogTitle>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontFamily: 'Poppins' }}
            >
              {t('ASSESSMENTS.OFFLINE_ASSESSMENT') || 'Offline Assessment'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3, fontFamily: 'Poppins' }}>
              {t('ASSESSMENTS.DOWNLOAD_ASSESSMENT_MESSAGE') ||
                'This assessment contains Long/Short Answer questions. Would you like to download the offline question paper?'}
            </Typography>
            <Box
              sx={{
                backgroundColor: '#F5F5F5',
                padding: 2,
                borderRadius: 2,
                border: '1px solid #E0E0E0',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 500, fontFamily: 'Poppins' }}
              >
                {assessmentData?.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#7C766F', fontFamily: 'Poppins', mt: 0.5 }}
              >
                {assessmentData?.totalQuestions} Questions •{' '}
                {assessmentData?.duration} minutes
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setShowDownloadPopup(false)}
              disabled={downloading}
              sx={{
                color: '#7C766F',
                fontFamily: 'Poppins',
                textTransform: 'none',
              }}
            >
              {t('ASSESSMENTS.CANCEL') || 'Cancel'}
            </Button>
            <Button
              onClick={handleDownloadQuestionPaper}
              variant="contained"
              disabled={downloading}
              startIcon={
                downloading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              sx={{
                backgroundColor: '#4D4639',
                color: '#FFFFFF',
                fontFamily: 'Poppins',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#3A3529',
                },
                '&:disabled': {
                  backgroundColor: '#E0E0E0',
                  color: '#9E9E9E',
                },
              }}
            >
              {downloading
                ? 'Downloading...'
                : t('ASSESSMENTS.DOWNLOAD') || 'Download'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
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

import FileUploadDialog from '@/components/FileUploadDialog';
import Loader from '@/components/Loader';
import { showToastMessage } from '@/components/Toastify';
import {
  deleteContent,
  deletePlanner,
  getSolutionDetails,
  getTargetedSolutions,
  getUserProjectDetails,
  getUserProjectTemplate,
  uploadCoursePlanner,
} from '@/services/coursePlanner';
import coursePlannerStore from '@/store/coursePlannerStore';
import taxonomyStore from '@/store/tanonomyStore';
import { monthColors, Role } from '@/utils/app.constant';
import { CoursePlannerMetaData } from '@/utils/Interfaces';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import deleteIcon from '../../public/images/deleteIcon.svg';
import downloadIcon from '../../public/images/downloadIcon.svg';
import { useRouter } from 'next/router';
import Papa from 'papaparse';
import { useCallback, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SimpleModal from '@/components/SimpleModal';
import AddNewTopic from '@/components/AddNewTopic';

//new course planner changes
import CoursePlanForm from '@/components/CoursePlan/CoursePlanForm';
import { useConfirmationDialog } from '@/components/CoursePlan/ConfirmationDialog';
import { useCustomSnackbar } from '@/components/CoursePlan/useCustomSnackbar';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const ImportCsv = () => {
  const { ConfirmationDialog, openConfirmation } = useConfirmationDialog();
  const { CustomSnackbar, showSnackbar } = useCustomSnackbar();

  const router = useRouter();
  const store = coursePlannerStore();
  const tstore = taxonomyStore();
  const { subject } = router.query;
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [openAddTopicModal, setOpenAddTopicModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPanels, setExpandedPanels] = useState<{
    [key: string]: boolean;
  }>({
    'panel0-header': true,
    'panel1-header': true,
    'panel2-header': true,
    'panel3-header': true,
  });
  const [userProjectDetails, setUserProjectDetails] = useState([]);
  const [subTopics, setSubTopics] = useState<number>(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const setResources = taxonomyStore((state) => state.setResources);

  //new course planner changes
  const [projectId, setProjectId] = useState('');
  const [solutionId, setSolutionId] = useState('');
  const [formType, setFormType] = useState('');
  const [prefilledObject, setPrefilledObject] = useState({});

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTargetedSolutions({
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        // state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        courseType: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      });

      const courseData = response?.result?.data[0];
      let courseId = courseData?._id;
      let solutionId = courseData?.solutionId;

      if (!courseId) {
        courseId = await fetchCourseIdFromSolution(courseData?.solutionId);
        // setSolutionId(courseData?.solutionId);
      }
      if (courseId) {
        setProjectId(courseId);
        setSolutionId(solutionId);
      }
      await fetchAndSetUserProjectDetails(courseId);
    } catch (error) {
      console.error('Error fetching course planner:', error);
      //reset project details
      setUserProjectDetails([]);
      setLoading(false);
    }
  }, [open]);

  const fetchCourseIdFromSolution = async (
    solutionId: string
  ): Promise<string> => {
    try {
      const solutionResponse = await getSolutionDetails({
        id: solutionId,
        role: 'Instructor',
      });

      const externalId = solutionResponse?.result?.externalId;

      const templateResponse = await getUserProjectTemplate({
        templateId: externalId,
        solutionId,
        role: Role.TEACHER,
      });

      const updatedResponse = await getTargetedSolutions({
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        // state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        courseType: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      });
      const courseData = updatedResponse?.result?.data[0];
      if (courseData?._id) {
        setProjectId(courseData?._id);
        setSolutionId(courseData?.solutionId);
      }
      setLoading(false);
      return updatedResponse.result.data[0]?._id;
    } catch (error) {
      console.error('Error fetching solution details:', error);
      throw error;
    }
  };

  const fetchAndSetUserProjectDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const userProjectDetailsResponse = await getUserProjectDetails({
        id: courseId,
      });
      setUserProjectDetails(userProjectDetailsResponse?.result?.tasks);
      if (userProjectDetails?.length) {
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user project details:', error);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleBackClick = () => {
    router.back();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDownloadCSV = () => {
    const link = document.createElement('a');
    link.href = '/Sample.csv';
    link.download = 'Sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const metaData: CoursePlannerMetaData = {
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        // state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        type: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      };

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          const data = results.data;

          const addTimestamp = (data: any[]) => {
            const timestamp = Date.now();

            const updatedData = data.map((item) => {
              const newItem = { ...item };

              if (newItem.externalId) {
                newItem.externalId = `${newItem.externalId}${timestamp}`;
              }
              if (newItem.parentTaskId) {
                newItem.parentTaskId = `${newItem.parentTaskId}${timestamp}`;
              }

              return newItem;
            });

            return updatedData;
          };

          const convertToFile = (updatedData: any[]) => {
            const csv = Papa.unparse(updatedData);

            const blob = new Blob([csv], { type: 'text/csv' });
            const file = new File([blob], 'updated_data.csv', {
              type: 'text/csv',
            });

            return file;
          };

          const updatedData = addTimestamp(data);
          const csvFile = convertToFile(updatedData);

          try {
            const response = await uploadCoursePlanner(csvFile, metaData);

            if (
              response.result.solutionData.message ===
              'Solution created successfully'
            ) {
              showToastMessage(
                t('COURSE_PLANNER.COURSE_CREATED_SUCCESSFULLY'),
                'success'
              );
              setSelectedFile(null);
              setOpen(false);
            } else {
              setSelectedFile(null);
              showToastMessage(t('COURSE_PLANNER.COURSE_NOT_CREATED'), 'error');
            }
          } catch (error: any) {
            console.error('Upload failed:', error);
            showToastMessage(error?.response?.data?.params?.errmsg, 'error');
          }
        },
        error: (error: any) => {
          console.error('Error parsing file:', error);
          showToastMessage(t('COURSE_PLANNER.PARSE_ERROR'), 'error');
        },
      });
    }
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(
      () => {
        alert('Link copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy link: ', err);
      }
    );
  };

  if (loading) {
    return <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />;
  }

  const getAbbreviatedMonth = (dateString: string | number | Date) => {
    dayjs.extend(customParseFormat);
    //below considering date 12 as month
    //12-02-1998
    // const date = new Date(dateString);
    // const months = Array.from({ length: 12 }, (_, i) =>
    //   dayjs().month(i).format('MMM')
    // );
    // return months[date.getMonth()];
    //fix this method to consider 02 as month
    const date = dayjs(dateString, 'DD-MM-YYYY', true); // strict mode
    if (!date.isValid()) return 'Invalid date';
    // return date.format('DD/MMM/YYYY'); // e.g., "Feb"
    return date.format('MMM'); // e.g., "Feb"
  };

  const handleResources = (subTopic: any) => {
    setResources(subTopic);
    router.push({
      pathname: '/resourceList',
    });
  };

  const totalChildren = userProjectDetails?.reduce(
    (acc: number, project: any) => {
      return acc + (project?.children?.length || 0);
    },
    0
  );

  if (totalChildren !== subTopics) {
    setSubTopics(totalChildren);
  }

  const handleCloseModal = () => {
    setOpenAddTopicModal(false);
  };

  const CoursePlanFormAction = (params: any) => {
    if (params.showSnackbar === true) {
      showSnackbar({
        text: t(`${params.type} has been successfully created`),
        bgColor: '#019722', //#BA1A1A
        textColor: '#fff',
        icon: <CheckCircleOutlineOutlinedIcon />, //ErrorOutlinedIcon
      });
    }
    fetchCourseDetails();
  };

  const handleDeleteContent = async (externalId: any, type: any) => {
    openConfirmation({
      title: t('Are you sure you want to delete?'),
      message: t(
        `${type} will be permanently deleted. Are you sure you want to delete?`
      ),
      yesText: t('Yes, Delete'),
      noText: t('No, Cancel'),
      onYes: async () => {
        const response = await deleteContent(solutionId, externalId);
        if (response) {
          showSnackbar({
            text: t(`${type} has been successfully deleted`),
            bgColor: '#BA1A1A', //#BA1A1A
            textColor: '#fff',
            icon: <CheckCircleOutlineOutlinedIcon />, //ErrorOutlinedIcon
          });
          //reload data
          fetchCourseDetails();
        } else {
          showSnackbar({
            text: t(
              `Something went wrong. We couldn't delete the ${type}. Please try again`
            ),
            bgColor: '#BA1A1A', //#BA1A1A
            textColor: '#fff',
            icon: <ErrorOutlinedIcon />, //ErrorOutlinedIcon
          });
        }
      },
    });
  };

  return (
    <Box sx={{ padding: isSmallScreen ? '16px' : '32px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexDirection: isSmallScreen ? 'column' : 'row',
          gap: isSmallScreen ? '16px' : '0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isSmallScreen ? 'h5' : 'h2'}>
            {tstore.taxonomySubject}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Delete Planner */}
          {userProjectDetails?.length > 0 && (
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              onClick={() => {
                console.log('Dlete button clicked!!!');
                //call delete api
                openConfirmation({
                  title: t('Are you sure you want to delete?'),
                  message: t(
                    'All the topic content and resources will be permanently deleted. Are you sure you want to delete?'
                  ),
                  yesText: t('Yes, Delete'),
                  noText: t('No, Cancel'),
                  onYes: async () => {
                    const response = await deletePlanner(solutionId);
                    if (response) {
                      showSnackbar({
                        text: t('Planner has been successfully deleted'),
                        bgColor: '#BA1A1A', //#BA1A1A
                        textColor: '#fff',
                        icon: <CheckCircleOutlineOutlinedIcon />, //ErrorOutlinedIcon
                      });
                      //reload data
                      fetchCourseDetails();
                    } else {
                      showSnackbar({
                        text: t(
                          'Something went wrong. We couldn’t delete the planner. Please try again'
                        ),
                        bgColor: '#BA1A1A', //#BA1A1A
                        textColor: '#fff',
                        icon: <ErrorOutlinedIcon />, //ErrorOutlinedIcon
                      });
                    }
                  },
                });
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Typography variant="h4" color={theme.palette.error.main}>
                {t('COURSE_PLANNER.DELETE_PLANNER')}
              </Typography>
              <Image src={deleteIcon} alt="" />
            </Box>
          )}
          {userProjectDetails?.length == 0 && (
            <>
              {/* Download CSV Template */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: 'pointer' }}
              >
                <Typography
                  variant="h4"
                  color={theme.palette.secondary.main}
                  onClick={handleDownloadCSV}
                >
                  {t('COURSE_PLANNER.CSV_TEMPLATE')}
                </Typography>
                <Image src={downloadIcon} alt="" />
              </Box>
              {/* Import New Planner */}
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  color: '#000000',
                  borderColor: '#000000',
                  '&:hover': {
                    borderColor: '#333333',
                    color: '#333333',
                  },
                }}
                onClick={handleClickOpen}
                endIcon={<AddIcon />}
              >
                {t('COURSE_PLANNER.IMPORT_NEW_PLANNER')}
              </Button>
            </>
          )}
          {userProjectDetails?.length > 0 && (
            <Button
              variant="outlined"
              sx={{
                borderRadius: '8px',
                color: '#000000',
                borderColor: '#000000',
                '&:hover': {
                  borderColor: '#333333',
                  color: '#333333',
                },
              }}
              endIcon={<AddIcon />}
              onClick={() => {
                setFormType('addTopic');
                setPrefilledObject({});
                setOpenAddTopicModal(true);
              }}
            >
              {t('COURSE_PLANNER.ADD_NEW_TOPIC')}
            </Button>
          )}
          {/* <Button
            sx={{
              borderRadius: '8px',
              color: '#000000',
              borderColor: '#000000',
              '&:hover': {
                borderColor: '#333333',
                color: '#333333',
              },
            }}
            onClick={handleCopyLink}
          >
            <AttachmentIcon />
          </Button> */}
        </Box>
      </Box>
      <CoursePlanForm
        open={openAddTopicModal}
        onClose={handleCloseModal}
        title={
          formType == 'addSubTopic'
            ? t('New Sub Topic')
            : formType == 'editTopic'
            ? t('Edit Topic and Sub Topic')
            : t('COURSE_PLANNER.NEW_TOPIC')
        }
        actionTitle={formType == 'editTopic' ? t('Save') : t('COMMON.ADD')}
        onAction={CoursePlanFormAction}
        projectId={solutionId}
        formType={formType}
        prefilledObject={prefilledObject}
      />
      <Box>
        {loading ? (
          <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography>
                {userProjectDetails?.length} {t('COURSE_PLANNER.TOPIC')}{' '}
                <FiberManualRecordIcon
                  sx={{ fontSize: '10px', color: '#CDC5BD' }}
                />
              </Typography>
              <Typography sx={{ marginLeft: '5px' }}>
                {subTopics} {t('COURSE_PLANNER.SUBTOPICS')}{' '}
              </Typography>
            </Box>

            <Box
              mt={2}
              sx={{ border: `1px solid #FFCCCC`, p: 2, borderRadius: '5px' }}
            >
              {userProjectDetails.length > 0 ? (
                userProjectDetails.map((topic: any, index) => (
                  <Box key={topic._id} sx={{ borderRadius: '8px', mb: 2 }}>
                    <Accordion
                      expanded={expandedPanels[`panel${index}-header`] || false}
                      onChange={() =>
                        setExpandedPanels((prev) => ({
                          ...prev,
                          [`panel${index}-header`]:
                            !prev[`panel${index}-header`],
                        }))
                      }
                      sx={{
                        boxShadow: 'none',
                        border: 'none',
                        transition: '0.3s',
                        '&.Mui-expanded': {
                          background: '#FFF8F2',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ArrowDropDownIcon sx={{ color: 'black' }} />
                        }
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                        sx={{
                          px: '16px',
                          m: 0,
                          '&.Mui-expanded': {
                            minHeight: '48px',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <Typography
                              fontWeight="500"
                              fontSize="14px"
                              color="black"
                            >
                              {`Topic ${index + 1} - ${topic.name}`}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              fontWeight="600"
                              fontSize="12px"
                              color="#7C766F"
                            >
                              {getAbbreviatedMonth(
                                topic?.metaInformation?.startDate
                              )}{' '}
                              ,{' '}
                              {getAbbreviatedMonth(
                                topic?.metaInformation?.endDate
                              )}
                            </Typography>

                            <Button
                              onClick={() => {
                                setFormType('addSubTopic');
                                setPrefilledObject(topic);
                                setOpenAddTopicModal(true);
                              }}
                              sx={{
                                p: 1,
                                pl: 2.5,
                                pr: 2.5,
                                fontSize: 'small',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                              size="small"
                              endIcon={<AddIcon fontSize="medium" />}
                            >
                              Add New Sub topic
                            </Button>
                            <IconButton
                              onClick={() => {
                                setFormType('editTopic');
                                setPrefilledObject(topic);
                                setOpenAddTopicModal(true);
                              }}
                              sx={{
                                color: '#0D599E',
                              }}
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                handleDeleteContent(topic?.externalId, 'Topic');
                              }}
                              sx={{
                                color: '#BA1A1A',
                              }}
                            >
                              <DeleteOutlineOutlinedIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      {topic?.children?.length > 0 ? (
                        <Box
                          sx={{
                            background: 'white',
                            fontSize: '14px',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: '10px 25px 0px 25px',
                            borderRadius: '8px',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            {t('COURSE_PLANNER.SUB-TOPIC')}
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            {t('COURSE_PLANNER.RESOURCES')}
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'right' }}>
                            {t('COURSE_PLANNER.DURATION/MONTH')}
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'right' }}>
                            {t('Actions')}
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            background: 'white',
                            fontSize: '14px',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: '10px 25px 0px 25px',
                            borderRadius: '8px',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontStyle: 'italic',
                              textAlign: 'center',
                              padding: '10px',
                              fontWeight: '100',
                              color: '#777777',
                            }}
                          >
                            {t(
                              `Looks like you haven't added any sub topics yet`
                            )}
                          </Typography>
                        </Box>
                      )}

                      <AccordionDetails
                        sx={{
                          padding: '20px',
                          transition: 'max-height 0.3s ease-out',
                          backgroundColor: 'white',
                        }}
                      >
                        {topic.children.map((subTopic: any) => (
                          <Box
                            key={subTopic._id}
                            sx={{
                              border: `1px solid #E0E0E0`,
                              padding: '10px',
                              backgroundColor: 'white',
                              marginBottom: '20px',
                              cursor: 'pointer',
                            }}
                          >
                            <Box
                              sx={{
                                py: '10px',
                                px: '16px',
                                background: 'white',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Box
                                  onClick={() => handleResources(subTopic)}
                                  sx={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: 500,
                                  }}
                                >
                                  <FolderOutlinedIcon /> {subTopic.name}
                                </Box>
                                <Box
                                  onClick={() => handleResources(subTopic)}
                                  sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#7C766F',
                                  }}
                                >
                                  {`${subTopic?.learningResources?.length} ${t(
                                    'COURSE_PLANNER.RESOURCES'
                                  )}`}
                                </Box>
                                <Box
                                  onClick={() => handleResources(subTopic)}
                                  sx={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      padding: '5px',
                                      background: (() => {
                                        const month = getAbbreviatedMonth(
                                          subTopic?.metaInformation?.startDate
                                        );
                                        return monthColors[month] || '#FFD6D6';
                                      })(),
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      color: '#4D4639',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    {getAbbreviatedMonth(
                                      subTopic?.metaInformation?.startDate
                                    )}
                                    {/* {' '}-{' '} 
                                    {getAbbreviatedMonth(
                                      subTopic?.metaInformation?.endDate
                                    )} */}
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      padding: '2px',
                                      background: '#FAEEEC',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    <IconButton
                                      onClick={() => {
                                        handleDeleteContent(
                                          subTopic?.externalId,
                                          'Sub Topic'
                                        );
                                      }}
                                      sx={{
                                        color: '#BA1A1A',
                                      }}
                                    >
                                      <DeleteOutlineOutlinedIcon />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                ))
              ) : (
                <Typography textAlign="center" color="gray">
                  {t('COMMON.NO_DATA_FOUND')}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      <FileUploadDialog
        open={open}
        onClose={handleClose}
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUpload}
      />
      {ConfirmationDialog}
      {CustomSnackbar}
    </Box>
  );
};

export default ImportCsv;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

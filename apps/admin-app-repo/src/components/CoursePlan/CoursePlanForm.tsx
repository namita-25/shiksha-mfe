// @ts-noCheck

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'libs/shared-lib-v2/src/lib/context/LanguageContext';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { SvgIconProps } from '@mui/material';

import { useConfirmationDialog } from './ConfirmationDialog';
import { useCustomSnackbar } from './useCustomSnackbar';
import { useAlertDialog } from './AlertDialog';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import {
  createTopic,
  deleteContent,
  updateContent,
} from '@/services/coursePlanner';

interface CoursePlanFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actionTitle: string;
  onAction: (params: any) => void;
  projectId: string;
  formType: string;
  prefilledObject: any;
}

const CoursePlanForm: React.FC<CoursePlanFormProps> = ({
  open,
  onClose,
  title,
  actionTitle,
  onAction,
  projectId,
  formType,
  prefilledObject,
}) => {
  console.log('###### formdatacourse formType', formType);
  console.log('###### formdatacourse prefilledObject', prefilledObject);
  const { ConfirmationDialog, openConfirmation } = useConfirmationDialog();
  const { CustomSnackbar, showSnackbar } = useCustomSnackbar();
  const { AlertDialog, openAlert } = useAlertDialog();
  const formRef = useRef<HTMLFormElement>(null);

  // showSnackbar({
  //   text: 'Operation successful!',
  //   bgColor: '#019722', //#BA1A1A
  //   textColor: '#fff',
  //   icon: <CheckCircleOutlineOutlinedIcon />, //ErrorOutlinedIcon
  // });

  // openAlert({
  //   message: t(
  //     'You were in the middle of creating a topic. Are you sure you want to close without saving?'
  //   ),
  //   okText: t('Yes, Close'),
  // });

  const { t } = useTranslation();

  const BlackCalendarIcon = (props: SvgIconProps) => (
    <CalendarMonthOutlinedIcon {...props} sx={{ color: 'black' }} />
  );

  const [topics, setTopics] = React.useState<
    {
      name: string;
      startDate: Date | null;
      endDate: Date | null;
      subTopics: {
        externalId: string;
        name: string;
        startDate: Date | null;
        endDate: Date | null;
        resources: {
          resourceType: string;
          resourceId: string;
          resourceName: string;
        }[];
      }[];
    }[]
  >([
    {
      name: '',
      startDate: null,
      endDate: null,
      subTopics: [{ name: '', startDate: null, endDate: null, resources: [] }],
    },
  ]);

  const dateConvert = (date: any) => {
    dayjs.extend(customParseFormat);
    return dayjs(date, 'DD-MM-YYYY', true);
  };
  useEffect(() => {
    if (prefilledObject && formType === 'addSubTopic') {
      setTopics([
        {
          name: prefilledObject?.name,
          startDate: prefilledObject?.metaInformation?.startDate
            ? dateConvert(prefilledObject.metaInformation.startDate)
            : null,
          endDate: prefilledObject?.metaInformation?.endDate
            ? dateConvert(prefilledObject.metaInformation.endDate)
            : null,
          subTopics: [
            {
              externalId: '',
              name: '',
              startDate: null,
              endDate: null,
              resources: [],
            },
          ],
        },
      ]);
    }
    if (prefilledObject && formType === 'addTopic') {
      setTopics([
        {
          externalId: '',
          name: '',
          startDate: null,
          endDate: null,
          subTopics: [
            { name: '', startDate: null, endDate: null, resources: [] },
          ],
        },
      ]);
    }
    if (prefilledObject && formType === 'editTopic') {
      setTopics([
        {
          name: prefilledObject?.name,
          startDate: prefilledObject?.metaInformation?.startDate
            ? dateConvert(prefilledObject.metaInformation.startDate)
            : null,
          endDate: prefilledObject?.metaInformation?.endDate
            ? dateConvert(prefilledObject.metaInformation.endDate)
            : null,
          subTopics:
            prefilledObject?.children?.map((child) => ({
              externalId: child?.externalId,
              name: child?.name || '',
              startDate: child?.metaInformation?.startDate
                ? dateConvert(child.metaInformation.startDate)
                : null,
              endDate: child?.metaInformation?.endDate
                ? dateConvert(child.metaInformation.endDate)
                : null,
              resources: (child?.learningResources || []).map((res) => ({
                resourceType: res.type,
                resourceId: res.id,
                resourceName: res.name,
              })),
            })) || [],
        },
      ]);
    }
  }, [prefilledObject, formType]);

  const handleAddTopic = () => {
    setTopics([
      ...topics,
      {
        externalId: '',
        name: '',
        startDate: null,
        endDate: null,
        subTopics: [
          { name: '', startDate: null, endDate: null, resources: [] },
        ],
      },
    ]);
  };

  const handleAddSubTopic = (topicIndex: number) => {
    setTopics(
      topics.map((topic, index): any => {
        if (index === topicIndex) {
          return {
            ...topic,
            subTopics: [
              ...topic.subTopics,
              {
                externalId: '',
                name: '',
                startDate: null,
                endDate: null,
                resources: [],
              },
            ],
          };
        } else {
          return topic;
        }
      })
    );
  };

  const handleAddResource = (topicIndex: number, subTopicIndex: number) => {
    setTopics(
      topics.map((topic, index) => {
        if (index === topicIndex) {
          return {
            ...topic,
            subTopics: topic.subTopics.map((subTopic, subIndex) => {
              if (subIndex === subTopicIndex) {
                return {
                  ...subTopic,
                  resources: [
                    ...subTopic.resources,
                    { resourceType: '', resourceId: '', resourceName: '' },
                  ],
                };
              } else {
                return subTopic;
              }
            }),
          };
        } else {
          return topic;
        }
      })
    );
  };

  const handleRemoveTopic = (topicIndex: number) => {
    setTopics(topics.filter((_, index) => index !== topicIndex));
  };

  const handleRemoveSubTopic = (topicIndex: number, subTopicIndex: number) => {
    const extractExternalId = (
      prefilledObject: any,
      topicIndex: number,
      subTopicIndex: number
    ) => {
      const children = prefilledObject?.children || [];
      const selectedSubTopic = children[subTopicIndex];
      return selectedSubTopic?.externalId || null;
    };

    const externalId = extractExternalId(
      prefilledObject,
      topicIndex,
      subTopicIndex
    );
    console.log('External ID:', externalId);
    if (externalId) {
      openConfirmation({
        title: t('Are you sure you want to delete?'),
        message: t(
          `Sub Task will be permanently deleted. Are you sure you want to delete?`
        ),
        yesText: t('Yes, Delete'),
        noText: t('No, Cancel'),
        onYes: async () => {
          const response = await deleteContent(projectId, externalId);
          if (response) {
            showSnackbar({
              text: t(`Sub Topic has been successfully deleted`),
              bgColor: '#BA1A1A',
              textColor: '#fff',
              icon: <CheckCircleOutlineOutlinedIcon />, //ErrorOutlinedIcon
            });
            setTopics(
              topics.map((topic, index) => {
                if (index === topicIndex) {
                  return {
                    ...topic,
                    subTopics: topic.subTopics.filter(
                      (_, subIndex) => subIndex !== subTopicIndex
                    ),
                  };
                } else {
                  return topic;
                }
              })
            );
          } else {
            showSnackbar({
              text: t(
                `Something went wrong. We couldn't delete the sub topic. Please try again`
              ),
              bgColor: '#BA1A1A',
              textColor: '#fff',
              icon: <ErrorOutlinedIcon />, //ErrorOutlinedIcon
            });
          }
        },
      });
    } else {
      setTopics(
        topics.map((topic, index) => {
          if (index === topicIndex) {
            return {
              ...topic,
              subTopics: topic.subTopics.filter(
                (_, subIndex) => subIndex !== subTopicIndex
              ),
            };
          } else {
            return topic;
          }
        })
      );
    }
  };

  const handleRemoveResource = (
    topicIndex: number,
    subTopicIndex: number,
    resourceIndex: number
  ) => {
    setTopics(
      topics.map((topic, index) => {
        if (index === topicIndex) {
          return {
            ...topic,
            subTopics: topic.subTopics.map((subTopic, subIndex) => {
              if (subIndex === subTopicIndex) {
                return {
                  ...subTopic,
                  resources: subTopic.resources.filter(
                    (_, rIndex) => rIndex !== resourceIndex
                  ),
                };
              } else {
                return subTopic;
              }
            }),
          };
        } else {
          return topic;
        }
      })
    );
  };

  const handleSave = async (e: any) => {
    e.preventDefault(); // Prevent default form submission
    if (formRef.current?.checkValidity()) {
      // All required fields are filled
      console.log('Form valid. Submit here.', topics);
      const payload = convertTopicsToTasks(topics);

      //create course planner
      let response = null;
      if (formType == 'editTopic') {
        response = await updateContent(
          projectId,
          payload?.tasks[0]?.externalId,
          payload
        );
      } else {
        response = await createTopic(projectId, payload);
      }

      if (response) {
        //reload data
        onCloseReset();
        onAction({
          showSnackbar: formType === 'editTopic' ? false : true,
          type: formType === 'addTopic' ? 'Topic' : 'Sub Topic',
        });
      } else {
        showSnackbar({
          text: t(
            'Something went wrong. We couldn’t create the topic. Please try again'
          ),
          bgColor: '#BA1A1A', //#BA1A1A
          textColor: '#fff',
          icon: <ErrorOutlinedIcon />, //ErrorOutlinedIcon
        });
      }
    } else {
      // Trigger native validation messages
      formRef.current?.reportValidity();
    }
  };
  const convertTopicsToTasks = (topics: any) => {
    const tasks: any = [];

    topics.forEach((topic: any, topicIndex: any) => {
      let topicId = `topic-${topicIndex + 1}-${Date.now()}`; // Unique externalId

      if (formType === 'addSubTopic' || formType === 'editTopic') {
        topicId = prefilledObject?.externalId;
      }

      if (formType != 'addSubTopic') {
        // Add topic as a parent task
        tasks.push({
          name: topic.name,
          externalId: topicId,
          type: 'content',
          startDate: dayjs(topic.startDate).format('DD-MM-YYYY'),
          endDate: dayjs(topic.endDate).format('DD-MM-YYYY'),
        });
      }

      // Add each subtopic as a child task
      topic?.subTopics?.forEach((subTopic: any, subIndex: any) => {
        const subTask = {
          name: subTopic?.name,
          externalId:
            formType === 'editTopic'
              ? subTopic?.externalId
              : `sub-${topicIndex + 1}-${subIndex + 1}-${Date.now()}`, // Unique externalId
          type: 'content',
          hasAParentTask: 'YES',
          parentTaskId: topicId,
          startDate: dayjs(subTopic.startDate).format('DD-MM-YYYY'),
          endDate: dayjs(subTopic.endDate).format('DD-MM-YYYY'),
        };

        if (subTopic.resources && subTopic.resources.length > 0) {
          subTask.learningResources = subTopic.resources.map((res: any) => ({
            name: res.resourceName,
            type: res.resourceType,
            id: res.resourceId,
          }));
        }

        tasks.push(subTask);
      });
    });
    console.log('Tasks#######', tasks);

    return { tasks };
  };

  //confirm box
  const onCloseDialog = () => {
    const hasAnyData = isAnyFieldFilled(topics);

    console.log('Topic Object', topics);
    if (hasAnyData) {
      openConfirmation({
        title: t('Are you sure you want to close?'),
        message: t(
          `You were in the middle of ${
            formType == 'editTopic' ? 'editing' : 'creating'
          } a ${
            formType == 'addTopic'
              ? 'Topic'
              : formType == 'addSubTopic'
              ? 'Sub Topic'
              : 'Topic and Sub Topic'
          }. Are you sure you want to close without saving?`
        ),
        yesText: t('Yes, Close'),
        noText: t('No, Cancel'),
        onYes: () => {
          onCloseReset();
          onAction({ showSnackbar: false, type: '' });
        },
      });
    } else {
      onCloseReset();
    }
  };
  const onCloseReset = () => {
    onClose();
    // setTopics([
    //   {
    //     name: '',
    //     startDate: null,
    //     endDate: null,
    //     subTopics: [
    //       { name: '', startDate: null, endDate: null, resources: [] },
    //     ],
    //   },
    // ]);
  };

  //check value filled or not
  type AnyValue = string | number | boolean | null | undefined | object;
  const isAnyFieldFilled = (obj: AnyValue): boolean => {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === 'string') return obj.trim() !== '';
    if (typeof obj === 'number' || typeof obj === 'boolean') return true;

    if (Array.isArray(obj)) {
      return obj.some((item) => isAnyFieldFilled(item));
    }

    if (typeof obj === 'object') {
      return Object.values(obj).some((value) => isAnyFieldFilled(value));
    }

    return false;
  };
  const alterTopicDates = (newTopics: any, topicIndex: any) => {
    const topicStart = dayjs(newTopics[topicIndex].startDate);
    const topicEnd = dayjs(newTopics[topicIndex].endDate);

    newTopics[topicIndex].subTopics = newTopics[topicIndex].subTopics.map(
      (sub: any) => {
        const subStart = sub.startDate ? dayjs(sub.startDate) : null;
        const subEnd = sub.endDate ? dayjs(sub.endDate) : null;

        // Case 1: both null — skip
        if (!subStart && !subEnd) return sub;

        // Case 2: both outside range → reset both
        if (
          subStart &&
          (subStart.isBefore(topicStart) || subStart.isAfter(topicEnd)) &&
          subEnd &&
          (subEnd.isBefore(topicStart) || subEnd.isAfter(topicEnd))
        ) {
          return { ...sub, startDate: null, endDate: null };
        }

        // Case 3: start is outside range → reset both
        if (
          subStart &&
          (subStart.isBefore(topicStart) || subStart.isAfter(topicEnd))
        ) {
          return { ...sub, startDate: null, endDate: null };
        }

        // Case 4: end is outside range → reset only end
        if (
          subEnd &&
          (subEnd.isBefore(topicStart) || subEnd.isAfter(topicEnd))
        ) {
          return { ...sub, endDate: null };
        }

        // Else: keep as is
        return sub;
      }
    );
    return newTopics;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          // Prevent closing on backdrop click or escape key
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose();
          }
        }}
        fullWidth
        maxWidth={false} // disables built-in maxWidth
        scroll="paper"
        PaperProps={{
          sx: {
            width: '90vw', // custom width, like xl (90% of viewport)
            maxWidth: 'md', // cap it at 1200px like "xl"
            maxHeight: '95vh',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Fixed Title */}
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            p: 3,
            pb: 1,
          }}
        >
          <Typography variant="h1" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <IconButton onClick={onCloseDialog}>
            <CloseIcon sx={{ color: 'black', fontWeight: 'bold' }} />
          </IconButton>
        </DialogTitle>
        {/* Scrollable Content */}
        <DialogContent sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <form ref={formRef}>
            {topics.map((topic, topicIndex) => (
              <Grid
                container
                spacing={2.5}
                key={topicIndex}
                sx={{ pl: 1, pr: 1, pt: 3.5 }}
              >
                <Grid item xs={12} sm={12} md={12}>
                  {/* <Typography variant="h6">Topic {topicIndex + 1}</Typography> */}
                  <TextField
                    fullWidth
                    label={t('Topic Name')}
                    required={true}
                    variant="outlined"
                    placeholder={t('Type here..')}
                    value={topic.name}
                    onChange={(e) => {
                      const newTopics: any = [...topics];
                      newTopics[topicIndex].name = e.target.value;
                      setTopics(newTopics);
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                    disabled={formType === 'addSubTopic' ? true : false}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('Start Date')}
                      value={topic.startDate}
                      onChange={(newValue) => {
                        let newTopics: any = [...topics];
                        newTopics[topicIndex].startDate = newValue;
                        const currentEndDate = newTopics[topicIndex].endDate;
                        if (
                          currentEndDate &&
                          dayjs(currentEndDate).isBefore(dayjs(newValue), 'day')
                        ) {
                          newTopics[topicIndex].endDate = null; // Only reset if endDate is before new startDate
                          // ✅ Reset all subTopic startDate and endDate
                          newTopics[topicIndex].subTopics = newTopics[
                            topicIndex
                          ].subTopics.map((sub: any) => ({
                            ...sub,
                            startDate: null,
                            endDate: null,
                          }));
                        } else {
                          newTopics = alterTopicDates(newTopics, topicIndex);
                        }
                        setTopics(newTopics);
                      }}
                      format="DD-MM-YYYY"
                      disableScrollLock
                      minDate={
                        formType === 'addSubTopic' ||
                        (formType === 'editTopic' &&
                          topic.startDate &&
                          dayjs(topic.startDate).isBefore(dayjs(), 'day'))
                          ? null
                          : dayjs()
                      } // ✅ Allow same or after today's date
                      slots={{
                        openPickerIcon: BlackCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          required: true,
                          onKeyDown: (e) => e.preventDefault(), // ✅ Block all key presses
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderRadius: '4px',
                            },
                          },
                        },
                      }}
                      required={true}
                      disabled={
                        formType === 'addSubTopic' ||
                        (formType === 'editTopic' &&
                          topic.startDate &&
                          dayjs(topic.startDate).isBefore(dayjs(), 'day'))
                          ? true
                          : false
                      }
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('End Date')}
                      value={topic.endDate}
                      onChange={(newValue) => {
                        let newTopics: any = [...topics];
                        newTopics[topicIndex].endDate = newValue;
                        newTopics = alterTopicDates(newTopics, topicIndex);
                        setTopics(newTopics);
                      }}
                      format="DD-MM-YYYY"
                      disableScrollLock
                      minDate={topic.startDate || undefined} // ✅ Allow same or after start date
                      slots={{
                        openPickerIcon: BlackCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          required: true,
                          onKeyDown: (e) => e.preventDefault(), // ✅ Block all key presses
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderRadius: '4px',
                            },
                          },
                        },
                      }}
                      disabled={formType === 'addSubTopic' ? true : false}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Divider />
                </Grid>

                {/* <Button
                onClick={() => handleRemoveTopic(topicIndex)}
                color="error"
                size="small"
              >
                Remove Topic
              </Button> */}

                {/* SubTopics */}
                {topic.subTopics.map((sub, subIndex) => (
                  <Grid
                    key={`${topicIndex}_${subIndex}`}
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    sx={{
                      borderRadius: '12px',
                      border: '1px solid #DADADA',
                      backgroundColor: '#F9F9F9',
                      p: 2,
                      mt: 2,
                      ml: 2.5,
                    }}
                  >
                    <Grid container spacing={2.5}>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: '#4D4639',
                            backgroundColor: '#FFDEA1',
                            borderRadius: '15px',
                            p: 0.5,
                            width: '130px',
                            textAlign: 'center',
                          }}
                        >
                          {t('Sub Topic')} {subIndex + 1}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        sm={6}
                        md={6}
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <IconButton
                          onClick={() =>
                            handleRemoveSubTopic(topicIndex, subIndex)
                          }
                          size="small"
                        >
                          <DeleteOutlineOutlinedIcon
                            sx={{ color: '#BA1A1A' }}
                          />
                        </IconButton>
                      </Grid>

                      <Grid item xs={12} sm={12} md={12}>
                        <TextField
                          fullWidth
                          label={t('Sub Topic Name')}
                          required={true}
                          variant="outlined"
                          placeholder={t('Type here..')}
                          value={sub.name}
                          onChange={(e) => {
                            const newTopics: any = [...topics];
                            newTopics[topicIndex].subTopics[subIndex].name =
                              e.target.value;
                            setTopics(newTopics);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={t('Start Date')}
                            value={sub.startDate}
                            onChange={(newValue) => {
                              const newTopics: any = [...topics];
                              newTopics[topicIndex].subTopics[
                                subIndex
                              ].startDate = newValue;
                              const currentEndDate =
                                newTopics[topicIndex].subTopics[subIndex]
                                  .endDate;
                              if (
                                currentEndDate &&
                                dayjs(currentEndDate).isBefore(
                                  dayjs(newValue),
                                  'day'
                                )
                              ) {
                                newTopics[topicIndex].subTopics[
                                  subIndex
                                ].endDate = null; // Only reset if endDate is before new startDate
                              }
                              setTopics(newTopics);
                            }}
                            format="DD-MM-YYYY"
                            disableScrollLock
                            minDate={topic.startDate || undefined} // ✅ Allow same or after start date
                            maxDate={topic.endDate || undefined} // ✅ Allow same or before end date
                            slots={{
                              openPickerIcon: BlackCalendarIcon,
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'outlined',
                                required: true,
                                onKeyDown: (e) => e.preventDefault(), // ✅ Block all key presses
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderRadius: '4px',
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={t('End Date')}
                            value={sub.endDate}
                            onChange={(newValue) => {
                              const newTopics: any = [...topics];
                              newTopics[topicIndex].subTopics[
                                subIndex
                              ].endDate = newValue;
                              setTopics(newTopics);
                            }}
                            format="DD-MM-YYYY"
                            disableScrollLock
                            minDate={
                              topic?.subTopics[subIndex]?.startDate
                                ? topic.subTopics[subIndex].startDate
                                : topic?.startDate
                                ? topic.startDate
                                : undefined
                            }
                            maxDate={topic.endDate || undefined} // ✅ Allow same or before end date
                            slots={{
                              openPickerIcon: BlackCalendarIcon,
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'outlined',
                                required: true,
                                onKeyDown: (e) => e.preventDefault(), // ✅ Block all key presses
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderRadius: '4px',
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={12} md={12} sx={{ mt: -2 }}>
                        {/* Resources */}
                        {sub.resources.map((res, resIndex) => (
                          <Grid
                            key={`${topicIndex}_${subIndex}_${resIndex}`}
                            container
                            spacing={2.5}
                            mt={1}
                          >
                            <Grid item xs={12} sm={12} md={12}>
                              <Divider />
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} sx={{ mt: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#4D4639',
                                  backgroundColor: '#EDE1CF',
                                  borderRadius: '15px',
                                  p: 0.5,
                                  width: '110px',
                                  textAlign: 'center',
                                }}
                              >
                                {t('Resource')} {subIndex + 1}.{resIndex + 1}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <IconButton
                                onClick={() =>
                                  handleRemoveResource(
                                    topicIndex,
                                    subIndex,
                                    resIndex
                                  )
                                }
                                size="small"
                              >
                                <DeleteOutlineOutlinedIcon
                                  sx={{ color: '#BA1A1A' }}
                                />
                              </IconButton>
                            </Grid>

                            <Grid item xs={12} sm={6} md={6}>
                              <FormControl fullWidth required>
                                <InputLabel
                                  id={`resource-type-label-${resIndex}`}
                                  required
                                >
                                  {t('Resource Type')}
                                </InputLabel>
                                <Select
                                  native
                                  labelId={`resource-type-label-${resIndex}`}
                                  id={`resource-type-select-${resIndex}`}
                                  value={res.resourceType}
                                  onChange={(e) => {
                                    const newTopics: any = [...topics];
                                    newTopics[topicIndex].subTopics[
                                      subIndex
                                    ].resources[resIndex].resourceType =
                                      e.target.value;
                                    setTopics(newTopics);
                                  }}
                                  label={t('Resource Type')}
                                  inputProps={{
                                    name: 'resourceType',
                                    required: true,
                                  }}
                                >
                                  <option value=""></option>
                                  <option value="prerequisite">
                                    {t('Prerequisite')}
                                  </option>
                                  <option value="postrequisite">
                                    {t('Postrequisite')}
                                  </option>
                                  <option value="facilitator-requisite">
                                    {t('Facilitator-requisite')}
                                  </option>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                              <TextField
                                fullWidth
                                label={t('Resource ID')}
                                required={true}
                                variant="outlined"
                                placeholder={t('Type here..')}
                                value={res.resourceId}
                                onChange={(e) => {
                                  const newTopics: any = [...topics];
                                  newTopics[topicIndex].subTopics[
                                    subIndex
                                  ].resources[resIndex].resourceId =
                                    e.target.value;
                                  setTopics(newTopics);
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12}>
                              <TextField
                                fullWidth
                                label={t('Resource Name')}
                                required={true}
                                variant="outlined"
                                placeholder={t('Type here..')}
                                value={res.resourceName}
                                onChange={(e) => {
                                  const newTopics: any = [...topics];
                                  newTopics[topicIndex].subTopics[
                                    subIndex
                                  ].resources[resIndex].resourceName =
                                    e.target.value;
                                  setTopics(newTopics);
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mt: -2,
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleAddResource(topicIndex, subIndex)
                          }
                          sx={{
                            mt: 2,
                            p: 1,
                            pl: 2.5,
                            pr: 2.5,
                            fontSize: 'medium',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          size="small"
                          endIcon={<AddIcon fontSize="medium" />}
                        >
                          Add Resource
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}></Grid>
                    </Grid>
                  </Grid>
                ))}
                {formType != 'editTopic' && (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2 }}
                  >
                    <Button
                      onClick={() => handleAddSubTopic(topicIndex)}
                      variant="outlined"
                      sx={{
                        mt: 2,
                        p: 1,
                        pl: 2.5,
                        pr: 2.5,
                        fontSize: 'medium',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      size="small"
                      endIcon={<AddIcon fontSize="medium" />}
                    >
                      Add Sub Topic
                    </Button>
                  </Grid>
                )}
              </Grid>
            ))}
            {/* 
        <Button
          onClick={handleAddTopic}
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
        >
          + Add Topic
        </Button> */}
          </form>
        </DialogContent>

        {/* Fixed Actions */}
        <DialogActions
          sx={{
            borderTop: '1px solid #eee',
            p: 3,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            sx={{
              fontSize: 'large',
              borderRadius: '5px',
            }}
          >
            {actionTitle}
          </Button>
        </DialogActions>
      </Dialog>
      {ConfirmationDialog}
      {CustomSnackbar}
      {AlertDialog}
    </>
  );
};

export default CoursePlanForm;

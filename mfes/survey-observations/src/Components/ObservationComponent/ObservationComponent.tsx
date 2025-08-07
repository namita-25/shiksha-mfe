import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import { Box, Typography, useTheme } from '@mui/material';
import 'questionnaire-webcomponent/questionnaire-player-webcomponent.js';
import 'questionnaire-webcomponent/styles.css';
import { useRouter } from 'next/navigation';
import { updateSubmission } from '@survey/utils/API/suveyService';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
// import ConfirmationModal from '../ConfirmationModal';
import { useTranslation } from '@shared-lib';
import { showToastMessage } from '../ToastComponent/Toastify';

interface FileUploadEvent {
  data: {
    submissionId: string;
    name: string;
    file: File;
    question_id: string;
  };
}
interface QuestionnaireAppProps {
  observationQuestions: any; // Define the correct type here based on your data structure
  observationName: any;
  backButtonShow?: boolean;
}
interface PresignedUrlResponse {
  url: string;
  getDownloadableUrl: string[];
  payload: Record<string, string>;
}

interface FileUploadResponse {
  status?: number;
  data?: FileUploadData | null;
  question_id?: string;
}

interface FileUploadData {
  name: string;
  url: string;
  previewUrl: string;
  [key: string]: any;
}

const ObservationComponent: React.FC<QuestionnaireAppProps> = ({
  observationQuestions,
  observationName,
  backButtonShow = true,
}) => {
  const questionairePlayerMainRef = useRef<HTMLElement | null>(null);
  const [isBackConfirmationOpen, setIsBackConfirmationOpen] = useState(false);

  const [fileUploadResponse, setFileUploadResponse] =
    useState<FileUploadResponse | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);
  const theme = useTheme<any>();

  const uploadFileToPresignedUrl = async (event: FileUploadEvent) => {
    const payload: any = {
      ref: 'survey',
      request: {},
    };

    const submissionId = event.data.submissionId;
    payload.request[submissionId] = {
      files: [event.data.name],
    };
    let fileType = '';

    try {
      //generate presigned url
      const submissionId = event.data.submissionId; // Extract submissionId from event data
      const files = [event.data.name];

      const requestObject: any = {
        request: {
          [submissionId]: {
            files: files,
          },
        },
        ref: 'survey',
      };
      let presignedUrlLatest = '';
      let presignedUrlData = null;
      let presignedurl = '';
      let presigneDownloadUrl = '';
      // Get Pre-Signed URL
      try {
        // const response_url: any = await axios.post(
        //   'https://dev-survey.prathamdigital.org/survey/v1/files/preSignedUrls',
        //   requestObject,
        //   {
        //     headers: {
        //       'x-auth-token': localStorage.getItem('token') || '', // Ensure token exists
        //     },
        //   }
        // );

        // const result_url = response_url.data.result;
        // console.log('########### response_url', result_url);
        // const dynamicSubmissionId = Object.keys(result_url).find(
        //   (key) => key !== 'cloudStorage'
        // ); // Get dynamic key
        // if (dynamicSubmissionId) {
        //   presignedUrlData = result_url[dynamicSubmissionId]?.files?.[0];
        //   presignedUrlLatest = result_url[dynamicSubmissionId]?.files?.[0]?.url; // Upload URL
        //   const downloadUrl =
        //     result_url[dynamicSubmissionId]?.files?.[0]
        //       ?.getDownloadableUrl?.[0]; // Download URL
        //   console.log('########### presignedUrlData:', presignedUrlData);
        // } else {
        //   console.error('Submission ID not found in response.');
        // }
        let fileName = event.data.name;
        fileType = event.data.file?.type;
        console.log(fileName, fileType);
        const extension = `.${fileType.split('/')[1]}`;

        //  const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
        // const result = await axios.get(
        //   `https://dev-interface.prathamdigital.org/interface/v1/user/presigned-url?key=${fileName}&fileType=${extension}`
        // );
        // presignedurl = result.data.result.url;
        // presigneDownloadUrl = result.data.result;
        presignedurl = await uploadToServer(event.data.file);
      } catch (error) {
        console.error('Error fetching pre-signed URL:', error);
      }

      /*const response = await axios.post(presignedUrlLatest, payload); // Update with your correct endpoint
      const presignedUrlData: PresignedUrlResponse =
        response.data.result[submissionId].files[0];*/

      // Use FormData for file uploads
      console.log(presignedurl);
      const formData = new FormData();
      formData.append('file', event.data.file);

      // await axios.put(presignedurl, event.data.file, {
      //   headers: {
      //     'Content-Type': fileType,
      //   },
      // });

      const obj: FileUploadData = {
        name: event.data.name,
        url: presignedurl.split('?')[0],
        previewUrl: presignedurl.split('?')[0],
      };

      for (const key of Object.keys(requestObject)) {
        obj[key] = requestObject[key];
      }
      setFileUploadResponse({
        status: 200,
        data: obj,
        question_id: event.data.question_id,
      });
    } catch (err) {
      console.error('Unable to upload the file. Please try again', err);
      setFileUploadResponse({
        status: 400,
        data: null,
        question_id: event.data.question_id,
      });
    }
  };

  const receiveUploadData = (event: any) => {
    if (event.data && event.data.file) {
      uploadFileToPresignedUrl(event as FileUploadEvent);
    }
  };
  const uploadToServer = async (file: File) => {
    console.log(file);
    try {
      // setUploading(true);

      const extension = file.name.split('.').pop()?.toLowerCase();
      const fileName = file.name.split('.')[0];

      // Step 1: Get Presigned URL
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/presigned-url?filename=${fileName}&foldername=cohort&fileType=.${extension}`
      );
      const presignedData = await res.json();

      const { url, fields } = presignedData.result;

      // Step 2: Prepare form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      // Step 3: Upload to S3
      const uploadRes = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // Step 4: Construct the uploaded file URL
      const uploadedUrl = `${url}${fields.key}`;
      return uploadedUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed. Please try again.');
      return '';
    } finally {
      // setUploading(false);
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', receiveUploadData, false);

      return () => {
        window.removeEventListener('message', receiveUploadData, false);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const playerElement = questionairePlayerMainRef.current;

      if (playerElement) {
        const handlePlayerSubmitOrSaveEvent = async (event: Event) => {
          if ((event as CustomEvent).detail.status === 'submit') {
            setCurrentEvent(event as CustomEvent);
            setIsConfirmationOpen(true);
          } else {
            await handleSaveSubmit(event);
          }
        };

        const handleSaveSubmit = async (event: Event) => {
          console.log('event', event);
          const submissionData = {
            evidence: {
              status: (event as CustomEvent).detail.status,
              ...(event as CustomEvent).detail.data,
            },
          };
          console.log(submissionData);

          const submissionId = observationQuestions?.assessment?.submissionId;
          console.log('hii');
          const response = await updateSubmission({
            submissionId,
            submissionData,
          });
          showToastMessage(t('OBSERVATION.FORM_SAVED_SUCCESSFULLY'), 'success');
        };

        playerElement.addEventListener(
          'submitOrSaveEvent',
          handlePlayerSubmitOrSaveEvent
        );

        return () => {
          playerElement.removeEventListener(
            'submitOrSaveEvent',
            handlePlayerSubmitOrSaveEvent
          );
        };
      }
    }
  }, [observationQuestions]);
  const handleConfirmSubmit = async () => {
    if (currentEvent) {
      const submissionData = {
        evidence: {
          status: currentEvent.detail.status,
          ...currentEvent.detail.data,
        },
      };
      const submissionId = observationQuestions?.assessment?.submissionId;
      const response = await updateSubmission({ submissionId, submissionData });
      if (currentEvent.detail.status === 'draft') {
        showToastMessage(t('OBSERVATION.FORM_SAVED_SUCCESSFULLY'), 'success');
      } else if (currentEvent.detail.status === 'submit') {
        showToastMessage(t('OBSERVATION.FORM_SUBMIT_SUCCESSFULLY'), 'success');
        router.push(`${localStorage.getItem('observationPath')}`);
      }
    }
    setIsConfirmationOpen(false);
  };
  useEffect(() => {
    if (questionairePlayerMainRef.current) {
      console.log('Web component ref set correctly');
    } else {
      console.log('Web component ref not set');
    }
  }, [questionairePlayerMainRef]);

  const handleBackEvent = () => {
    const classList = document?.querySelector(
      'questionnaire-player-main form'
    )?.classList;

    if (classList?.contains('ng-dirty')) {
      setIsBackConfirmationOpen(true);
    } else {
      router.push(`${localStorage.getItem('observationPath')}`);
    }
  };

  const handleCancelBack = () => {
    setIsBackConfirmationOpen(false);
  };

  const handleConfirmBack = () => {
    setIsBackConfirmationOpen(false);
    router.push(`${localStorage.getItem('observationPath')}`);
  };

  return (
    <>
      {backButtonShow && (
        <>
          <Box
            sx={{
              display: 'flex',
              direction: 'row',
              gap: '24px',
              mt: '15px',
              marginLeft: '10px',
            }}
            width={'100%'}
            onClick={handleBackEvent}
          >
            <KeyboardBackspaceOutlinedIcon
              cursor={'pointer'}
              sx={{
                color: theme.palette.warning['A200'],
              }}
            />
            {localStorage.getItem('observationName') && (
              <Typography variant="h3" fontSize={'22px'} color={'black'}>
                {localStorage.getItem('observationName')}
              </Typography>
            )}
          </Box>

          <Typography variant="h3" ml="60px" color={'black'}>
            {observationName}
          </Typography>
        </>
      )}

      {observationQuestions && (
        <questionnaire-player-main
          assessment={JSON.stringify(observationQuestions)}
          fileuploadresponse={JSON.stringify(fileUploadResponse)}
          ref={questionairePlayerMainRef}
        ></questionnaire-player-main>
      )}

      {isConfirmationOpen && (
        <ConfirmationModal
          message={t('OBSERVATION.ARE_YOU_SURE_YOU_TO_SUBMIT_FORM')}
          handleAction={handleConfirmSubmit}
          buttonNames={{
            primary: t('COMMON.SUBMIT'),
            secondary: t('COMMON.CANCEL'),
          }}
          handleCloseModal={() => setIsConfirmationOpen(false)}
          modalOpen={isConfirmationOpen}
        />
      )}

      {isBackConfirmationOpen && (
        <ConfirmationModal
          message={t('COMMON.YOU_HAVE_UNSAVED_CHANGES')}
          handleAction={handleConfirmBack}
          buttonNames={{
            primary: t('COMMON.YES'),
            secondary: t('FORM.NO'),
          }}
          handleCloseModal={handleCancelBack}
          modalOpen={isBackConfirmationOpen}
        />
      )}
    </>
  );
};

export default ObservationComponent;

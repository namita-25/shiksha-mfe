import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { getLocalStoredUserId } from '../services/LocalStorageService';
import SelectContent from '../components/ai-assessment/SelectContent';
import SetParameters from '../components/ai-assessment/SetParameters';
import useTenantConfig from '../hooks/useTenantConfig';
import AIGenerationDialog from '../components/ai-assessment/AIGenerationDialog';
import {
  createAIQuestionsSet,
  createQuestionSet,
  deleteContent,
  getAIQuestionSetStatus,
  updateQuestionSet,
} from '../services/ContentService';
import { MIME_TYPE } from '../utils/app.config';
import { useRouter } from 'next/router';
import Loader from '../components/Loader';
const poppinsFont = {
  fontFamily: 'Poppins',
};

const CustomStepper = ({ activeStep }: { activeStep: number }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          bgcolor: activeStep <= 2 ? '#FDBE16' : '#DADADA',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: activeStep <= 2 ? '#1F1B13' : '#FFFFFF',
            fontWeight: 500,
          }}
        >
          1
        </Typography>
      </Box>
      <Typography
        sx={{
          ml: 2,
          ...poppinsFont,
          fontWeight: 500,
          fontSize: 16,
          color: activeStep <= 2 ? '#1F1B13' : '#7C766F',
        }}
      >
        Select Content
      </Typography>
    </Box>
    <Box sx={{ width: 40, height: 2, bgcolor: '#CDC5BD', mx: 2 }} />
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          bgcolor: activeStep === 1 ? '#FDBE16' : '#DADADA',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: activeStep === 1 ? '#1F1B13' : '#FFFFFF',
            fontWeight: 500,
          }}
        >
          2
        </Typography>
      </Box>
      <Typography
        sx={{
          ml: 2,
          ...poppinsFont,
          fontWeight: 500,
          fontSize: 16,
          color: activeStep === 1 ? '#1F1B13' : '#7C766F',
        }}
      >
        Set Parameters
      </Typography>
    </Box>
    <Box sx={{ width: 40, height: 2, bgcolor: '#CDC5BD', mx: 2 }} />
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          bgcolor: activeStep === 2 ? '#FDBE16' : '#DADADA',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: activeStep === 2 ? '#1F1B13' : '#FFFFFF',
            fontWeight: 500,
          }}
        >
          3
        </Typography>
      </Box>
      <Typography
        sx={{
          ml: 2,
          ...poppinsFont,
          fontWeight: 500,
          fontSize: 16,
          color: activeStep === 2 ? '#1F1B13' : '#7C766F',
        }}
      >
        Review Questions
      </Typography>
    </Box>
  </Box>
);

const onlyFields1 = [
  'se_boards',
  'se_mediums',
  'se_gradeLevels',
  'se_subjects',
  'se_courseTypes',
  // 'contentLanguage',
];
const onlyFields = [
  'program',
  'se_domains',
  'se_subDomains',
  'se_subjects',
  'primaryUser',
  'targetAgeGroup',
  'contentLanguage',
];
const inputType = {
  program: 'dropdown-multi',
  se_boards: 'dropdown-single',
  se_mediums: 'dropdown-multi',
  se_gradeLevels: 'dropdown-multi',
  se_courseTypes: 'dropdown-multi',
  se_domains: 'dropdown-single',
  se_subDomains: 'dropdown-single',
  se_subjects: 'dropdown-multi',
  primaryUser: 'dropdown-multi',
  targetAgeGroup: 'dropdown-multi',
  contentLanguage: 'dropdown-single',
};
const AIAssessmentCreator: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedKey, setSelectedKey] = useState('create');
  const [showHeader, setShowHeader] = useState<boolean | null>(null);
  const [formState, setFormState] = useState<any>({});
  const tenantConfig = useTenantConfig();
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [staticFilter, setStaticFilter] = useState({});
  const [aiDialogState, setAIDialogState] = useState<
    'loader' | 'success' | 'failed' | 'processing'
  >('loader');
  const [aiStatus, setAIStatus] = useState<string | null>(null);
  const [aiDialogParams, setAIDialogParams] = useState<any>(null); // for retry
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = getLocalStoredUserId();

    const headerValue = localStorage.getItem('showHeader');
    setShowHeader(headerValue === 'true');

    const staticFilterData = {
      program: [
        tenantConfig?.COLLECTION_FRAMEWORK === 'scp-framework'
          ? 'Second Chance'
          : localStorage.getItem('program'),
      ],
      contentLanguage: ['English'],
      se_domains: ['Learning for School'],
      se_subDomains: ['Academics'],
    };
    setStaticFilter(staticFilterData);
    if (token && userId) {
      document.cookie = `authToken=${token}; path=/; secure; SameSite=Strict`;
      document.cookie = `userId=${userId}; path=/; secure; SameSite=Strict`;
    }
  }, [tenantConfig]);

  const handleNextFromSelectContent = (newFormData: any) => {
    setFormState((prev: any) => ({
      ...prev,
      ...newFormData,
    }));
    setActiveStep((s) => s + 1);
  };

  const fetchData = async (data: any) => {
    let response: any = '';
    try {
      response = await createQuestionSet(tenantConfig?.COLLECTION_FRAMEWORK);
      const updateResponse = await updateQuestionSet({
        identifier: response?.result?.identifier,
        ...(data?.metadata || {}),
      });
      return updateResponse?.result?.identifier;
    } catch (error) {
      if (response?.result?.identifier) {
        const resultDelet = await deleteContent(
          response?.result?.identifier,
          MIME_TYPE.QUESTIONSET_MIME_TYPE
        );
        console.log('resultDelet', resultDelet);
      }
      console.error('Error creating question set:', error);
    }
  };

  // Orchestrate AI generation dialog and API
  const handleAIGeneration = async ({
    newFormData,
    identifier,
    token,
  }: {
    newFormData: any;
    identifier: string;
    token: string;
  }) => {
    setAIDialogParams({ newFormData, identifier, token });
    setAIDialogState('loader');
    setAIStatus(null);
    setShowAIDialog(true);

    try {
      // 1. Call AI generation API
      await createAIQuestionsSet({
        ...newFormData,
        questionSetId: identifier,
        token,
      });

      // 2. Poll for status (sendToAi logic)
      let prog = 0;
      let lastStatus: string | null = null;
      const interval = setInterval(async () => {
        prog += 1.67;
        try {
          if (Math.floor(prog / 1.67) % 10 === 0 && prog > 0) {
            const status = await getAIQuestionSetStatus(identifier, token);
            setAIStatus(status?.result?.status);
            lastStatus = status?.result?.status;
            if (status?.result?.status === 'COMPLETED') {
              clearInterval(interval);
              setAIDialogState('success');
            }
          }
        } catch (error) {
          console.error('Error getting AI question set status:', error);
        }
        if (prog >= 100) {
          clearInterval(interval);
          if (lastStatus === 'COMPLETED') {
            setAIDialogState('success');
          } else if (lastStatus === 'PROCESSING') {
            setAIDialogState('processing');
          } else {
            setAIDialogState('failed');
          }
        }
      }, 1000);
    } catch (error: any) {
      setAIDialogState('failed');
      console.error('Error creating AI question set:', error);
    }
  };

  const handleNextFromSetParameters = (parameters: any) => {
    const newFormState = {
      framework: tenantConfig?.CONTENT_FRAMEWORK,
      channel: tenantConfig?.CHANNEL_ID,
      ...parameters,
    };
    setFormState((prev: any) => ({ ...prev, ...newFormState }));
    handleSubmit(newFormState);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    // Convert dropdown-single array values to single string
    const formattedData = {};
    const onlyFieldsNew =
      tenantConfig?.COLLECTION_FRAMEWORK === 'scp-framework'
        ? onlyFields1
        : onlyFields;
    onlyFieldsNew.forEach((key: string) => {
      let newKey = key;
      if (key.startsWith('se_') && key.endsWith('s')) {
        newKey = key.slice(3, -1); // Remove 'se_' prefix and 's' suffix
      }
      if (
        inputType?.[key as keyof typeof inputType] === 'dropdown-single' &&
        Array.isArray(formData?.metadata?.[key]) &&
        !['se_subDomains'].includes(key)
      ) {
        (formattedData as Record<string, string>)[newKey] =
          formData?.metadata?.[key][0] || '';
      } else {
        (formattedData as Record<string, any>)[newKey] =
          formData?.metadata?.[key];
      }
      if (key.startsWith('se_') && key.endsWith('s')) {
        delete (formattedData as Record<string, any>)[key];
      }
    });
    const newFormData = {
      ...formData,
      metadata: {
        ...formattedData,
        name: formData?.metadata?.name,
        description: formData?.metadata?.description,
        assessmentType: formData?.metadata?.assessmentType,
      },
    };
    try {
      const identifier = await fetchData(newFormData);
      if (identifier) {
        handleAIGeneration({ newFormData, identifier, token });
      }
    } catch (error) {
      console.error('Error creating question set:', error);
    }
  };

  if (Object.keys(staticFilter).length === 0) {
    return <Loader showBackdrop loadingText="Loading..." />;
  }

  let stepContent = null;
  if (activeStep === 0) {
    stepContent = (
      <SelectContent
        formState={formState}
        selected={selectedContent}
        setSelected={setSelectedContent}
        staticFilter={staticFilter}
        onlyFields={onlyFields.filter(
          (field) => !['primaryUser', 'targetAgeGroup'].includes(field)
        )}
        inputType={inputType}
        onNext={handleNextFromSelectContent}
      />
    );
  } else if (activeStep === 1) {
    stepContent = (
      <SetParameters
        formState={{
          ...formState,
          ...(tenantConfig?.COLLECTION_FRAMEWORK === 'scp-framework'
            ? { se_gradeLevels: ['Grade 10'] }
            : {}),
        }}
        staticFilter={staticFilter}
        onlyFields={
          tenantConfig?.COLLECTION_FRAMEWORK === 'scp-framework'
            ? onlyFields1
            : onlyFields
        }
        inputType={inputType}
        onNext={(parameters: any) => handleNextFromSetParameters(parameters)}
        onBack={handleBack}
      />
    );
  }

  return (
    <Layout selectedKey={selectedKey} onSelect={setSelectedKey}>
      {showHeader && <WorkspaceHeader />}
      <Box p={3} sx={{ minHeight: '100vh', background: '#F2F5F8' }}>
        <Typography
          variant="h5"
          sx={{
            ...poppinsFont,
            fontWeight: 400,
            fontSize: 22,
            color: '#1F1B13',
            mb: 2,
          }}
        >
          AI Question Set Generator
        </Typography>
        <CustomStepper activeStep={activeStep} />
        <Box
          sx={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0px 2px 6px 2px #00000026',
          }}
        >
          {stepContent}
        </Box>
        <AIGenerationDialog
          open={showAIDialog}
          state={aiDialogState}
          aiStatus={aiStatus}
          onRetry={() => handleAIGeneration(aiDialogParams)}
          onClose={() => setShowAIDialog(false)}
          onGoToEditor={() => {
            router.push(`/editor?identifier=${aiDialogParams?.identifier}`);
          }}
        />
      </Box>
    </Layout>
  );
};

export default AIAssessmentCreator;

import Header from '../../components/Header';
import withRole from '../../components/withRole';
import BackHeader from '../../components/youthNet/BackHeader';
import EntryContent from '../../components/youthNet/EntryContent';
import EntrySlider from '../../components/youthNet/EntrySlider';
import { CAMP_DATA } from '../../components/youthNet/tempConfigs';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { TENANT_DATA } from '../../utils/app.config';
import { UserList } from '../../components/youthNet/UserCard';
import UploadedFile from '../../components/youthNet/UploadedFile';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PieChartComponent from '../../components/youthNet/Survey/PieChartComponent';
import ParticipantsList from '../../components/youthNet/Survey/ParticipantsList';
interface UserData {
  gender: string;
  age: number;
  name?:string
}
const villageSurveyName = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme<any>();
  const { villageSurveyName } = router.query;
  const { volunteerCount , observationId} = router.query;
  const storedEntries = JSON.parse(localStorage.getItem('selectedSurveyEntries') || '[]');

  const [value, setValue] = React.useState(1);
  const [village, setVillage] = useState<string>('');
  const [camp, setCamp] = useState<string>('');
  const [questionResponse, setQuestionResponseResponse] =
  useState<any>(null);
 
  useEffect(() => {
    if (villageSurveyName) {
      const [villageName, ...rest] = (villageSurveyName as string).split(
        /(?=[A-Z])/
      );
      const surveyTitle = rest.join('');

      setVillage(villageName);
      setCamp(surveyTitle);
    }
  }, [villageSurveyName]);

  const handleBack = () => {
    router.back();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };


const data: Record<string, UserData> = {
  "123": { gender: "male", age: 17, name: "John Doe" },
  "1283": { gender: "female", age: 18, name: "Jane Smith" },
  "12843": { gender: "female", age: 14, name: "Emily Johnson" },
};

const ageColors = ["#EE6002", "#26A69A", "#6200EE", "#FFC107"];
const genderColors = ["#008080", "#FF4500"];

const processData = (key: keyof UserData, data: any) => {
  if (!Array.isArray(data)) {
    console.error("Invalid data format:", data);
    return [];
  }

  const participantEntry = data.find((item: any) => item.question === "Participant Name");
  
  if (!participantEntry || !Array.isArray(participantEntry.answer)) {
    console.warn("No valid Participant Name data found.");
    return [];
  }

  const participantData = participantEntry.answer;
  const counts: Record<string, number> = {};

  participantData.forEach((item: any) => {
    if (item && typeof item === "object" && key in item) {
      const value = String(item[key]); 
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.keys(counts).map((value, index) => ({
    name: value,
    value: counts[value],
    color: key === "age" ? ageColors[index % ageColors.length] : genderColors[index % genderColors.length],
  }));
};

  return (
    <Box minHeight="100vh">
      <Box>
        <Header />
      </Box>
      <Box>
        <BackHeader
          headingOne={village}
          headingTwo={'Creativity Mahotsav'}
          showBackButton={true}
          onBackClick={handleBack}
        />
      </Box>
      <Box ml={2}>
        <Typography
          sx={{ fontSize: '14px', fontWeight: 400, fontStyle: 'italic' }}
        >
{volunteerCount} {t('YOUTHNET_VOLUNTEERLIST.VOLUNTEERS_ASSIGNED')}        </Typography>
      </Box>
      <Box sx={{ width: '100%', display: 'flex' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          aria-label="secondary tabs example"
          sx={{
            fontSize: '14px',
            borderBottom: `1px solid #EBE1D4`,
            '& .MuiTab-root': {
              color: '#4D4639',
              padding: '0 20px',
            },
            '& .Mui-selected': {
              color: '#4D4639',
            },
            '& .MuiTabs-indicator': {
              display: 'flex',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '100px',
              height: '3px',
            },
            '& .MuiTabs-scroller': {
              overflowX: 'unset !important',
            },
          }}
        >
          <Tab value={1} label={t('YOUTHNET_CAMP_DETAILS.SUBMISSION')} />
          <Tab value={2} label={t('YOUTHNET_CAMP_DETAILS.SUMMARY')} />
        </Tabs>
      </Box>
      {value === 1 && (
        <Box>
          { storedEntries.length!==0  ?(<Box width="100%">
            <EntrySlider>
            {storedEntries?.map((entry: { id: string; submissionCount: number }) => (
                      <EntryContent
                        entityId={entry.id}
                        questionResponse={questionResponse}
                        setQuestionResponseResponse={
                          setQuestionResponseResponse
                        }
                        observationId={observationId}
                        submissionNumber={entry?.submissionCount}
                      />
                    ))}
            </EntrySlider>
          </Box>):(<Typography ml="25%" mt="10%"> Looks like there are no entries yet</Typography>)
      }
        </Box>
      )}
      {value === 2 &&
       <Box>
        {storedEntries.length!==0? (<div style={{ display: "flex", flexWrap: "wrap" }}>
      <PieChartComponent title="Age" data={processData("age", questionResponse)} />
      <PieChartComponent title="Gender" data={processData("gender", questionResponse)} />
      <ParticipantsList 
  users={
    Array.isArray(questionResponse) 
      ? Object.values(questionResponse.find((item: any) => item.question === "Participant Name")?.answer || []) 
      : []
  } 
/>

    </div>): (<Typography ml="25%" mt="10%"> Looks like there are no entries yet</Typography>)
}
    </Box>}
    </Box>
  );
};
export async function getStaticPaths() {
  return {
    paths: [], // No pre-generated pages
    fallback: 'blocking', // Generate page on request
  };
}

export async function getStaticProps({ params, locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      villageSurveyName: params.villageSurveyName, // Pass param as prop
    },
  };
}
export default withRole(TENANT_DATA.YOUTHNET)(villageSurveyName);

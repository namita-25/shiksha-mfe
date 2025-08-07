// import Header from '../../components/Header';
// import BackHeader from '../../components/youthNet/BackHeader';
'use client';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '@shared-lib'; // Updated import
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
// import { targetSolution } from '../../services/youthNet/Survey/suveyService';
import { targetSolution } from '../../utils/API/suveyService';
import NoDataFound from '../../Components/NoDataFound/NoDataFound';
import {
  cohortHierarchy,
  YOUTHNET_USER_ROLE,
} from 'mfes/survey-observations/app.config';
import Surveys from '../../Components/Surveys/Surveys';
import { getLoggedInUserRole } from '../../utils/Helper/helper';
import { getStateBlockDistrictList } from '../../utils/API/VillageServices';
import { useRouter } from 'next/navigation';

const Observation = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();

  const [value, setValue] = useState<number>(1);
  const [surveysData, setSurveysData] = useState<any>();
  const [expiredSurveysData, setExpiredSurveysData] = useState<any>();

  const [districtData, setDistrictData] = useState<any>(null);
  const [blockData, setBlockData] = useState<any>(null);
  // const [searchInput, setSearchInput] = useState('');
  const [selectedBlockValue, setSelectedBlockValue] = useState<any>('');
  const [selectedDistrictValue, setSelectedDistrictValue] = useState<any>('');
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleCampSurvey = (villageNameStringNew: string, title: string) => {
    router.push(`/campDetails/${villageNameStringNew}${title}`);
  };

  const handleAddVolunteers = (
    observationId: any,
    solutionId: any,
    observationName?: any
  ) => {
    console.log(observationId);
    // router.push({
    //   pathname: `/volunteerList`,
    //   query: {
    //     blockId: selectedBlockValue,
    //     observationId:observationId,
    //     solutionId: solutionId
    //   },
    // });
    const newFullPath = `/observations/questionary`;
    // const { observationName } = router.query;

    const queryParams = new URLSearchParams({
      Id: observationId,
      observationId,
      observationName,
      solutionId,
    }).toString();

    const fullUrl = `${newFullPath}?Id=${observationId}&observationId=${observationId}&observationName=${observationName}&solutionId=${solutionId}`;
    console.log('Full URL:', fullUrl); // Log the full URL
    router.push(fullUrl);
  };
  useEffect(() => {
    const getData = async () => {
      let userDataString = localStorage.getItem('userData');
      let userData: any = userDataString ? JSON.parse(userDataString) : null;
      const districtResult = userData?.customFields?.find(
        (item: any) => item.label === cohortHierarchy.DISTRICT
      );
      console.log(districtResult?.selectedValues);
      const transformedData = districtResult?.selectedValues?.map(
        (item: any) => ({
          id: item?.id,
          name: item?.value,
        })
      );
      setDistrictData(transformedData);
      setSelectedDistrictValue(transformedData[0]?.id);
      const controllingfieldfk = [transformedData[0]?.id?.toString()];
      const fieldName = 'block';
      const blockResponce = await getStateBlockDistrictList({
        controllingfieldfk,
        fieldName,
      });
      console.log(blockResponce);

      const transformedBlockData = blockResponce?.result?.values?.map(
        (item: any) => ({
          id: item?.value,
          name: item?.label,
        })
      );
      setBlockData(transformedBlockData);
      setSelectedBlockValue(transformedBlockData[0]?.id);
    };
    if (YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()) getData();
  }, []);
  useEffect(() => {
    const fetchObservationData = async () => {
      try {
        //  let userDataString = localStorage.getItem('userData');
        //     let userData: any = userDataString ? JSON.parse(userDataString) : null;
        //     const districtResult = userData.customFields.find(
        //       (item: any) => item.label === cohortHierarchy.DISTRICT
        //     );
        //     const stateResult = userData.customFields.find(
        //       (item: any) => item.label === cohortHierarchy.STATE
        //     );
        //     const blockResult = userData.customFields.find(
        //       (item: any) => item.label === cohortHierarchy.BLOCK
        //     );
        // const state= stateResult?.selectedValues[0]?.id?.toString()
        // const district=districtResult?.selectedValues[0]?.id?.toString()
        // const block=YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()?selectedBlockValue.toString():blockResult?.selectedValues[0]?.id?.toString()
        // localStorage.setItem('userId', ${userId});
        // localStorage.setItem('mfe_role', ${roleId});

        localStorage.setItem(
          'observationPath',
          '/observations/questionary/reload'
        );
        const state = localStorage.getItem('mfe_state');
        const district = localStorage.getItem('mfe_district');
        const block = localStorage.getItem('mfe_block');
        const response = await targetSolution({ state, district });
        const surveysData2 = response?.result?.data.map((survey: any) => ({
          id: survey._id,
          solutionId: survey.solutionId,
          title: survey.name,
          date: new Date(survey.endDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          details: {},
          endDate: new Date(survey.endDate),
        }));
        const currentDate = new Date();
        const activeSurveys = surveysData2.filter(
          (survey: any) => survey.endDate >= currentDate
        );
        const expiredSurveys = surveysData2.filter(
          (survey: any) => survey.endDate < currentDate
        );

        setSurveysData(activeSurveys);
        setExpiredSurveysData(expiredSurveys);
        console.log(surveysData2);

        // setObservationData(response?.result?.data || []);
        // const sortedData = [...response?.result?.data].sort((a, b) => {
        //   const dateA = new Date(a.endDate);
        //   const dateB = new Date(b.endDate);
        //   return dateA.getTime() - dateB.getTime();
        // });

        // setFilteredObservationData(sortedData || []);
        // const data=response?.result?.data;
        // data[1].endDate = "2027-11-15T14:26:18.803Z";
        // setObservationData(data || []);
        // setFilteredObservationData(data || []);
      } catch (error) {
        console.error('Error fetching cohort list:', error);
      }
    };
    fetchObservationData();
  }, [selectedBlockValue]);
  return (
    <>
      <Box px={{ xs: 2, sm: 3, md: 4 }} py={{ xs: 2, sm: 3 }}>
        <Typography variant="h2">{t('SURVEYS.SURVEYS')}</Typography>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {value && (
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            aria-label="survey tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={(theme) => ({
              borderBottom: `1px solid #EBE1D4`,
              '& .MuiTab-root': {
                // color: theme.palette.warning.A200,
                padding: { xs: '6px 10px', sm: '8px 20px' },
                flexShrink: 0,
              },
              '& .Mui-selected': {
                // color: theme.palette.warning.A200,
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '100px',
                height: '3px',
              },
            })}
          >
            <Tab value={1} label={t('SURVEYS.ACTIVE_SURVEYS')} />
            <Tab value={2} label={t('SURVEYS.PREVIOUS_SURVEYS')} />
          </Tabs>
        )}
      </Box>

      <Box>
        {value === 1 && (
          <Box px={{ xs: 2, sm: 3 }} py={2} sx={{ background: '#FBF4E4' }}>
            <Grid container spacing={2}>
              {surveysData?.length > 0 ? (
                surveysData.map((survey: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Surveys
                      title={survey.title}
                      date={survey.date}
                      villages={survey.details.villages}
                      status={survey.details.status}
                      actionRequired={survey.details.actionRequired}
                      minHeight="98px"
                      onClick={() => {
                        handleAddVolunteers(
                          survey.id,
                          survey.solutionId,
                          survey.title
                        );
                        localStorage.setItem('selectedSurvey', survey.title);
                      }}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <NoDataFound />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {value === 2 && (
          <Box px={{ xs: 2, sm: 3 }} py={2} sx={{ background: '#FBF4E4' }}>
            <Grid container spacing={2}>
              {expiredSurveysData?.length > 0 ? (
                expiredSurveysData.map((survey: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Surveys
                      title={survey.title}
                      date={survey.date}
                      villages={survey.details.villages}
                      status={survey.details.status}
                      actionRequired={survey.details.actionRequired}
                      minHeight="98px"
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12} display="flex" justifyContent="center">
                  <NoDataFound />
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Observation;

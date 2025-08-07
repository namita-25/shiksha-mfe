import NoDataFound from '../../components/common/NoDataFound';
import Header from '../../components/Header';
import BackHeader from '../../components/youthNet/BackHeader';
import Surveys from '../../components/youthNet/Surveys';
import {
  surveysData,
  YOUTHNET_USER_ROLE,
} from '../../components/youthNet/tempConfigs';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { targetSolution } from '../../services/youthNet/Survey/suveyService';
import Dropdown from '../../components/youthNet/DropDown';
import Loader from '../../components/Loader';
import { getStateBlockDistrictList } from '../../services/youthNet/Dashboard/VillageServices';
import { cohortHierarchy } from '../../utils/app.constant';
import { getLoggedInUserRole } from '../../utils/Helper';

const Survey = () => {
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
    // console.log(observationId)
    // router.push({
    //   pathname: `/volunteerList`,
    //   query: {
    //     blockId: selectedBlockValue,
    //     observationId:observationId,
    //     solutionId: solutionId
    //   },
    // });
    const newFullPath = `/mfe_observations/questionary`;
    // const { observationName } = router.query;
    const { Id } = router.query;

    const queryParams = {
      Id: observationId,
      observationId: observationId,
      observationName: observationName,
      solutionId: solutionId,
    };
    router.push({
      pathname: newFullPath,
      query: queryParams,
    });
    //here temporary hardcoded entity id later it replace with localstorage entity id for lear
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
          '/mfe_observations/questionary/reload'
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
      <Box ml={2}>
        <BackHeader headingOne={t('SURVEYS.SURVEYS')} />
      </Box>
      <Box sx={{ width: '100%' }}>
        {value && (
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit" // Use "inherit" to apply custom color
            aria-label="secondary tabs example"
            sx={{
              fontSize: '14px',
              borderBottom: (theme) => `1px solid #EBE1D4`,

              '& .MuiTab-root': {
                color: theme.palette.warning['A200'],
                padding: '0 20px',
                flexGrow: 1,
              },
              '& .Mui-selected': {
                color: theme.palette.warning['A200'],
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '100px',
                height: '3px',
              },
              '& .MuiTabs-scroller': {
                overflowX: 'unset !important',
              },
            }}
          >
            <Tab value={1} label={t('SURVEYS.ACTIVE_SURVEYS')} />
            <Tab value={2} label={t('SURVEYS.PREVIOUS_SURVEYS')} />
          </Tabs>
        )}
      </Box>
      <Box>
        {value === 1 && (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <Grid container spacing={2}>
              {surveysData && surveysData.length > 0 ? (
                surveysData?.map((survey: any, index: any) => (
                  <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
                    <Surveys
                      title={survey.title}
                      date={survey.date}
                      villages={survey.details.villages}
                      status={survey.details.status}
                      actionRequired={survey.details.actionRequired}
                      minHeight="98px"
                      // onClick={handleAddVolunteers}
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
                <NoDataFound />
              )}
            </Grid>
          </Box>
        )}
        {value === 2 && (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <Grid container spacing={2}>
              {expiredSurveysData && expiredSurveysData.length > 0 ? (
                expiredSurveysData?.map((survey: any, index: any) => (
                  <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
                    <Surveys
                      title={survey.title}
                      date={survey.date}
                      villages={survey.details.villages}
                      status={survey.details.status}
                      actionRequired={survey.details.actionRequired}
                      minHeight="98px"
                      // onClick={handleAddVolunteers}
                      //  onClick={() => {
                      //   handleAddVolunteers(survey.id, survey.solutionId);
                      //   localStorage.setItem("selectedSurvey", survey.title);
                      // }}
                    />
                  </Grid>
                ))
              ) : (
                <NoDataFound />
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}

export default Survey;

import React, { useEffect, useState } from 'react';
import withRole from '../components/withRole';
import { Box, Grid, Modal, Typography } from '@mui/material';
import Header from '../components/Header';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TENANT_DATA } from '../utils/app.config';
import { fetchSurveyData } from '../services/youthNet/SurveyYouthService';
import SimpleModal from '../components/SimpleModal';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  locations,
  SURVEY_DATA,
  YOUTHNET_USER_ROLE,
  users,
} from '../components/youthNet/tempConfigs';
import BackHeader from '../components/youthNet/BackHeader';
import MonthlyRegistrationsChart from '../components/youthNet/MonthlyRegistrationsChart';
import RegistrationStatistics from '../components/youthNet/RegistrationStatistics';
import YouthAndVolunteers from '../components/youthNet/YouthAndVolunteers';
import VillageNewRegistration from '../components/youthNet/VillageNewRegistration';
import { UserList } from '../components/youthNet/UserCard';
import Dropdown from '../components/youthNet/DropDown';
import {
  fetchUserData,
  fetchUserList,
  getUserDetails,
  getVillages,
  getYouthDataByDate,
} from '../services/youthNet/Dashboard/UserServices';
import Loader from '../components/Loader';
import { filterUsersByAge, getLoggedInUserRole } from '../utils/Helper';
import { Role, Status } from '../utils/app.constant';

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSurveyAvailable, setIsSurveyAvailable] = useState<boolean>(false);
  const [villageCount, setVillageCount] = useState<number>(0);
  const [registeredVillages, setRegisteredVillages] = useState<any>([]);
  const [todaysRegistrationCount, setTodaysRegistrationCount] =
    useState<number>(0);
  const [aboveEighteenUsers, setAboveEighteenUsers] = useState<any>([]);
  const [belowEighteenUsers, setBelowEighteenUsers] = useState<any>([]);
  const [surveymodalOpen, setSurveyModalOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [abvmodalOpen, setAbvModalOpen] = useState<boolean>(false);
  const [belmodalOpen, setBelModalOpen] = useState<boolean>(false);
  const [vilmodalOpen, setVilModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<any>('');

  useEffect(() => {
    const getSurveyData = async () => {
      const surveyAvailable = await fetchSurveyData();
      setIsSurveyAvailable(surveyAvailable);
      setModalOpen(surveyAvailable);
    };

    getSurveyData();
  }, []);

  useEffect(() => {
    const getMentorData = async () => {
      const filters = {
        role: Role.INSTRUCTOR,
        status: [Status.ACTIVE],
      };
      const data = await fetchUserData();
      //  setUserData(data);
    };
    if (YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()) getMentorData();
  }, []);
  const getMentorDistrictData = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const data = await getUserDetails(userId, true);
      const result = data?.userData?.customFields?.find(
        (item: any) => item.label === 'DISTRICT'
      );
      const districtId = result?.selectedValues?.[0]?.id;
      const filters = {
        role: Role?.INSTRUCTOR,
        status: [Status.ACTIVE],
        district: [districtId],
      };
      const responce = await fetchUserList({ filters });
      const transformedData = responce?.getUserDetails?.map((user: any) => ({
        id: user.userId,
        name: user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName,
      }));
      setUserData(transformedData);
      let userDataString = localStorage.getItem('userData');
      let userData: any = userDataString ? JSON.parse(userDataString) : null;
      userData.customFields = data.userData.customFields;
      localStorage.setItem('userData', JSON.stringify(userData));
      setSelectedMentorId(responce?.getUserDetails?.[0]?.userId);
    }
  };
  // setUserData(data);
  const onUserClick = (userId: any) => {
    router.push(`/user-profile/${userId}`);
  };
  useEffect(() => {
    if (YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole())
      getMentorDistrictData();
  }, []);
  useEffect(() => {
    const getYouthData = async (userId: any) => {
      try {
        const villages = await getVillages(userId);
        console.log(villages);

        if (userId === localStorage.getItem('userId')) {
          const updatedData = villages?.map(({ id, value }: any) => ({
            Id: id,
            name: value,
          }));

          localStorage.setItem('villageData', JSON.stringify(updatedData));
        }
        const villageIds = villages?.map((item: any) => item.id) || [];
        setVillageCount(villageIds?.length);
        const response = await getYouthDataByDate(
          new Date(),
          new Date(),
          villageIds
        );
        if (response?.totalCount) {
          setTodaysRegistrationCount(response?.totalCount);
          //  const youthData=response.getUserDetails.find((item:any)=>{
          //    return item.role==="Content creator"
          //  })
          const youthData = filterUsersByAge(response.getUserDetails);
          //console.log()

          const transformedAbove18 = youthData?.above18.map((user: any) => {
            let name = user.firstName || '';
            if (user.lastName) {
              name += ` ${user.lastName}`;
            }
            const villageResult = user.customFields?.find(
              (item: any) => item.label === 'VILLAGE'
            );
            const villageValues = villageResult?.selectedValues.map(
              (village: any) => village.value
            );

            return {
              Id: user.userId,
              name: name.trim(),
              dob: user?.dob,
              firstName: user?.firstName,
              lastName: user?.lastName,
              villageNames: villageValues,
            };
          });
          const transformedBelow18 = youthData?.below18.map((user: any) => {
            let name = user.firstName || '';
            if (user.lastName) {
              name += ` ${user.lastName}`;
            }
            const villageResult = user.customFields?.find(
              (item: any) => item.label === 'VILLAGE'
            );
            const villageValues = villageResult?.selectedValues.map(
              (village: any) => village.value
            );
            return {
              Id: user.userId,
              name: name.trim(),
              dob: user.dob,
              firstName: user?.firstName,
              lastName: user?.lastName,
              villageNames: villageValues,
            };
          });
          setAboveEighteenUsers(transformedAbove18);
          setBelowEighteenUsers(transformedBelow18);
          console.log(youthData?.below18);
          //  console.log(users)
          let users = response.getUserDetails;
          const villageSet = new Set();

          const villageMap = new Map<number, string>();

          users.forEach((user: any) => {
            if (user.customFields) {
              user.customFields.forEach((field: any) => {
                if (field.label === 'VILLAGE') {
                  field.selectedValues.forEach((value: any) => {
                    villageMap.set(value.id, value.value);
                    //  userVillageMap[user.userId] = value.value; // Ensures unique villages by ID
                  });
                }
              });
            }
          });
          const uniqueVillages = Array.from(villageMap, ([id, value]) => ({
            id,
            value,
          }));
          setRegisteredVillages(uniqueVillages);
        } else {
          setTodaysRegistrationCount(0);
          setRegisteredVillages([]);
          setAboveEighteenUsers([]);
          setBelowEighteenUsers([]);
        }
      } catch (error) {
        console.log(error);
      }
      // setUserData(data);
    };
    if (YOUTHNET_USER_ROLE.INSTRUCTOR === getLoggedInUserRole())
      getYouthData(localStorage.getItem('userId'));
    if (
      YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() &&
      selectedMentorId !== ''
    )
      getYouthData(selectedMentorId);
  }, [selectedMentorId]);
  const handleModalClose = () => {
    setModalOpen(false),
      setBelModalOpen(false),
      setAbvModalOpen(false),
      setVilModalOpen(false);
  };

  const handleAddVolunteers = () => {
    router.push('/volunteerList');
  };

  const handleClick = (type: string) => {
    switch (type) {
      case 'above':
        if (aboveEighteenUsers.length !== 0) setAbvModalOpen(true);
        break;
      case 'below':
        if (belowEighteenUsers.length !== 0) setBelModalOpen(true);
        break;
      case 'village':
        if (registeredVillages.length !== 0) setVilModalOpen(true);
        break;
      default:
        console.log('Unknown action');
    }
  };

  return (
    <Box minHeight="100vh">
      <Box>
        <Header />
      </Box>
      <Box ml={2}>
        <BackHeader headingOne={t('DASHBOARD.DASHBOARD')} />
      </Box>
      {YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() && (
        <Box
          sx={{
            px: '20px',
            mt: '15px',
          }}
        >
          {true ? (
            <Dropdown
              name={'Mentor'}
              values={userData}
              defaultValue={userData?.[0]?.id}
              onSelect={(value) => {
                localStorage.setItem('selectedMentoruserId', value);
                setSelectedMentorId(value);
              }}
            />
          ) : (
            <Loader showBackdrop={true} />
          )}
        </Box>
      )}
      <Box ml={2}>
        {YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() ? (
          <Box mt={2}>
            <Typography>
              {t(`YOUTHNET_DASHBOARD.MANAGES`)} {villageCount}{' '}
              {villageCount >= 1
                ? t(`YOUTHNET_DASHBOARD.VILLAGE`)
                : t(`YOUTHNET_DASHBOARD.VILLAGES`)}
            </Typography>
          </Box>
        ) : (
          <Typography>
            {t(
              villageCount <= 1
                ? 'YOUTHNET_DASHBOARD.VILLAGE_MANAGED_BY_YOU'
                : 'YOUTHNET_DASHBOARD.VILLAGES_MANAGED_BY_YOU',
              { totalVillageCount: villageCount }
            )}
          </Typography>
        )}
      </Box>

      <Box pl={2} pr={2} mt={2}>
        <RegistrationStatistics
          title={t('YOUTHNET_DASHBOARD.TODAYS_NEW_REGISTRATION', {
            totalCount: todaysRegistrationCount,
          })}
        />
      </Box>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <RegistrationStatistics
              onPrimaryClick={() => handleClick('above')}
              cardTitle={'Above 18 y/o'}
              statistic={aboveEighteenUsers?.length}
            />
          </Grid>
          <Grid item xs={4}>
            <RegistrationStatistics
              onPrimaryClick={() => handleClick('below')}
              cardTitle={'Below 18 y/o'}
              statistic={belowEighteenUsers?.length}
            />
          </Grid>
          <Grid item xs={4}>
            <RegistrationStatistics
              onPrimaryClick={() => handleClick('village')}
              cardTitle={'From'}
              statistic={
                registeredVillages.length <= 1
                  ? `${registeredVillages.length} ${t(
                      'YOUTHNET_USERS_AND_VILLAGES.VILLAGE'
                    )}`
                  : `${registeredVillages.length} ${t(
                      'YOUTHNET_USERS_AND_VILLAGES.VILLAGES'
                    )}`
              }
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <MonthlyRegistrationsChart
          userId={
            YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()
              ? selectedMentorId
              : localStorage.getItem('userId') || ''
          }
        />
      </Box>
      <Box>
        <YouthAndVolunteers
          selectOptions={[
            { label: t('YOUTHNET_DASHBOARD.AS_OF_TODAY'), value: 'today' },
            {
              label: t('YOUTHNET_DASHBOARD.AS_OF_LAST_SIX_MONTH'),
              value: 'month',
            },
            { label: t('YOUTHNET_DASHBOARD.AS_OF_LAST_YEAR'), value: 'year' },
          ]}
          data=""
          userId={
            YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()
              ? selectedMentorId
              : localStorage.getItem('userId') || ''
          }
          managedVillageCount={villageCount}
        />
      </Box>
      {/* <SimpleModal
        modalTitle={t('YOUTHNET_SURVEY.NEW_SURVEY')}
        primaryText={t('YOUTHNET_SURVEY.ASSIGN_VOLUNTEERS_NOW')}
        secondaryText={t('YOUTHNET_SURVEY.REMIND_ME_LATER')}
        secondaryActionHandler={handleModalClose}
        primaryActionHandler={handleAddVolunteers}
        open={modalOpen}
        onClose={handleModalClose}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography
            sx={{
              color: 'black',
              fontWeight: 500,
              textAlign: 'center',
              mb: 1,
            }}
          >
            {t('YOUTHNET_SURVEY.NEW_SURVEY_HAS_BEEN_ADDED', {
              surveyName: SURVEY_DATA.CREATIVITY_MAHOTSAV,
              villageCount: SURVEY_DATA.TWELVE,
            })}
          </Typography>
          <Typography
            sx={{
              color: 'black',
              textAlign: 'center',
            }}
          >
            {t('YOUTHNET_SURVEY.ASSIGN_VOLUNTEERS_TO_ENSURE')}
          </Typography>
        </Box>
      </SimpleModal> */}
      <SimpleModal
        modalTitle={t('YOUTHNET_DASHBOARD.ABOVE_18')}
        open={abvmodalOpen}
        onClose={handleModalClose}
      >
        {' '}
        <UserList
          users={aboveEighteenUsers}
          layout="list"
          onUserClick={onUserClick}
        />
      </SimpleModal>

      <SimpleModal
        modalTitle={t('YOUTHNET_DASHBOARD.BELOW_18')}
        open={belmodalOpen}
        onClose={handleModalClose}
      >
        {' '}
        <UserList
          users={belowEighteenUsers}
          layout="list"
          onUserClick={onUserClick}
        />
      </SimpleModal>
      <SimpleModal
        modalTitle={t('YOUTHNET_DASHBOARD.VLLAGE_18')}
        open={vilmodalOpen}
        onClose={handleModalClose}
      >
        {' '}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <VillageNewRegistration locations={registeredVillages} />
        </Box>
      </SimpleModal>
    </Box>
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

export default withRole(TENANT_DATA.YOUTHNET)(Index);

import Header from '../../components/Header';
import BackHeader from '../../components/youthNet/BackHeader';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import withRole from '../../components/withRole';
import { TENANT_DATA } from '../../utils/app.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPaths } from 'next';
import {
  SURVEY_DATA,
  VILLAGE_DATA,
  YOUTHNET_USER_ROLE,
} from '../../components/youthNet/tempConfigs';
import VillageDetailCard from '../../components/youthNet/VillageDetailCard';
import Frame1 from '../../assets/images/SurveyFrame1.png';
import Frame2 from '../../assets/images/SurveyFrame2.png';
import { useEffect, useState } from 'react';
import { fetchUserList } from '../../services/youthNet/Dashboard/UserServices';
import { Role, Status } from '../../utils/app.constant';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { categorizeUsers, getLoggedInUserRole } from '../../utils/Helper';
import { cohortHierarchy } from '@/utils/app.constant';

const VillageDetails = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { villageName } = router.query; // Extract the slug from the URL
  const villageNameString = Array.isArray(villageName)
    ? villageName[0]
    : villageName || '';
  const { id, blockId, tab } = router.query;
  const [yuthCount, setYuthCount] = useState<number>(0);
  const [volunteerCount, setVolunteerCount] = useState<number>(0);

  const [todaysRegistrationCount, setTodaysRegistrationCount] =
    useState<number>(0);

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA');
  };
  useEffect(() => {
    const getYouthData = async () => {
      try {
        const limit = 100;
        const offset = 0;
        let filters;
        if (id) {
          filters = {
            role: Role.LEARNER,
            status: [Status.ACTIVE],
            village: [id.toString()],
          };
        }
        if (filters) {
          const response = await fetchUserList({ limit, offset, filters });
          const { volunteerUsers, youthUsers } = categorizeUsers(
            response?.getUserDetails
          );

          setYuthCount(youthUsers?.length);
          setVolunteerCount(volunteerUsers?.length);
          const todayUsers = response?.getUserDetails.filter((user: any) => {
            return user.createdAt.startsWith(getTodayDate());
          });
          setTodaysRegistrationCount(todayUsers.length);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getYouthData();
  }, []);
  const handleYouthVolunteers = () => {
    console.log('handleYouthVolunteers');
    let userDataString;
    if (YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole())
      userDataString = localStorage.getItem('selectedmentorData');
    else userDataString = localStorage.getItem('userData');

    let userData: any = userDataString ? JSON.parse(userDataString) : null;
    console.log(userData);
    const blockResult = userData?.customFields?.find(
      (item: any) => item.label === cohortHierarchy.BLOCK
    );
    blockResult?.selectedValues?.[0]?.id;
    router.push({
      pathname: `/villages`,
      query: {
        villageId: id,
        tab: 3,
        blockId: blockId ? blockId : blockResult?.selectedValues?.[0]?.id,
      },
    });
  };
  const handleAddVolunteer = (id: any, blockId?: any) => {
    if (blockId) {
      router.push({
        pathname: `/villages`,
        query: {
          villageId: id,
          tab: 3,
          blockId: blockId,
        },
      });
    }
    router.push({
      pathname: `/villages`,
      query: {
        villageId: id,
        tab: 3,
      },
    });
  };
  const handleSurveys = () => {
    router.push(`/survey/${villageNameString}`);
  };

  return (
    <Box minHeight="100vh">
      <Box>
        <Header />
      </Box>
      <Box>
        <BackHeader
          headingOne={villageNameString}
          headingTwo={(yuthCount + volunteerCount).toString()}
          headingThree={
            <>
              <ArrowUpwardIcon sx={{ height: 16, width: 16 }} />
              {todaysRegistrationCount.toString()}
            </>
          }
          showBackButton={true}
          onBackClick={() => {
            if (tab) {
              router.push({
                pathname: `/villages`,
                query: {
                  //   villageId: id,
                  tab: tab,
                  blockId: blockId,
                },
              });
            } else router.back();
          }}
        />
      </Box>
      <Box
        ml={2}
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
          {VILLAGE_DATA.VILLAGE_ID}
        </Typography>
        <Typography pl={5} sx={{ fontSize: '12px' }}>
          {id}
        </Typography>
      </Box>
      <Box>
        <VillageDetailCard
          imageSrc={Frame1}
          title={t('YOUTHNET_DASHBOARD.YOUTH_AND_VOLUNTEER', {
            youthCount: yuthCount,
            volunteerCount: volunteerCount,
          })}
          onClick={handleYouthVolunteers}
        />
      </Box>
      {/* <Box>
        <VillageDetailCard
          imageSrc={Frame2}
          title={VILLAGE_DATA.THREE}
          subtitle={VILLAGE_DATA.SURVEYS_CONDUCTED}
          onClick={handleSurveys}
        />
      </Box> */}
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

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  };
};

export default withRole(TENANT_DATA.YOUTHNET)(VillageDetails);

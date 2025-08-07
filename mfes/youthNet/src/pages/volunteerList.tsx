import React, { useEffect, useState } from 'react';
import withRole from '../components/withRole';
import { Box, Grid } from '@mui/material';
import Header from '../components/Header';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TENANT_DATA } from '../utils/app.config';
import BackHeader from '../components/youthNet/BackHeader';
import { SURVEY_DATA, volunteerData } from '../components/youthNet/tempConfigs';
import { useRouter } from 'next/router';
import VolunteerListCard from '../components/youthNet/VolunteerListCard';
import NoDataFound from '../components/common/NoDataFound';
import { Role, Status } from '../utils/app.constant';
import { fetchUserList } from '../services/youthNet/Dashboard/UserServices';
import { getStateBlockDistrictList } from '../services/youthNet/Dashboard/VillageServices';
import { useTranslation } from 'next-i18next';
import { fetchEntities } from '@/services/ObservationServices';
import { fetchObservSublist } from '../services/youthNet/Survey/suveyService';

const volunteerList = () => {
  const router = useRouter();
  const [villageList, setVillageList] = useState<any>();
  const [villageCount, setVillageCount] = useState<any>();
  const [observationId, setObservationId] = useState<any>();

  const { t } = useTranslation();

  const { surveyName } = router.query;
  const { blockId, solutionId } = router.query;
  const villageNameStringNew = Array.isArray(surveyName)
    ? surveyName[0]
    : surveyName || '';

  console.log(villageNameStringNew);

  const handleBack = () => {
    router.back();
  };
  useEffect(() => {
    const getVillageVolunteerData = async () => {
      let villagedatalist;
      if (blockId) {
        const controllingfieldfk = [blockId.toString()];
        const fieldName = 'village';
        const villageResponce = await getStateBlockDistrictList({
          controllingfieldfk,
          fieldName,
        });

        const transformedVillageData = villageResponce?.result?.values?.map(
          (item: any) => ({
            Id: item?.value,
            name: item?.label,
          })
        );
        villagedatalist = transformedVillageData;
        setVillageCount(transformedVillageData.length);
      } else {
        villagedatalist = localStorage.getItem('villageData');
        if (villagedatalist) {
          villagedatalist = JSON.parse(villagedatalist);
          setVillageCount(villagedatalist.length);
        }
      }

      if (villagedatalist) {
        const ids = villagedatalist?.map((item: any) => item.Id);

        let transformedData = villagedatalist.map(({ Id, name }: any) => ({
          Id,
          name,
          entries: 0, // Default entries count
          volunteerCount: 0, // Default volunteer count
          actionLabel: 'Add or Update Volunteers',
          completedEntries: [], // New array for completed user IDs
        }));

        const filters = {
          village: ids,
          role: Role.LEARNER,
          status: [Status.ACTIVE],
          is_volunteer: 'yes',
        };

        const result = await fetchUserList({ filters });
        if (result?.getUserDetails) {
          const villageVolunteerCount: any = {};
          const userVillageMap: any = {}; // Map userId to villageId

          result.getUserDetails.forEach((user: any) => {
            const villageField = user?.customFields?.find(
              (field: any) => field?.label === 'VILLAGE'
            );
            if (villageField) {
              const villageId = villageField?.selectedValues?.[0]?.id;
              if (!villageVolunteerCount?.[villageId]) {
                villageVolunteerCount[villageId] = 0;
              }
              villageVolunteerCount[villageId] += 1;

              // Map userId to villageId
              userVillageMap[user.userId] = villageId;
            }
          });

          transformedData = transformedData.map((village: any) => ({
            ...village,
            volunteerCount: villageVolunteerCount[village.Id] || 0,
          }));

          const completedEntriesList: any = [];

          if (solutionId) {
            const response = await fetchEntities({ solutionId });
            setObservationId(response?.result?._id);

            const completedIds = response?.result?.entities
              ?.filter(
                (entity: any) => entity.submissionsCount > 0 && entity._id
              )
              ?.map((entity: any) => entity._id);

            console.log(completedIds);

            const completedEntriesResults = await Promise.all(
              completedIds?.map(async (userId: string) => {
                const responseObserSubList = await fetchObservSublist({
                  observationId: response?.result?._id,
                  entityId: userId,
                });

                return responseObserSubList
                  ?.filter(
                    (entity: any) => entity.status === 'completed' && entity._id
                  )
                  ?.map((entity: any) => ({
                    id: entity.entityId,
                    submissionCount: entity['submissionNumber'] || 0,
                  }))
                  ?.sort(
                    (a: any, b: any) => a.submissionCount - b.submissionCount
                  );
              })
            );

            completedEntriesList.push(...completedEntriesResults.flat());

            const villageEntriesData: any = {};
            completedEntriesList.forEach((item: any) => {
              const villageId = userVillageMap[item.id];
              if (villageId) {
                if (!villageEntriesData[villageId]) {
                  villageEntriesData[villageId] = { count: 0, ids: [] };
                }
                villageEntriesData[villageId].count =
                  villageEntriesData[villageId]?.ids?.length;
                villageEntriesData[villageId].ids.push(item);
              }
            });

            console.log(villageEntriesData);

            transformedData = transformedData.map((village: any) => {
              const entriesData = villageEntriesData[village.Id] || {
                count: 0,
                ids: [],
              };
              return {
                ...village,
                entries: entriesData.ids.length,
                completedEntries: entriesData.ids,
              };
            });
          }
        }

        console.log(transformedData);
        setVillageList(transformedData);
      }
    };

    getVillageVolunteerData();
  }, [solutionId]);

  console.log(villageList);
  const handleCardAction = (
    villageNameStringNew: string,
    title: string,
    volunteerCount?: any
  ) => {
    router.push({
      pathname: `/village-camp-survyey/${title}`,
      query: {
        volunteerCount: volunteerCount,
        observationId: observationId,
        solutionId: solutionId,
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

  return (
    <Box minHeight="100vh">
      <Box>
        <Header />
      </Box>
      <BackHeader
        headingOne={localStorage.getItem('selectedSurvey') || ''}
        headingTwo={t('YOUTHNET_SURVEY.SURVEY_ASSIGNED_VILLAGE_COUNT', {
          villageCount: villageCount,
        })}
        showBackButton={true}
        onBackClick={handleBack}
      />
      <Box sx={{ mt: 4, p: 2, background: '#FBF4E4' }}>
        <Grid container spacing={2}>
          {villageList?.length > 0 ? (
            villageList?.map((data: any) => (
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <VolunteerListCard
                  key={data?.Id}
                  title={data?.name}
                  entries={data?.entries}
                  volunteerCount={data?.volunteerCount}
                  actionLabel={data?.actionLabel}
                  onActionClick={() => {
                    localStorage.setItem(
                      'selectedSurveyEntries',
                      JSON.stringify(data?.completedEntries)
                    );
                    handleCardAction(
                      villageNameStringNew,
                      data?.name,
                      data?.volunteerCount
                    );
                  }}
                  onAssignVolunteerClick={() =>
                    handleAddVolunteer(data?.Id, blockId)
                  }
                  entriesList={data?.completedEntries}
                />
              </Grid>
            ))
          ) : (
            <NoDataFound />
          )}
        </Grid>
      </Box>
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

export default withRole(TENANT_DATA.YOUTHNET)(volunteerList);

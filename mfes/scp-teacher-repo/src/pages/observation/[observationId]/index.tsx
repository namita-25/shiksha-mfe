import Header from '@/components/Header';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
// import AddEntityModal from '@/components/observations/AddEntityModal';
import { getBlocksByCenterId, getCohortList } from '@/services/CohortServices';
import {
  getMyCohortFacilitatorList,
  getMyCohortMemberList,
} from '@/services/MyClassDetailsService';
import {
  ObservationEntityType,
  ObservationStatus,
  Role,
  Status,
  Telemetry,
} from '@/utils/app.constant';
import { formatDate, toPascalCase } from '@/utils/Helper';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import { GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Loader from '@/components/Loader';
import Entity from '@/components/observations/Entity';
import SearchBar from '@/components/Searchbar';
import {
  addEntities,
  fetchEntities,
  targetSolution,
} from '@/services/ObservationServices';
import { CohortMemberList, ICohort } from '@/utils/Interfaces';
import { telemetryFactory } from '@/utils/telemetry';
import { useTranslation } from 'next-i18next';
import CohortSelectionSection from '@/components/CohortSelectionSection';
import CenterDropdown from '@/components/CenterSelection';
import CohortId from '@/pages/centers/[cohortId]';
interface EntityData {
  cohortId?: string;
  name?: string;
  userId?: string;
  status?: string;
  _id?: string;
}

const ObservationDetails = () => {
  const router = useRouter();
  const { entity } = router.query;
  // const entity="center"
  const { Id } = router.query;

  const { observationName } = router.query;

  const [myCohortList, setMyCohortList] = useState<any[]>([]);
  const [centerList, setCenterList] = useState<any[]>([]);
  const [blockName, setBlockName] = React.useState<string>('');
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);

  const [myCohortListForCenter, setmyCohortListForCenter] = useState<any[]>([]);
  const [cohortIdData, setCohortIdData] = useState<any[]>([]);
  const [entityIds, setEntityIds] = useState<any[]>([]);
  const [fetchEntityResponse, setFetchEntityResponse] = useState<any[]>([]);
  const [entityData, setEntityData] = useState<any[]>([]);
  const [filteredEntityData, setFilteredEntityData] = useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [observationId, setObservationId] = React.useState('');
  const [selectedCenter, setSelectedCenter] = useState('');

  const isSmallScreen = useMediaQuery('(max-width:938px)');

  const [cohortsData, setCohortsData] = React.useState<Array<ICohort>>([]);
  const [manipulatedCohortData, setManipulatedCohortData] =
    React.useState<Array<ICohort>>(cohortsData);
  const [classId, setClassId] = React.useState('');
  console.log('classId', classId);
  const [showDetails, setShowDetails] = React.useState(false);
  const [handleSaveHasRun, setHandleSaveHasRun] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  const [userIdData, setUserIdData] = useState<any[]>([]);

  const [totalCountForCenter, setTotalCountForCenter] = React.useState(0);

  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [Data, setData] = React.useState<Array<any>>([]);
  const [firstEntityStatus, setFirstEntityStatus] = React.useState<string>('');

  const [totalCount, setTotalCount] = React.useState(0);
  const [pageLimit, setPageLimit] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [pageForCenter, setPageForCenter] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);

  const [limit, setLimit] = React.useState(pageLimit);

  const [searchInput, setSearchInput] = useState('');

  const { t, i18n } = useTranslation();
  const [observationData, setObservationData] = useState<any>([]);
  const [observationDescription, setObservationDescription] = useState<any>();
  const [observationEndDate, setObservationEndDate] = useState<any>('');

  const [status, setStatus] = useState(ObservationStatus.ALL);

  const theme = useTheme<any>();
  console.log(myCohortListForCenter);
  useEffect(() => {
    if (selectedCenter) {
      setFilteredBatches([]);
      getBlocksByCenterId(selectedCenter, centerList)
        .then((res: any) => {
          setmyCohortListForCenter(res);
          setFilteredBatches(res);
          //setLoading(false)
          // setBatchLoading(false);
        })
        .catch(() => {
          // setBatchLoading(false);
        });
    } else {
      setFilteredBatches([]);
    }
  }, [selectedCenter, centerList]);
  console.log('filteredbatchlist', filteredBatches);
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const userId = localStorage.getItem('userId');

        if (userId) {
          const response = await getCohortList(userId, { customField: 'true' });
          let filteredData;
          if (localStorage.getItem('role') === Role.TEAM_LEADER) {
            if (searchInput !== '' && entity === ObservationEntityType.CENTER) {
              filteredData = response[0]?.childData
                ?.filter(
                  (cohort: any) =>
                    cohort?.name
                      ?.toLowerCase()
                      ?.includes(searchInput?.toLowerCase()) &&
                    cohort?.status?.toLowerCase() === Status.ACTIVE
                )
                ?.sort((a: any, b: any) => a.name.localeCompare(b.name));

              setMyCohortList(filteredData);
            } else {
              filteredData = response[0]?.childData
                ?.filter(
                  (cohort: any) =>
                    cohort?.status?.toLowerCase() === Status.ACTIVE
                )
                ?.sort((a: any, b: any) => a.name.localeCompare(b.name));

              setMyCohortList(filteredData);
            }
            if (selectedCohort === '') {
              // const data= typeof window !== 'undefined'
              // ? localStorage.getItem("selectedCohort") || localStorage.getItem('role') === Role.TEAM_LEADER? response[0]?.childData[0]?.cohortId:response[0]?.cohortId
              // : response[0]?.childData[0]?.cohortId;
              const data = localStorage.getItem('selectedCohort')
                ? localStorage.getItem('selectedCohort')
                : localStorage.getItem('role') === Role.TEAM_LEADER
                ? filteredData[0]?.cohortId
                : filteredData[0]?.cohortId;

              setSelectedCohort(data);
            }
          } else {
            setMyCohortList(response);
            if (selectedCohort === '') {
              const data = localStorage.getItem('selectedCohort')
                ? localStorage.getItem('selectedCohort')
                : localStorage.getItem('role') === Role.TEAM_LEADER
                ? response[0]?.childData[0]?.cohortId
                : response[0]?.cohortId;

              setSelectedCohort(data);
            }
          }

          if (searchInput !== '' || entity === ObservationEntityType.CENTER) {
            const filteredData = response[0]?.childData
              ?.filter((cohort: any) =>
                cohort?.name?.toLowerCase().includes(searchInput?.toLowerCase())
              )
              ?.sort((a: any, b: any) => a?.name?.localeCompare(b?.name));

            //  setmyCohortListForCenter(filteredData);
          }
          //setmyCohortListForCenter(response);
        }
      } catch (error) {
        console.error('Error fetching cohort list', error);
      }
    };
    fetchCohorts();
  }, [searchInput]);

  useEffect(() => {
    const fetchObservationData = async () => {
      try {
        const response = await targetSolution();
        setObservationData(response?.result?.data || []);
      } catch (error) {
        console.error('Error fetching cohort list:', error);
      }
    };
    fetchObservationData();
  }, []);

  useEffect(() => {
    console.log(observationData);
    const result = observationData?.find((item: any) => item._id === Id);
    setObservationDescription(
      result?.description || localStorage.getItem('observationDescription')
    );
    setObservationEndDate(
      result?.endDate || localStorage.getItem('endDateForSelectedObservation')
    );
  }, [Id, observationData]);
  useEffect(() => {
    const getCohortListForTL = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userId = localStorage.getItem('userId');
          if (userId) {
            const response = await getCohortList(userId, {
              customField: 'true',
            });
            setCenterList(response);
          }
        }
      } catch (error) {
        setCenterList([]);

        console.log('error', error);
        // showToastMessage(t('COMMON.SOMETHING_WENT_WRONG'), 'error');
      }
    };
    getCohortListForTL();
  }, []);
  useEffect(() => {
    const fetchEntityList = async () => {
      try {
        const urlPath = window.location.pathname;
        const solutionId = urlPath.split('/observation/')[1];
        if (solutionId) {
          let entities = entityIds;

          //  if (entities?.length === 0)
          {
            const response = await fetchEntities({ solutionId });
            setObservationId(response?.result?._id);
            setFetchEntityResponse(response?.result?.entities);
            entities = response?.result?.entities?.map(
              (item: any) => item?._id
            );

            setEntityIds(entities);
          }
        }
      } catch (error) {
        console.error('Error fetching cohort list:', error);
      }
    };
    if (entity !== ObservationEntityType.CENTER && Data.length !== 0)
      fetchEntityList();
    else if (
      entity === ObservationEntityType.CENTER &&
      myCohortListForCenter.length !== 0
    )
      fetchEntityList();
  }, [Data, myCohortListForCenter]);
  useEffect(() => {
    const selectedcenterForobbservation = localStorage.getItem(
      'selectedcenterForobbservation'
    );
    const storedCenterId = localStorage.getItem('centerId');
    if (selectedcenterForobbservation) {
      console.log(selectedcenterForobbservation);
      setSelectedCenter(selectedcenterForobbservation);
    } else if (storedCenterId) {
      console.log(storedCenterId);

      setSelectedCenter(storedCenterId);
    }
  }, []);
  console.log('selectedCenter', selectedCenter);
  useEffect(() => {
    let result = [];

    if (entity !== ObservationEntityType.CENTER) {
      result = Data.map((user) => {
        const submission =
          fetchEntityResponse.find((sub) => sub._id === user.userId) || {};
        return {
          name: user.name,
          _id: user.userId,
          submissionsCount: submission.submissionsCount || 0,
          submissionId: submission.submissionId || null,
          status: submission.status || ObservationStatus.NOT_STARTED,
        };
      });
    } else {
      console.log('myCohortListForCenter', myCohortListForCenter);

      result =
        myCohortListForCenter?.map((cohort) => {
          const submission =
            fetchEntityResponse.find((sub) => sub._id === cohort.cohortId) ||
            {};
          return {
            name: cohort?.name,
            _id: cohort?.cohortId,
            submissionsCount: submission.submissionsCount || 0,
            submissionId: submission.submissionId || null,
            status: submission.status || ObservationStatus.NOT_STARTED,
          };
        }) || [];

      console.log('result', result);
    }

    // Apply filtering based on search input
    const filtered = result.filter((item) =>
      item.name?.toLowerCase().includes(searchInput?.toLowerCase())
    );

    setEntityData(filtered);
    setFilteredEntityData(filtered);
  }, [
    fetchEntityResponse,
    Data,
    myCohortListForCenter,
    searchInput,
    selectedCenter,
  ]);

  useEffect(() => {
    if (entityIds?.length > 0) {
      const unmatchedCohorts = myCohortListForCenter?.filter(
        (child: any) => !entityIds?.includes(child.cohortId)
      );
      const unmatchedUsers = Data?.filter(
        (child: any) => !entityIds?.includes(child.userId)
      );

      const unmatchedUserIds = unmatchedUsers?.map(
        (child: any) => child?.userId
      );
      const unmatchedCohortIds = unmatchedCohorts?.map(
        (cohort) => cohort?.cohortId
      );

      setCohortIdData(unmatchedCohortIds);
      setUserIdData(unmatchedUserIds);

      const data = {
        data:
          entity !== ObservationEntityType.CENTER
            ? unmatchedUserIds
            : unmatchedCohortIds,
      };

      const executeAddEntities = async () => {
        if (
          entity === ObservationEntityType.CENTER &&
          unmatchedCohortIds.length !== 0
        ) {
          await addEntities({ data, observationId });
          const urlPath = window.location.pathname;

          const solutionId = urlPath.split('/observation/')[1];

          const response = await fetchEntities({ solutionId });
          setObservationId(response?.result?._id);

          setFetchEntityResponse(response?.result?.entities);
        } else if (unmatchedUserIds.length !== 0) {
          await addEntities({ data, observationId });
          const urlPath = window.location.pathname;

          const solutionId = urlPath.split('/observation/')[1];

          const response = await fetchEntities({ solutionId });
          setObservationId(response?.result?._id);

          setFetchEntityResponse(response?.result?.entities);
        }
      };

      executeAddEntities();
    }
  }, [entityIds, Data, observationId]);

  useEffect(() => {
    const handleCohortChange = async () => {
      try {
        setLoading(true);
        const filters = {
          cohortId: classId,
        } as CohortMemberList['filters'];
        if (searchInput !== '') filters.firstName = searchInput;
        //const limit=limit;
        let response;
        if (entity === ObservationEntityType?.LEARNER) {
          response = await getMyCohortMemberList({
            filters,
          });
        } else if (entity === ObservationEntityType?.FACILITATOR) {
          response = await getMyCohortFacilitatorList({
            filters,
          });
        }

        const resp = response?.result?.userDetails;
        setTotalCount(response?.result?.totalCount);
        if (resp) {
          const userDetails = resp.map((user: any) => {
            const ageField = user.customField.find(
              (field: { label: string }) => field.label === 'AGE'
            );
            return {
              name:
                toPascalCase(user?.firstName || '') +
                ' ' +
                (user?.lastName ? toPascalCase(user.lastName) : ''),
              userId: user?.userId,
              memberStatus: user?.status,
              statusReason: user?.statusReason,
              cohortMembershipId: user?.cohortMembershipId,
              enrollmentNumber: user?.username,
              age: ageField ? ageField.value : null,
            };
          });

          setData(userDetails);
        } else {
          setData([]);
        }
      } catch (error) {
        setData([]);

        console.error('Error fetching cohort list:', error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedCohort && selectedCohort !== '') handleCohortChange();
  }, [page, selectedCohort, searchInput, entity, i18n?.language, classId]);

  const onPreviousClick = () => {
    if (entity === ObservationEntityType?.CENTER) {
      setPageForCenter(pageForCenter - pageLimit);
    }
    setPage(page - pageLimit);
  };
  function onNextClick() {
    if (entity === ObservationEntityType?.CENTER) {
      setPageForCenter(pageForCenter + pageLimit);
    } else {
      setPage(page + pageLimit);
    }
  }
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSearchInput(value);
    // Trigger the search logic only if input has 3 or more characters
    if (value.length >= 3) {
      // Call your search logic here
      setSearchInput(event.target.value.toLowerCase());
    }
  };
  const handleCohortChange = async (event: any) => {};
  const handleCenterChange = (cohortId: any) => {
    setSelectedCenter(cohortId);
    localStorage.setItem('selectedcenterForobbservation', cohortId);
  };
  const onStartObservation = (cohortId: any, name?: any) => {
    localStorage.setItem('observationName', name);

    localStorage.setItem('observationPath', router.asPath);
    const basePath = router.asPath.split('?')[0];
    const newFullPath = `${basePath}/questionary`;
    const { observationName } = router.query;
    const { Id } = router.query;

    const queryParams = {
      entityId: cohortId,
      Id: observationId,
      observationName: observationName,
    };
    router.push({
      pathname: newFullPath,
      query: queryParams,
    });
  };

  const renderEntityData = (data: EntityData[], entityType: string) => {
    console.log('data', data);

    console.log(entityType);

    // if (!data || data.length === 0) {
    //   return <Typography ml="40%"> {t('OBSERVATION.NO_DATA_FOUND',{
    //     entity:entity,
    //   })}
    //   </Typography>;
    // }

    return data.map((item, index) => (
      <Entity
        key={item.cohortId || index} // Use a unique key here
        entityMemberValue={toPascalCase(item?.name)}
        status={
          item?.status === ObservationStatus?.STARTED
            ? ObservationStatus.NOT_STARTED
            : item?.status
        }
        onClick={() =>
          entityType !== ObservationEntityType.CENTER
            ? onStartObservation(item?._id, item?.name)
            : onStartObservation(item?._id, item?.name)
        }
      />
    ));
  };

  const entityContent = useMemo(() => {
    switch (entity?.toString()) {
      case ObservationEntityType.CENTER:
        if (myCohortListForCenter.length !== 0) {
          return renderEntityData(
            filteredEntityData,
            ObservationEntityType.CENTER
          );
        }

      case ObservationEntityType.LEARNER:
        return renderEntityData(
          filteredEntityData,
          ObservationEntityType.LEARNER
        );
      case ObservationEntityType.FACILITATOR:
        return renderEntityData(
          filteredEntityData,
          ObservationEntityType.FACILITATOR
        );
      default:
        return null;
    }
  }, [entity, myCohortListForCenter, Data, filteredEntityData, i18n?.language]);

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value - 1);
    if (entity === ObservationEntityType.CENTER)
      setPageForCenter((value - 1) * limit);
    else setPage((value - 1) * limit);

    // setPageOffset(value - 1);
    // setOffset((value - 1)*limit)
  };

  const handleBackEvent = () => {
    //  router.push(
    //     `${localStorage.getItem('observationPath')}`
    //   );
    router.push('/observation');
  };
  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);

    if (event.target.value === ObservationStatus.ALL) {
      setFilteredEntityData(entityData);
    } else if (event.target.value === ObservationStatus.NOT_STARTED) {
      const filteredData = entityData.filter(
        (item) =>
          item.status === event.target.value ||
          item.status === ObservationStatus.STARTED
      );
      setFilteredEntityData(filteredData);
    } else {
      const filteredData = entityData.filter(
        (item) => item.status === event.target.value
      );
      setFilteredEntityData(filteredData);
    }
  };
  return (
    <>
      <Header />
      <Box m={{ xs: '10px', md: '20px' }}>
        {/* Top bar with back icon and title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '22px',
            mb: 2,
            color: '#1F1B13',
          }}
        >
          <KeyboardBackspaceOutlinedIcon
            cursor="pointer"
            sx={{ color: theme.palette.warning['A200'] }}
            onClick={handleBackEvent}
          />
          <Box
            sx={{
              fontSize: '16px',
              fontWeight: '400',
              color: '#1F1B13',
            }}
          >
            {observationName}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              position="relative"
              bgcolor="#FBF4E5"
              width="100%"
              p={{ xs: 2, sm: 3 }}
            >
              <Box mt={1} ml={1}>
                <Typography variant="h2" fontWeight="bold" color="black">
                  {t('OBSERVATION.OBSERVATION_DETAILS')}
                </Typography>
                <Typography variant="h2" color="black" mt={2}>
                  {observationDescription}
                </Typography>
                {observationEndDate && (
                  <Typography variant="body1" color="black">
                    {t('OBSERVATION.DUE_DATE')}:{' '}
                    {formatDate(observationEndDate?.toString())}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  marginLeft: '10px',
                }}
              >
                {entity !== ObservationEntityType?.CENTER ? (
                  <CohortSelectionSection
                    classId={classId}
                    setClassId={setClassId}
                    userId={userId}
                    setUserId={setUserId}
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    loading={loading}
                    setLoading={setLoading}
                    cohortsData={cohortsData}
                    setCohortsData={setCohortsData}
                    manipulatedCohortData={manipulatedCohortData}
                    setManipulatedCohortData={setManipulatedCohortData}
                    blockName={blockName}
                    setBlockName={setBlockName}
                    handleSaveHasRun={handleSaveHasRun}
                    setHandleSaveHasRun={setHandleSaveHasRun}
                    isCustomFieldRequired={false}
                  />
                ) : (
                  <CenterDropdown
                    cohortId={selectedCenter}
                    onChange={handleCenterChange}
                    centerList={centerList}
                    selectedCenterId={selectedCenter}
                    setSelectedCenterId={setSelectedCenter}
                  />
                )}
                <Box
                  sx={{
                    mt: '24px',
                    '@media (min-width: 900px)': {
                      width: '20%',
                      marginLeft: '5px',
                    },
                  }}
                >
                  <Box sx={{ minWidth: 120, gap: '15px' }} display={'flex'}>
                    <FormControl
                      sx={{
                        borderRadius: '0.5rem',
                        color: 'rgba(0, 0, 0, 0.6)',
                        backgroundColor: 'white',
                        marginBottom: '0rem',
                        width: '100%',
                        marginRight: '10px',
                        '@media (max-width: 902px)': {
                          width: '100%',
                        },
                        '@media (max-width: 702px)': {
                          width: '100%',
                        },
                      }}
                    >
                      <InputLabel>
                        <Typography
                          variant="h2"
                          sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 400 }}
                        >
                          {t('OBSERVATION.OBSERVATION_STATUS')}
                        </Typography>
                      </InputLabel>
                      <Select
                        value={status}
                        onChange={handleStatusChange}
                        label={t('OBSERVATION.OBSERVATION_STATUS')}
                        defaultValue={ObservationStatus.ALL}
                        sx={{
                          height: '52px',
                        }}
                      >
                        <MenuItem value={ObservationStatus.ALL}>
                          {t('COMMON.ALL')}
                        </MenuItem>
                        <MenuItem value={ObservationStatus.NOT_STARTED}>
                          {t('OBSERVATION.NOT_STARTED')}
                        </MenuItem>
                        <MenuItem value={ObservationStatus.DRAFT}>
                          {t('OBSERVATION.INPROGRESS')}
                        </MenuItem>
                        <MenuItem value={ObservationStatus.COMPLETED}>
                          {t('OBSERVATION.COMPLETED')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
              <Box width="100%" mt={{ xs: 2, md: 0 }}>
                <SearchBar
                  onSearch={setSearchInput}
                  value={searchInput}
                  placeholder="Search..."
                  backgroundColor="white"
                  fullWidth
                />
              </Box>

              {/* Entity cards or loader */}
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  justifyContent: 'flex-start',
                  mx: '11px',
                }}
              >
                {loading ? (
                  <Box mx="auto">
                    <Loader
                      showBackdrop={false}
                      loadingText={t('COMMON.LOADING')}
                    />
                  </Box>
                ) : filteredEntityData.length === 0 ? (
                  entity && (
                    <Typography mx="auto">
                      {t('OBSERVATION.NO_DATA_FOUND', { entity })}
                    </Typography>
                  )
                ) : (
                  entityContent
                )}
              </Box>

              {/* Pagination */}
              {/* {(entity === ObservationEntityType.CENTER
                ? totalCountForCenter
                : totalCount) > 6 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    mt: 3,
                    gap: 2,
                  }}
                >
                  <Pagination
                    color="primary"
                    count={Math.ceil(
                      (entity === ObservationEntityType.CENTER
                        ? totalCountForCenter
                        : totalCount) / pageLimit
                    )}
                    page={currentPage + 1}
                    onChange={handlePaginationChange}
                    siblingCount={0}
                    boundaryCount={1}
                  />
                </Box>
              )} */}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default ObservationDetails;

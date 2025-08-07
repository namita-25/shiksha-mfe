import Header from '../../components/Header';
import BackHeader from '../../components/youthNet/BackHeader';
import {
  Box,
  Button,
  Divider,
  Grid,
  Radio,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import SearchBar from '../../components/Searchbar';
import SortBy from '../../components/youthNet/SortBy';
import YouthAndVolunteers from '../../components/youthNet/YouthAndVolunteers';
import {
  DROPDOWN_NAME,
  users,
  VILLAGE_OPTIONS,
  villageList,
  youthList,
  mentorList,
  YOUTHNET_USER_ROLE,
  reAssignVillages,
  SURVEY_DATA,
} from '../../components/youthNet/tempConfigs';
import { UserList } from '../../components/youthNet/UserCard';
import DownloadIcon from '@mui/icons-material/Download';
import withRole from '../../components/withRole';
import { BOTTOM_DRAWER_CONSTANTS, TENANT_DATA } from '../../utils/app.config';
import Dropdown from '../../components/youthNet/DropDown';
import { useRouter } from 'next/router';
import BottomDrawer from '../../components/youthNet/BottomDrawer';
import Loader from '../../components/Loader';
import {
  fetchBlockData,
  fetchDistrictData,
  getStateBlockDistrictList,
} from '../../services/youthNet/Dashboard/VillageServices';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import SimpleModal from '../../components/SimpleModal';
import Surveys from '../../components/youthNet/Surveys';
import { useDirection } from '../../hooks/useDirection';
import GenericForm from '../../components/youthNet/GenericForm';
import ExamplePage from '../../components/youthNet/BlockItem';
import VillageSelector from '../../components/youthNet/VillageSelector';
import {
  filterData,
  getAge,
  getLoggedInUserRole,
  getVillageUserCounts,
} from '../../utils/Helper';
import { fetchUserList } from '../../services/youthNet/Dashboard/UserServices';
import {
  cohortHierarchy,
  Role,
  SortOrder,
  Status,
  VolunteerField,
} from '../../utils/app.constant';
import { editEditUser } from '../../services/ProfileService';
import { showToastMessage } from '@/components/Toastify';
import MentorAssignment from '../../components/youthNet/MentorForm/MentorAssignment';
import useSubmittedButtonStore from '../../store/useSubmittedButtonStore';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import DeleteIcon from '@mui/icons-material/Delete';

const Index = () => {
  const { isRTL } = useDirection();
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();
  const { villageId, tab, blockId } = router.query;
  // const blockId: blockResult?.selectedValues[0]?.id
  const [value, setValue] = useState<number>(
    tab
      ? Number(tab)
      : YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()
      ? 1
      : 2
  );
  const [searchInput, setSearchInput] = useState('');
  const [toggledUser, setToggledUser] = useState('');
  const [selectedToggledUserId, setselectedToggledUserId] = useState('');
  const [formData, setFormData] = useState<any>();
  const [showAssignmentScreen, setShowAssignmentScreen] =
    useState<boolean>(false);
  const submittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.submittedButtonStatus
  );
  const [openMentorDrawer, setOpenMentorDrawer] = useState(false);
  const [toggledMentor, setToggledMentor] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openReassignDistrict, setOpenReassignDistrict] = useState(false);
  const [openReassignVillage, setOpenReassignVillage] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [count, setCount] = useState(0);
  const [villageCount, setVillageCount] = useState(0);
  const [mentorCount, setMentorCount] = useState(0);
  const [villageList, setVillageList] = useState<any>([]);
  const [mentorList, setMentorList] = useState<any>([]);
  const [villageListWithUsers, setVillageListWithUsers] = useState<any>([]);
  const [youthList, setYouthList] = useState<any>([]);
  const [filteredmentorList, setFilteredmentorList] = useState<any>([]);
  const [filteredvillageListWithUsers, setFilteredVillageListWithUsers] =
    useState<any>([]);
  const [filteredyouthList, setFilteredYouthList] = useState<any>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [districtData, setDistrictData] = useState<any>(null);
  const [blockData, setBlockData] = useState<any>(null);

  const [selectedValue, setSelectedValue] = useState<any>();
  const [selectedBlockValue, setSelectedBlockValue] = useState<any>(
    blockId ? blockId : ''
  );
  const [selectedVillageValue, setSelectedVillageValue] = useState<any>(
    villageId ? villageId : ''
  );
  const [selectedDistrictValue, setSelectedDistrictValue] = useState<any>('');
  const [isVolunteerFieldId, setIsVolunteerFieldId] = useState<any>('');

  const [loading, setLoading] = useState<boolean>(false);

  const [appliedFilters, setAppliedFilters] = useState({
    centerType: '',
    sortOrder: '',
  });

  useEffect(() => {

    const getData = async () => {
      try{
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
      setSelectedDistrictValue(transformedData?.[0]?.id);
      const controllingfieldfk = [transformedData?.[0]?.id?.toString()];
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
      setSelectedBlockValue(blockId ? blockId : transformedBlockData[0]?.id);
    } catch (error) {
      console.error('Error fetching district and block data:', error);
     // setDistrictData([]);
      setBlockData([]);}
    };
    getData();
  }, [blockId, villageId]);
  useEffect(() => {
    try {
      const getSortedData = (data: any, sortOrderType: any) => {
        setLoading(true);

        switch (sortOrderType) {
          case SortOrder.ASC:
            return [...data].sort((a, b) => a.name.localeCompare(b.name));
          case SortOrder.DESC:
            return [...data].sort((a, b) => b.name.localeCompare(a.name));
          case SortOrder.NEW_REGISTRATION_LOW_TO_HIGH:
            return [...data].sort(
                            (a, b) => a.newRegistrations - b.newRegistrations

            );
          case SortOrder.NEW_REGISTRATION_HIGH_TO_LOW:
            return [...data].sort(
              (a, b) => b.newRegistrations - a.newRegistrations
            );
          case SortOrder.TOTAL_COUNT_LOW_TO_HIGH:
            return [...data].sort((a, b) => a.totalCount - b.totalCount);
          case SortOrder.TOTAL_COUNT_HIGH_TO_LOW:
            return [...data].sort((a, b) => b.totalCount - a.totalCount);
          case SortOrder.AGE_LOW_TO_HIGH:
            return [...data].sort((a, b) => a.age - b.age);
          case SortOrder.AGE_HIGH_TO_LOW:
            return [...data].sort((a, b) => b.age - a.age);
          case SortOrder.OLD_JOINER_FIRST:
            return [...data].sort(
              (a, b) =>
                new Date(a.joinOn).getTime() - new Date(b.joinOn).getTime()
            );
          case SortOrder.NEW_JOINER_FIRST:
            return [...data].sort(
              (a, b) =>
                new Date(b.joinOn).getTime() - new Date(a.joinOn).getTime()
            );
          default:
            return data;
        }
      };

      let filteredData = [];
      if (value === 1) {
        filteredData = filterData(mentorList, searchInput);
        const data = getSortedData(filteredData, appliedFilters?.sortOrder);
        setFilteredmentorList(
          getSortedData(filteredData, appliedFilters?.sortOrder)
        );
        setMentorCount(data.length);
      } else if (value === 2) {
        filteredData = filterData(villageListWithUsers, searchInput);
        const data = getSortedData(filteredData, appliedFilters?.sortOrder);
        setFilteredVillageListWithUsers(
          getSortedData(filteredData, appliedFilters?.sortOrder)
        );
        setVillageCount(data.length);
      } else if (value === 3) {
        filteredData = filterData(youthList, searchInput);
        setFilteredYouthList(
          getSortedData(filteredData, appliedFilters?.sortOrder)
        );
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, [searchInput, appliedFilters, value]);

  useEffect(() => {
    const getYouthData = async () => {
      try {
        setLoading(true);
        const filters = {
          village: [selectedVillageValue],
          role: Role.LEARNER,
          status: [Status.ACTIVE],
        };

        const result = await fetchUserList({ filters });
        if (result.getUserDetails) {
          const transformedYouthData = result?.getUserDetails.map(
            (user: any) => {
              let name = user.firstName || '';
              const villageField = user?.customFields?.find(
                (field: any) => field?.label === cohortHierarchy.BLOCK
              );
              const blockField = user?.customFields?.find(
                (field: any) => field?.label === cohortHierarchy.BLOCK
              );
              const isVolunteer = user?.customFields?.find(
                (field: any) => field.label === VolunteerField.IS_VOLUNTEER
              );
              setIsVolunteerFieldId(isVolunteer?.fieldId);
              const blockValues = blockField?.selectedValues.map(
                (block: any) => block.value
              );

              if (user.lastName) {
                name += ` ${user.lastName}`;
              }
              let formattedDate;
              let isToday = false;
              if (user.createdAt) {
                const date = new Date(user.createdAt);
                const today = new Date();
                isToday =
                  date.getUTCFullYear() === today.getUTCFullYear() &&
                  date.getUTCMonth() === today.getUTCMonth() &&
                  date.getUTCDate() === today.getUTCDate();
                const options: Intl.DateTimeFormatOptions = {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                };

                formattedDate = date.toLocaleDateString('en-GB', options);
              }
              return {
                Id: user.userId,
                name: name.trim(),
                firstName: user?.firstName,
                dob: user?.dob,
                lastName: user?.lastName,
                joinOn: formattedDate,
                isNew: isToday,
                age: getAge(user?.dob),
                showMore: true,
                isVolunteer:
                  isVolunteer?.selectedValues[0] || VolunteerField?.NO,
              };
            }
          );
          const ascending = [...transformedYouthData].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setYouthList(ascending);
          setFilteredYouthList(ascending);
        } else {
          setYouthList([]);
          setFilteredYouthList([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (value === 3 && selectedVillageValue !== '') getYouthData();
  }, [value, selectedVillageValue]);
  useEffect(() => {
    const getMentorData = async () => {
      try {
        if (selectedDistrictValue !== '' && value === 1) {
          setLoading(true);
          const filters = {
            district: [selectedDistrictValue],
            role: Role.INSTRUCTOR,
            status: [Status.ACTIVE],
          };
          const result = await fetchUserList({ filters });
          const transformedMentorData = result?.getUserDetails.map(
            (user: any) => {
              let name = user.firstName || '';
              const villageField = user?.customFields?.find(
                (field: any) => field.label === cohortHierarchy.VILLAGE
              );
              const blockField = user?.customFields?.find(
                (field: any) => field.label === cohortHierarchy.BLOCK
              );
              const blockValues = blockField?.selectedValues.map(
                (block: any) => {
                  block.value;
                }
              );

              if (user.lastName) {
                name += ` ${user.lastName}`;
              }
              return {
                Id: user.userId,
                name: name.trim(),
                //  dob:user?.dob ,
                firstName: user?.firstName,
                villageCount: villageField?.selectedValues.length,
                lastName: user?.lastName,
                blockNames: blockValues,
              };
            }
          );
          // const filteredMentoList= filterData( transformedMentorData , searchInput)
          const ascending = [...transformedMentorData].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setMentorList(ascending);

          setFilteredmentorList(ascending);
          setMentorCount(transformedMentorData.length);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    if (value === 1) getMentorData();
  }, [selectedDistrictValue, value, submittedButtonStatus]);
  const handleLocationClick = (Id: any, name: any) => {
    console.log(selectedBlockValue);

    router.push({
      pathname: `/villageDetails/${name}`,
      query: { id: Id, blockId: selectedBlockValue, tab: value },
    });
  };

  useEffect(() => {
    const getVillageYouthData = async () => {
      try {
        setLoading(true);
        let userDataString = localStorage.getItem('userData');
        let userData: any = userDataString ? JSON.parse(userDataString) : null;
        let blockIds: any;
        if (YOUTHNET_USER_ROLE.INSTRUCTOR === getLoggedInUserRole()) {
          const blockResult = userData?.customFields?.find(
            (item: any) => item.label === 'BLOCK'
          );
          blockIds =
            blockResult?.selectedValues?.map((item: any) => item.id) || [];
        } else if (selectedBlockValue !== '') {
          blockIds = [selectedBlockValue];
        }
        const filters = {
          block: blockIds,
          role: Role.LEARNER,
          status: [Status.ACTIVE],
        };

        const result = await fetchUserList({ filters });
        let villagewithUser;
        villagewithUser = getVillageUserCounts(result, villageList);
        const ascending = [...villagewithUser].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setVillageListWithUsers([...ascending]);

        setFilteredVillageListWithUsers([...ascending]);
      } catch (e) {
        setVillageListWithUsers([]);
        setFilteredVillageListWithUsers([]);
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    if (villageList?.length !== 0) getVillageYouthData();
  }, [villageList, selectedBlockValue]);
  //   useEffect(() => {
  //     setSelectedVillageValue(villageId);
  //     setSelectedBlockValue(blockId)

  //   }

  // , [blockId, villageId]);
  useEffect(() => {
    const getVillageList = async () => {
      try {
        if (YOUTHNET_USER_ROLE.INSTRUCTOR === getLoggedInUserRole()) {
          let villageDataString = localStorage.getItem('villageData');
          let villageData: any = villageDataString
            ? JSON.parse(villageDataString)
            : null;
          setVillageList(villageData);
          if (selectedBlockValue === blockId) {
            setSelectedVillageValue(villageId);
          } else {
            if (YOUTHNET_USER_ROLE.INSTRUCTOR === getLoggedInUserRole())
              setSelectedVillageValue(villageId);
            else setSelectedVillageValue(villageData[0]?.Id);
          }

          setVillageCount(villageData.length);
        } else if (selectedBlockValue !== '') {
          const controllingfieldfk = [selectedBlockValue?.toString()];
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
          setVillageCount(transformedVillageData.length);

          setVillageList(transformedVillageData);
          if (selectedBlockValue === blockId) {
            setSelectedVillageValue(villageId);
          } else {
            if (YOUTHNET_USER_ROLE.INSTRUCTOR === getLoggedInUserRole())
              setSelectedVillageValue(villageId);
            else setSelectedVillageValue(transformedVillageData[0]?.Id);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    getVillageList();
  }, [selectedBlockValue, blockId, villageId]);
  useEffect(() => {
    setValue(
      tab
        ? Number(tab)
        : YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole()
        ? 1
        : 2
    );
  }, []);
  const FormSubmitFunction = async (formData: any, payload: any) => {
    setFormData(formData);
    setShowAssignmentScreen(true);
  };
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setSearchInput('');
    const centerType = '';
    const sortOrder = '';
    setAppliedFilters({ centerType, sortOrder });
  };

  const handleUserClick = (userId: any) => {
    router.push({
      pathname: `/user-profile/${userId}`,
      query: {
        tab: value,
        blockId: selectedBlockValue,
        villageId: selectedVillageValue,
      },
    });
  };

  const handleToggledUserClick = (name: any, Id?: any) => {
    setToggledUser(name);
    setselectedToggledUserId(Id);
    setOpenDrawer((prev) => !prev);
  };
  const handlemarkAsVolunteer = async () => {
    try {
      if (selectedToggledUserId !== '') {
        const userId = selectedToggledUserId;
        const userDetails = {
          userData: {},
          customFields: [
            {
              fieldId:
                isVolunteerFieldId || '59716ca7-37af-4527-a1ad-ce0f1dabeb00',
              value: 'yes',
            },
          ],
        };

        const response = await editEditUser(userId, userDetails);
        console.log(filteredyouthList);

        const updateIsVolunteer = (
          array: any[],
          targetId: any,
          newValue: any
        ) => {
          return array.map((item) =>
            item.Id === targetId ? { ...item, isVolunteer: newValue } : item
          );
        };

        const updatedYouthList = updateIsVolunteer(
          youthList,
          selectedToggledUserId,
          VolunteerField.YES
        );
        const updatedFilteredList = updateIsVolunteer(
          filteredyouthList,
          selectedToggledUserId,
          VolunteerField.YES
        );

        setYouthList(updatedYouthList);
        setFilteredYouthList(updatedFilteredList);
        showToastMessage(
          t('YOUTHNET_DASHBOARD.MARK_AS_VOLUNTEER_SUCCESSFULLY'),
          'success'
        );
      }
    } catch (e) {
      showToastMessage(
        t('YOUTHNET_DASHBOARD.MARK_AS_VOLUNTEER_FAILED'),
        'error'
      );

      console.log(e);
    }
  };

  const handleToggledMentorClick = (name: any) => {
    console.log('Toggled user:', name);
    setToggledMentor(name);
    setOpenMentorDrawer((prev) => !prev);
  };
  const handleToggleClose = () => {
    setOpenDrawer(false);
    setOpenMentorDrawer(false);
    setselectedToggledUserId('');
  };

  const onClose = () => {
    setOpenDelete(false);
    setOpenReassignDistrict(false);
    setOpenReassignVillage(false);
    setAddNew(false);
    setCount(0);
    setShowAssignmentScreen(false);
    setFormData({});
  };

  const handleButtonClick = async (actionType: string) => {
    console.log(actionType);

    switch (actionType) {
      case BOTTOM_DRAWER_CONSTANTS.MARK_VOLUNTEER: {
        setOpenDrawer(false);
        await handlemarkAsVolunteer();
        break;
      }

      case BOTTOM_DRAWER_CONSTANTS.ADD_REASSIGN:
        setOpenMentorDrawer(false);
        setOpenReassignVillage(true);
        break;

      case BOTTOM_DRAWER_CONSTANTS.REQUEST_REASSIGN:
        setOpenMentorDrawer(false);
        setOpenReassignDistrict(true);
        break;

      case BOTTOM_DRAWER_CONSTANTS.DELETE:
        setOpenMentorDrawer(false);
        setOpenDelete(true);
        break;

      default:
        console.warn(BOTTOM_DRAWER_CONSTANTS.UNKNOWN_ACTION, actionType);
    }
  };

  const buttons = [
    {
      label: t('YOUTHNET_USERS_AND_VILLAGES.MARK_AS_VOLUNTEER'),
      icon: <SwapHorizIcon />,
      onClick: () => handleButtonClick(BOTTOM_DRAWER_CONSTANTS.MARK_VOLUNTEER),
    },
  ];

  const mentorActions = [
    {
      label: t('YOUTHNET_USERS_AND_VILLAGES.ADD_OR_REASSIGN_VILLAGES'),
      action: BOTTOM_DRAWER_CONSTANTS.ADD_REASSIGN,
      icon: <HolidayVillageIcon />,
    },
    {
      label: t('YOUTHNET_USERS_AND_VILLAGES.REQUEST_TO_REASSIGN_DISTRICT'),
      action: BOTTOM_DRAWER_CONSTANTS.REQUEST_REASSIGN,
      icon: <PersonPinIcon />,
    },
    {
      label: t('YOUTHNET_USERS_AND_VILLAGES.DELETE_USER_PERMANENTLY'),
      action: BOTTOM_DRAWER_CONSTANTS.DELETE,
      icon: <DeleteIcon />,
    },
  ];

  const Mentorbuttons = mentorActions.map(({ label, action, icon }) => ({
    label,
    icon,
    onClick: () => handleButtonClick(action),
  }));

  const reasons = [
    { value: 'Incorrect Data Entry', label: t('COMMON.INCORRECT_DATA_ENTRY') },
    { value: 'Duplicated User', label: t('COMMON.DUPLICATED_USER') },
    { value: 'Resignation', label: t('COMMON.RESIGNATION') },
  ];

  const handleRadioChange = (value: string) => {
    // setSelectedValue(value);
  };

  const formFields = [
    { type: 'text', label: 'Full Name' },
    { type: 'number', label: 'Contact Number' },
    {
      type: 'radio',
      label: 'Gender',
      options: [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
      ],
    },
    { type: 'number', label: 'Age' },
    { type: 'email', label: "Mentor's Email ID" },
  ];

  const handleOpenNew = () => {
    setAddNew(true);
    //router.push(`/add-mentor`);
  };

  const handleNext = () => {
    // setCount(count + 1)
    setCount((prev) => prev + 1);
  };

  return (
    <Box minHeight="100vh">
      <Box>
        <Header />
      </Box>
      <Box ml={2}>
        <BackHeader headingOne={t('DASHBOARD.VILLAGES_AND_YOUTH')} />
      </Box>
      <Box sx={{ width: '100%' }}>
        {value && (
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
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
            {YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() && (
              <Tab value={1} label={t('YOUTHNET_USERS_AND_VILLAGES.MENTORS')} />
            )}

            <Tab value={2} label={t('DASHBOARD.VILLAGES')} />
            <Tab value={3} label={t('DASHBOARD.YOUTH_VOLUNTEERS')} />
          </Tabs>
        )}
      </Box>

      <Box>
        {value === 1 && YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() && (
          <>
            <Box
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              sx={{
                p: '20px',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  // mr: '20px',
                }}
              >
                {districtData ? (
                  <Dropdown
                    name={districtData?.DISTRICT_NAME}
                    values={districtData}
                    defaultValue={districtData[0]?.id}
                    onSelect={(value) => console.log('Selected:', value)}
                    label={t('YOUTHNET_USERS_AND_VILLAGES.DISTRICTS')}
                  />
                ) : (
                  <Loader showBackdrop={true} />
                )}
              </Box>
            </Box>

            <Box
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              sx={{
                pr: '20px',
              }}
            >
              <SearchBar
                onSearch={setSearchInput}
                value={searchInput}
                placeholder={t('YOUTHNET_USERS_AND_VILLAGES.SEARCH_MENTORS')}
                fullWidth={true}
              />
              <SortBy
                appliedFilters={appliedFilters}
                setAppliedFilters={setAppliedFilters}
                sortingContent={Role.INSTRUCTOR}
              />
            </Box>

            <Box
              mt={'18px'}
              px={'18px'}
              ml={'10px'}
              display={'flex'}
              justifyContent={'flex-end'}
            >
              <Button
                sx={{
                  border: `1px solid ${theme.palette.error.contrastText}`,
                  borderRadius: '100px',
                  height: '40px',
                  width: '8rem',
                  color: theme.palette.error.contrastText,
                  '& .MuiButton-endIcon': {
                    marginLeft: isRTL ? '0px !important' : '8px !important',
                    marginRight: isRTL ? '8px !important' : '-2px !important',
                  },
                }}
                className="text-1E"
                // onClick={handleOpenAddFaciModal}
                endIcon={<AddIcon />}
                onClick={handleOpenNew}
              >
                {t('COMMON.ADD_NEW')}
              </Button>
            </Box>

            <Box>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography
                  sx={{
                    fontSize: '16px',
                    color: 'black',
                    margin: '0 20px',
                  }}
                >
                  {mentorCount} {''}
                  {t('YOUTHNET_USERS_AND_VILLAGES.MENTORS')}
                </Typography>

                {/* <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    pr: '20px',
                    color: '#0D599E',
                    '&:hover': {
                      color: '#074d82',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '16px',
                    }}
                  >
                    {t('YOUTHNET_USERS_AND_VILLAGES.CSV')}
                  </Typography>
                  <DownloadIcon />
                </Box> */}
              </Box>
            </Box>
            <Box
              sx={{
                px: '20px',
              }}
            >
              {filteredmentorList.length !== 0 ? (
                <UserList
                  layout="list"
                  users={filteredmentorList}
                  onUserClick={handleUserClick}
                  onToggleUserClick={handleToggledMentorClick}
                />
              ) : filteredmentorList.length === 0 && !loading ? (
                <>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.warning['300'],
                      marginTop: '10px',
                      marginLeft: '15%',
                    }}
                  >
                    {t('YOUTHNET_USERS_AND_VILLAGES.NO_DATA_FOUND')}
                  </Typography>
                </>
              ) : (
                <Loader showBackdrop={true} />
              )}
            </Box>
            <BottomDrawer
              open={openMentorDrawer}
              onClose={handleToggleClose}
              title={toggledMentor}
              buttons={Mentorbuttons}
            />
            <SimpleModal
              open={openReassignVillage}
              onClose={onClose}
              showFooter={true}
              modalTitle={t(
                'YOUTHNET_USERS_AND_VILLAGES.ADD_OR_REASSIGN_VILLAGES'
              )}
              primaryText={t('YOUTHNET_USERS_AND_VILLAGES.SAVE_PROGRESS')}
              secondaryText={t('YOUTHNET_USERS_AND_VILLAGES.FINISH_ASSIGN')}

              //pass function handler as props
            >
              <Box>
                <Box mt={2}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: theme.palette.warning['300'],
                    }}
                  >
                    {t(
                      'YOUTHNET_USERS_AND_VILLAGES.ASSIGN_VILLAGES_FROM_BLOCK'
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.warning['300'],
                      marginTop: '10px',
                    }}
                  >
                    {t(
                      'YOUTHNET_USERS_AND_VILLAGES.ASSIGN_VILLAGES_FROM_BLOCK_INFO'
                    )}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2} p={2}>
                  {reAssignVillages?.map((survey, index) => (
                    <Surveys
                      key={index}
                      title={survey.title}
                      date={survey.date}
                    />
                  ))}
                </Box>
              </Box>
            </SimpleModal>
            <SimpleModal
              open={openReassignDistrict}
              onClose={onClose}
              showFooter={true}
              modalTitle={t(
                'YOUTHNET_USERS_AND_VILLAGES.REQUEST_USER_TO_DIFFERENT_MENTOR'
              )}
              primaryText={t('COMMON.SEND_REQUEST')}
              //pass function handler as props
            >
              <Box>
                <Box m={2}>
                  <Typography sx={{ color: theme.palette.warning['A200'] }}>
                    {t(
                      'YOUTHNET_USERS_AND_VILLAGES.SEND_REQUEST_TO_ADMIN_TEXT'
                    )}
                  </Typography>
                </Box>
                <Box m={2}>
                  <Dropdown
                    name={t('YOUTHNET_USERS_AND_VILLAGES.SELECT_STATE')}
                    // values={districtData?.DISTRICT_OPTIONS}
                    // defaultValue={t('YOUTHNET_USERS_AND_VILLAGES.SELECT_STATE')}
                    onSelect={(value) => console.log('Selected:', value)}
                  />
                </Box>
                <Box m={2}>
                  <Dropdown
                    name={t('YOUTHNET_USERS_AND_VILLAGES.SELECT_DISTRICT')}
                    // values={blockData?.BLOCK_OPTIONS}
                    // defaultValue={t('YOUTHNET_USERS_AND_VILLAGES.SELECT')}
                    onSelect={(value) => console.log('Selected:', value)}
                  />
                </Box>
              </Box>
            </SimpleModal>
            <SimpleModal
              open={openDelete}
              onClose={onClose}
              showFooter={true}
              modalTitle={t(
                'YOUTHNET_USERS_AND_VILLAGES.DELETE_USER_PERMANENTLY'
              )}
              primaryText={t('COMMON.DELETE_USER_WITH_REASON')}
            >
              <Box>
                <Box mt={2}>
                  <Typography sx={{ fontSize: '14px' }}>
                    {t('COMMON.REASON_FOR_DELETION')}
                  </Typography>
                </Box>
                <Box>
                  {reasons.map((option, index) => (
                    <>
                      <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                      >
                        <Typography
                          sx={{
                            color: theme.palette.warning['A200'],
                            fontSize: '16px',
                            fontWeight: 400,
                          }}
                          component="h2"
                        >
                          {option.label}
                        </Typography>

                        <Radio
                          sx={{ pb: '20px' }}
                          onChange={() => handleRadioChange(option.value)}
                          value={option.value}
                          checked={selectedValue === option.value}
                        />
                      </Box>
                      {reasons?.length - 1 !== index && <Divider />}
                    </>
                  ))}
                </Box>
              </Box>
            </SimpleModal>

            <SimpleModal
              open={addNew}
              onClose={onClose}
              showFooter={true}
              modalTitle={'New Mentor'}
              //  handleNext={FormSubmitFunction}
              primaryText={!showAssignmentScreen ? 'Next' : undefined}
              secondaryText={count === 1 ? 'Save Progress' : ''}
              id="dynamic-form-id"
            >
              {/* {count === 0 && (
                <Box>
                  <Box mt={2}>
                    <GenericForm fields={formFields} />
                  </Box>
                </Box>
              )}
              {count === 1 && (
                <Box>
                  <Box mt={2}>
                    <ExamplePage handleNext={handleNext} />
                  </Box>
                </Box>
              )}
              {count === 2 && (
                <Box>
                  <Box mt={2}>
                    <VillageSelector />
                  </Box>
                </Box>
              )} */}
              <MentorAssignment
                FormSubmitFunction={FormSubmitFunction}
                setShowAssignmentScreen={setShowAssignmentScreen}
                showAssignmentScreen={showAssignmentScreen}
                formData={formData}
                setFormData={setFormData}
                onClose={onClose}
              />
            </SimpleModal>
          </>
        )}
      </Box>

      <Box>
        {value === 2 && (
          <>
            {YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() && (
              <Box
                display={'flex'}
                flexDirection={'row'}
                sx={{
                  p: '20px',
                }}
              >
                <Box
                  sx={{
                    width: '50%',
                    mr: '20px',
                  }}
                >
                  {districtData ? (
                    <Dropdown
                      name={districtData?.DISTRICT_NAME}
                      values={districtData}
                      defaultValue={districtData?.[0]?.id}
                      onSelect={(value) => console.log('Selected:', value)}
                      label={t('YOUTHNET_USERS_AND_VILLAGES.DISTRICTS')}
                    />
                  ) : (
                    <Loader showBackdrop={true} />
                  )}
                </Box>
                <Box
                  sx={{
                    width: '50%',
                  }}
                >
                  {blockData ? (
                    <Dropdown
                      name={blockData?.BLOCK_NAME}
                      values={blockData}
                      defaultValue={selectedBlockValue}
                      onSelect={(value) =>
                        console.log('Selected:', setSelectedBlockValue(value))
                      }
                      label={t('YOUTHNET_USERS_AND_VILLAGES.BLOCKS')}
                    />
                  ) : (
                    <Loader showBackdrop={true} />
                  )}
                </Box>
              </Box>
            )}
            <Box
              display={'flex'}
              flexDirection={'row'}
              sx={{
                pr: '20px',
              }}
              alignItems={'center'}
            >
              <SearchBar
                onSearch={setSearchInput}
                value={searchInput}
                placeholder={t('DASHBOARD.SEARCH_VILLAGES')}
                fullWidth={true}
              />
              <SortBy
                appliedFilters={appliedFilters}
                setAppliedFilters={setAppliedFilters}
                sortingContent={cohortHierarchy.VILLAGE}
              />
            </Box>
            {/* <Box>
              <YouthAndVolunteers
                selectOptions={[
                  { label: 'As of today, 5th Sep', value: 'today' },
                  { label: 'As of yesterday, 4th Sep', value: 'yesterday' },
                ]}
              />
            </Box> */}
            <Box display={'flex'} justifyContent={'space-between'}>
              <Typography
                sx={{
                  fontSize: '16px',
                  color: 'black',
                  marginLeft: '2rem',
                  mt: '10px',
                }}
              >
                {villageCount} {t(`YOUTHNET_DASHBOARD.VILLAGES`)}
              </Typography>

              {/* <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  pr: '20px',
                  color: '#0D599E',
                  '&:hover': {
                    color: '#074d82',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '16px',
                  }}
                >
                  CSV
                </Typography>
                <DownloadIcon />
              </Box> */}
            </Box>
            <Box display={'flex'} mt={2} justifyContent={'space-between'}>
              <Typography
                sx={{
                  fontSize: '16px',
                  color: 'textSecondary',
                  marginLeft: '2rem',
                  cursor: 'pointer',
                  pr: '20px',
                }}
                className="one-line-text"
              >
                {t(`YOUTHNET_DASHBOARD.VILLAGES`)}
              </Typography>

              <Typography
                sx={{
                  fontSize: '16px',
                  color: 'textSecondary',
                  cursor: 'pointer',
                  pr: '20px',
                }}
              >
                {t(`YOUTHNET_DASHBOARD.TOTAL_COUNT_NEW_REGISTRATION`)}
              </Typography>
            </Box>
            <Box
              sx={{
                pr: '20px',
                mt: '15px',
              }}
            >
              {filteredvillageListWithUsers.length !== 0 ? (
                <UserList
                  layout="list"
                  users={filteredvillageListWithUsers}
                  onUserClick={handleLocationClick}
                />
              ) : filteredvillageListWithUsers.length === 0 && !loading ? (
                <>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.warning['300'],
                      marginTop: '15px',
                      marginLeft: '30%',
                    }}
                  >
                    {t('YOUTHNET_USERS_AND_VILLAGES.NO_DATA_FOUND')}
                  </Typography>
                </>
              ) : (
                <Loader showBackdrop={true} />
              )}
            </Box>
          </>
        )}
      </Box>
      <Box>
        {value === 3 && (
          <>
            {YOUTHNET_USER_ROLE.LEAD === getLoggedInUserRole() && (
              <Box
                display={'flex'}
                flexDirection={'row'}
                sx={{
                  p: '20px 20px 0px 20px',
                }}
              >
                <Box
                  sx={{
                    width: '50%',
                    mr: '20px',
                  }}
                >
                  {districtData ? (
                    <Dropdown
                      name={districtData?.DISTRICT_NAME}
                      values={districtData}
                      defaultValue={districtData?.[0]?.id}
                      onSelect={(value) => console.log('Selected:', value)}
                      label={t('YOUTHNET_USERS_AND_VILLAGES.DISTRICTS')}
                    />
                  ) : (
                    <Loader showBackdrop={true} />
                  )}
                </Box>
                <Box
                  sx={{
                    width: '50%',
                  }}
                >
                  {blockData ? (
                    <Dropdown
                      name={blockData?.BLOCK_NAME}
                      values={blockData}
                      defaultValue={selectedBlockValue}
                      onSelect={(value) =>
                        console.log('Selected:', setSelectedBlockValue(value))
                      }
                      label={t('YOUTHNET_USERS_AND_VILLAGES.BLOCKS')}
                    />
                  ) : (
                    <Loader showBackdrop={true} />
                  )}
                </Box>
              </Box>
            )}
            <Box
              sx={{
                px: '20px',
                mt: '15px',
              }}
            >
              <Dropdown
                name={DROPDOWN_NAME}
                values={villageList.map((item: any) =>
                  Array.isArray(item)
                    ? item.map(({ Id, name }) => ({ id: Id, name }))
                    : { id: item.Id, name: item.name }
                )}
                defaultValue={selectedVillageValue}
                onSelect={(value) => {
                  console.log('Selected:', value);
                  setSelectedVillageValue(value);
                }}
                label={t('YOUTHNET_USERS_AND_VILLAGES.VILLAGES')}
              />
            </Box>
            <Box
              display={'flex'}
              flexDirection={'row'}
              sx={{
                pr: '20px',
              }}
              alignItems={'center'}
            >
              <SearchBar
                onSearch={setSearchInput}
                value={searchInput}
                placeholder={t('DASHBOARD.SEARCH_YOUTH')}
                fullWidth={true}
              />
              <SortBy
                appliedFilters={appliedFilters}
                setAppliedFilters={setAppliedFilters}
                sortingContent={Role.LEARNER}
              />{' '}
            </Box>
            <Box
              sx={{
                px: '20px',
                mt: '15px',
              }}
            >
              {filteredyouthList.length !== 0 ? (
                <UserList
                  layout="list"
                  users={filteredyouthList}
                  onUserClick={handleUserClick}
                  onToggleUserClick={handleToggledUserClick}
                  // showMore={true}
                />
              ) : filteredyouthList.length === 0 && !loading ? (
                <>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.warning['300'],
                      marginTop: '10%',
                      marginLeft: '25%',
                    }}
                  >
                    {t('YOUTHNET_USERS_AND_VILLAGES.NO_DATA_FOUND')}
                  </Typography>
                </>
              ) : (
                <Loader showBackdrop={true} />
              )}
            </Box>
            <BottomDrawer
              open={openDrawer}
              onClose={handleToggleClose}
              title={toggledUser}
              buttons={buttons}
            />
          </>
        )}
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

export default withRole(TENANT_DATA.YOUTHNET)(Index);

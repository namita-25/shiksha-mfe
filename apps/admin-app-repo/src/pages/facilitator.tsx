// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import Loader from '@/components/Loader';
import { useTranslation } from 'react-i18next';
import {
  facilitatorSearchSchema,
  facilitatorSearchUISchema,
} from '../constant/Forms/facilitatorSearch';
import { Role, RoleId, Status } from '@/utils/app.constant';
import { userList } from '@/services/UserList';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { debounce, forEach } from 'lodash';
import { Numbers } from '@mui/icons-material';
import PaginatedTable from '@/components/PaginatedTable/PaginatedTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import AddEditUser from '@/components/EntityForms/AddEditUser/AddEditUser';
import SimpleModal from '@/components/SimpleModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { updateCohortMemberStatus } from '@/services/CohortService/cohortService';
import editIcon from '../../public/images/editIcon.svg';
import deleteIcon from '../../public/images/deleteIcon.svg';
import Image from 'next/image';
import {
  extractMatchingKeys,
  fetchForm,
  searchListData,
} from '@/components/DynamicForm/DynamicFormCallback';
import { FormContext } from '@/components/DynamicForm/DynamicFormConstant';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import DeleteDetails from '@/components/DeleteDetails';
import { deleteUser } from '@/services/UserService';
import {
  transformLabel,
  fetchUserData,
  calculateAgeFromDate,
} from '@/utils/Helper';
import { getCohortList } from '@/services/GetCohortList';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import apartment from '../../public/images/apartment.svg';
import CenteredLoader from '@/components/CenteredLoader/CenteredLoader';
import FacilitatorForm from '@/components/DynamicForm/FacilitatorForm/FacilitatorForm';
import CenterLabel from '@/components/Centerlabel';

const Facilitator = () => {
  const theme = useTheme<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState(facilitatorSearchSchema);
  const [uiSchema, setUiSchema] = useState(facilitatorSearchUISchema);
  const [addSchema, setAddSchema] = useState(null);
  const [addUiSchema, setAddUiSchema] = useState(null);
  const [prefilledAddFormData, setPrefilledAddFormData] = useState({});
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const [prefilledFormData, setPrefilledFormData] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isReassign, setIsReassign] = useState(false);
  const [editableUserId, setEditableUserId] = useState('');
  const [roleId, setRoleID] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [memberShipID, setMemberShipID] = useState('');
  const [blockFieldId, setBlockFieldId] = useState('');
  const [districtFieldId, setDistrictFieldId] = useState('');
  const [villageFieldId, setVillageFieldId] = useState('');
  // const [centerFieldId, setCenterFieldId] = useState('');

  const [userID, setUserId] = useState('');
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    village: '',
  });

  const { t, i18n } = useTranslation();
  const initialFormData = localStorage.getItem('stateId')
    ? { state: [localStorage.getItem('stateId')], designation: 'facilitator' }
    : { designation: 'facilitator' };

  const searchStoreKey = 'facilitator';
  const initialFormDataSearch =
    localStorage.getItem(searchStoreKey) &&
    localStorage.getItem(searchStoreKey) != '{}'
      ? JSON.parse(localStorage.getItem(searchStoreKey))
      : localStorage.getItem('stateId')
      ? { state: [localStorage.getItem('stateId')] }
      : {};

  useEffect(() => {
    if (response?.result?.totalCount !== 0) {
      searchData(prefilledFormData, 0);
    }
  }, [pageLimit]);
  useEffect(() => {
    // Fetch form schema from API and set it in state.
    const fetchData = async () => {
      const responseForm = await fetchForm([
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.facilitator.context}&contextType=${FormContext.facilitator.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.facilitator.context}&contextType=${FormContext.facilitator.contextType}`,
          header: {
            tenantid: localStorage.getItem('tenantId'),
          },
        },
      ]);
      console.log('responseForm', responseForm);

      //unit name is missing from required so handled from frotnend
      let alterSchema = responseForm?.schema;
      let alterUISchema = responseForm?.uiSchema;
      let requiredArray = alterSchema?.required;
      const mustRequired = ['email'];
      // Merge only missing items from required2 into required1
      mustRequired.forEach((item) => {
        if (!requiredArray.includes(item)) {
          requiredArray.push(item);
        }
      });
      alterSchema.required = requiredArray;
      //add max selection custom
      if (alterSchema?.properties?.village) {
        alterSchema.properties.village.maxSelection = 1000;
      }
      if (alterUISchema?.designation) {
        alterUISchema = {
          ...alterUISchema,
          designation: {
            ...alterUISchema.designation,
            'ui:disabled': true,
          },
        };
      }

      console.log('########### alterUISchema', alterUISchema);

      const districtFieldId =
        responseForm?.schema?.properties?.district?.fieldId;
      const blockFieldId = responseForm?.schema?.properties?.block.fieldId;
      const villageFieldId = responseForm?.schema?.properties?.village?.fieldId;
      // const centerFieldId = responseForm?.schema?.properties?.center?.fieldId;

      setBlockFieldId(blockFieldId);
      setDistrictFieldId(districtFieldId);
      setVillageFieldId(villageFieldId);
      // setCenterFieldId(centerFieldId)
      setAddSchema(alterSchema);
      setAddUiSchema(alterUISchema);
    };
    fetchData();
    setRoleID(RoleId.TEACHER);
    setTenantId(localStorage.getItem('tenantId'));
  }, []);

  const updatedUiSchema = {
    ...uiSchema,
    'ui:submitButtonOptions': {
      norender: true, // Hide submit button if isHide is true
    },
  };

  const SubmitaFunction = async (formData: any) => {
    // console.log("###### debug issue formData", formData)
    if (Object.keys(formData).length > 0) {
      setPrefilledFormData(formData);
      //set prefilled search data on refresh
      localStorage.setItem(searchStoreKey, JSON.stringify(formData));
      await searchData(formData, 0);
    }
  };

  const searchData = async (formData, newPage) => {
    if (formData) {
      formData = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, value]) => !Array.isArray(value) || value.length > 0
        )
      );

      const staticFilter = {
        role: 'Instructor',
        tenantId: localStorage.getItem('tenantId'),
      };
      if (localStorage.getItem('roleName') === Role.ADMIN) {
        staticFilter.state = [localStorage.getItem('stateId')];
      }
      const { sortBy } = formData;
      const staticSort = ['firstName', sortBy || 'asc'];
      await searchListData(
        formData,
        newPage,
        staticFilter,
        pageLimit,
        setPageOffset,
        setCurrentPage,
        setResponse,
        userList,
        staticSort
      );
    }
  };

  // Define table columns
  const columns = [
    {
      keys: ['firstName', 'middleName', 'lastName'],
      label: 'Facilitator Name',
      render: (row) =>
        `${transformLabel(row.firstName) || ''} ${
          transformLabel(row.middleName) || ''
        } ${transformLabel(row.lastName) || ''}`.trim(),
    },
    {
      keys: ['age'],
      label: 'Age',
      render: (row) => calculateAgeFromDate(row.dob) || '',
    },
    {
      keys: ['gender'],
      label: 'Gender',
      render: (row) => transformLabel(row.gender) || '',
    },
    {
      keys: ['mobile'],
      label: 'Mobile',
      render: (row) => transformLabel(row.mobile) || '',
    },
    {
      keys: ['STATE', 'DISTRICT', 'BLOCK'],
      label: 'State, District, Block',
      render: (row: any) => {
        const state =
          transformLabel(
            row.customFields.find(
              (field: { label: string }) => field.label === 'STATE'
            )?.selectedValues?.[0]?.value
          ) || '';
        const district =
          transformLabel(
            row.customFields.find(
              (field: { label: string }) => field.label === 'DISTRICT'
            )?.selectedValues?.[0]?.value
          ) || '';
        const block =
          transformLabel(
            row.customFields.find(
              (field: { label: string }) => field.label === 'BLOCK'
            )?.selectedValues?.[0]?.value
          ) || '';
        return `${state == '' ? '' : `${state}`}${
          district == '' ? '' : `, ${district}`
        }${block == '' ? '' : `, ${block}`}`;
      },
    },
    {
      key: 'village',
      label: 'Village',
      render: (row) =>
        transformLabel(
          row.customFields
            .find((field) => field.label === 'VILLAGE')
            ?.selectedValues.map((item) => item.value)
            .join(', ')
        ) || '-',
    },
    {
      key: 'center',
      label: 'Center',
      render: (row) => {
        let centerArray = row.customFields.find(
          (field) => field.label === 'CENTER'
        )?.selectedValues;
        return (
          <>
            {centerArray && (
              <>
                {centerArray.map((centerId) => (
                  <>
                    <CenterLabel parentId={centerId} />,{' '}
                  </>
                ))}
              </>
            )}
          </>
        );
      },
    },
    {
      key: 'mysubject',
      label: 'Main Subjects',
      render: (row) =>
        transformLabel(
          row.customFields
            .find((field) => field.label === 'MY_MAIN_SUBJECTS')
            ?.selectedValues.map((item) => item.value)
            .join(', ')
        ) || '-',
    },
    {
      key: 'subjectteach',
      label: 'Subjects Teach',
      render: (row) =>
        transformLabel(
          row.customFields
            .find((field) => field.label === 'SUBJECTS_I_TEACH')
            ?.selectedValues.map((item) => item.value)
            .join(', ')
        ) || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => transformLabel(row.status),
      getStyle: (row) => ({ color: row.status === 'active' ? 'green' : 'red' }),
    },
  ];

  const userDelete = async () => {
    try {
      let membershipIds = null;

      // Attempt to get the cohort list
      try {
        const userCohortResp = await getCohortList(userID);
        if (userCohortResp?.result?.length) {
          membershipIds = userCohortResp?.result?.map(
            (item) => item.cohortMembershipId
          );
        } else {
          console.warn('No cohort data found for the user.');
        }
      } catch (error) {
        console.error('Failed to fetch cohort list:', error);
      }

      // Attempt to update cohort member status only if we got a valid membershipId
      if (membershipIds && Array.isArray(membershipIds)) {
        for (const membershipId of membershipIds) {
          try {
            const updateResponse = await updateCohortMemberStatus({
              memberStatus: 'archived',
              statusReason: reason,
              membershipId,
            });

            if (updateResponse?.responseCode !== 200) {
              console.error(
                `Failed to archive user with membershipId ${membershipId}:`,
                updateResponse
              );
            } else {
              console.log(
                `User with membershipId ${membershipId} successfully archived.`
              );
            }
          } catch (error) {
            console.error(
              `Error archiving user with membershipId ${membershipId}:`,
              error
            );
          }
        }
      }

      // Always attempt to delete the user
      console.log('Proceeding to self-delete...');
      const resp = await deleteUser(userID, {
        userData: { reason: reason, status: 'archived' },
      });

      if (resp?.responseCode === 200) {
        // setResponse((prev) => ({
        //   ...prev,
        //   result: {
        //     ...prev?.result,
        //     getUserDetails: prev?.result?.getUserDetails?.filter(
        //       (item) => item?.userId !== userID
        //     ),
        //   },
        // }));
        searchData(prefilledFormData, currentPage);
        console.log('Team leader successfully archived.');
      } else {
        console.error('Failed to archive team leader:', resp);
      }

      return resp;
    } catch (error) {
      console.error('Error updating team leader:', error);
    }
  };

  // Define actions
  const actions = [
    {
      icon: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgb(227, 234, 240)',
            padding: '10px',
          }}
        >
          <Image src={editIcon} alt="" />
        </Box>
      ),
      callback: (row) => {
        // console.log('row:', row);
        // console.log('AddSchema', addSchema);
        // console.log('AddUISchema', addUiSchema);

        let tempFormData = extractMatchingKeys(row, addSchema);
        // console.log('tempFormData', tempFormData);
        setPrefilledAddFormData(tempFormData);
        setIsEdit(true);
        setIsReassign(false);
        setButtonShow(true);
        setEditableUserId(row?.userId);
        handleOpenModal();
      },
      show: (row) => row.status !== 'archived',
    },
    {
      icon: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgb(227, 234, 240)',
            padding: '10px',
          }}
        >
          {' '}
          <Image src={deleteIcon} alt="" />{' '}
        </Box>
      ),
      callback: async (row) => {
        const findVillage = row?.customFields.find((item) => {
          if (item.label === 'VILLAGE' || item.label === 'BLOCK') {
            return item;
          }
        });

        // setVillage(findVillage?.selectedValues[0]?.value);
        // console.log('row:', row?.customFields[2].selectedValues[0].value);
        // setEditableUserId(row?.userId);
        // const memberStatus = Status.ARCHIVED;
        // const statusReason = '';
        // const membershipId = row?.userId;

        // const response = await updateCohortMemberStatus({
        //   memberStatus,
        //   statusReason,
        //   membershipId,
        // });
        // setPrefilledFormData({});
        // searchData(prefilledFormData, currentPage);
        setOpen(true);
        setUserId(row?.userId);
        setReason('');
        setChecked(false);

        setUserData({
          firstName: row?.firstName || '',
          lastName: row?.lastName || '',
          village: findVillage?.selectedValues?.[0]?.value || '',
        });
      },
      show: (row) => row.status !== 'archived',
    },
    {
      icon: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgb(227, 234, 240)',
            padding: '10px',
          }}
        >
          <Image src={apartment} alt="" />
        </Box>
      ),
      callback: async (row) => {
        console.log('row:', row);
        // console.log('AddSchema', addSchema);
        // console.log('AddUISchema', addUiSchema);
        let batchList = await fetchUserData(row?.userId);
        console.log('######## batchList', batchList);
        let tempFormData = extractMatchingKeys(row, addSchema);
        tempFormData = {
          ...tempFormData,
          batch: batchList,
        };
        console.log(tempFormData, ' tempFormData');
        setPrefilledAddFormData(tempFormData);
        setIsEdit(false);
        setIsReassign(true);
        setButtonShow(true);
        setEditableUserId(row?.userId);
        handleOpenModal();
      },
      show: (row) => row.status !== 'archived',
    },
  ];

  // Pagination handlers
  const handlePageChange = (newPage) => {
    // console.log('Page changed to:', newPage);
    searchData(prefilledFormData, newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    // console.log('Rows per page changed to:', newRowsPerPage);
    setPageLimit(newRowsPerPage);
  };

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsReassign(false);
    setIsEdit(false);
  };

  //Add Edit Props
  const extraFieldsUpdate = {};
  const extraFields = {
    tenantCohortRoleMapping: [
      {
        tenantId: tenantId,
        roleId: roleId,
      },
    ],
    username: 'scpFacilitator',
    password: Math.floor(10000 + Math.random() * 90000),
  };
  const successUpdateMessage = 'FACILITATORS.FACILITATOR_UPDATED_SUCCESSFULLY';
  const telemetryUpdateKey = 'scp-facilitator-updated-successfully';
  const failureUpdateMessage = 'COMMON.NOT_ABLE_UPDATE_FACILITATOR';
  const successCreateMessage = 'FACILITATORS.FACILITATOR_CREATED_SUCCESSFULLY';
  const telemetryCreateKey = 'SCP-Facilitator-created-successfully';
  const failureCreateMessage = 'COMMON.NOT_ABLE_CREATE_FACILITATOR';
  const notificationKey = 'onFacilitatorCreated';
  const notificationMessage = 'FACILITATORS.USER_CREDENTIALS_WILL_BE_SEND_SOON';
  const notificationContext = 'USER';
  const blockReassignmentNotificationKey = 'FACILITATOR_BLOCK_UPDATE';
  const profileUpdateNotificationKey = 'FACILITATOR_PROFILE_UPDATE';
  const centerUpdateNotificationKey = 'FACILITATOR_CENTER_UPDATE';

  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reason, setReason] = useState('');

  // console.log(response?.result?.getUserDetails , "shreyas");
  // response;

  useEffect(() => {
    setPrefilledFormData(initialFormDataSearch);
  }, []);

  const [buttonShow, setButtonShowState] = useState(true);

  const setButtonShow = (status) => {
    console.log('########## changed', status);
    setButtonShowState(status);
  };
  return (
    <>
      <Box display={'flex'} flexDirection={'column'} gap={2}>
        {isLoading ? (
          <Loader showBackdrop={false} loadingText={t('COMMON.LOADING')} />
        ) : (
          schema &&
          uiSchema && (
            <DynamicForm
              schema={schema}
              uiSchema={updatedUiSchema}
              SubmitaFunction={SubmitaFunction}
              isCallSubmitInHandle={true}
              prefilledFormData={prefilledFormData}
            />
          )
        )}
        <Box mt={4} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            color="primary"
            sx={{
              textTransform: 'none',
              fontSize: '14px',
              color: theme.palette.primary['100'],
              width: '200px',
            }}
            onClick={() => {
              setPrefilledAddFormData(initialFormData);
              setIsEdit(false);
              setIsReassign(false);
              setEditableUserId('');
              handleOpenModal();
              setButtonShow(true);
            }}
          >
            {t('COMMON.ADD_NEW')}{' '}
          </Button>
        </Box>

        <SimpleModal
          open={openModal}
          onClose={handleCloseModal}
          showFooter={buttonShow}
          primaryText={isEdit ? t('Update') : t('Next')}
          id="dynamic-form-id"
          modalTitle={
            isEdit
              ? t('FACILITATORS.EDIT_FACILITATOR')
              : isReassign
              ? t('FACILITATORS.RE_ASSIGN_facilitator')
              : t('FACILITATORS.NEW_FACILITATOR')
          }
        >
          <FacilitatorForm
            t={t}
            SuccessCallback={() => {
              setPrefilledFormData(initialFormDataSearch);
              searchData(initialFormDataSearch, 0);
              setOpenModal(false);
            }}
            schema={addSchema}
            uiSchema={addUiSchema}
            editPrefilledFormData={prefilledAddFormData}
            isEdit={isEdit}
            isReassign={isReassign}
            // isExtraFields={true}
            editableUserId={editableUserId}
            UpdateSuccessCallback={() => {
              setPrefilledFormData(prefilledFormData);
              searchData(prefilledFormData, currentPage);
              setOpenModal(false);
            }}
            extraFields={extraFields}
            extraFieldsUpdate={extraFieldsUpdate}
            successUpdateMessage={successUpdateMessage}
            telemetryUpdateKey={telemetryUpdateKey}
            failureUpdateMessage={failureUpdateMessage}
            successCreateMessage={successCreateMessage}
            telemetryCreateKey={telemetryCreateKey}
            failureCreateMessage={failureCreateMessage}
            notificationKey={notificationKey}
            notificationMessage={notificationMessage}
            notificationContext={notificationContext}
            // blockFieldId={blockFieldId}
            // districtFieldId={districtFieldId}
            // villageFieldId={villageFieldId}
            // // centerFieldId={centerFieldId}
            type="facilitator"
            hideSubmit={true}
            setButtonShow={setButtonShow}
            // isSteeper={true}
            blockReassignmentNotificationKey={blockReassignmentNotificationKey}
            profileUpdateNotificationKey={profileUpdateNotificationKey}
            centerUpdateNotificationKey={centerUpdateNotificationKey}
          />
        </SimpleModal>

        {response != null ? (
          <>
            {response && response?.result?.getUserDetails ? (
              <Box sx={{ mt: 1 }}>
                <PaginatedTable
                  count={response?.result?.totalCount}
                  data={response?.result?.getUserDetails}
                  columns={columns}
                  actions={actions}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  defaultPage={currentPage}
                  defaultRowsPerPage={pageLimit}
                />
              </Box>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="20vh"
              >
                <Typography marginTop="10px" textAlign={'center'}>
                  {t('COMMON.NO_FACILITATOR_FOUND')}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <CenteredLoader />
        )}
      </Box>

      <ConfirmationPopup
        checked={checked}
        open={open}
        onClose={() => setOpen(false)}
        title={t('COMMON.DELETE_USER')}
        primary={t('COMMON.DELETE_USER_WITH_REASON')}
        secondary={t('COMMON.CANCEL')}
        reason={reason}
        onClickPrimary={userDelete}
      >
        <DeleteDetails
          firstName={userData.firstName}
          lastName={userData.lastName}
          village={userData.village}
          checked={checked}
          setChecked={setChecked}
          reason={reason}
          setReason={setReason}
        />
      </ConfirmationPopup>
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

export default Facilitator;

// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import Loader from '@/components/Loader';
import { useTranslation } from 'react-i18next';
import {
  MentorLeadSearchSchema,
  MentorLeadSearchUISchema,
} from '../constant/Forms/MentorLeadSearch';
import { Role, RoleId, Status } from '@/utils/app.constant';
import { userList } from '@/services/UserList';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { debounce } from 'lodash';
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
import { transformLabel } from '@/utils/Helper';
import { getCohortList } from '@/services/GetCohortList';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

const MentorLead = () => {
  console.log(
    '################ MentorLeadSearchSchema',
    MentorLeadSearchSchema
  );
  const theme = useTheme<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState(MentorLeadSearchSchema);
  const [uiSchema, setUiSchema] = useState(MentorLeadSearchUISchema);
  const [addSchema, setAddSchema] = useState(null);
  const [addUiSchema, setAddUiSchema] = useState(null);
  const [prefilledAddFormData, setPrefilledAddFormData] = useState({});
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const [prefilledFormData, setPrefilledFormData] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editableUserId, setEditableUserId] = useState('');
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [village, setVillage] = useState('');
  const [userID, setUserId] = useState('');
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    village: '',
  });
  const [reason, setReason] = useState('');
  const [memberShipID, setMemberShipID] = useState('');

  const { t, i18n } = useTranslation();

  const initialFormData = localStorage.getItem('stateId')
    ? { state: [localStorage.getItem('stateId')] }
    : {};

  const searchStoreKey = 'mentorLeader';
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
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.mentorLead.context}&contextType=${FormContext.mentorLead.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.mentorLead.context}&contextType=${FormContext.mentorLead.contextType}`,
          header: {
            tenantid: localStorage.getItem('tenantId'),
          },
        },
      ]);
      console.log('responseForm', responseForm);
      setAddSchema(responseForm?.schema);
      setAddUiSchema(responseForm?.uiSchema);
    };
    setPrefilledAddFormData(initialFormData);
    setPrefilledFormData(initialFormDataSearch);
    fetchData();
  }, []);

  const updatedUiSchema = {
    ...uiSchema,
    'ui:submitButtonOptions': {
      norender: true, // Hide submit button if isHide is true
    },
  };

  const SubmitaFunction = async (formData: any) => {
    setPrefilledFormData(formData);
    //set prefilled search data on refresh
    localStorage.setItem(searchStoreKey, JSON.stringify(formData));
    await searchData(formData, 0);
  };

  const searchData = async (formData, newPage) => {
    formData = Object.fromEntries(
      Object.entries(formData).filter(
        ([_, value]) => !Array.isArray(value) || value.length > 0
      )
    );
    const staticFilter = {
      role: 'Lead',
      status: 'active',
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
  };

  // Define table columns
  const columns = [
    {
      keys: ['firstName', 'middleName', 'lastName'],
      label: 'Mentor Lead Name',
      render: (row) =>
        `${transformLabel(row.firstName) || ''} ${
          transformLabel(row.middleName) || ''
        } ${transformLabel(row.lastName) || ''}`.trim(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => transformLabel(row.status),
      getStyle: (row) => ({ color: row.status === 'active' ? 'green' : 'red' }),
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
    // {
    //   key: 'STATE',
    //   label: 'State',
    //   render: (row) => {
    //     const state =
    //       row.customFields.find((field) => field.label === 'STATE')
    //         ?.selectedValues[0]?.value || '-';
    //     return `${state}`;
    //   },
    // },
    {
      keys: ['STATE', 'DISTRICT'],
      label: 'Location (State / District )',
      render: (row) => {
        const state =
          transformLabel(
            row.customFields.find((field) => field.label === 'STATE')
              ?.selectedValues?.[0]?.value
          ) || '';
        const district =
          transformLabel(
            row.customFields.find((field) => field.label === 'DISTRICT')
              ?.selectedValues?.[0]?.value
          ) || '';

        return `${state == '' ? '' : `${state}`}${
          district == '' ? '' : `, ${district}`
        }`;
      },
    },
  ];
  const userDelete = async () => {
    try {
      let membershipId = null;

      // Attempt to get the cohort list
      try {
        const userCohortResp = await getCohortList(userID);
        if (userCohortResp?.result?.cohortData?.length) {
          membershipId = userCohortResp.result.cohortData[0].cohortMembershipId;
        } else {
          console.warn('No cohort data found for the user.');
        }
      } catch (error) {
        console.error('Failed to fetch cohort list:', error);
      }

      // Attempt to update cohort member status only if we got a valid membershipId
      if (membershipId) {
        try {
          const updateResponse = await updateCohortMemberStatus({
            memberStatus: 'archived',
            statusReason: reason,
            membershipId: membershipId,
          });

          if (updateResponse?.responseCode !== 200) {
            console.error(
              'Failed to archive user from center:',
              updateResponse
            );
          } else {
            console.log('User successfully archived from center.');
          }
        } catch (error) {
          console.error('Error archiving user from center:', error);
        }
      }

      // Always attempt to delete the user
      console.log('Proceeding to self-delete...');
      const resp = await deleteUser(userID, {
        userData: { reason: reason, status: 'archived' },
      });

      if (resp?.responseCode === 200) {
        setResponse((prev) => ({
          ...prev,
          result: {
            ...prev?.result,
            getUserDetails: prev?.result?.getUserDetails?.filter(
              (item) => item?.userId !== userID
            ),
          },
        }));
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
        setEditableUserId(row?.userId);
        handleOpenModal();
      },
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
          if (item.label === 'DISTRICT') {
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

        setUserData({
          firstName: row?.firstName || '',
          lastName: row?.lastName || '',
          village: findVillage?.selectedValues?.[0]?.value || '',
        });
      },
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
  };

  //Add Edit Props
  const extraFieldsUpdate = {};
  const extraFields = {
    tenantCohortRoleMapping: [
      {
        tenantId: '6c8b810a-66c2-4f0d-8c0c-c025415a4414',
        roleId: RoleId.TEAM_LEADER,
      },
    ],
    username: 'youthnetmentorlead',
    password: Math.floor(10000 + Math.random() * 90000),
  };
  const successUpdateMessage =
    'MENTOR_LEADERS.MENTOR_LEAD_UPDATED_SUCCESSFULLY';
  const telemetryUpdateKey = 'youthnet-mentor-lead-updated-successfully';
  const failureUpdateMessage = 'MENTOR_LEADERS.NOT_ABLE_UPDATE_MENTOR_LEAD';
  const successCreateMessage =
    'MENTOR_LEADERS.MENTOR_LEAD_CREATED_SUCCESSFULLY';
  const telemetryCreateKey = 'youthnet-mentor-lead-created-successfully';
  const failureCreateMessage = 'MENTOR_LEADERS.NOT_ABLE_CREATE_MENTOR_LEAD';
  const notificationKey = 'onMentorLeaderCreate';
  const notificationMessage =
    'MENTOR_LEADERS.USER_CREDENTIALS_WILL_BE_SEND_SOON';
  const notificationContext = 'USER';

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
              setEditableUserId('');
              handleOpenModal();
            }}
          >
            {t('COMMON.ADD_NEW')}{' '}
          </Button>
        </Box>

        <SimpleModal
          open={openModal}
          onClose={handleCloseModal}
          showFooter={true}
          modalTitle={
            isEdit
              ? t('MENTOR_LEADERS.UPDATE_MENTOR_LEAD')
              : t('MENTOR_LEADERS.NEW_MENTOR_LEAD')
          }
          id="dynamic-form-id"
          primaryText={isEdit ? t('Update') : t('Create')}

        >
          <AddEditUser
            SuccessCallback={() => {
              setPrefilledFormData({});
              searchData({}, 0);
              setOpenModal(false);
            }}
            schema={addSchema}
            uiSchema={addUiSchema}
            editPrefilledFormData={prefilledAddFormData}
            isEdit={isEdit}
            editableUserId={editableUserId}
            UpdateSuccessCallback={() => {
              setPrefilledFormData({});
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
           hideSubmit={true}

          />
        </SimpleModal>

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
              {t('COMMON.NO_MENTOR_LEAD_FOUND')}
            </Typography>
          </Box>
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

export default MentorLead;

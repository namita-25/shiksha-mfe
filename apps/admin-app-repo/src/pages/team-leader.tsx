// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import Loader from '@/components/Loader';
import { useTranslation } from 'react-i18next';
import {
  TeamLeaderSearchSchema,
  TeamLeaderSearchUISchema,
} from '../constant/Forms/TeamLeaderSearch';
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
import { debounce, set } from 'lodash';
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
import apartment from '../../public/images/apartment.svg';
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
  calculateAge,
  calculateAgeFromDate,
  transformLabel,
} from '@/utils/Helper';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CenteredLoader from '@/components/CenteredLoader/CenteredLoader';

const TeamLeader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState(TeamLeaderSearchSchema);
  const [uiSchema, setUiSchema] = useState(TeamLeaderSearchUISchema);
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
  const [blockFieldId, setBlockFieldId] = useState('');
  const [districtFieldId, setDistrictFieldId] = useState('');

  const [tenantId, setTenantId] = useState('');
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [village, setVillage] = useState('');
  const [reason, setReason] = useState('');
  const [userID, setUserId] = useState('');

  const { t, i18n } = useTranslation();
  const theme = useTheme<any>();

  const initialFormData = localStorage.getItem('stateId')
    ? { state: [localStorage.getItem('stateId')] }
    : {};

  const searchStoreKey = 'teamLeader';
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
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.teamLead.context}&contextType=${FormContext.teamLead.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.teamLead.context}&contextType=${FormContext.teamLead.contextType}`,
          header: {
            tenantid: localStorage.getItem('tenantId'),
          },
        },
      ]);
      console.log('responseForm', responseForm);

      //unit name is missing from required so handled from frotnend
      let alterSchema = responseForm?.schema;
      let requiredArray = alterSchema?.required;
      const mustRequired = ['email'];
      // Merge only missing items from required2 into required1
      mustRequired.forEach((item) => {
        if (!requiredArray.includes(item)) {
          requiredArray.push(item);
        }
      });

      const blockFieldId = responseForm.schema.properties.block.fieldId;
      const districtFieldId = responseForm.schema.properties.district.fieldId;

      setBlockFieldId(blockFieldId);
      setDistrictFieldId(districtFieldId);
      setAddSchema(alterSchema);
      setAddUiSchema(responseForm?.uiSchema);
    };
    fetchData();
    setRoleID(RoleId.TEAM_LEADER);
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

  const userDelete = async () => {
    try {
      const resp = await deleteUser(userID, {
        userData: { reason: reason, status: 'archived' },
      });
      if (resp?.responseCode === 200) {
        // setResponse((prev) => ({
        //   ...prev, // Preserve other properties in `prev`
        //   result: {
        //     ...prev?.result, // Preserve other properties in `result`
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

  const searchData = async (formData, newPage) => {
    if (formData) {
      formData = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, value]) => !Array.isArray(value) || value.length > 0
        )
      );
      const staticFilter = {
        role: 'Lead',
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
      label: 'Team Lead Name',
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
      key: 'status',
      label: 'Status',
      render: (row: any) => transformLabel(row.status),
      getStyle: (row) => ({ color: row.status === 'active' ? 'green' : 'red' }),
    },
  ];

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
        setPrefilledAddFormData(tempFormData);
        setIsEdit(true);
        setIsReassign(false);
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
          if (item.label === 'BLOCK') {
            return item;
          }
        });

        setVillage(findVillage?.selectedValues[0]?.value);
        setUserId(row?.userId);
        setOpen(true);
        setFirstName(row?.firstName);
        setLastName(row?.lastName);
        setReason('');
        setChecked(false);
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
      callback: (row) => {
        // console.log('row:', row);
        // console.log('AddSchema', addSchema);
        // console.log('AddUISchema', addUiSchema);

        let tempFormData = extractMatchingKeys(row, addSchema);
        setPrefilledAddFormData(tempFormData);
        setIsEdit(false);
        setIsReassign(true);
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
    username: 'scpTeamLead',
    password: Math.floor(10000 + Math.random() * 90000),
  };
  const successUpdateMessage = 'TEAM_LEADERS.TEAM_LEADER_UPDATED_SUCCESSFULLY';
  const telemetryUpdateKey = 'scp-team-lead-updated-successfully';
  const failureUpdateMessage = 'TEAM_LEADERS.NOT_ABLE_UPDATE_TEAM_LEADER';
  const successCreateMessage = 'TEAM_LEADERS.TEAM_LEADER_CREATED_SUCCESSFULLY';
  const telemetryCreateKey = 'scp-team-lead-created-successfully';
  const failureCreateMessage = 'TEAM_LEADERS.NOT_ABLE_CREATE_TEAM_LEADER';
  const notificationKey = 'onTeamLeaderCreated';
  const notificationMessage = 'TEAM_LEADERS.USER_CREDENTIALS_WILL_BE_SEND_SOON';
  const notificationContext = 'USER';
  const blockReassignmentNotificationKey = 'TL_BLOCK_REASSIGNMENT';
  const profileUpdateNotificationKey = 'TL_PROFILE_UPDATE';
  const districtUpdateNotificationKey = 'TL_DISTRICT_UPDATE';

  useEffect(() => {
    setPrefilledFormData(initialFormDataSearch);
  }, []);

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
            }}
          >
            {t('COMMON.ADD_NEW')}
          </Button>
        </Box>

        <SimpleModal
          open={openModal}
          onClose={handleCloseModal}
          showFooter={true}
          primaryText={
            isEdit ? t('Update') : isReassign ? t('Reassign') : t('Create')
          }
          id="dynamic-form-id"
          modalTitle={
            isEdit
              ? t('TEAM_LEADERS.EDIT_TEAM_LEADER')
              : isReassign
              ? t('TEAM_LEADERS.RE_ASSIGN_TEAM_LEAD')
              : t('TEAM_LEADERS.NEW_TEAM_LEADER')
          }
        >
          <AddEditUser
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
            blockFieldId={blockFieldId}
            districtFieldId={districtFieldId}
            hideSubmit={true}
            type={'team-leader'}
            blockReassignmentNotificationKey={blockReassignmentNotificationKey}
            profileUpdateNotificationKey={profileUpdateNotificationKey}
            districtUpdateNotificationKey={districtUpdateNotificationKey}
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
                  {t('TEAM_LEADERS.NO_TEAM_LEADER_FOUND')}
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
          firstName={firstName}
          lastName={lastName}
          village={village}
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

export default TeamLeader;

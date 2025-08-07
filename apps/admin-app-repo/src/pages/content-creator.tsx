// @ts-nocheck
import React, { useState, useEffect } from 'react';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import Loader from '@/components/Loader';
import { useTranslation } from 'react-i18next';
import {
  ContentCreatorSearchSchema,
  ContentCreatorUISchema,
} from '../constant/Forms/ContentCreatorSearch';

import { RoleId, RoleName, Status, TenantName } from '@/utils/app.constant';
import { userList } from '@/services/UserList';
import { Box, Typography } from '@mui/material';
import PaginatedTable from '@/components/PaginatedTable/PaginatedTable';
import { Button } from '@mui/material';
import SimpleModal from '@/components/SimpleModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { deleteUser } from '@/services/UserService';
import editIcon from '../../public/images/editIcon.svg';
import deleteIcon from '../../public/images/deleteIcon.svg';
import Image from 'next/image';
import {
  extractMatchingKeys,
  fetchForm,
  searchListData,
} from '@/components/DynamicForm/DynamicFormCallback';
import { FormContext } from '@/components/DynamicForm/DynamicFormConstant';
import AddEditUser from '@/components/EntityForms/AddEditUser/AddEditUser';
import TenantService from '@/services/TenantService';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CenteredLoader from '@/components/CenteredLoader/CenteredLoader';
import { transformLabel } from '@/utils/Helper';

const ContentCreator = () => {
  const theme = useTheme<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState(ContentCreatorSearchSchema);
  const [uiSchema, setUiSchema] = useState(ContentCreatorUISchema);
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
  const [editableUserId, setEditableUserId] = useState('');

  const { t, i18n } = useTranslation();

  const searchStoreKey = 'contentCreator';

  const initialFormDataSearch =
    localStorage.getItem(searchStoreKey) &&
    localStorage.getItem(searchStoreKey) != '{}'
      ? JSON.parse(localStorage.getItem(searchStoreKey))
      : localStorage.getItem('stateId')
      ? { state: [localStorage.getItem('stateId')] }
      : {};

  const storedUserData = JSON.parse(localStorage.getItem('adminInfo') || '{}');

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
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.contentCreator.context}&contextType=${FormContext.contentCreator.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.contentCreator.context}&contextType=${FormContext.contentCreator.contextType}`,
          header: {
            tenantid: TenantService.getTenantId(),
          },
        },
      ]);
      console.log('responseForm', responseForm);
      setAddSchema(responseForm?.schema);
      setAddUiSchema(responseForm?.uiSchema);
    };

    setPrefilledAddFormData(initialFormDataSearch);
    fetchData();
  }, []);

  const updatedUiSchema = {
    ...uiSchema,
    'ui:submitButtonOptions': {
      norender: true, // Hide submit button if isHide is true
    },
  };

  const SubmitaFunction = async (formData: any) => {
    if (Object.keys(formData).length > 0) {
      setPrefilledFormData(formData);
      //set prefilled search data on refresh
      localStorage.setItem(searchStoreKey, JSON.stringify(formData));
      await searchData(formData, 0);
    }
  };

  const searchData = async (formData: any, newPage: any) => {
    if (formData) {
      formData = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, value]) => !Array.isArray(value) || value.length > 0
        )
      );
      const staticFilter = {
        role: RoleName.CONTENT_CREATOR,
        tenantId: storedUserData.tenantData[0].tenantId,
      };
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
  let columns = [
    {
      keys: ['firstName', 'middleName', 'lastName'],
      label: 'Content Creator Name',
      render: (row: any) =>
        `${row.firstName || ''} ${row.middleName || ''} ${
          row.lastName || ''
        }`.trim(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => transformLabel(row.status),
      getStyle: (row: any) => ({
        color: row.status === 'active' ? 'green' : 'red',
      }),
    },
    {
      key: 'STATE',
      label: 'State',
      render: (row) => {
        const state =
          row.customFields.find((field) => field.label === 'STATE')
            ?.selectedValues?.[0]?.value || '-';
        return `${state}`;
      },
    },
  ];

  const scpCustomColumns = [
    {
      key: 'BOARD',
      label: 'Board',
      render: (row) => {
        const board =
          row.customFields
            .find((field) => field.label === 'BOARD')
            ?.selectedValues.join(', ') || '-';
        return `${board}`;
      },
    },
    {
      key: 'MEDIUM',
      label: 'Medium',
      render: (row) => {
        const medium =
          row.customFields
            .find((field) => field.label === 'MEDIUM')
            ?.selectedValues.join(', ') || '-';
        return `${medium}`;
      },
    },
    {
      key: 'GRADE',
      label: 'Grade',
      render: (row) => {
        const grade =
          row.customFields
            .find((field) => field.label === 'GRADE')
            ?.selectedValues.join(', ') || '-';
        return `${grade}`;
      },
    },
    {
      key: 'SUBJECT',
      label: 'Subject',
      render: (row) => {
        const subject =
          row.customFields
            .find((field) => field.label === 'SUBJECT')
            ?.selectedValues.join(', ') || '-';
        return `${subject}`;
      },
    },
  ];

  const youthnetCustomColumns = [
    {
      key: 'DOMAIN',
      label: 'Domain',
      render: (row) => {
        const domain =
          row.customFields
            .find((field) => field.label === 'DOMAIN')
            ?.selectedValues.join(', ') || '-';
        return `${domain}`;
      },
    },
    {
      key: 'SUB DOMAIN',
      label: 'Sub Domain',
      render: (row) => {
        const subDomain =
          row.customFields
            .find((field) => field.label === 'SUB DOMAIN')
            ?.selectedValues.join(', ') || '-';
        return `${subDomain}`;
      },
    },
    {
      key: 'STREAM',
      label: 'Stream',
      render: (row) => {
        const stream =
          row.customFields
            .find((field) => field.label === 'STREAM')
            ?.selectedValues.join(', ') || '-';
        return `${stream}`;
      },
    },
  ];
  if (
    storedUserData.tenantData[0].tenantName === TenantName.SECOND_CHANCE_PROGRAM
  ) {
    columns = [...columns, ...scpCustomColumns];
  } else if (storedUserData.tenantData[0].tenantName === TenantName.YOUTHNET) {
    columns = [...columns, ...youthnetCustomColumns];
  }

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
      callback: (row: any) => {
        console.log('row:', row);
        console.log('AddSchema', addSchema);
        console.log('AddUISchema', addUiSchema);

        let tempFormData = extractMatchingKeys(row, addSchema);
        console.log('tempFormData', tempFormData);
        setPrefilledAddFormData(tempFormData);
        setIsEdit(true);
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
          <Image src={deleteIcon} alt="" />
        </Box>
      ),
      callback: async (row: any) => {
        console.log('row:', row);
        setEditableUserId(row?.userId);
        const userId = row?.userId;
        const response = await deleteUser(userId, {
          userData: {
            status: Status.ARCHIVED,
          },
        });
        setPrefilledFormData({});
        searchData(prefilledFormData, currentPage);
        setOpenModal(false);
      },
      show: (row) => row.status !== 'archived',
    },
  ];

  // Pagination handlers
  const handlePageChange = (newPage: any) => {
    console.log('Page changed to:', newPage);
    searchData(prefilledFormData, newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: any) => {
    console.log('Rows per page changed to:', newRowsPerPage);
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
        tenantId: TenantService.getTenantId(),
        roleId: RoleId.CONTENT_CREATOR,
      },
    ],
    password: Math.floor(10000 + Math.random() * 90000),
  };
  const successUpdateMessage =
    'CONTENT_CREATORS.CONTENT_CREATOR_UPDATED_SUCCESSFULLY';
  const telemetryUpdateKey = 'content-creator-updated-successfully';
  const failureUpdateMessage =
    'CONTENT_CREATORS.NOT_ABLE_UPDATE_CONTENT_CREATOR';
  const successCreateMessage =
    'CONTENT_CREATORS.CONTENT_CREATOR_CREATED_SUCCESSFULLY';
  const telemetryCreateKey = 'content-creator-created-successfully';
  const failureCreateMessage =
    'CONTENT_CREATORS.NOT_ABLE_CREATE_CONTENT_CREATOR';
  const notificationKey =
    storedUserData.tenantData[0].tenantName === TenantName.SECOND_CHANCE_PROGRAM
      ? 'onScpContentCreatorCreate'
      : 'onYouthnetContentCreatorCreate';
  const notificationMessage =
    'CONTENT_CREATORS.USER_CREDENTIALS_WILL_BE_SEND_SOON';
  const notificationContext = 'USER';
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
              prefilledFormData={prefilledFormData || {}}
            />
          )
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} mt={4}>
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
              setPrefilledAddFormData({});
              setIsEdit(false);
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
          primaryText={isEdit ? t('Update') : t('Create')}
          id="dynamic-form-id"
          modalTitle={
            isEdit
              ? t('CONTENT_CREATORS.UPDATE_CONTENT_CREATOR')
              : t('CONTENT_CREATORS.NEW_CONTENT_CREATOR')
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
            hideSubmit={true}
            type={'content-creator'}
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
                  {t('COMMON.NO_CONTENT_CREATOR_FOUND')}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <CenteredLoader />
        )}
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

export default ContentCreator;

'use-client';

import withRole from '../../components/withRole';
import React, { useEffect, useState } from 'react';
import { TENANT_DATA } from '../../utils/app.config';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import Header from '../../components/Header';
import BackHeader from '../../components/youthNet/BackHeader';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPaths } from 'next';
import { VILLAGE_DATA } from '../../components/youthNet/tempConfigs';
import VillageDetailCard from '../../components/youthNet/VillageDetailCard';
import Frame2 from '../../assets/images/SurveyFrame2.png';
import Profile from '../../components/youthNet/Profile';
import { filterSchema, getAge, toPascalCase } from '../../utils/Helper';
import { useRouter } from 'next/router';
import {
  getUserDetails,
  updateUser,
} from '../../services/youthNet/Dashboard/UserServices';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DynamicForm from '@shared-lib-v2/DynamicForm/components/DynamicForm';
import { FormContext } from '@shared-lib-v2/DynamicForm/components/DynamicFormConstant';
import { fetchForm } from '@shared-lib-v2/DynamicForm/components/DynamicFormCallback';
import SimpleModal from '../../components/SimpleModal';
import { showToastMessage } from '@/components/Toastify';

const UserId = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();
  const { userId } = router.query;
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState<any>();
  const [editModal, setEditModal] = useState<boolean>(false);
  const [updatedUser, setUpdatedUser] = useState<boolean>(false);
  const { tab, blockId, villageId } = router.query;

  const [uiSchema, setUiSchema] = useState(null);
  const [user, setUser] = React.useState<{
    userRole: string | null;
    userID: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    dob?: string | null;
    state?: string | null;
    district?: string | null;
    block?: string | null;
    middleName?: string | null;
    village?: string | null;
    userName?: string | null;
    joinedOn?: string | null;
  }>({
    userRole: null,
    userID: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    gender: null,
    dob: null,
    state: null,
    district: null,
    block: null,
    village: null,
    middleName: null,
    userName: null,
    joinedOn: null,
  });
  const handleOpenEditModal = () => {
    setEditModal(true);
  };
  function formatDate(dob: string): string | null {
    if (!dob) return null;

    const parsedDate = new Date(dob);

    if (isNaN(parsedDate.getTime())) {
      const parts = dob.split(' ');
      if (parts.length === 3) {
        const formatted = parts.reverse().join('-');
        const retryDate = new Date(formatted);
        if (!isNaN(retryDate.getTime()))
          return retryDate.toISOString().split('T')[0];
      }
      return null;
    }

    return parsedDate.toISOString().split('T')[0];
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseForm: any = await fetchForm([
          {
            fetchUrl: `${
              process.env.NEXT_PUBLIC_MIDDLEWARE_URL
            }/form/read?context=${
              FormContext.mentor.context
            }&contextType=${user?.userRole?.toUpperCase()}`,
            header: {},
          },
          {
            fetchUrl: `${
              process.env.NEXT_PUBLIC_MIDDLEWARE_URL
            }/form/read?context=${
              FormContext.mentor.context
            }&contextType=${user?.userRole?.toUpperCase()}`,
            header: { tenantid: localStorage.getItem('tenantId') },
          },
        ]);
        console.log('responseForm', responseForm);
        const { newSchema, extractedFields } = filterSchema(responseForm);
        console.log(newSchema?.schema);
        console.log(newSchema?.uiSchema);

        const extractUserInfo = (({
          firstName,
          lastName,
          middleName,
          gender,
          phone: mobile,
          dob,
          email,
        }: any) => ({
          firstName,
          lastName,
          middleName,
          gender,
          mobile,
          dob,
          email,
        }))(user);
        extractUserInfo.dob = formatDate(extractUserInfo?.dob);
        extractUserInfo.mobile = extractUserInfo?.mobile?.toString();

        console.log(extractUserInfo);
        setFormData(extractUserInfo);
        setSchema(newSchema?.schema);
        const updatedUiSchema = {
          ...newSchema?.uiSchema,
          'ui:submitButtonOptions': {
            norender: true,
          },
        };
        setUiSchema(updatedUiSchema);
      } catch (e) {
        console.log(e);
      }
      // setSdbvFieldData(extractedFields);
    };
    if (userId === localStorage.getItem('userId') && user?.userRole)
      fetchData();
  }, [user]);
  const onClose = () => {
    setEditModal(false);
  };
  const FormSubmitFunction = async (formData: any, payload: any) => {
    try {
      const object = {
        userData: formData,
      };
      if (user?.email == formData?.email) {
        delete formData?.email;
      }
      if (userId) {
        const updateUserResponse = await updateUser(userId.toString(), object);
        let userlocalData = localStorage.getItem('userData');
        let userData = userlocalData ? JSON.parse(userlocalData) : {};
        // let userlocalData = JSON.parse(localStorage.getItem("userData")) || {};

        // Merge existing data with updated values
        Object.assign(userData, formData);
        console.log(userData);
        localStorage.setItem('userData', JSON.stringify(userData));

        showToastMessage(t('PROFILE.PROFILE_UPDATE_SUCCESSFULLY'), 'success');
        setEditModal(false);
        setUpdatedUser(!updatedUser);
      }
    } catch (e) {
      showToastMessage(t('PROFILE.UNABLE_TO_PROFILE_UPDATE_'), 'error');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const storedUserId = localStorage.getItem('userId');
      const role = localStorage.getItem('role') || '';
      let userData: any = {};

      if (userId === storedUserId) {
        userData = JSON.parse(localStorage.getItem('userData') || '{}');
      } else if (userId) {
        const data = await getUserDetails(userId, true);
        userData = data?.userData || {};
      }

      if (userData) {
        const getFieldValue = (label: string) =>
          toPascalCase(
            userData?.customFields?.find((item: any) => item.label === label)
              ?.selectedValues?.[0]?.value || ''
          );
        let date;
        let formattedDOBDate;
        if (userData.dob) {
          date = new Date(userData.dob);
          //const joinedDate = new Date(userData.createdAt);

          const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          };
          formattedDOBDate = date.toLocaleDateString('en-GB', options);
        }

        setUser({
          firstName: toPascalCase(userData?.firstName) || '',
          lastName: toPascalCase(userData?.lastName) || '',
          middleName: toPascalCase(userData?.middleName) || '',
          userName: userData?.username || '',
          joinedOn: userData?.createdOn || '',
          email: userData?.email || '',
          userID: userData?.userId || '',
          phone: userData?.mobile || '',
          gender: userData?.gender || '',
          userRole:
            toPascalCase(userData?.tenantData?.[0]?.roleName) ||
            toPascalCase(role),
          dob: formattedDOBDate || '',
          district: getFieldValue('DISTRICT'),
          block: getFieldValue('BLOCK'),
          state: getFieldValue('STATE'),
          village: getFieldValue('VILLAGE'),
        });
      }
    };

    fetchData();
  }, [userId, updatedUser]);

  return (
    <>
      <Box minHeight="100vh">
        {' '}
        <Box>
          <Header />
        </Box>
        <Box ml={2}>
          <BackHeader
            headingOne={
              userId === localStorage.getItem('userId')
                ? t('YOUTHNET_PROFILE.MY_PROFILE')
                : user.firstName
                ? user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName
                : ''
            }
            showBackButton={
              userId === localStorage.getItem('userId') ? false : true
            }
            onBackClick={() => {
              if (tab) {
                router.push({
                  pathname: `/villages`,
                  query: {
                    villageId: villageId,
                    tab: tab,
                    blockId: blockId,
                  },
                });
              } else router.back();
            }}
          />
        </Box>
        {userId === localStorage.getItem('userId') && (
          <Box
            sx={{
              marginLeft: '30%',
            }}
          >
            <Button
              sx={{
                fontSize: '14px',
                lineHeight: '20px',
                minWidth: '40%',
                padding: '10px 24px 10px 16px',
                gap: '8px',
                borderRadius: '100px',
                marginTop: '10px',
                // flex: '1',
                textAlign: 'center',
                color: theme.palette.warning.A200,
                border: `1px solid #4D4639`,
              }}
              onClick={handleOpenEditModal}
            >
              <Typography
                variant="h3"
                style={{
                  letterSpacing: '0.1px',
                  textAlign: 'left',
                  marginBottom: '2px',
                }}
                fontSize={'14px'}
                fontWeight={'500'}
                lineHeight={'20px'}
              >
                {t('PROFILE.EDIT_PROFILE')}
              </Typography>
              <Box>
                <CreateOutlinedIcon sx={{ fontSize: '14px' }} />
              </Box>
            </Button>
          </Box>
        )}
        {/* <Box ml={2}>
        {' '}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: theme.palette.info.black,
          }}
        >
          {t('YOUTHNET_PROFILE.ACTIVITIES_CONDUCTED')}
        </Typography>
      </Box> */}
        {/* <Box>
        <VillageDetailCard
          imageSrc={Frame2}
          title={VILLAGE_DATA.THREE}
          subtitle={VILLAGE_DATA.SURVEYS_CONDUCTED}
        />
      </Box> */}
        <Box
          sx={{
            background: theme.palette.info.gradient,
            padding: '24px 16px 24px 16px',
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              color: theme.palette.info.black,
            }}
          >
            {t('YOUTHNET_PROFILE.PROFILE_DETAILS')}
          </Typography>
          <Profile
            fullName={`${user.firstName} ${user.lastName}` || ''}
            emailId={user.email || '-'}
            designation={user.userRole || '-'}
            mentorId={user.userID || ''}
            phoneNumber={user.phone || '-'}
            gender={toPascalCase(user.gender) || '-'}
            state={user.state || '-'}
            district={user.district || '-'}
            block={user.block || '-'}
            dob={user.dob || '-'}
            age={getAge(user?.dob)}
            village={user.village || null}
            middleName={user.middleName || '-'}
            userName={user.userName || null}
            joinedOn={user.joinedOn || null}
            firstName={user.firstName || ''}
            lastName={user.lastName || ''}
          />
        </Box>
      </Box>
      <SimpleModal
        open={editModal}
        onClose={onClose}
        showFooter={true}
        modalTitle={'New Mentor'}
        //  handleNext={FormSubmitFunction}
        primaryText={'Submit'}
        id="dynamic-form-id"
        // secondaryText={count === 1 ? 'Save Progress' : ''}
      >
        {schema && uiSchema && (
          <DynamicForm
            hideSubmit={true}
            schema={schema}
            uiSchema={uiSchema}
            FormSubmitFunction={FormSubmitFunction}
            prefilledFormData={formData || {}}
          />
        )}
      </SimpleModal>
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

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  };
};

export default withRole(TENANT_DATA.YOUTHNET)(UserId);

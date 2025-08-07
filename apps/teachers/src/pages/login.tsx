import dynamic from 'next/dynamic';
import React from 'react';
import manageUserStore from '../store/manageUserStore';
import { UpdateDeviceNotification } from '../services/NotificationService';
import useStore from '../store/store';
import { TENANT_DATA } from '../utils/app.config';
import { getUserDetails } from '../services/ProfileService';
import { AcademicYear } from '../utils/Interfaces';
import { getAcademicYear } from '../services/AcademicYearService';
import router from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { RoleNames } from '../utils/app.constant';

const Login = dynamic(() => import('@login'), {
  ssr: false,
});

const LoginComponent = () => {
  const setUserId = manageUserStore((state) => state.setUserId);
  const setUserRole = useStore(
    (state: { setUserRole: any }) => state.setUserRole
  );

  const setAccessToken = useStore(
    (state: { setAccessToken: any }) => state.setAccessToken
  );

  const setIsActiveYearSelected = useStore(
    (state: { setIsActiveYearSelected: any }) => state.setIsActiveYearSelected
  );

  const setDistrictCode = manageUserStore(
    (state: { setDistrictCode: any }) => state.setDistrictCode
  );
  const setDistrictId = manageUserStore(
    (state: { setDistrictId: any }) => state.setDistrictId
  );

  const setDistrictName = manageUserStore(
    (state: { setDistrictName: any }) => state.setDistrictName
  );

  const setStateCode = manageUserStore(
    (state: { setStateCode: any }) => state.setStateCode
  );
  const setStateId = manageUserStore(
    (state: { setStateId: any }) => state.setStateId
  );

  const setStateName = manageUserStore(
    (state: { setStateName: any }) => state.setStateName
  );

  const setBlockCode = manageUserStore(
    (state: { setBlockCode: any }) => state.setBlockCode
  );
  const setBlockId = manageUserStore(
    (state: { setBlockId: any }) => state.setBlockId
  );
  const setBlockName = manageUserStore(
    (state: { setBlockName: any }) => state.setBlockName
  );

  const getAcademicYearList = async () => {
    const academicYearList: AcademicYear[] = await getAcademicYear();
    if (academicYearList) {
      localStorage.setItem(
        'academicYearList',
        JSON.stringify(academicYearList)
      );
      const extractedAcademicYears = academicYearList?.map(
        ({ id, session, isActive }) => ({ id, session, isActive })
      );
      const activeSession = extractedAcademicYears?.find(
        (item) => item.isActive
      );
      const activeSessionId = activeSession ? activeSession.id : '';
      localStorage.setItem('academicYearId', activeSessionId);
      setIsActiveYearSelected(true);

      return activeSessionId;
    }
  };

  const handleLoginSuccess = async (receivedToken: any) => {
    const userId = receivedToken?.userId;
    const token = localStorage.getItem('token');
    console.log(receivedToken, token);

    if (receivedToken.tenantData && receivedToken.tenantData.length > 0) {
      const tenantName = receivedToken.tenantData[0].tenantName;
      const tenantId = receivedToken.tenantData[0].tenantId;
      localStorage.setItem('tenantName', tenantName);
      localStorage.setItem('tenantId', tenantId);
    } else {
      console.error('Tenant data not found in user response.');
    }
    localStorage.setItem('userId', userId);
    setUserId(userId);

    if (token && userId) {
      document.cookie = `authToken=${token}; path=/; secure; SameSite=Strict`;
      document.cookie = `userId=${userId}; path=/; secure; SameSite=Strict`;

      // Retrieve deviceID from local storage
      const deviceID = localStorage.getItem('deviceID');

      if (deviceID) {
        try {
          // Update device notification
          const headers = {
            tenantId: receivedToken?.tenantData[0]?.tenantId,
            Authorization: `Bearer ${token}`,
          };

          const updateResponse = await UpdateDeviceNotification(
            { deviceId: deviceID, action: 'add' },
            userId,
            headers
          );

          console.log(
            'Device notification updated successfully:',
            updateResponse
          );
        } catch (updateError) {
          console.error('Error updating device notification:', updateError);
        }
      }

      localStorage.setItem('role', receivedToken?.tenantData[0]?.roleName);
      localStorage.setItem('userEmail', receivedToken?.email);
      localStorage.setItem('userName', receivedToken?.firstName);
      localStorage.setItem('userIdName', receivedToken?.username);
      localStorage.setItem(
        'temporaryPassword',
        receivedToken?.temporaryPassword ?? 'false'
      );
      localStorage.setItem('userData', JSON.stringify(receivedToken));
      setUserRole(receivedToken?.tenantData[0]?.roleName);
      setAccessToken(token);

      const tenant = localStorage.getItem('tenantName');
      if (
        tenant?.toLocaleLowerCase() ===
          TENANT_DATA?.SECOND_CHANCE_PROGRAM?.toLowerCase() ||
        tenant?.toLocaleLowerCase() === TENANT_DATA?.PRATHAM_SCP?.toLowerCase()
      ) {
        const userDetails = await getUserDetails(userId, true);
        console.log(userDetails);

        if (userDetails?.result?.userData) {
          const activeSessionId = await getAcademicYearList();
          const customFields = userDetails?.result?.userData?.customFields;
          if (customFields?.length) {
            // set customFields in userData
            let userDataString = localStorage.getItem('userData');
            let userData: any = userDataString
              ? JSON.parse(userDataString)
              : null;
            userData.customFields = customFields;
            localStorage.setItem('userData', JSON.stringify(userData));
            const state = customFields.find(
              (field: any) => field?.label === 'STATE'
            );
            const district = customFields.find(
              (field: any) => field?.label === 'DISTRICT'
            );
            const block = customFields.find(
              (field: any) => field?.label === 'BLOCK'
            );

            if (state) {
              localStorage.setItem(
                'stateName',
                state?.selectedValues?.[0]?.value
              );
              setStateName(state?.selectedValues?.[0]?.value);
              setStateCode(state?.selectedValues?.[0]?.id);
              setStateId(state?.fieldId);
            }

            if (district) {
              setDistrictName(district?.selectedValues?.[0]?.value);
              setDistrictCode(district?.selectedValues?.[0]?.id);
              setDistrictId(district?.fieldId);
            }

            if (block) {
              setBlockName(block?.selectedValues?.[0]?.value);
              setBlockCode(block?.selectedValues?.[0]?.id);
              setBlockId(block?.fieldId);
            }
          }

          if (activeSessionId) {
            router.push('/teacher');
          }
          console.log('userDetails', userDetails);
        }
      } else if (
        token &&
        tenant?.toLowerCase() === TENANT_DATA.YOUTHNET?.toLowerCase()
      ) {
        if (
          localStorage.getItem('role') === RoleNames.TEACHER ||
          localStorage.getItem('role') === RoleNames.TEAM_LEADER
        )
          router.push('/youth');
        else router.push('/unauthorized');
      }
    }
  };
  return <Login onLoginSuccess={handleLoginSuccess} />;
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default LoginComponent;

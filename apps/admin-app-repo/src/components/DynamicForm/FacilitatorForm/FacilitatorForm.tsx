// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import Loader from '@/components/Loader';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import _ from 'lodash';
import axios from 'axios';
import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';
import CohortBatchSelector from './CohortBatchSelector';
import CenteredLoader from '@/components/CenteredLoader/CenteredLoader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createUser, updateUser } from '@/services/CreateUserService';
import {
  getReassignPayload,
  getUserFullName,
  isBlockDifferent,
  isCenterDifferent,
  toPascalCase,
} from '@/utils/Helper';
import { sendCredentialService } from '@/services/NotificationService';
import { showToastMessage } from '@/components/Toastify';
import {
  notificationCallback,
  splitUserData,
  telemetryCallbacks,
} from '../DynamicFormCallback';
import { getCohortList } from '@/services/GetCohortList';
import {
  bulkCreateCohortMembers,
  updateReassignUser,
} from '@/services/CohortService/cohortService';
import useNotification from '@/hooks/useNotification';
const FacilitatorForm = ({
  t,
  SuccessCallback,
  schema,
  uiSchema,
  editPrefilledFormData,
  isEdit,
  isReassign,
  UpdateSuccessCallback,
  extraFields,
  extraFieldsUpdate,
  type,
  hideSubmit,
  setButtonShow,
  successCreateMessage,
  failureCreateMessage,
  editableUserId,
  successUpdateMessage,
  telemetryUpdateKey,
  failureUpdateMessage,
  notificationContext,
  notificationKey,
  notificationMessage,
  telemetryCreateKey,
  blockReassignmentNotificationKey,
  profileUpdateNotificationKey,
  centerUpdateNotificationKey,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alteredSchema, setAlteredSchema] = useState<any>(null);
  const [alteredSchemaCB, setAlteredSchemaCB] = useState<any>(null);
  const [alteredUiSchema, setAlteredUiSchema] = useState<any>(null);

  const [prefilledFormData, setPrefilledFormData] = useState(
    editPrefilledFormData
  );
  const [originalPrefilledFormData, setOriginalPrefilledFormData] = useState(
    editPrefilledFormData
  );
  const [showNextForm, setShowNextForm] = useState<boolean>(false);

  const [blockId, setBlockId] = useState([]);
  const [centerList, setCenterList] = useState(null);
  const [selectedCenterBatches, setSelectedCenterBatches] = useState(null);

  const [isChangeForm, setIsChangeForm] = useState(false);
  // const [testIs, setShowNextForm] = useState<boolean>(true);
  const { getNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      let isEditSchema = _.cloneDeep(schema);
      let isEditSchemaCB = _.cloneDeep(schema);
      let isEditUiSchema = _.cloneDeep(uiSchema);

      if (localStorage.getItem('stateId')) {
        // console.log('##########isEditUiSchema', isEditUiSchema);
        // ✅ Add `ui:disabled` to the `state` field
        if (isEditUiSchema?.state) {
          isEditUiSchema.state['ui:disabled'] = true;
        }
      }

      console.log('######## filteredKeys start', isReassign);
      if (isEdit) {
        console.log('########### debug issue ', isEditUiSchema);
        let keysToRemove = [
          'state',
          'district',
          'block',
          'village',
          'password',
          'confirm_password',
          'board',
          'medium',
          'parentId',
          'center',
          'batch',
          'grade',
        ];
        //disable center type if value present
        //if first time not designation is sent then update it but backend fix required as it gives eneditable field issue
        // if (!editPrefilledFormData?.designation) {
        //   isEditUiSchema = {
        //     ...isEditUiSchema,
        //     designation: {
        //       ...isEditUiSchema.designation,
        //       'ui:disabled': false,
        //     },
        //   };
        // }
        keysToRemove.forEach((key) => delete isEditSchema.properties[key]);
        keysToRemove.forEach((key) => delete isEditUiSchema[key]);
        //also remove from required if present
        isEditSchema.required = isEditSchema.required.filter(
          (key) => !keysToRemove.includes(key)
        );
        // console.log('isEditSchema', JSON.stringify(isEditSchema));
      } else if (isReassign) {
        console.log('######## filteredKeys isReassign');
        let originalRequired = isEditSchema.required;
        const keysToHave = [
          'state',
          'district',
          'block',
          'village',
          // 'center',
          // 'batch',
          'designation',
        ];

        console.log('######## filteredKeys keysToHave', keysToHave);
        const properties = isEditSchema.properties;
        const filteredKeys = Object.keys(properties).filter(
          (key) => !keysToHave.includes(key)
        );
        console.log('######## filteredKeys', filteredKeys);
        let keysToRemove = filteredKeys;
        keysToRemove.forEach((key) => delete isEditSchema.properties[key]);
        keysToRemove.forEach((key) => delete isEditUiSchema[key]);
        //also remove from required if present
        isEditSchema.required = isEditSchema.required.filter(
          (key) => !keysToRemove.includes(key)
        );

        //remove ui:order
        isEditUiSchema['ui:order'] = isEditUiSchema['ui:order'].filter(
          (key) => !keysToRemove.includes(key)
        );

        console.log('######## filteredKeys isEditSchema', isEditSchema);
        console.log('######## filteredKeys isEditUiSchema', isEditUiSchema);
        let alterPrefilledFormData = prefilledFormData;

        const filteredData = Object.fromEntries(
          Object.entries(alterPrefilledFormData).filter(
            ([key]) => !keysToRemove.includes(key)
          )
        );
        console.log('######## filteredKeys filteredData', filteredData);
        setPrefilledFormData(filteredData);
        setIsChangeForm((preVal) => !preVal);
      } else {
        const keysToRemove = [
          'password',
          'confirm_password',
          'program',
          'center',
          'batch',
        ];
        keysToRemove.forEach((key) => delete isEditSchema?.properties[key]);
        keysToRemove.forEach((key) => delete isEditUiSchema[key]);
        //also remove from required if present
        isEditSchema.required = isEditSchema.required.filter(
          (key) => !keysToRemove.includes(key)
        );
        // console.log('isEditSchema', JSON.stringify(isEditSchema));

        //create another for sending center and batch
        const keysToRemoveCB = ['password', 'confirm_password', 'program'];
        keysToRemoveCB.forEach((key) => delete isEditSchemaCB?.properties[key]);
      }
      setAlteredSchema(isEditSchema);
      setAlteredSchemaCB(isEditSchemaCB);
      setAlteredUiSchema(isEditUiSchema);
    };
    fetchData();
  }, []);

  const flresponsetotl = async (response: any[]) => {
    console.log('###### responsedebug flresponsetotl', response);
    const uniqueParentIds = Array.from(
      new Set(
        response
          .filter((item) => item.cohortMemberStatus === 'active')
          .map((item) => item.parentId)
      )
    );
    console.log('###### responsedebug uniqueParentIds', uniqueParentIds);

    const fetchParentData = async (parentId: string) => {
      try {
        const url = API_ENDPOINTS.cohortSearch;
        const header = {
          tenantId: localStorage.getItem('tenantId') || '',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          academicyearid: localStorage.getItem('academicYearId') || '',
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...header,
          },
          body: JSON.stringify({
            limit: 200,
            offset: 0,
            filters: {
              status: ['active'],
              cohortId: parentId,
            },
          }),
        });

        const data = await response.json();
        const cohortDetails = data?.result?.results?.cohortDetails || [];

        // Remove customFields if needed
        const filteredBatch = cohortDetails
          .filter((item) => item.status === 'active')
          .map(({ customFields, ...rest }) => rest);

        return filteredBatch;
      } catch (error) {
        console.error(`Error fetching data for parentId ${parentId}:`, error);
        return [];
      }
    };

    const getAllParentData = async (parentIds: string[]) => {
      const results = await Promise.all(
        parentIds.map((id) => fetchParentData(id))
      );
      return results.flat(); // flatten nested arrays
    };

    // Now fetch and attach children
    const parentData = await getAllParentData(uniqueParentIds);

    const updatedCohorts = parentData.map((cohort) => {
      const children = response.filter(
        (child) =>
          child.parentId === cohort.cohortId &&
          child.cohortMemberStatus == 'active'
      );

      return {
        ...cohort,
        childData: children,
      };
    });

    console.log('###### responsedebug updatedCohorts', updatedCohorts);
    const transformCohortData = (cohorts) => {
      const transform = (item) => {
        const { name, cohortName, status, cohortStatus, childData, ...rest } =
          item;

        const updated = {
          ...rest,
          name: cohortName ?? name,
          cohortName: name ?? cohortName,
          status: cohortStatus ?? status,
          cohortStatus: status ?? cohortStatus,
          childData: childData?.map(transform) || [],
        };

        return updated;
      };

      return cohorts.map(transform);
    };

    // Usage
    const transformedData = transformCohortData(updatedCohorts);
    console.log('###### responsedebug transformedData', transformedData);

    return transformedData;
  };

  const StepperFormSubmitFunction = async (formData: any, payload: any) => {
    if (isEdit) {
      try {
        const { userData, customFields } = splitUserData(payload);
        //update email and username if email changed
        if (userData?.email) {
          if (editPrefilledFormData?.email == userData?.email) {
            delete userData?.email;
          } else {
            userData.username = userData?.email;
          }
        }
        // console.log('userData', userData);
        // console.log('customFields', customFields);
        const object = {
          userData: userData,
          customFields: customFields,
        };
        const updateUserResponse = await updateUser(editableUserId, object);
        // console.log('updatedResponse', updateUserResponse);

        if (
          updateUserResponse &&
          updateUserResponse?.data?.params?.err === null
        ) {
          getNotification(editableUserId, profileUpdateNotificationKey);
          showToastMessage(t(successUpdateMessage), 'success');
          telemetryCallbacks(telemetryUpdateKey);

          UpdateSuccessCallback();
          // localStorage.removeItem('BMGSData');
        } else {
          // console.error('Error update user:', error);
          showToastMessage(t(failureUpdateMessage), 'error');
        }
      } catch (error) {
        console.error('Error update user:', error);
        showToastMessage(t(failureUpdateMessage), 'error');
      }
    } else {
      const isEqual =
        blockId.length === formData?.block.length &&
        blockId.every((val, i) => val === formData?.block[i]);
      if (!isEqual) {
        setSelectedCenterBatches(null);
      }
      setBlockId(formData?.block);
      console.log('############ new formdata', formData);
      setPrefilledFormData(formData);
      setShowNextForm(true);
      setButtonShow(false);
    }
  };
  const onCloseNextForm = (cohortdata) => {
    console.log('########## cohortdata', cohortdata);
    setSelectedCenterBatches(cohortdata);
    setShowNextForm(false);
    setButtonShow(true);
  };

  useEffect(() => {
    fetchCenterList();
  }, [blockId]);

  /*
  prefilled value type
  [
    {
      cohortId: '88cf0da0-8a10-41ad-b927-459f4d3a5945',
      name: 'nighoj',
      childData: [
        {
          cohortId: '6ccd597e-51d8-4f4b-b9c8-f0469075a0b4',
          name: 'matheran',
        },
      ],
    },
  ]
  */
  //load center list
  const fetchCenterList = async () => {
    const url = API_ENDPOINTS.cohortSearch;
    const header = {
      tenantId: localStorage.getItem('tenantId') || '',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      academicyearid: localStorage.getItem('academicYearId') || '',
    };
    const config = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        ...header,
      },
      data: {
        limit: 200,
        offset: 0,
        filters: {
          type: 'COHORT',
          block: blockId || [],
          status: ['active'],
        },
      },
    };
    setCenterList(null);

    // 1. Your original data
    let originalData = [];

    await axios(config)
      .then(async (response) => {
        if (response?.data?.result?.results?.cohortDetails) {
          originalData = response.data.result.results.cohortDetails;

          // 2. Filter and strip customFields
          const filteredCohorts = originalData
            .filter((item) => item.status === 'active')
            .map(({ customFields, ...rest }) => rest);

          // 3. Function to fetch child data for a given cohortId
          const fetchChildData = async (cohortId: string) => {
            try {
              // Replace with your real API call

              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...header,
                },
                body: JSON.stringify({
                  limit: 200,
                  offset: 0,
                  filters: {
                    type: 'BATCH',
                    status: ['active'],
                    parentId: [cohortId],
                  },
                }),
              });

              const data = await response.json();
              if (data?.result?.results?.cohortDetails) {
                const filteredBatch = data?.result?.results?.cohortDetails
                  .filter((item) => item.status === 'active')
                  .map(({ customFields, ...rest }) => rest);

                return filteredBatch;
              } else {
                return [];
              }
            } catch (error) {
              console.error(
                `Error fetching child data for cohortId ${cohortId}:`,
                error
              );
              return []; // or null or {}
            }
          };

          // 4. Main async function to enrich the data
          const enrichCohortsWithChildren = async () => {
            const enrichedCohorts = await Promise.all(
              filteredCohorts.map(async (cohort) => {
                const childData = await fetchChildData(cohort.cohortId);
                return {
                  ...cohort,
                  childData, // attach response here
                };
              })
            );

            console.log(enrichedCohorts);
            return enrichedCohorts;
          };

          // 5. Call it
          const cohortWithChildren = await enrichCohortsWithChildren();

          // 6. Remove empty childData
          const centerBatchList = cohortWithChildren.filter(
            (item) => item.childData && item.childData.length > 0
          );

          //prefilled value for user
          if (selectedCenterBatches == null && isReassign === true) {
            //set setSelectedCenterBatches
            let response = await getCohortList(editableUserId);
            console.log('###### responsedebug editableUserId', editableUserId);
            console.log('###### responsedebug mycohor', response);
            if (response?.result) {
              let centerId = await flresponsetotl(response.result);
              setSelectedCenterBatches(centerId);
              console.log('###### responsedebug centerId', centerId);
            }
          }

          setCenterList(centerBatchList);
        }
      })
      .catch((error) => {
        setCenterList([]);
      });
  };

  //createAccount
  const createAccount = async (centerBatchData) => {
    // setIsLoading(true);
    // 1. All parent cohortIds
    const parentCohortIds = centerBatchData.map((item) => item.cohortId);

    // 2. All child cohortIds
    const childCohortIds = centerBatchData.flatMap(
      (item) => item.childData?.map((child) => child.cohortId) || []
    );

    //final formdata
    let formDataCreate = prefilledFormData;
    formDataCreate['center'] = parentCohortIds;
    formDataCreate['batch'] = childCohortIds;
    // Optional extra root-level fields
    if (isReassign === true) {
      // Extra Field for cohort creation
      const transformedFormData = transformFormData(
        formDataCreate,
        alteredSchemaCB,
        extraFieldsUpdate
      );
      let payload = transformedFormData;
      // console.log(
      //   '######## debug issue facilitator transformedFormData',
      //   originalPrefilledFormData
      // );
      // console.log('######## debug formDataCreate', transformedFormData);

      const toSendBlockChangeNotification = isBlockDifferent(
        originalPrefilledFormData,
        transformedFormData
      );
      const toSendCenterChangeNotification = isCenterDifferent(
        originalPrefilledFormData,
        transformedFormData
      );
      
      try {
        // console.log('new', formData?.batch);
        // console.log(editPrefilledFormData?.batch, 'old');
        delete payload?.batch;
        console.log('payload', payload);
        const reassignmentPayload = {
          ...payload,
          userData: {
            firstName: editPrefilledFormData.firstName,
          },
        };
        const resp = await updateReassignUser(
          editableUserId,
          reassignmentPayload
        );
        if (resp) {
          const cohortIdPayload = getReassignPayload(
            editPrefilledFormData.batch,
            formDataCreate.batch
          );
          const res = await bulkCreateCohortMembers({
            userId: [editableUserId],
            cohortId: cohortIdPayload.cohortId,
            ...(cohortIdPayload.removedIds.length > 0 && {
              removeCohortId: cohortIdPayload.removedIds,
            }),
          });
          showToastMessage(t(successUpdateMessage), 'success');
          // Send notification if block or center is changed
          if (toSendBlockChangeNotification) {
            getNotification(editableUserId, blockReassignmentNotificationKey);
          }
          if (toSendCenterChangeNotification) {
            getNotification(editableUserId, centerUpdateNotificationKey);
          }
          telemetryCallbacks(telemetryUpdateKey);
          UpdateSuccessCallback();
        } else {
          // console.error('Error reassigning user:', error);
          showToastMessage(t(failureUpdateMessage), 'error');
        }
      } catch (error) {
        console.error('Error reassigning user:', error);
        showToastMessage(t(failureUpdateMessage + 'ssdsds'), 'error');
      }
    } else {
      // Extra Field for cohort creation
      const transformedFormData = transformFormData(
        formDataCreate,
        alteredSchemaCB,
        extraFields
      );
      transformedFormData.username = formDataCreate.email;
      const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
      transformedFormData.password = randomNum;
      if (transformedFormData?.batch) {
        const cohortIds = transformedFormData.batch;
        transformedFormData.tenantCohortRoleMapping[0]['cohortIds'] = cohortIds;
        delete transformedFormData.batch;
      }

      console.log(
        '######## debug issue facilitator transformedFormData',
        transformedFormData
      );

      //create user
      const responseUserData = await createUser(transformedFormData);
      if (responseUserData?.userData?.userId) {
        showToastMessage(t(successCreateMessage), 'success');

        telemetryCallbacks(telemetryCreateKey);
        SuccessCallback();

        // Send Notification with credentials to user
        try {
          await notificationCallback(
            successCreateMessage,
            notificationContext,
            notificationKey,
            transformedFormData,
            t,
            notificationMessage,
            type
          );
        } catch (notificationError) {
          console.error('Notification failed:', notificationError);
          // No failure toast here to prevent duplicate messages
        }
      } else {
        showToastMessage(t(failureCreateMessage), 'error');
      }
    }
  };

  function transformFormData(
    formData: Record<string, any>,
    schema: any,
    extraFields: Record<string, any> = {} // Optional root-level custom fields
  ) {
    const transformedData: Record<string, any> = {
      ...extraFields, // Add optional root-level custom fields dynamically
      customFields: [],
    };

    for (const key in formData) {
      if (schema.properties[key]) {
        const fieldSchema = schema.properties[key];

        if (fieldSchema.coreField === 0 && fieldSchema.fieldId) {
          // Use fieldId for custom fields
          transformedData.customFields.push({
            fieldId: fieldSchema.fieldId,
            value: formData[key] || '',
          });
        } else {
          // Use the field name for core fields
          transformedData[key] = formData[key] || '';
        }
      }
    }

    return transformedData;
  }

  return (
    <>
      {isLoading ? (
        <>
          <Loader showBackdrop={false} loadingText={t('COMMON.LOADING')} />
        </>
      ) : (
        alteredSchema &&
        alteredUiSchema && (
          <>
            {showNextForm ? (
              centerList ? (
                <Box>
                  <CohortBatchSelector
                    data={centerList}
                    prefillSelection={selectedCenterBatches || []}
                    onFinish={(selectedData) => {
                      console.log('Final selection:', selectedData);
                      createAccount(selectedData);
                    }}
                    t={t}
                    onCloseNextForm={onCloseNextForm}
                  />
                  {/* {JSON.stringify(centerList)} */}
                </Box>
              ) : (
                <CenteredLoader />
              )
            ) : (
              <DynamicForm
                // key={isChangeForm ? 'dynamicform' : 'defaultform'}
                schema={alteredSchema}
                uiSchema={alteredUiSchema}
                t={t}
                FormSubmitFunction={StepperFormSubmitFunction}
                prefilledFormData={prefilledFormData || {}}
                extraFields={isEdit ? extraFieldsUpdate : extraFields}
                hideSubmit={hideSubmit}
              />
            )}
          </>
        )
      )}
    </>
  );
};

export default FacilitatorForm;

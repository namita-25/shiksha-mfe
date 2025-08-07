import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import VillageSelection from './VillageSelection';
import { cohortHierarchy } from 'mfes/youthNet/src/utils/app.constant';
import { getStateBlockDistrictList } from 'mfes/youthNet/src/services/youthNet/Dashboard/VillageServices';
// import DynamicForm from '../../../../../../apps/admin-app-repo/src/components/DynamicForm/DynamicForm';
// import { fetchForm } from '../../../../../../apps/admin-app-repo/src/components/DynamicForm/DynamicFormCallback';
// import { FormContext } from '../../../../../../apps/admin-app-repo/src/components/DynamicForm/DynamicFormConstant';
import DynamicForm from '@shared-lib-v2/DynamicForm/components/DynamicForm';
import { FormContext } from '@shared-lib-v2/DynamicForm/components/DynamicFormConstant';
import { fetchForm } from '@shared-lib-v2/DynamicForm/components/DynamicFormCallback';

import { useTranslation } from 'react-i18next';
import { createUser } from 'mfes/youthNet/src/services/youthNet/Dashboard/UserServices';
import { getUserFullName, toPascalCase } from '@/utils/Helper';
import { sendCredentialService } from '@/services/NotificationService';
import { showToastMessage } from '@/components/Toastify';
import { filterSchema } from 'mfes/youthNet/src/utils/Helper';
import useSubmittedButtonStore from 'mfes/youthNet/src/store/useSubmittedButtonStore';
type FormSubmitFunctionType = (formData: any, payload: any) => Promise<void>;

interface MentorAssignmentProps {
  showAssignmentScreen: boolean;
  setShowAssignmentScreen: React.Dispatch<React.SetStateAction<boolean>>;
  formData: any;
  setFormData: any;
  FormSubmitFunction: FormSubmitFunctionType;
  onClose: any;
}
const MentorAssignment: React.FC<MentorAssignmentProps> = ({
  showAssignmentScreen,
  setShowAssignmentScreen,
  FormSubmitFunction,
  formData,
  setFormData,
  onClose,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedVillages, setSelectedVillages] = useState<
    Record<string, string[]>
  >({});
  const [blocks, setBlocks] = useState<any>([]);
  const [districtName, setDistrictName] = useState<any>('');
  //const [formData, setFormData] = useState<any>();
  const [sdbvFieldData, setSdbvFieldData] = useState<any>();
  const [totalVillageCount, setTotalVillageCount] = useState(0);

  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );
  const submittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.submittedButtonStatus
  );
  const [addSchema, setAddSchema] = useState(null);
  const [addUiSchema, setAddUiSchema] = useState(null);
  // const [showAssignmentScreen, setShowAssignmentScreen] = useState(false); // New state to toggle views

  const { t } = useTranslation();

  const handleVillageSelection = (blockId: string, villages: string[]) => {
    setSelectedVillages((prev) => ({
      ...prev,
      [blockId]: villages,
    }));
  };
  // console.log('selectedVillage', selectedVillages); //get count from here
  useEffect(() => {
    const count = Object.values(selectedVillages).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    setTotalVillageCount(count);
  }, [selectedVillages]);

  const handleBackToForm = () => setShowAssignmentScreen(false); // Back to form screen

  const handleBack = () => setSelectedBlock(null);

  const handleFinish = async () => {
    try {
      const assignedVillages = Object.entries(selectedVillages).map(
        ([blockId, villageIds]) => ({
          blockId,
          villageIds,
        })
      );
      const customFields = mapToCustomFields(assignedVillages, sdbvFieldData);
      console.log('customFields', customFields);
      let tenantCohortRoleMapping = [];
      tenantCohortRoleMapping[0] = {
        tenantId: localStorage.getItem('tenantId'),
        roleId: 'a5f1dbc9-2ad4-442c-b762-0e3fc1f6c6da',
      };
      const payload = formData;
      payload.tenantCohortRoleMapping = tenantCohortRoleMapping;
      payload.customFields = customFields;
      payload.username = formData.email;
      const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
      payload.password = randomNum;
      const responseUserData = await createUser(payload);
      if (responseUserData?.userData) {
        let creatorName;

        if (typeof window !== 'undefined' && window.localStorage) {
          creatorName = getUserFullName();
        }
        let replacements: { [key: string]: string };
        const key = 'onMentorCreate';
        const context = 'USER';
        const isQueue = false;

        replacements = {};
        if (creatorName) {
          replacements = {
            '{FirstName}': toPascalCase(payload?.firstName),
            '{UserName}': payload?.email,
            '{Password}': payload?.password,
            '{appUrl}':
              (process.env.NEXT_PUBLIC_TEACHER_APP_URL as string) || '', //TODO: check url
          };
        }

        const sendTo = {
          receipients: [payload?.email],
        };
        if (Object.keys(replacements).length !== 0 && sendTo) {
          const response = await sendCredentialService({
            isQueue,
            context,
            key,
            replacements,
            email: sendTo,
          });
          if (
            response?.email?.data[0]?.result ===
            'Email notification sent successfully'
          ) {
            onClose();

            showToastMessage(
              t('MENTOR.MENTOR_CREATED_SUCCESSFULLY'),
              'success'
            );
            setSubmittedButtonStatus(true);
          } else {
            console.log(' not checked');
            onClose();
            showToastMessage(t('MENTOR.MENTOR_CREATED'), 'success');
          }
          setSubmittedButtonStatus(!submittedButtonStatus);
        }
      }
    } catch (error: any) {
      if (error?.response?.data?.params?.err === 'User already exist.') {
        showToastMessage(error?.response?.data?.params?.err, 'error');
      } else {
        onClose();
      }
    }
  };

  // Example usage:
  // const schemaObj = {
  //   /* Your given schema and uiSchema here */
  // };

  const mapToCustomFields = (blockVillageData: any, fieldMapping: any) => {
    let userDataString = localStorage.getItem('userData');
    let userData: any = userDataString ? JSON.parse(userDataString) : null;
    const districtResult = userData.customFields.find(
      (item: any) => item.label === cohortHierarchy.DISTRICT
    );
    const stateResult = userData.customFields.find(
      (item: any) => item.label === cohortHierarchy.STATE
    );
    return [
      {
        fieldId: fieldMapping.block.fieldId,
        value: blockVillageData.map((item: any) => parseInt(item.blockId)),
      },
      {
        fieldId: fieldMapping.village.fieldId,
        value: blockVillageData.flatMap((item: any) => item.villageIds),
      },
      {
        fieldId: fieldMapping.state.fieldId,
        value: [stateResult?.selectedValues?.[0]?.id],
      },
      {
        fieldId: fieldMapping.district.fieldId,
        value: [districtResult?.selectedValues?.[0]?.id],
      },
    ];
  };

  useEffect(() => {
    const getData = async () => {
      let userDataString = localStorage.getItem('userData');
      let userData: any = userDataString ? JSON.parse(userDataString) : null;
      const districtResult = userData.customFields.find(
        (item: any) => item.label === cohortHierarchy.DISTRICT
      );
      setDistrictName(districtResult?.selectedValues?.[0]?.value);
      const transformedData = districtResult?.selectedValues?.map(
        (item: any) => ({
          id: item?.id,
          name: item?.value,
        })
      );

      const controllingfieldfk = [transformedData[0]?.id?.toString()];
      const fieldName = 'block';
      const blockResponse = await getStateBlockDistrictList({
        controllingfieldfk,
        fieldName,
      });

      const transformedBlockData = blockResponse?.result?.values?.map(
        (item: any) => ({
          id: item?.value,
          name: item?.label,
        })
      );
      setBlocks(transformedBlockData);
    };
    getData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const responseForm: any = await fetchForm([
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.mentor.context}&contextType=${FormContext.mentor.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.mentor.context}&contextType=${FormContext.mentor.contextType}`,
          header: { tenantid: localStorage.getItem('tenantId') },
        },
      ]);
      console.log('responseForm', responseForm);
      const { newSchema, extractedFields } = filterSchema(responseForm);

      setAddSchema(newSchema?.schema);
      const updatedUiSchema = {
        ...newSchema?.uiSchema,
        'ui:submitButtonOptions': {
          norender: true,
        },
      };
      setAddUiSchema(updatedUiSchema);
      setSdbvFieldData(extractedFields);
    };

    fetchData();
  }, []);

  // Show VillageSelection if a block is selected
  if (selectedBlock) {
    return (
      <VillageSelection
        blockId={selectedBlock.id}
        blockName={selectedBlock.name}
        onBack={handleBack}
        selectedVillages={selectedVillages[selectedBlock.id] || []}
        onSelectionChange={(villages: any) =>
          handleVillageSelection(selectedBlock.id, villages)
        }
      />
    );
  }

  // Show DynamicForm first, then Assignment UI after submission
  return (
    <>
      {!showAssignmentScreen ? (
        addSchema &&
        addUiSchema && (
          <DynamicForm
            hideSubmit={true}
            schema={addSchema}
            uiSchema={addUiSchema}
            FormSubmitFunction={FormSubmitFunction}
            prefilledFormData={formData || {}}
          />
        )
      ) : (
        <Box display="flex" flexDirection="column">
          <Button variant="text" color="primary" onClick={handleBackToForm}>
            {t('MENTOR.BACK_TO_FORM')}
          </Button>
          <Typography
            sx={{ fontSize: '14px', color: '#1F1B13', fontWeight: '400' }}
          >
            {t('MENTOR.ASSIGN_VILLAGES_FROM_BLOCKS')}
          </Typography>
          <Typography
            sx={{ fontSize: '14px', color: '#1F1B13', fontWeight: '400' }}
            color="textSecondary"
            gutterBottom
          >
            {t('MENTOR.ASSIGN_VILLAGES_FINISH')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ fontSize: '14px', color: '#7C766F', fontWeight: '400' }}
            mt={2}
          >
            {districtName} {t('MENTOR.DISTRICTS')} (
            {t('MENTOR.SELECTED_VILLAGE_COUNT', {
              totalVillageCount: totalVillageCount,
            })}
            )
          </Typography>

          <Box
          // display="grid"
          // gridTemplateColumns="repeat(2, 1fr)"
          // gap={2}
          >
            {blocks.map(({ id, name }: any) => (
              <Box
                key={id}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '10px',
                }}
                onClick={() => setSelectedBlock({ id, name })}
              >
                <Box>
                  <Typography
                    sx={{
                      color: '#1F1B13',
                      fontWeight: '400',
                      fontSize: '16px',
                    }}
                    variant="h6"
                  >
                    {name}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#635E57',
                      fontWeight: '400',
                      fontSize: '14px',
                    }}
                    color="text.secondary"
                  >
                    {selectedVillages[id]?.length || 0}{' '}
                    {t('MENTOR.VILLAGES_SELECTED')}
                  </Typography>
                </Box>
                <IconButton>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinish}
              disabled={Object.values(selectedVillages).every(
                (villages) => villages.length === 0
              )}
              sx={{ width: '100%' }}
            >
              {t('MENTOR.FINISH_ASSIGN')}
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MentorAssignment;

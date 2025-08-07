// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RoleId, Status } from '@/utils/app.constant';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
// admin-app
import AddEditUser from '@/components/EntityForms/AddEditUser/AddEditUser';
import SimpleModal from '@/components/SimpleModalV2';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  extractMatchingKeys,
  fetchForm,
  searchListData,
} from '@/components/DynamicForm/DynamicFormCallback';
import { FormContext } from '@/components/DynamicForm/DynamicFormConstant';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { fetchUserData } from '@/utils/Helper';
import { getUserDetails } from '@/services/ProfileService';

const LearnerManage = ({
  open,
  onClose,
  onLearnerAdded,
  cohortId,
  isReassign,
  customFields,
  userId,
  isEditProfile = false,
}: any) => {
  const theme = useTheme<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [addSchema, setAddSchema] = useState(null);
  const [addEditSchema, setAddEditSchema] = useState(null);
  const [addEditUiSchema, setAddEditUiSchema] = useState(null);
  const [addUiSchema, setAddUiSchema] = useState(null);
  const [prefilledAddFormData, setPrefilledAddFormData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = React.useState<boolean>(open);
  const [isEdit, setIsEdit] = useState(false);
  const [editableUserId, setEditableUserId] = useState('');
  const [roleId, setRoleID] = useState('');
  const [tenantId, setTenantId] = useState('');
  // const [isReassign, setIsReassign] = useState(false);
  const [checked, setChecked] = useState(false);
  const [userID, setUserId] = useState('');
  const [centerSelectiveValue, setCenterSelectiveValue] = useState('');
  const [cohorts, setCohorts] = useState([]);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    village: '',
  });
  const [reason, setReason] = useState('');
  const [memberShipID, setMemberShipID] = useState('');
  const [blockFieldId, setBlockFieldId] = useState('');
  const [districtFieldId, setDistrictFieldId] = useState('');
  const [villageFieldId, setVillageFieldId] = useState('');
  const [parentId, setParentId] = useState('');
  const { t, i18n } = useTranslation();
  const searchStoreKey = 'learner';

  useEffect(() => {
    // Fetch form schema from API and set it in state.
    const fetchData = async () => {
      const responseForm = await fetchForm([
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.learner.context}&contextType=${FormContext.learner.contextType}`,
          header: {},
        },
        {
          fetchUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/form/read?context=${FormContext.learner.context}&contextType=${FormContext.learner.contextType}`,
          header: {
            tenantid: localStorage.getItem('tenantId'),
          },
        },
      ]);
      console.log('responseForm', responseForm);
      setAddEditSchema(responseForm?.schema);
      setAddEditUiSchema(responseForm?.uiSchema);

      //unit name is missing from required so handled from frotnend
      let alterSchema = responseForm?.schema;
      let alterUISchema = responseForm?.uiSchema;
      let requiredArray = alterSchema?.required;
      const mustRequired = [
        'firstName',
        'lastName',
        // 'email',
        'mobile',
        'dob',
        'gender',
        'state',
        'district',
        'block',
        'village',
        'center',
        'batch',
        'username',
      ];
      // Merge only missing items from required2 into required1
      mustRequired.forEach((item) => {
        if (!requiredArray.includes(item)) {
          requiredArray.push(item);
        }
      });
      //no required

      alterSchema.required = requiredArray;
      //add max selection custom
      if (alterSchema?.properties?.state) {
        alterSchema.properties.state.maxSelection = 1;
      }
      if (alterSchema?.properties?.district) {
        alterSchema.properties.district.maxSelection = 1;
      }
      if (alterSchema?.properties?.block) {
        alterSchema.properties.block.maxSelection = 1;
      }
      if (alterSchema?.properties?.village) {
        alterSchema.properties.village.maxSelection = 1;
      }
      if (alterSchema?.properties?.center) {
        alterSchema.properties.center.maxSelection = 1;
      }
      if (alterSchema?.properties?.batch) {
        alterSchema.properties.batch.maxSelection = 1;
      }

      const requiredKeys = isReassign
        ? ['state', 'district', 'block']
        : ['state', 'district', 'block', 'center', 'batch'];
      //set ui schema hide
      const updatedUiSchema = { ...alterUISchema };
      // Clone each key's config and set widget to 'hidden'
      if (!isReassign) {
        requiredKeys.forEach((key) => {
          if (updatedUiSchema.hasOwnProperty(key)) {
            updatedUiSchema[key] = {
              ...updatedUiSchema[key],
              'ui:widget': 'hidden',
            };
          }
        });
        alterUISchema = updatedUiSchema;
      } else {
        requiredKeys.forEach((key) => {
          if (updatedUiSchema.hasOwnProperty(key)) {
            updatedUiSchema[key] = {
              ...updatedUiSchema[key],
              'ui:disabled': true,
            };
          }
        });
        alterUISchema = updatedUiSchema;
      }

      //setprefilled formDat for re-assign functionality
      if (isReassign) {
        let batchList = await fetchUserData(userId);
        let tempFormData =
          extractMatchingKeys({ customFields }, alterSchema) ?? {};
        tempFormData = {
          ...tempFormData,
          batch: batchList,
        };
        setPrefilledAddFormData(tempFormData);
        console.log('@@@@@@@@@', tempFormData);
      }
      if (isEditProfile) {
        const user = await getUserDetails(userId, true);
        // console.log('##### user', user);
        let tempFormData = extractMatchingKeys(
          user?.result?.userData,
          alterSchema
        );
        const modifiedFormData = {
          ...tempFormData,
          mobile: tempFormData.mobile?.toString?.() || '',
        };
        setPrefilledAddFormData(modifiedFormData);
        console.log('tempFormData', modifiedFormData);
      }

      const districtFieldId =
        responseForm?.schema?.properties?.district?.fieldId;
      const blockFieldId = responseForm?.schema?.properties?.block?.fieldId;
      const villageFieldId = responseForm?.schema?.properties?.village?.fieldId;

      // const centerFieldId = responseForm.schema.properties.center.fieldId;

      setBlockFieldId(blockFieldId);
      setDistrictFieldId(districtFieldId);
      setVillageFieldId(villageFieldId);
      setAddSchema(alterSchema);
      setAddUiSchema(alterUISchema);
    };
    fetchData();
    setRoleID(RoleId.STUDENT);
    setTenantId(localStorage.getItem('tenantId'));
  }, []);

  useEffect(() => {
    if (open === true) {
      let initialFormData = {};
      if (localStorage.getItem('userData')) {
        try {
          const customFields = JSON.parse(
            localStorage.getItem('userData')
          ).customFields;

          const getSelectedValueIds = (label) => {
            const field = customFields.find(
              (f) => f.label.toLowerCase() === label.toLowerCase()
            );
            return field?.selectedValues?.map((val) => val.id.toString()) || [];
          };

          const stateIds = getSelectedValueIds('STATE');
          const districtIds = getSelectedValueIds('DISTRICT');
          const blockIds = getSelectedValueIds('BLOCK');
          // const villageIds = getSelectedValueIds('VILLAGE');
          initialFormData = {
            state: stateIds,
            district: districtIds,
            block: blockIds,
            // village: villageIds,
            center: [localStorage.getItem('centerId')],
            batch: [cohortId],
          };
        } catch (e) {}
      }
      console.log('######### setPrefilledAddFormData', initialFormData);
      setPrefilledAddFormData(initialFormData);
      setIsEdit(false);
      // setIsReassign(false);
      setEditableUserId('');
    }
  }, [open]);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    onClose();
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
    program: tenantId,
    // username: 'Leaner',
    password: Math.floor(10000 + Math.random() * 90000),
  };
  const successUpdateMessage = 'LEARNERS.LEARNER_UPDATED_SUCCESSFULLY';
  const telemetryUpdateKey = 'scp-learner-updated-successfully';
  const failureUpdateMessage = 'LEARNERS.NOT_ABLE_UPDATE_LEARNER';
  const successCreateMessage = 'LEARNERS.LEARNER_CREATED_SUCCESSFULLY';
  const telemetryCreateKey = 'scp-learner-created-successfully';
  const failureCreateMessage = 'LEARNERS.NOT_ABLE_CREATE_LEARNER';
  const notificationKey = 'onLearnerCreated';
  const notificationMessage = 'LEARNERS.USER_CREDENTIALS_WILL_BE_SEND_SOON';
  const notificationContext = 'USER';

  return (
    <>
      {addSchema && prefilledAddFormData && (
        <SimpleModal
          open={openModal}
          onClose={handleCloseModal}
          showFooter={true}
          primaryText={
            isEdit || isEditProfile
              ? t('Update')
              : isReassign
              ? t('Reassign')
              : t('Create')
          }
          id="dynamic-form-id"
          modalTitle={
            isEdit || isEditProfile
              ? t('LEARNERS.EDIT_LEARNER')
              : isReassign
              ? t('LEARNERS.RE_ASSIGN_LEARNER')
              : t('LEARNERS.NEW_LEARNER')
          }
        >
          <AddEditUser
            SuccessCallback={() => {
              onClose();
              onLearnerAdded();
              setOpenModal(false);
            }}
            schema={isEditProfile ? addEditSchema : addSchema}
            uiSchema={isEditProfile ? addEditUiSchema : addUiSchema}
            editPrefilledFormData={prefilledAddFormData}
            isEdit={isEdit || isEditProfile}
            isReassign={isReassign}
            isExtraFields={true}
            editableUserId={
              isReassign || isEditProfile ? userId : editableUserId
            }
            UpdateSuccessCallback={() => {
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
            villageFieldId={villageFieldId}
            hideSubmit={true}
            type={'learner'}
          />
        </SimpleModal>
      )}
    </>
  );
};

export default LearnerManage;

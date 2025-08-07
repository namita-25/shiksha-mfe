//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import { TextField, Container, Typography } from '@mui/material';
import { Layout as SharedLayout } from '@shared-lib';
import _ from 'lodash'; // Lodash for deep comparison
import CustomMultiSelectWidget from './RJSFWidget/CustomMultiSelectWidget';
import CustomCheckboxWidget from './RJSFWidget/CustomCheckboxWidget';
import CustomDateWidget from './RJSFWidget/CustomDateWidget';
import SearchTextFieldWidget from './RJSFWidget/SearchTextFieldWidget';
import CustomSingleSelectWidget from './RJSFWidget/CustomSingleSelectWidget';
import CustomRadioWidget from './RJSFWidget/CustomRadioWidget';
import CustomTextFieldWidget from './RJSFWidget/CustomTextFieldWidget';
import CustomFileUpload from './RJSFWidget/CustomFileUpload';
import {
  calculateAgeFromDate,
  toPascalCase,
  transformLabel,
} from '../utils/Helper';
import { CustomObjectFieldTemplate } from './FormTemplate/ObjectFieldTemplate';
import { useTranslation } from '../../lib/context/LanguageContext';

// import { useTranslation } from '@shared-lib'; // Updated import
const DynamicForm = ({
  schema,
  uiSchema,
  SubmitaFunction,
  isCallSubmitInHandle,
  prefilledFormData,
  FormSubmitFunction,
  extraFields,
  hideSubmit,
  type,
  isCompleteProfile=false,
  isReassign=false
}: any) => {
  const { t } = useTranslation();
  const hasPrefilled = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const [formSchema, setFormSchema] = useState(schema);
  const [formUiSchemaOriginal, setFormUiSchemaOriginal] = useState(uiSchema);
  const [formUiSchema, setFormUiSchema] = useState(uiSchema);
  const [formData, setFormData] = useState(prefilledFormData);
  const [dependentSchema, setDependentSchema] = useState([]);
  const [isInitialCompleted, setIsInitialCompleted] = useState(false);
  const [hideAndSkipFields, setHideAndSkipFields] = useState({});
  const [isRenderCompleted, setIsRenderCompleted] = useState(false);

  //custom validation on formData for learner fields hide on dob
  useEffect(() => {
    if (type == 'learner'  && !isReassign) {
      // ...existing code...
      console.log('hello');
      let requiredKeys = ['parent_phone'];
      let requiredKeys2 = ['mobile'];
      console.log('formDatadynamicform', formData.family_member_details);
      console.log('updatedUiSchema------', formUiSchema);

      if (formData?.dob) {
        let age = calculateAgeFromDate(formData?.dob);
        let oldFormSchema = formSchema;
        let oldFormUiSchema = formUiSchema;
        let requiredArray = oldFormSchema?.required;

        //if learner form then only apply
        if (oldFormSchema?.properties?.guardian_relation) {
          if (age < 18) {
            delete formData?.mobile;
            // Merge only missing items from required2 into required1 guardian details
            requiredKeys.forEach((item) => {
              if (!requiredArray.includes(item)) {
                  requiredArray.push(item);
              }
            });

            // remove from required mobile
            requiredArray = requiredArray.filter(
              (key) => !requiredKeys2.includes(key)
            );

            //set ui schema show
            const updatedUiSchema = { ...oldFormUiSchema };
            // Clone each key's config and set widget to 'hidden'
            requiredKeys.forEach((key) => {
              if (updatedUiSchema.hasOwnProperty(key)) {
                updatedUiSchema[key] = {
                  ...updatedUiSchema[key],
                  'ui:widget': 'CustomTextFieldWidget',
                };
              }
            });

            //hide mobile
            // Clone each key's config and set widget to 'hidden'
            requiredKeys2.forEach((key) => {
              if (updatedUiSchema.hasOwnProperty(key)) {
                updatedUiSchema[key] = {
                  ...updatedUiSchema[key],
                  // 'ui:widget': 'hidden',
                  'ui:disabled': true,
                };
              }
            });
            oldFormUiSchema = updatedUiSchema;
          } else {
            delete formData?.parent_phone;
            delete formData?.guardian_relation;
            delete formData?.guardian_name;
            // remove from required
            requiredArray = requiredArray.filter(
              (key) => !requiredKeys.includes(key)
            );

            // Merge only missing items from required2 into required1 guardian details
            requiredKeys2.forEach((item) => {
              if (!requiredArray.includes(item)) {
                requiredArray.push(item);
              }
            });

            //set ui schema hide
            const updatedUiSchema = { ...oldFormUiSchema };
            // Clone each key's config and set widget to 'hidden'
            requiredKeys.forEach((key) => {
              if (updatedUiSchema.hasOwnProperty(key)) {
                updatedUiSchema[key] = {
                  ...updatedUiSchema[key],
                  'ui:widget': 'hidden',
                };
              }
            });

            //show mobile
            // Clone each key's config and set widget to 'hidden'
            requiredKeys2.forEach((key) => {
              if (updatedUiSchema.hasOwnProperty(key)) {
                updatedUiSchema[key] = {
                  ...updatedUiSchema[key],
                  'ui:widget': 'CustomTextFieldWidget',
                };
              }
            });

            oldFormUiSchema = updatedUiSchema;
          }
          oldFormSchema.required = requiredArray;
          setFormSchema(oldFormSchema);
          setFormUiSchema(oldFormUiSchema);
        }
      } else {
        //initially hide all
        let oldFormSchema = formSchema;
        let oldFormUiSchema = formUiSchema;
        let requiredArray = oldFormSchema?.required;

        // remove from required
        requiredArray = requiredArray.filter(
          (key) => !requiredKeys.includes(key)
        );
        requiredArray = requiredArray.filter(
          (key) => !requiredKeys2.includes(key)
        );

        //set ui schema hide
        const updatedUiSchema = { ...oldFormUiSchema };
        // Clone each key's config and set widget to 'hidden'
        requiredKeys.forEach((key) => {
          if (updatedUiSchema.hasOwnProperty(key)) {
            updatedUiSchema[key] = {
              ...updatedUiSchema[key],
              'ui:widget': 'hidden',
            };
          }
        });
        requiredKeys2.forEach((key) => {
          if (updatedUiSchema.hasOwnProperty(key)) {
            updatedUiSchema[key] = {
              ...updatedUiSchema[key],
              // 'ui:widget': 'hidden',
              'ui:disabled': true,
            };
          }
        });

        oldFormUiSchema = updatedUiSchema;
        oldFormSchema.required = requiredArray;
        setFormSchema(oldFormSchema);
        setFormUiSchema(oldFormUiSchema);
      }

      if (!formData.family_member_details) {
        // Remove all three fields if nothing is selected
        setFormUiSchema((prevUiSchema) => {
          const updatedUiSchema = { ...prevUiSchema };
          delete updatedUiSchema.mother_name;
          delete updatedUiSchema.father_name;
          delete updatedUiSchema.spouse_name;
          return updatedUiSchema;
        });

        setFormSchema((prevSchema) => {
          const updatedSchema = { ...prevSchema };
          if (updatedSchema.properties) {
            updatedSchema.properties = { ...updatedSchema.properties };
            delete updatedSchema.properties.mother_name;
            delete updatedSchema.properties.father_name;
            delete updatedSchema.properties.spouse_name;
          }
          if (Array.isArray(updatedSchema.required)) {
            updatedSchema.required = updatedSchema.required.filter(
              (key) =>
                key !== 'mother_name' &&
                key !== 'father_name' &&
                key !== 'spouse_name'
            );
          }
          return updatedSchema;
        });
      } else {
        // Helper to add a field
        const addField = (fieldKey, title) => {
          setFormUiSchema((prevUiSchema) => ({
            ...prevUiSchema,
            [fieldKey]: {
              'ui:widget': 'CustomTextFieldWidget',
              'ui:options': {
                validateOnBlur: true,
                hideError: true,
              },
            },
          }));

          setFormSchema((prevSchema) => {
            const updatedSchema = { ...prevSchema };
            if (updatedSchema.properties) {
              updatedSchema.properties = { ...updatedSchema.properties };
              updatedSchema.properties[fieldKey] = {
                type: 'string',
                title,
              };
            }
            if (
              Array.isArray(updatedSchema.required) &&
              !updatedSchema.required.includes(fieldKey)
            ) {
              updatedSchema.required = [...updatedSchema.required, fieldKey];
            }
            return updatedSchema;
          });
        };
        console.log('editlearner', formUiSchema);

        // Remove the other two fields
        const removeFields = (fields) => {
          console.log('removeFields', fields);
          setFormUiSchema((prevUiSchema) => {
            const updatedUiSchema = { ...prevUiSchema };
            fields.forEach((field) => delete updatedUiSchema[field]);
            console.log('updatedUiSchema', updatedUiSchema);

            return updatedUiSchema;
          });
          setFormUiSchemaOriginal((prevUiSchema) => {
            const updatedUiSchema = { ...prevUiSchema };
            fields.forEach((field) => delete updatedUiSchema[field]);
            console.log('updatedUiSchema', updatedUiSchema);

            return updatedUiSchema;
          });

          setFormSchema((prevSchema) => {
            const updatedSchema = { ...prevSchema };
            if (updatedSchema.properties) {
              updatedSchema.properties = { ...updatedSchema.properties };
              fields.forEach((field) => delete updatedSchema.properties[field]);
            }
            if (Array.isArray(updatedSchema.required)) {
              updatedSchema.required = updatedSchema.required.filter(
                (key) => !fields.includes(key)
              );
            }

            return updatedSchema;
          });
        };
        if (formData.family_member_details === 'mother') {
          addField('mother_name', 'Mother Name');
          removeFields(['father_name', 'spouse_name']);
          setFormData((prev) => ({
            ...prev,
            mother_name: !hasPrefilled.current
              ? prefilledFormData?.mother_name || prev.mother_name || ''
              : prev.mother_name || '',
            father_name: undefined,
            spouse_name: undefined,
          }));
          hasPrefilled.current = true;
        } else if (formData.family_member_details === 'father') {
          addField('father_name', 'Father Name');
          removeFields(['mother_name', 'spouse_name']);
          setFormData((prev) => ({
            ...prev,
            father_name: !hasPrefilled.current
              ? prefilledFormData?.father_name || prev.father_name || ''
              : prev.father_name || '',
            mother_name: undefined,
            spouse_name: undefined,
          }));
          hasPrefilled.current = true;
        } else if (formData.family_member_details === 'spouse') {
          addField('spouse_name', 'Spouse Name');
          removeFields(['mother_name', 'father_name']);
          setFormData((prev) => ({
            ...prev,
            spouse_name: !hasPrefilled.current
              ? prefilledFormData?.spouse_name || prev.spouse_name || ''
              : prev.spouse_name || '',
            mother_name: undefined,
            father_name: undefined,
          }));
          hasPrefilled.current = true;
        }
      }

      console.log('editlearner', formUiSchema);

      // Remove the other two fields
      const removeFields = (fields) => {
        console.log('removeFields', fields);
        setFormUiSchema((prevUiSchema) => {
          const updatedUiSchema = { ...prevUiSchema };
          fields.forEach((field) => delete updatedUiSchema[field]);
          console.log('updatedUiSchema', updatedUiSchema);

          return updatedUiSchema;
        });
        setFormUiSchemaOriginal((prevUiSchema) => {
          const updatedUiSchema = { ...prevUiSchema };
          fields.forEach((field) => delete updatedUiSchema[field]);
          console.log('updatedUiSchema', updatedUiSchema);

          return updatedUiSchema;
        });

        setFormSchema((prevSchema) => {
          const updatedSchema = { ...prevSchema };
          if (updatedSchema.properties) {
            updatedSchema.properties = { ...updatedSchema.properties };
            fields.forEach((field) => delete updatedSchema.properties[field]);
          }
          if (Array.isArray(updatedSchema.required)) {
            updatedSchema.required = updatedSchema.required.filter(
              (key) => !fields.includes(key)
            );
          }

          return updatedSchema;
        });
      };
      if (formData.phone_type_accessible === 'nophone') {
        removeFields(['own_phone_check']);
      } else {
        // 1. Add back to schema if missing
        setFormSchema((prevSchema) => {
          if (!prevSchema.properties?.own_phone_check && !isCompleteProfile) {
            return {
              ...prevSchema,
              properties: {
                ...prevSchema.properties,
                own_phone_check: {
                  type: 'string',
                  title: t('DOES_THIS_PHONE_BELONG_TO_YOU'),
                  coreField: 0,
                  fieldId: 'd119d92f-fab7-4c7d-8370-8b40b5ed23dc',
                  field_type: 'radio',
                  isRequired: true,
                  enum: ['yes', 'no'],
                  enumNames: ['YES', 'NO'],
                },
              },
              required: prevSchema.required?.includes('own_phone_check')
                ? prevSchema.required
                : [...(prevSchema.required || []), 'own_phone_check'],
            };
          }
          return prevSchema;
        });

        // 2. Add back to uiSchema
        setFormUiSchema((prevUiSchema) => ({
          ...prevUiSchema,
          own_phone_check: {
            'ui:widget': 'CustomRadioWidget',
            'ui:options': {
              hideError: true,
            },
          },
        }));
      }
    }
  }, [formData]);

  const widgets = {
    CustomMultiSelectWidget,
    CustomCheckboxWidget,
    CustomDateWidget,
    SearchTextFieldWidget,
    CustomSingleSelectWidget,
    CustomRadioWidget,
    CustomTextFieldWidget,
    CustomFileUpload,
  };

  useEffect(() => {
    if (isInitialCompleted === true) {
      // setFormData;
      //fix for auto submit and render
      if (Object.keys(prefilledFormData).length === 0) {
        if (type !== 'centers') prefilledFormData = { test: 'test' };
        else prefilledFormData = { type: 'COHORT' };
      }
      renderPrefilledForm();
    }
  }, [isInitialCompleted, type]);

  useEffect(() => {
    if (isCallSubmitInHandle) {
      SubmitaFunction(formData);
    }
  }, [formData]);

  useEffect(() => {
    if (isRenderCompleted === true && isReassign) {
      //commented below to fix bug of no district load
      handleChange({ formData: prefilledFormData });
    }
  }, [isRenderCompleted]);

  useEffect(() => {
    function extractSkipAndHide(schema: any): Record<string, any> {
      const skipAndHideMap: Record<string, any> = {};

      Object.entries(schema.properties).forEach(
        ([key, value]: [string, any]) => {
          if (value.extra?.skipAndHide) {
            skipAndHideMap[key] = value.extra.skipAndHide;
          }
        }
      );

      return skipAndHideMap;
    }
    const extractedSkipAndHide = extractSkipAndHide(schema);
    setHideAndSkipFields(extractedSkipAndHide);
    // console.log('extractedSkipAndHide', extractedSkipAndHide);
    // console.log('formUiSchema', uiSchema);
  }, [schema]);

  const prevFormData = useRef({});

  useEffect(() => {
    const fetchApiData = async (schema) => {
      const initialApis = extractApiProperties(schema, 'initial');
      const dependentApis = extractApiProperties(schema, 'dependent');
      setDependentSchema(dependentApis);
      // // console.log('!!!', initialApis);
      try {
        const apiRequests = initialApis.map((field) => {
          const { api } = field;
          // If header exists, replace values with localStorage values
          let customHeader = api?.header
            ? {
                tenantId:
                  api.header.tenantId === '**'
                    ? localStorage.getItem('tenantId') || ''
                    : api.header.tenantId,
                Authorization:
                  api.header.Authorization === '**'
                    ? `Bearer ${localStorage.getItem('token') || ''}`
                    : api.header.Authorization,
                academicyearid:
                  api.header.academicyearid === '**'
                    ? localStorage.getItem('academicYearId') || ''
                    : api.header.academicyearid,
              }
            : {};
          const config = {
            method: api.method,
            url: api.url,
            headers: { 'Content-Type': 'application/json', ...customHeader },
            ...(api.method === 'POST' && { data: api.payload }),
          };
          return axios(config)
            .then((response) => ({
              fieldKey: field.key,
              data: getNestedValue(response.data, api.options.optionObj),
            }))
            .catch((error) => ({
              error: error,
              fieldKey: field.key,
            }));
        });

        const responses = await Promise.all(apiRequests);
        // console.log('API Responses:', responses);
        // Update schema dynamically
        if (!responses[0]?.error) {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              // // console.log('Data:', data);
              // // console.log('fieldKey:', fieldKey);
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data
                      ? data?.map((item) => item?.[value].toString())
                      : ['Select'],
                    enumNames: data
                      ? data?.map((item) =>
                          transformLabel(item?.[label].toString())
                        )
                      : ['Select'],
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data
                    ? data?.map((item) => item?.[value].toString())
                    : ['Select'],
                  enumNames: data
                    ? data?.map((item) =>
                        transformLabel(item?.[label].toString())
                      )
                    : ['Select'],
                };
              }
            });
            return { ...prevSchema, properties: updatedProperties };
          });
        } else {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            let fieldKey = responses[0]?.fieldKey;
            if (updatedProperties[fieldKey]?.isMultiSelect === true) {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                items: {
                  type: 'string',
                  enum: ['Select'],
                  enumNames: ['Select'],
                },
              };
            } else {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                enum: ['Select'],
                enumNames: ['Select'],
              };
            }
            return { ...prevSchema, properties: updatedProperties };
          });
        }

        //setIsInitialCompleted
        setIsInitialCompleted(true);
      } catch (error) {
        // console.error("Error fetching API data:", error);
      }
    };

    const getNestedValue = (obj, path) => {
      // // console.log("@@@@", obj)
      // // console.log("path", path)
      if (path === '') {
        return obj;
      } else {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
      }
    };

    // Call the function
    fetchApiData(schema);

    // console.log('formSchema !!!!!', formSchema);
    //replace title with language constant
    const updateSchemaTitles = (schema, t) => {
      if (!schema || typeof schema !== 'object') return schema;

      const updatedSchema = { ...schema };

      if (updatedSchema.title) {
        updatedSchema.title = t(updatedSchema.title);
      }

      if (updatedSchema.properties) {
        updatedSchema.properties = Object.keys(updatedSchema.properties).reduce(
          (acc, key) => {
            acc[key] = updateSchemaTitles(updatedSchema.properties[key], t);
            return acc;
          },
          {}
        );
      }

      return updatedSchema;
    };
    // Dynamically update schema titles
    const translatedSchema = updateSchemaTitles(formSchema, t);
    setFormSchema(translatedSchema);
  }, []);

  // console.log('schema', schema)
  const extractApiProperties = (schema, callType) => {
    return Object.entries(schema.properties)
      .filter(([_, value]) => value.api && value.api.callType === callType)
      .map(([key, value]) => ({ key, ...value }));
  };

  const renderPrefilledForm = () => {
    const temp_prefilled_form = { ...prefilledFormData };
    // console.log('temp', temp_prefilled_form);
    const dependentApis = extractApiProperties(schema, 'dependent');
    const initialApis = extractApiProperties(schema, 'initial');
    // // console.log('initialApis', initialApis);
    // console.log('dependentFields', dependentApis);
    if (dependentApis.length > 0 && initialApis.length > 0) {
      let initialKeys = initialApis.map((item) => item.key);
      let dependentKeys = dependentApis.map((item) => item.key);
      dependentKeys = [...initialKeys, ...dependentKeys];
      // console.log('dependentKeys', dependentKeys);
      // console.log('prefilledFormData', temp_prefilled_form);
      const removeDependentKeys = (formData, keysToRemove) => {
        const updatedData = { ...formData };
        keysToRemove.forEach((key) => delete updatedData[key]);
        return updatedData;
      };
      let updatedFormData = removeDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      // // console.log('updatedFormData', updatedFormData);
      setFormData(updatedFormData);

      //prefill other dependent keys
      const filterDependentKeys = (
        formData: Record<string, any>,
        keysToKeep: string[]
      ) => {
        return Object.fromEntries(
          Object.entries(formData).filter(([key]) => keysToKeep.includes(key))
        );
      };
      let filteredFormData = filterDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      // console.log('filteredFormData', filteredFormData);
      const filteredFormDataKey = Object.keys(filteredFormData);
      // console.log('filteredFormDataKey', filteredFormDataKey);
      let filterDependentApis = [];
      for (let i = 0; i < filteredFormDataKey.length; i++) {
        filterDependentApis.push({
          key: filteredFormDataKey[i],
          data: schema.properties[filteredFormDataKey[i]],
        });
      }
      // console.log('filterDependentApis', filterDependentApis);
      //dependent calls
      const workingSchema = filterDependentApis;

      const getNestedValue = (obj, path) => {
        if (path === '') {
          return obj;
        } else {
          return path.split('.').reduce((acc, key) => acc && acc[key], obj);
        }
      };

      const fetchDependentApis = async () => {
        // Filter only the dependent APIs based on the changed field
        const dependentApis = workingSchema;
        try {
          // console.log('dependentApis dependentApis', dependentApis);
          const apiRequests = dependentApis.map((realField) => {
            const field = realField?.data;
            const { api } = realField?.data;
            const key = realField?.key;

            // console.log('API field:', field);

            const changedField = field?.api?.dependent;
            const changedFieldValue = temp_prefilled_form[changedField];
            let isMultiSelect = field?.isMultiSelect;
            let updatedPayload = replaceControllingField(
              api.payload,
              changedFieldValue,
              isMultiSelect
            );
            // Replace "**" in the payload with changedFieldValue
            // const updatedPayload = JSON.parse(
            //   JSON.stringify(api.payload).replace(/\*\*/g, changedFieldValue)
            // );
            // If header exists, replace values with localStorage values
            let customHeader = api?.header
              ? {
                  tenantId:
                    api.header.tenantId === '**'
                      ? localStorage.getItem('tenantId') || ''
                      : api.header.tenantId,
                  Authorization:
                    api.header.Authorization === '**'
                      ? `Bearer ${localStorage.getItem('token') || ''}`
                      : api.header.Authorization,
                  academicyearid:
                    api.header.academicyearid === '**'
                      ? localStorage.getItem('academicYearId') || ''
                      : api.header.academicyearid,
                }
              : {};
            const config = {
              method: api.method,
              url: api.url,
              headers: { 'Content-Type': 'application/json', ...customHeader },
              ...(api.method === 'POST' && { data: updatedPayload }),
            };
            if (key) {
              const changedField = key;

              // // console.log(`Field changed: ${changedField}, New Value: ${formData[changedField]}`);
              // // console.log('dependentSchema', dependentSchema);
              const workingSchema1 = dependentSchema?.filter(
                (item) => item.api && item.api.dependent === changedField
              );
              // // console.log('workingSchema1', workingSchema1);
              if (workingSchema1.length > 0) {
                const changedFieldValue = temp_prefilled_form[changedField];

                const getNestedValue = (obj, path) => {
                  if (path === '') {
                    return obj;
                  } else {
                    return path
                      .split('.')
                      .reduce((acc, key) => acc && acc[key], obj);
                  }
                };

                const fetchDependentApis = async () => {
                  // Filter only the dependent APIs based on the changed field
                  const dependentApis = workingSchema1;
                  try {
                    const apiRequests = dependentApis.map((field) => {
                      const { api, key } = field;

                      let isMultiSelect = field?.isMultiSelect;
                      let updatedPayload = replaceControllingField(
                        api.payload,
                        changedFieldValue,
                        isMultiSelect
                      );
                      // Replace "**" in the payload with changedFieldValue
                      // const updatedPayload = JSON.parse(
                      //   JSON.stringify(api.payload).replace(
                      //     /\*\*/g,
                      //     changedFieldValue
                      //   )
                      // );

                      // If header exists, replace values with localStorage values
                      let customHeader = api?.header
                        ? {
                            tenantId:
                              api.header.tenantId === '**'
                                ? localStorage.getItem('tenantId') || ''
                                : api.header.tenantId,
                            Authorization:
                              api.header.Authorization === '**'
                                ? `Bearer ${
                                    localStorage.getItem('token') || ''
                                  }`
                                : api.header.Authorization,
                            academicyearid:
                              api.header.academicyearid === '**'
                                ? localStorage.getItem('academicYearId') || ''
                                : api.header.academicyearid,
                          }
                        : {};
                      const config = {
                        method: api.method,
                        url: api.url,
                        headers: {
                          'Content-Type': 'application/json',
                          ...customHeader,
                        },
                        ...(api.method === 'POST' && { data: updatedPayload }),
                      };
                      return axios(config)
                        .then((response) => ({
                          fieldKey: field.key,
                          data: getNestedValue(
                            response.data,
                            api.options.optionObj
                          ),
                        }))
                        .catch((error) => ({
                          error: error,
                          fieldKey: field.key,
                        }));
                    });

                    const responses = await Promise.all(apiRequests);
                    // // console.log('API Responses:', responses);
                    if (!responses[0]?.error) {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        responses.forEach(({ fieldKey, data }) => {
                          // // console.log('Data:', data);
                          // // console.log('fieldKey:', fieldKey);
                          let label =
                            prevSchema.properties[fieldKey].api.options.label;
                          let value =
                            prevSchema.properties[fieldKey].api.options.value;
                          if (
                            updatedProperties[fieldKey]?.isMultiSelect === true
                          ) {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              items: {
                                type: 'string',
                                enum: data?.map((item) =>
                                  item?.[value].toString()
                                ),
                                enumNames: data?.map((item) =>
                                  transformLabel(item?.[label].toString())
                                ),
                              },
                            };
                          } else {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              enum: data?.map((item) =>
                                item?.[value].toString()
                              ),
                              enumNames: data?.map((item) =>
                                transformLabel(item?.[label].toString())
                              ),
                            };
                          }
                        });

                        return { ...prevSchema, properties: updatedProperties };
                      });
                    } else {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        let fieldKey = responses[0]?.fieldKey;
                        if (
                          updatedProperties[fieldKey]?.isMultiSelect === true
                        ) {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            items: {
                              type: 'string',
                              enum: ['Select'],
                              enumNames: ['Select'],
                            },
                          };
                        } else {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            enum: ['Select'],
                            enumNames: ['Select'],
                          };
                        }
                        return { ...prevSchema, properties: updatedProperties };
                      });
                    }
                  } catch (error) {
                    console.error('Error fetching dependent APIs:', error);
                  }
                };

                // Call the function
                fetchDependentApis();
              }
            }

            return axios(config).then((response) => ({
              fieldKey: key,
              data: getNestedValue(response.data, api.options.optionObj),
            }));
          });

          const responses = await Promise.all(apiRequests);
          // console.log('API Responses:', responses);
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              // console.log('Data:', data);
              // console.log('fieldKey:', fieldKey);
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data?.map((item) => item?.[value].toString()),
                    enumNames: data?.map((item) =>
                      transformLabel(item?.[label].toString())
                    ),
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data?.map((item) => item?.[value].toString()),
                  enumNames: data?.map((item) =>
                    transformLabel(item?.[label].toString())
                  ),
                };
              }
            });

            return { ...prevSchema, properties: updatedProperties };
          });
        } catch (error) {
          console.error('Error fetching dependent APIs:', error);
        }
      };

      // Call the function
      fetchDependentApis();

      //setFormData
      setFormData(temp_prefilled_form);

      function getSkipKeys(skipHideObject, formData) {
        let skipKeys = [];

        Object.keys(skipHideObject).forEach((key) => {
          if (formData[key] && skipHideObject[key][formData[key]]) {
            skipKeys = skipKeys.concat(skipHideObject[key][formData[key]]);
          }
        });

        return skipKeys;
      }

      const skipKeys = getSkipKeys(hideAndSkipFields, temp_prefilled_form);
      // console.log('skipKeys', skipKeys);
      let updatedUISchema = formUiSchemaOriginal;
      function hideFieldsInUISchema(uiSchema, fieldsToHide) {
        const updatedUISchema = { ...uiSchema };

        fieldsToHide.forEach((field) => {
          if (updatedUISchema[field]) {
            updatedUISchema[field] = {
              ...updatedUISchema[field],
              originalWidget: updatedUISchema[field]['ui:widget'], // Store original widget type
              'ui:widget': 'hidden',
            };
          }
        });

        return updatedUISchema;
      }
      const hiddenUISchema = hideFieldsInUISchema(updatedUISchema, skipKeys);
      setFormUiSchema(hiddenUISchema);
    }
    //Code patch: bug solved for prefilled dependent field options render
    setIsRenderCompleted(true);
  };

  const getDependentKeys = (schema, startKey) => {
    const properties = schema.properties;
    const dependentKeys = [];

    const findDependencies = (key) => {
      Object.keys(properties).forEach((propKey) => {
        const field = properties[propKey];
        if (field.api && field.api.dependent === key) {
          dependentKeys.push(propKey);
          findDependencies(propKey); // Recursively check deeper dependencies
        }
      });
    };

    findDependencies(startKey);
    return dependentKeys;
  };

  const hasObjectChanged = (oldObj, newObj) => {
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (let key of keys) {
      const oldValue = oldObj[key] || [];
      const newValue = newObj[key] || [];

      // Handle array comparison
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (oldValue.length !== newValue.length) return true;
        const isDifferent = oldValue.some(
          (val, index) => val !== newValue[index]
        );
        if (isDifferent) return true;
      }
      // Handle normal value comparison
      else if (oldValue !== newValue) {
        return true;
      }
    }

    return false;
  };

  // const replaceControllingField = (
  //   payload,
  //   changedFieldValue,
  //   isMultiSelect
  // ) => {
  //   // Clone the payload to avoid mutating original object
  //   let updatedPayload = { ...payload };
  //   console.log(updatedPayload)

  //   // Replace ** with value based on isMultiSelect
  //   const newValue = isMultiSelect
  //     ? changedFieldValue
  //     : String(changedFieldValue);

  //   // Iterate through the object keys and replace "**" wherever found
  //   Object.keys(updatedPayload).forEach((key) => {
  //     if (updatedPayload[key] === '**') {
  //       updatedPayload[key] = newValue;
  //     }
  //   });

  //   return updatedPayload;
  // };
  const replaceControllingField = (
    payload,
    changedFieldValue,
    isMultiSelect
  ) => {
    // Deep clone to avoid modifying the original object
    const updatedPayload = JSON.parse(JSON.stringify(payload));
    // Determine new value based on type
    const newValue = isMultiSelect
      ? Array.isArray(changedFieldValue)
        ? [...changedFieldValue]
        : [changedFieldValue]
      : changedFieldValue;

    // Recursive function to replace ** in nested objects/arrays
    const replaceNested = (obj) => {
      if (Array.isArray(obj)) {
        // If array, iterate through each element
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            replaceNested(item); // Recursive call for nested objects/arrays
          } else if (item === '**') {
            obj[index] = newValue;
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        // If object, iterate through keys
        Object.keys(obj).forEach((key) => {
          if (obj[key] === '**') {
            obj[key] = newValue;
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceNested(obj[key]); // Recursive call for nested objects/arrays
          }
        });
      }
    };

    // Start recursion from the root
    replaceNested(updatedPayload);

    return updatedPayload;
  };
  const getChangedField = (
    formData: Record<string, any>,
    prevFormData: Record<string, any>
  ) => {
    return Object.keys(formData).find((key) => {
      const newValue = formData[key];
      const oldValue = prevFormData[key];

      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        // Check if arrays have different elements (added/removed values)
        return (
          newValue.length !== oldValue.length ||
          !newValue.every((val) => oldValue.includes(val))
        );
      } else {
        // Check for primitive value changes
        return newValue !== oldValue;
      }
    });
  };

  const handleChange = ({
    formData,
    errors,
  }: {
    formData: any;
    errors: any;
  }) => {
    // const changedField = Object.keys(formData).find(
    //   (key) => formData[key] !== prevFormData.current[key]
    // );
    const changedField = getChangedField(formData, prevFormData.current);
    // console.log('hasObjectChanged prevFormData.current', prevFormData.current);
    console.log('hasObjectChanged formData', formData);
    // console.log(
    //   'hasObjectChanged hasObjectChanged(prevFormData.current, formData)',
    //   hasObjectChanged(prevFormData.current, formData)
    // );
    // console.log('hasObjectChanged changedField', changedField);

    if (hasObjectChanged(prevFormData.current, formData)) {
      console.log('hasObjectChanged in 1 formData', formData);
      if (changedField) {
        //error set
        console.log('errors', errors);
        setSubmitted(false);
        //find out all dependent keys
        const dependentKeyArray = getDependentKeys(schema, changedField);
        console.log('hasObjectChanged in 2 formData', formData);
        // console.log('hasObjectChanged dependent keys:', dependentKeyArray);
        dependentKeyArray.forEach((key) => {
          delete formData[key]; // Remove the key from formData
        });
        // console.log('hasObjectChanged formData', formData);

        setFormSchema((prevSchema) => {
          const updatedProperties = { ...prevSchema.properties };

          dependentKeyArray.forEach((key) => {
            if (updatedProperties[key]) {
              if (updatedProperties[key]?.isMultiSelect === true) {
                updatedProperties[key] = {
                  ...updatedProperties[key],
                  items: {
                    type: 'string',
                    enum: ['Select'], // Clear the enum
                    enumNames: ['Select'], // Clear the enumNames
                  },
                };
              } else {
                updatedProperties[key] = {
                  ...updatedProperties[key],
                  enum: ['Select'], // Clear the enum
                  enumNames: ['Select'], // Clear the enumNames
                };
              }
            }
          });

          return { ...prevSchema, properties: updatedProperties };
        });

        // // console.log(`Field changed: ${changedField}, New Value: ${formData[changedField]}`);
        // // console.log('dependentSchema', dependentSchema);
        const workingSchema = dependentSchema?.filter(
          (item) => item.api && item.api.dependent === changedField
        );
        // // console.log('workingSchema', workingSchema);
        if (workingSchema.length > 0) {
          const changedFieldValue = formData[changedField];

          const getNestedValue = (obj, path) => {
            if (path === '') {
              return obj;
            } else {
              return path.split('.').reduce((acc, key) => acc && acc[key], obj);
            }
          };

          const fetchDependentApis = async () => {
            // Filter only the dependent APIs based on the changed field
            const dependentApis = workingSchema;
            try {
              const apiRequests = dependentApis.map((field) => {
                const { api, key } = field;
                let isMultiSelect = field?.isMultiSelect;
                let updatedPayload = replaceControllingField(
                  api.payload,
                  changedFieldValue,
                  isMultiSelect
                );
                // console.log('updatedPayload', updatedPayload);

                // let changedFieldValuePayload = changedFieldValue;
                // if (field?.isMultiSelect == true) {
                //   // changedFieldValuePayload
                // }
                // // console.log(
                //   'field multiselect changedFieldValuePayload',
                //   changedFieldValuePayload
                // );
                // // console.log('field multiselect api.payload', api.payload);

                // // Replace "**" in the payload with changedFieldValue
                // const updatedPayload = JSON.parse(
                //   JSON.stringify(api.payload).replace(
                //     /\*\*/g,
                //     changedFieldValuePayload
                //   )
                // );

                // If header exists, replace values with localStorage values
                let customHeader = api?.header
                  ? {
                      tenantId:
                        api.header.tenantId === '**'
                          ? localStorage.getItem('tenantId') || ''
                          : api.header.tenantId,
                      Authorization:
                        api.header.Authorization === '**'
                          ? `Bearer ${localStorage.getItem('token') || ''}`
                          : api.header.Authorization,
                      academicyearid:
                        api.header.academicyearid === '**'
                          ? localStorage.getItem('academicYearId') || ''
                          : api.header.academicyearid,
                    }
                  : {};
                const config = {
                  method: api.method,
                  url: api.url,
                  headers: {
                    'Content-Type': 'application/json',
                    ...customHeader,
                  },
                  ...(api.method === 'POST' && { data: updatedPayload }),
                };
                return axios(config)
                  .then((response) => ({
                    fieldKey: field.key,
                    data: getNestedValue(response.data, api.options.optionObj),
                  }))
                  .catch((error) => ({ error: error, fieldKey: field.key }));
              });

              const responses = await Promise.all(apiRequests);
              // console.log('State API Responses:', responses);
              if (!responses[0]?.error) {
                setFormSchema((prevSchema) => {
                  const updatedProperties = { ...prevSchema.properties };
                  responses.forEach(({ fieldKey, data }) => {
                    // // console.log('Data:', data);
                    // // console.log('fieldKey:', fieldKey);
                    let label =
                      prevSchema.properties[fieldKey].api.options.label;
                    let value =
                      prevSchema.properties[fieldKey].api.options.value;
                    if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                      updatedProperties[fieldKey] = {
                        ...updatedProperties[fieldKey],
                        items: {
                          type: 'string',
                          enum: data?.map((item) => item?.[value].toString()),
                          enumNames: data?.map((item) =>
                            transformLabel(item?.[label].toString())
                          ),
                        },
                      };
                    } else {
                      updatedProperties[fieldKey] = {
                        ...updatedProperties[fieldKey],
                        enum: data?.map((item) => item?.[value].toString()),
                        enumNames: data?.map((item) =>
                          transformLabel(item?.[label].toString())
                        ),
                      };
                    }
                  });

                  return { ...prevSchema, properties: updatedProperties };
                });
              } else {
                setFormSchema((prevSchema) => {
                  const updatedProperties = { ...prevSchema.properties };
                  let fieldKey = responses[0]?.fieldKey;
                  if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                    updatedProperties[fieldKey] = {
                      ...updatedProperties[fieldKey],
                      items: {
                        type: 'string',
                        enum: ['Select'],
                        enumNames: ['Select'],
                      },
                    };
                  } else {
                    updatedProperties[fieldKey] = {
                      ...updatedProperties[fieldKey],
                      enum: ['Select'],
                      enumNames: ['Select'],
                    };
                  }
                  return { ...prevSchema, properties: updatedProperties };
                });
              }
            } catch (error) {
              console.error('Error fetching dependent APIs:', error);
            }
          };

          // Call the function
          fetchDependentApis();
        }
      }

      prevFormData.current = formData;
      // console.log('Form data changed:', formData);
      // live error
      setFormData(formData);

      function getSkipKeys(skipHideObject, formData) {
        let skipKeys = [];

        Object.keys(skipHideObject).forEach((key) => {
          if (formData[key] && skipHideObject[key][formData[key]]) {
            skipKeys = skipKeys.concat(skipHideObject[key][formData[key]]);
          }
        });

        return skipKeys;
      }

      const skipKeys = getSkipKeys(hideAndSkipFields, formData);
      // console.log('skipKeys', skipKeys);
      let updatedUISchema = formUiSchemaOriginal;
      function hideFieldsInUISchema(uiSchema, fieldsToHide) {
        const updatedUISchema = { ...uiSchema };

        fieldsToHide.forEach((field) => {
          if (updatedUISchema[field]) {
            updatedUISchema[field] = {
              ...updatedUISchema[field],
              originalWidget: updatedUISchema[field]['ui:widget'], // Store original widget type
              'ui:widget': 'hidden',
            };
          }
        });

        return updatedUISchema;
      }
      const hiddenUISchema = hideFieldsInUISchema(updatedUISchema, skipKeys);
      setFormUiSchema(hiddenUISchema);
    }
  };
  const prevNameRef = useRef({ firstName: '', lastName: '' });

  const handleFirstLastNameBlur = async (id: any, value: any) => {
  if (
    formData?.firstName !== undefined &&
    formData?.lastName !== undefined &&
    type === 'learner'
  ) {
    // Only update if firstName or lastName changed
    if (
      formData.firstName !== prevNameRef.current.firstName ||
      formData.lastName !== prevNameRef.current.lastName
    ) {
      const randomTwoDigit = Math.floor(10 + Math.random() * 90);
      const newUserName = `${formData.firstName}${formData.lastName}${randomTwoDigit}`;
      if (formData.username !== newUserName) {
        setFormData({
          ...formData,
          username: newUserName,
        });
      }
      // Update the ref to current values
      prevNameRef.current = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
    }
  }
};
  const handleSubmit = ({ formData }: { formData: any }) => {
    console.log('########### issue debug formData', formData);

    //step-1 : Check and remove skipped Data
    function filterFormData(skipHideObject, formData) {
      const updatedFormData = { ...formData };

      Object.keys(skipHideObject).forEach((key) => {
        if (formData[key] && skipHideObject[key][formData[key]]) {
          skipHideObject[key][formData[key]].forEach((fieldToRemove) => {
            delete updatedFormData[fieldToRemove];
          });
        }
      });

      return updatedFormData;
    }
    const filteredData = filterFormData(hideAndSkipFields, formData);
    // console.log('######### filteredData', JSON.stringify(filteredData));
    const cleanedData = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([_, value]) => !Array.isArray(value) || value.length > 0
      )
    );
    //step-2 : Validate the form data
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

    // Optional extra root-level fields
    // Extra Field for cohort creation

    const transformedFormData = transformFormData(
      cleanedData,
      schema,
      extraFields
    );

    //add name in always lower case
    if (transformedFormData?.name) {
      transformedFormData.name = transformedFormData.name.toLowerCase();
    }

    // // console.log('formSchema', transformedFormData);
    // console.log('Form Data Submitted:', filteredData);
    console.log('########## debug formattedFormData', transformedFormData);
    if (!isCallSubmitInHandle) {
      FormSubmitFunction(cleanedData, transformedFormData);
    }

    //live validate error fix
    setSubmitted(true);
    // Get first error field and scroll into view
    setTimeout(() => {
      const errorField = document.querySelector('.field-error');
      if (errorField) {
        errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  // console.log(formSchema);

  // Regex to Error Mapping
  const patternErrorMessages = {
    '^(?=.*[a-zA-Z])[a-zA-Z ]+$':
      'FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED',
    '^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$':
      'FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED',
    '^[a-zA-Z0-9.@]+$':
      'FORM_ERROR_MESSAGES.SPACE_AND_SPECIAL_CHARACTERS_NOT_ALLOWED',
    '^[0-9]{10}$': 'FORM_ERROR_MESSAGES.ENTER_VALID_NUMBER',
    '^d{10}$':
      'FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED',
  };

  // Dynamic custom validation
  const customValidate = (formData, errors) => {
    Object.keys(formSchema.properties).forEach((key) => {
      const field = formSchema.properties[key];
      const value = formData[key];

      // Ensure errors[key] is defined
      if (!errors[key]) {
        errors[key] = {};
      }
      // ✅ Clear error if field is empty or invalid
      if (!value || value === '' || value === null || value === undefined) {
        if (errors[key]?.__errors) {
          console.log('####### field', field);
          console.log('####### value', value);
          console.log('####### key', key);
          errors[key].__errors = []; // ✅ Clear existing errors
        }
        delete errors[key]; // ✅ Completely remove errors if empty
      } else if (field.pattern) {
        // ✅ Validate pattern only if the field has a value
        const patternRegex = new RegExp(field.pattern);
        if (!patternRegex.test(value)) {
          const errorMessage =
            t(patternErrorMessages?.[field.pattern]) ||
            `Invalid format for ${field.title || key}.`;

          // ✅ Add only if pattern does not match
          if (!errors[key].__errors) {
            errors[key].__errors = [];
          }
          errors[key].__errors = [errorMessage];
        } else {
          // ✅ Clear errors if pattern matches
          if (errors[key]?.__errors) {
            errors[key].__errors = [];
          }
          delete errors[key]; // ✅ Remove errors if valid
        }
      }
    });

    return errors;
  };
  // const customValidate = (formData, errors) => {
  //   console.log('########### issue debug errors customvalidator ', JSON.stringify(errors));

  //   Object.keys(formSchema.properties).forEach((key) => {
  //     const field = formSchema.properties[key];
  //     const value = formData[key];

  //     if (field.pattern && value) {
  //       const patternRegex = new RegExp(field.pattern);
  //       if (!patternRegex.test(value)) {
  //         const errorMessage =
  //           t(patternErrorMessages?.[field.pattern]) ||
  //           `Invalid format for ${field.title || key}.`;

  //         if (!errors[key].__errors) {
  //           errors[key].__errors = [];
  //         }
  //         errors[key].__errors.push(errorMessage);
  //       }
  //     }
  //   });

  //   return errors;
  // };

  // Custom transformErrors to suppress required errors before submit
  const transformErrors = (errors) => {
    // console.log('########### issue debug errors 123 ', JSON.stringify(errors));
    let updatedError = errors;
    if (!submitted) {
      // updatedError = errors.filter((error) => error.name !== 'required');
    }
    if (!submitted) {
      updatedError = updatedError.filter((error) => error.name !== 'pattern');
    }
    // console.log('########### issue debug updatedError 123 ', JSON.stringify(updatedError));
    return updatedError;
  };

  return (
    <>
      {!isCallSubmitInHandle ? (
        <Form
          ref={formRef}
          schema={formSchema}
          uiSchema={formUiSchema}
          formData={formData}
          onChange={handleChange}
          onBlur={handleFirstLastNameBlur}
          // onSubmit={handleSubmit}
          onSubmit={({ formData, errors }) => {
            // console.log("########### issue debug SUBMIT", formData);
            // console.log("########### issue debug ERRORS", errors); // 👈 this will be empty if validation passed
            if (errors.length > 0) {
              // Block submission if needed
              return;
            }
            handleSubmit({ formData });
          }}
          validator={validator}
          //noHtml5Validate //disable auto error pop up to field location
          showErrorList={false} // Hides the error list card at the top
          liveValidate //all validate live
          // liveValidate={submitted} // Only validate on submit or typing
          // onChange={() => setSubmitted(true)} // Show validation when user starts typing
          customValidate={customValidate} // Dynamic Validation
          transformErrors={transformErrors} // ✅ Suppress default pattern errors
          widgets={widgets}
          id="dynamic-form-id"
          // template
          templates={{ ObjectFieldTemplate: CustomObjectFieldTemplate }}
        >
          <button
            type="submit"
            style={{ display: hideSubmit ? 'none' : 'block' }}
          >
            Submit
          </button>
        </Form>
      ) : (
        <Grid container spacing={2}>
          {Object.keys(formSchema.properties).map((key) => (
            <Grid item xs={12} md={4} lg={3} key={key} sx={{ mb: '-40px' }}>
              <Form
                ref={formRef}
                schema={{
                  type: 'object',
                  properties: { [key]: formSchema.properties[key] },
                }}
                uiSchema={{ [key]: formUiSchema[key] }}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                validator={validator}
                // submitButtonProps={{
                //   style: { display: !isCallSubmitInHandle ? 'none' : 'block' },
                // }}
                // noHtml5Validate //disable auto error pop up to field location
                showErrorList={false} // Hides the error list card at the top
                liveValidate //all validate live
                // liveValidate={submitted} // Only validate on submit or typing
                // onChange={() => setSubmitted(true)} // Show validation when user starts typing
                // {...(isCallSubmitInHandle
                //   ? { submitButtonProps: { style: { display: 'none' } } }
                //   : {})}
                customValidate={customValidate} // Dynamic Validation
                transformErrors={transformErrors} // ✅ Suppress default pattern errors
                widgets={widgets}
              >
                {!isCallSubmitInHandle ? null : (
                  <button type="submit" style={{ display: 'none' }}>
                    Submit
                  </button>
                )}
              </Form>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default DynamicForm;

/*
below are sample json


    const schema = {
        type: 'object',
        properties: {
          studentName: {
            type: 'string',
            title: 'Student Name',
            pattern: '^[A-Za-z ]+$',
          },
          rollNo: {
            type: 'string',
            title: 'Roll No',
            pattern: '^[0-9]{1,6}$',
          },
          gender: {
            type: 'string',
            title: 'Gender',
            enum: ['Male', 'Female', 'Other'],
          },
          lastEducation: {
            type: 'string',
            title: 'Last Completed Education',
            enum: ['SSC', 'HSC', 'Degree'],
          },
          state: {
            type: 'number',
            title: 'State',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: 'https://dev-interface.prathamdigital.org/interface/v1/fields/options/read',
              method: 'POST',
              payload: { fieldName: 'state', sort: ['state_name', 'asc'] },
              options: {
                optionObj: 'result.values',
                label: 'label',
                value: 'value',
              },
              callType: 'initial', // initial or dependent
            },
          },
          district: {
            type: 'number',
            title: 'District',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: 'https://dev-interface.prathamdigital.org/interface/v1/fields/options/read',
              method: 'POST',
              payload: {
                fieldName: 'district',
                controllingfieldfk: '**',
                sort: ['district_name', 'asc'],
              },
              options: {
                optionObj: 'result.values',
                label: 'label',
                value: 'value',
              },
              callType: 'dependent', // initial or dependent,
              dependent: 'state',
            },
          },
          block: {
            type: 'number',
            title: 'Block',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: 'https://dev-interface.prathamdigital.org/interface/v1/fields/options/read',
              method: 'POST',
              payload: {
                fieldName: 'block',
                controllingfieldfk: '**',
                sort: ['block_name', 'asc'],
              },
              options: {
                optionObj: 'result.values',
                label: 'label',
                value: 'value',
              },
              callType: 'dependent', // initial or dependent,
              dependent: 'district',
            },
          },
          village: {
            type: 'number',
            title: 'Village',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: 'https://dev-interface.prathamdigital.org/interface/v1/fields/options/read',
              method: 'POST',
              payload: {
                fieldName: 'village',
                controllingfieldfk: '**',
                sort: ['village_name', 'asc'],
              },
              options: {
                optionObj: 'result.values',
                label: 'label',
                value: 'value',
              },
              callType: 'dependent', // initial or dependent,
              dependent: 'block',
            },
          },
          board: {
            type: 'string',
            title: 'Board',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: '/api/dynamic-form/get-framework',
              method: 'POST',
              payload: {
                code: 'board',
                fetchUrl:
                  'https://qa-lap.prathamdigital.org/api/framework/v1/read/scp-framework',
              },
              options: {
                optionObj: 'options',
                label: 'label',
                value: 'value',
              },
              callType: 'initial', // initial or dependent,
            },
          },
          medium: {
            type: 'string',
            title: 'Medium',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: '/api/dynamic-form/get-framework',
              method: 'POST',
              payload: {
                code: 'board',
                findcode: 'medium',
                selectedvalue: '**',
                fetchUrl:
                  'https://qa-lap.prathamdigital.org/api/framework/v1/read/scp-framework',
              },
              options: {
                optionObj: 'options',
                label: 'label',
                value: 'value',
              },
              callType: 'dependent', // initial or dependent,
              dependent: 'board',
            },
          },
          grade: {
            type: 'string',
            title: 'Grade',
            enum: ['Select'], // Clear the enum
            enumNames: ['Select'], // Clear the enumNames
            api: {
              url: '/api/dynamic-form/get-framework',
              method: 'POST',
              payload: {
                code: 'medium',
                findcode: 'gradeLevel',
                selectedvalue: '**',
                fetchUrl:
                  'https://qa-lap.prathamdigital.org/api/framework/v1/read/scp-framework',
              },
              options: {
                optionObj: 'options',
                label: 'label',
                value: 'value',
              },
              callType: 'dependent', // initial or dependent,
              dependent: 'medium',
            },
          },
        },
        dependencies: {
          lastEducation: {
            oneOf: [
              {
                properties: {
                  lastEducation: { const: 'SSC' },
                  schoolName: { type: 'string', title: 'School Name' },
                  percentage: {
                    type: 'number',
                    title: 'Percentage',
                    minimum: 0,
                    maximum: 100,
                  },
                },
              },
              {
                properties: {
                  lastEducation: { const: 'HSC' },
                  collegeName: { type: 'string', title: 'College Name' },
                  percentage: {
                    type: 'number',
                    title: 'Percentage',
                    minimum: 0,
                    maximum: 100,
                  },
                },
              },
              {
                properties: {
                  lastEducation: { const: 'Degree' },
                  degreeCollege: {
                    type: 'string',
                    title: "Model's Degree College",
                  },
                  modelGrade: {
                    type: 'string',
                    title: 'Model Grade Received',
                    enum: ['A', 'B', 'C', 'D'],
                  },
                },
              },
            ],
          },
        },
      };
      
const uiSchema = {
    studentName: {
      'ui:autofocus': true,
      'ui:emptyValue': '',
      'ui:options': { liveValidate: true },
    },
    rollNo: {
      'ui:options': { liveValidate: true },
    },
    lastEducation: {
      'ui:order': [
        'lastEducation',
        'schoolName',
        'collegeName',
        'degreeCollege',
        'percentage',
        'modelGrade',
      ],
    },
    percentage: {
      'ui:options': { liveValidate: true },
    },
    state: { 'ui:widget': 'select' },
    phoneDetails: { 'ui:widget': 'select' },
    district: { 'ui:widget': 'select' },
  };
  */

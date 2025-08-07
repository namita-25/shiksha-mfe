import { Role } from '@/utils/app.constant';

const stateId =
  typeof window !== 'undefined' ? localStorage.getItem('stateId') : null;
const stateName =
  typeof window !== 'undefined' ? localStorage.getItem('stateName') : null;
const userRole =
  typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;

export const MasterBlockSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'string',
      title: 'State',
      enum: userRole !== Role.CENTRAL_ADMIN ? [stateId] : ['Select'],
      enumNames: userRole !== Role.CENTRAL_ADMIN ? [stateName] : ['Select'],
      api:
        userRole !== Role.CENTRAL_ADMIN
          ? undefined // Avoid API call if userRole is Central admin
          : {
              url: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/fields/options/read`,
              method: 'POST',
              payload: { fieldName: 'state', sort: ['state_name', 'asc'] },
              options: {
                optionObj: 'result.values',
                label: 'label',
                value: 'value',
              },
              callType: 'initial',
            },
    },
    district: {
      type: 'array',
      title: 'District',
      items: {
        type: 'string',
        enum: ['Select'],
        enumNames: ['Select'],
      },
      api: {
        url: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/fields/options/read`,
        method: 'POST',
        payload: {
          fieldName: 'district',
          controllingfieldfk:
            userRole !== Role.CENTRAL_ADMIN ? [stateId] : '**',
          sort: ['district_name', 'asc'],
        },
        options: {
          optionObj: 'result.values',
          label: 'label',
          value: 'value',
        },
        callType: userRole !== Role.CENTRAL_ADMIN ? 'initial' : 'dependent',
        ...(!stateId ? { dependent: 'state' } : {}),
      },
      //for multiselect
      uniqueItems: true,
      isMultiSelect: true,
      maxSelections: 1000,
    },
    fieldName: {
      type: 'string',
      title: 'Search Block',
      // description: 'Search for a specific user or entity',
    },
    sortBy: {
      type: 'string',
      title: 'Sort By',
      enum: ['asc', 'desc'],
      enumNames: ['A-Z', 'Z-A'],
    },
  },
};

export const MasterBlocksUISchema = {
  'ui:order': ['state', 'district', 'fieldName', 'sortBy'],

  state: {
    'ui:widget': 'CustomSingleSelectWidget',
    ...(stateId ? { 'ui:disabled': true } : {}),
  },

  district: {
    'ui:widget': 'CustomMultiSelectWidget',
    'ui:options': {
      multiple: true,
      uniqueItems: true,
    },
  },

  fieldName: {
    'ui:widget': 'SearchTextFieldWidget',
  },

  sortBy: {
    'ui:widget': 'select',
  },
};

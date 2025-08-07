export const ContentCreatorSearchSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'array',
      title: 'State',
      items: {
        type: 'string',
        enum: ['Select'],
        enumNames: ['Select'],
      },
      api: {
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
      //for multiselect
      uniqueItems: true,
      isMultiSelect: true,
      maxSelections: 1000,
    },
    firstName: {
      type: 'string',
      title: 'Search Content Creator',
    },
    sortBy: {
      type: 'string',
      title: 'Sort By',
      enum: ['asc', 'desc'],
      enumNames: ['A-Z', 'Z-A'],
    },
    status: {
      type: 'string',
      title: 'Status',
      enum: ['active', 'archived'],
      enumNames: ['Active', 'Archived'],
    },
  },
};

export const ContentCreatorUISchema = {
  'ui:order': ['state', 'firstName', 'sortBy', 'status'],

  state: {
    'ui:widget': 'CustomMultiSelectWidget',
    'ui:options': {
      multiple: true,
      uniqueItems: true,
    },
  },

  firstName: {
    'ui:widget': 'SearchTextFieldWidget',
  },

  sortBy: {
    'ui:widget': 'select',
  },

  status: {
    'ui:widget': 'select',
  },
};

export const MasterStateSearchSchema = {
  type: 'object',
  properties: {
    fieldName: {
      type: 'string',
      title: 'Search States',
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

export const MasterStateUISchema = {
  'ui:order': ['fieldName', 'sortBy'],

  fieldName: {
    'ui:widget': 'SearchTextFieldWidget',
  },

  sortBy: {
    'ui:widget': 'select',
  },
};

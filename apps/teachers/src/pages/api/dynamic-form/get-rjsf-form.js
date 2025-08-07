import { validate } from 'uuid';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { readForm } = req.body;

      if (readForm && readForm.length > 0) {
        fetchFormFields(readForm).then((fields) => {
          // console.log('fieldFromFunction!!!', fields);

          if (fields && fields.length > 0) {
            const { schema, uiSchema } = generateSchemaAndUISchema(fields);
            res.status(200).json({
              schema,
              uiSchema,
            });
          } else {
            res
              .status(500)
              .json({ error: 'Form Fields Not Found in API Call' });
          }
        });
      } else {
        res.status(500).json({ error: 'Form data is required' });
      }
    } catch (error) {
      // console.log('error hgfgfh', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

const fetchFormFields = async (readForm) => {
  const axios = require('axios');
  let fields = [];
  for (let i = 0; i < readForm.length; i++) {
    let fetchUrl = readForm[i].fetchUrl;
    let header = readForm[i].header;
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: fetchUrl,
      headers: {
        Accept: '*/*',
        ...header,
      },
    };

    await axios
      .request(config)
      .then((response) => {
        fields = [...fields, ...response?.data?.result?.fields];
        // console.log('response', response?.data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }
  // console.log('field!!!', fields);
  return fields;
};

function normalizePattern(pattern) {
  if (typeof pattern === 'string') {
    return pattern.startsWith('/') && pattern.endsWith('/')
      ? pattern.slice(1, -1)
      : pattern;
  }
  return pattern;
}

function generateSchemaAndUISchema(fields) {
  const schema = {
    type: 'object',
    properties: {},
  };
  const uiSchema = {};

  fields.forEach((field) => {
    const {
      name,
      hint,
      label,
      placeholder,
      coreField,
      fieldId,
      type,
      options,
      pattern,
      validation,
      maxLength,
      minLength,
      //custom field attributes
      api,
      extra,
    } = field;
    let isRequired = false;
    const schemaField = {
      type: 'string',
      title: label,
      coreField,
      fieldId,
      field_type: type,
    };

    if (pattern) {
      schemaField.pattern = normalizePattern(pattern);
    }
    if (validation?.maxSelections) {
      schemaField.maxSelection = parseInt(validation.maxSelections, 10);
    }
    if (validation?.isMultiSelect) {
      schemaField.isMultiSelect = validation.isMultiSelect;
      schemaField.uniqueItems = validation.isMultiSelect;
      schemaField.type = 'array';
    }
    if (validation?.isRequired) {
      schemaField.isRequired = validation.isRequired;
      isRequired = validation.isRequired;
    }
    if (validation?.minValue || validation?.minValue == 0) {
      schemaField.minValue = validation.minValue;
    }
    if (validation?.maxValue) {
      schemaField.maxValue = validation.maxValue;
    }
    if (maxLength) {
      schemaField.maxLength = parseInt(maxLength, 10);
    }
    if (minLength) {
      schemaField.minLength = parseInt(minLength, 10);
    }
    if (isRequired) {
      schema.required = schema.required || [];
      schema.required.push(name);
    }
    // Handling UI Schema (including hint and placeholder)
    uiSchema[name] = {
      'ui:widget': 'text', // default widget
    };

    if (placeholder) {
      uiSchema[name]['ui:placeholder'] = placeholder;
    }

    if (hint) {
      uiSchema[name]['ui:help'] = hint;
    }

    if (type === 'radio') {
      schemaField.enum = options?.map((opt) => opt.value);
      schemaField.enumNames = options?.map((opt) => opt.label);
      uiSchema[name] = {
        'ui:widget': 'CustomRadioWidget',
        'ui:options': {
          hideError: true, // ✅ hides automatic error rendering
        },
      };
    } else if (type === 'drop_down' || type === 'checkbox') {
      if (schemaField?.isMultiSelect === true) {
        schemaField.items = {
          type: 'string',
          enum: options?.map((opt) => opt.value) || ['Select'],
          enumNames: options?.map((opt) => opt.label) || ['Select'],
        };
      } else {
        schemaField.enum = options?.map((opt) => opt.value) || ['Select'];
        schemaField.enumNames = options?.map((opt) => opt.label) || ['Select'];
      }
      uiSchema[name] = {
        'ui:widget':
          type === 'checkbox'
            ? //? 'checkboxes'
              'CustomCheckboxWidget'
            : schemaField?.isMultiSelect === true
            ? 'CustomMultiSelectWidget'
            : 'CustomSingleSelectWidget',
        'ui:options': {
          multiple: schemaField?.isMultiSelect === true ? true : false,
          uniqueItems: schemaField?.isMultiSelect === true ? true : false,
          hideError: schemaField?.isMultiSelect === true ? false : true,
        },
      };
    } else if (type === 'date') {
      let minDateCount = 0;
      let maxDateCount = 100;
      if (schemaField?.minValue) {
        minDateCount = schemaField?.minValue;
      }
      if (schemaField?.minValue) {
        maxDateCount = schemaField?.maxValue;
      }

      //set dates
      // Get current date
      const currentDate = new Date();

      // Calculate min and max date range based on age limit
      const maxDate = new Date(
        currentDate.getFullYear() - minDateCount,
        currentDate.getMonth(),
        currentDate.getDate()
      )
        .toISOString()
        .split('T')[0]; // 18 years ago

      const minDate = new Date(
        currentDate.getFullYear() - maxDateCount,
        currentDate.getMonth(),
        currentDate.getDate()
      )
        .toISOString()
        .split('T')[0]; // 50 years ago

      schemaField.format = 'date';

      uiSchema[name] = {
        'ui:widget': 'CustomDateWidget',
        'ui:options': {
          minValue: minDate, // Default minValue (optional)
          maxValue: maxDate, // Default maxValue (optional)
          hideError: true,
        },
      };
    } else if (type === 'dateTime') {
      schemaField.format = 'date-time';
      uiSchema[name] = { 'ui:widget': 'dateTime' };
    } else {
      uiSchema[name] = {
        'ui:widget': 'CustomTextFieldWidget',
        'ui:options': { validateOnBlur: true, hideError: true },
      };
    }

    //Our custom RJSF field attributes
    if (api) {
      schemaField.api = api;
      if (schemaField?.isMultiSelect === true) {
        schemaField.items = {
          type: 'string',
          enum: ['Select'],
          enumNames: ['Select'],
        };
      } else {
        schemaField.enum = ['Select'];
        schemaField.enumNames = ['Select'];
      }
    }

    if (extra) {
      schemaField.extra = extra;
    }

    schema.properties[name] = schemaField;
  });

  //form order schema
  let originalOrder = Object.keys(schema.properties);
  const finalUiOrder = reorderUiOrder(originalOrder, preferredOrder);
  uiSchema['ui:order'] = finalUiOrder;

  return { schema, uiSchema };
}

const reorderUiOrder = (originalOrder, preferredOrder) => {
  const preferredSet = new Set(preferredOrder);

  const ordered = [
    ...preferredOrder.filter((field) => originalOrder.includes(field)),
    ...originalOrder.filter((field) => !preferredSet.has(field)),
  ];

  return ordered;
};
const preferredOrder = [
  'state',
  'district',
  'block',
  'village',
  'center',
  'parentId',
  'batch',
  'board',
  'medium',
  'grade',
];

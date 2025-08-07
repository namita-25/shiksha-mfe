// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { useTranslation } from 'libs/shared-lib-v2/src/lib/context/LanguageContext';

const CustomMultiSelectWidget = ({
  id,
  options,
  value = [],
  required,
  label,
  onChange,
  schema,
  uiSchema,
  rawErrors = [],
}: WidgetProps) => {
  const { enumOptions = [] } = options;
  const maxSelections = schema.maxSelection || enumOptions.length;
  const { t } = useTranslation();

  const selectedValues = Array.isArray(value) ? value : [];

  const [isAllSelected, setIsAllSelected] = useState(
    selectedValues.length === enumOptions.length
  );

  const isDisabled = uiSchema?.['ui:disabled'] === true;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsAllSelected(selectedValues.length === enumOptions.length);
  }, [selectedValues, enumOptions]);

  const handleChange = (event: any) => {
    const selected = event.target.value;

    if (selected.includes('selectAll')) {
      if (isAllSelected) {
        onChange([]);
      } else {
        const allValues = enumOptions.map((option) => option.value);
        onChange(allValues.slice(0, maxSelections));
      }
    } else {
      if (Array.isArray(selected)) {
        if (selected.length <= maxSelections) {
          onChange(selected.length > 0 ? selected : []);
          if (maxSelections === 1 && selected.length === 1) {
            setOpen(false);
          }
        }
      }
    }
  };

  return (
    <FormControl
      fullWidth
      error={rawErrors.length > 0}
      required={required}
      disabled={
        isDisabled
        //bug fix for if zero value then no disable it not reflect in required if disable
        // ||
        // enumOptions.length === 0 ||
        // (enumOptions.length === 1 && enumOptions[0]?.value === 'Select')
      }
    >
      <InputLabel id="demo-multiple-checkbox-label">{label}</InputLabel>
      <Select
        id={id}
        multiple
        label={label}
        labelId="demo-multiple-checkbox-label"
        value={selectedValues}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={handleChange}
        renderValue={(selected) =>
          enumOptions
            .filter((option) => selected.includes(option.value))
            .map((option) =>
              t(`FORM.${option.label}`, { defaultValue: option.label })
            )
            .join(', ')
        }
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: '300px',
            },
          },
        }}
      >
        {enumOptions.length > 1 && maxSelections >= enumOptions.length && (
          <MenuItem
            key="selectAll"
            value="selectAll"
            disabled={enumOptions.length === 1}
          >
            <Checkbox checked={isAllSelected} />
            <ListItemText
              primary={isAllSelected ? 'Deselect All' : 'Select All'}
            />
          </MenuItem>
        )}

        {enumOptions
          .filter((option) => option.value !== 'Select')
          .map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={
                selectedValues.length >= maxSelections &&
                !selectedValues.includes(option.value)
              }
            >
              <Checkbox checked={selectedValues.includes(option.value)} />
              <ListItemText
                primary={t(`FORM.${option.label}`, {
                  defaultValue: option.label,
                })}
              />
            </MenuItem>
          ))}
      </Select>

      {/* Form submission error */}
      {rawErrors.length > 0 && <FormHelperText>{rawErrors[0]}</FormHelperText>}
    </FormControl>
  );
};

export default CustomMultiSelectWidget;

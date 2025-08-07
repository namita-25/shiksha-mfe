import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useTranslation } from 'react-i18next';

const CustomCheckboxWidget = ({
  id,
  schema,
  options,
  value = [],
  onChange,
  label,
}: WidgetProps) => {
  const { enumOptions = [] } = options;
  const maxSelection = schema.maxSelection || Infinity; // Default to unlimited if not set
  const isMaxSelected = value.length >= maxSelection;
  const { t } = useTranslation();

  const handleChange = (selectedValue: string) => {
    let newValue;
    if (value.includes(selectedValue)) {
      newValue = value.filter((v: string) => v !== selectedValue);
    } else {
      if (!isMaxSelected) {
        newValue = [...value, selectedValue];
      } else {
        return; // Prevent selection if max limit is reached
      }
    }
    onChange(newValue);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label || schema.title}</FormLabel>
      <FormGroup>
        {enumOptions.map((option: any) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={value.includes(option.value)}
                onChange={() => handleChange(option.value)}
                disabled={isMaxSelected && !value.includes(option.value)} // Disable if max reached
              />
            }
            label={t(`FORM.${option.label}`, {
              defaultValue: option.label,
            })}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default CustomCheckboxWidget;

// @ts-nocheck
import React from 'react';
import { TextField } from '@mui/material';
import { WidgetProps } from '@rjsf/utils';

const CustomTextFieldWidget = ({
  id,
  label,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  rawErrors = [],
  placeholder,
}: WidgetProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    onChange(val === '' ? undefined : val);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, event.target.value);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.value);

  // Filter out 'is a required property' messages
  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  return (
    <TextField
      fullWidth
      id={id}
      label={label}
      value={value ?? ''}
      required={required}
      disabled={disabled || readonly}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      error={displayErrors.length > 0}
      helperText={displayErrors.length > 0 ? displayErrors[0] : ''}
      variant="outlined"
    //   margin="normal"
    />
  );
};

export default CustomTextFieldWidget;

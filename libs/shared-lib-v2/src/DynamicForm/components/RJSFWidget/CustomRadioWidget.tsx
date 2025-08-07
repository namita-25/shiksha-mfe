// @ts-nocheck
import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormHelperText,
  TextField,
} from '@mui/material';
import { useTranslation } from 'libs/shared-lib-v2/src/lib/context/LanguageContext';

const CustomRadioWidget = ({
  id,
  options,
  value,
  required,
  disabled,
  readonly,
  label,
  onChange,
  rawErrors = [],
}: WidgetProps) => {
  const { enumOptions = [] } = options;
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      component="fieldset"
      error={rawErrors.length > 0}
      required={required}
      fullWidth
    >
      {/* Hidden text input to force native validation */}
      <input
        value={value ?? ''}
        required={required}
        onChange={() => {}}
        tabIndex={-1}
        style={{
          height: 1,
          padding: 0,
          border: 0,
          ...(value && { visibility: 'hidden' }),
        }}
        aria-hidden="true"
        />
      <FormLabel
        component="legend"
        sx={{
          color: 'black',
          '&.Mui-error': {
            color: 'black', // override error red
          },
          '&.Mui-disabled': {
            color: 'black', // override disabled grey
          },
        }}
      >
        {label}
      </FormLabel>
      <RadioGroup
        row // makes all options in one line, wraps automatically
        id={id}
        name={id}
        value={value ?? ''}
        onChange={handleChange}
        style={{ flexWrap: 'wrap' }}
      >
        {enumOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={t(`FORM.${option.label}`, {
              defaultValue: option.label,
            })}
            disabled={disabled || readonly}
          />
        ))}
      </RadioGroup>
      {/* {rawErrors.length > 0 && (
        <FormHelperText>{rawErrors[0]}</FormHelperText>
      )} */}
    </FormControl>
  );
};

export default CustomRadioWidget;

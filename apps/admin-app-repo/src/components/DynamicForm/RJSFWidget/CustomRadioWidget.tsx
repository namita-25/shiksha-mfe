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
} from '@mui/material';
import { useTranslation } from 'react-i18next';

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
            <FormLabel component="legend">{label}</FormLabel>
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

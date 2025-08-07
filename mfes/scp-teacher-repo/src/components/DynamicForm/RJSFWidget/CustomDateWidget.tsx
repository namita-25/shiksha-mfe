// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const CustomDateWidget = ({
  value,
  onChange,
  options,
  required,
  label,
  rawErrors = [],
}: any) => {
  const { minValue, maxValue } = options;
  const { t } = useTranslation();

  const initialValue =
    typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)
      ? value
      : null;

  const [selectedDate, setSelectedDate] = useState(
    initialValue ? dayjs(initialValue, 'YYYY-MM-DD') : null
  );

  useEffect(() => {
    if (value && dayjs(value, 'YYYY-MM-DD').isValid()) {
      setSelectedDate(dayjs(value, 'YYYY-MM-DD'));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateChange = (date: any) => {
    if (date && date.isValid()) {
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedDate(date);
      onChange(formattedDate);
    } else {
      setSelectedDate(null);
      onChange(undefined);
    }
  };

  const errorText = rawErrors?.length > 0 ? rawErrors[0] : '';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={`${t(`FORM.${label}`, {
          defaultValue: label,
        })} ${required ? '*' : ''}`}
        value={selectedDate || null}
        onChange={handleDateChange}
        minDate={minValue ? dayjs(minValue, 'YYYY-MM-DD') : undefined}
        maxDate={maxValue ? dayjs(maxValue, 'YYYY-MM-DD') : undefined}
        format="DD-MM-YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            error: rawErrors.length > 0,
            // helperText: errorText,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDateWidget;

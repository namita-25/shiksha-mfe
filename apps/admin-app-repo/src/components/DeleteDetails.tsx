import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'next-i18next';

interface DeleteDetailsProps {
  firstName: string;
  lastName: string;
  village: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  reason: string;
  setReason: (reason: string) => void;
}

const DeleteDetails: React.FC<DeleteDetailsProps> = ({
  firstName,
  lastName,
  village,
  checked,
  setChecked,
  reason,
  setReason,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Box
        sx={{
          border: '1px solid #ddd',
          borderRadius: 2,
          mb: 2,
          p: 1,
        }}
      >
        <Typography fontWeight="bold">
          { firstName } { lastName } {t("FORM.TEST_BELONG_TO")}
        </Typography>
        <TextField fullWidth value={village} disabled sx={{ mt: 1 }} />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        }
        label={t('FORM.DO_YOU_WANT_TO_DELETE')}
        sx={{ mb: checked ? 2 : 0 }}
      />

      {checked && (
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel sx={{ fontWeight: 'bold', mb: 1 }}>
            {t("COMMON.REASON_FOR_DELETION")}
          </FormLabel>
          <RadioGroup
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <FormControlLabel
              value="Incorrect Data Entry"
              control={<Radio />}
              label={t("COMMON.INCORRECT_DATA_ENTRY")}
            />
            <FormControlLabel
              value="Duplicate User"
              control={<Radio />}
              label={t("COMMON.DUPLICATED_USER")}
            />
          </RadioGroup>
        </FormControl>
      )}
    </>
  );
};

export default DeleteDetails;

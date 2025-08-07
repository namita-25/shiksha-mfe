import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { useTranslation } from 'next-i18next';

interface MarkAsVolunteerProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

const MarkAsVolunteer: React.FC<MarkAsVolunteerProps> = ({
  checked,
  setChecked,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        }
        label={t('YOUTH.DO_YOU_WANT_TO_MARK_AS_VOLUNTEER')}
        sx={{ mb: checked ? 2 : 0 }}
      />
    </>
  );
};

export default MarkAsVolunteer;

import React, { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { getCohortList } from '@/services/CohortServices';
import { QueryKeys } from '@/utils/app.constant';
import { useQueryClient } from '@tanstack/react-query';
import { toPascalCase } from '@/utils/Helper';

interface CenterDropdownProps {
  cohortId?: string;
  roleName?: string;
  onChange?: (value: string) => void;
  centerList?: any;
  selectedCenterId?: any;
  setSelectedCenterId?: any;
}

const CenterDropdown: React.FC<CenterDropdownProps> = ({
  cohortId,
  roleName,
  onChange,
  centerList,
  selectedCenterId,
  setSelectedCenterId,
}) => {
  const [centers, setCenters] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedCenterId(value);
    if (onChange) onChange(value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="center-dropdown-label">Center</InputLabel>
      <Select
        labelId="center-dropdown-label"
        value={selectedCenterId}
        onChange={handleChange}
        label="Center"
      >
        {centerList && centerList.length === 0 ? (
          <MenuItem disabled>No centers found</MenuItem>
        ) : (
          centerList?.map((center: any) => (
            <MenuItem key={center?.cohortId} value={center?.cohortId}>
              {toPascalCase(center?.cohortName)}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default CenterDropdown;

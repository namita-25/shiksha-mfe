import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import {
  getCenterList,
  getStateBlockDistrictList,
} from '@/services/MasterDataService';
import { FormContextType } from '@/utils/app.constant';
interface VillageSelectionProps {
  parentId: string;
  ParentName: string;
  onBack: () => void;
  selectedVillages: any;
  onSelectionChange: (selectedVillages: number[]) => void;
  role?: string;
  stateId?: any;
  districtId?: any;
  blockId?: any;
  villageId?: any;
  searchPlaceHolder?: string;
  villages?: any;
  setVillages?: any;
  isReassign?: boolean;
  selectedCohortId?: any;
}
const CohortSelections: React.FC<VillageSelectionProps> = ({
  parentId,
  ParentName,
  onBack,
  selectedVillages: initialSelectedVillages,
  onSelectionChange,
  role,
  stateId,
  blockId,
  districtId,
  villageId,
  villages,
  setVillages,
  isReassign,
  selectedCohortId,
}) => {
  const [selectedVillages, setSelectedVillages] = useState<number[]>(
    initialSelectedVillages || []
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useTranslation();
  useEffect(() => {
    setSelectedVillages(initialSelectedVillages || []);
  }, [initialSelectedVillages]);
  useEffect(() => {
    const getVillageList = async () => {
      try {
        if (role === 'mentor') {
          const controllingfieldfk: any = [parentId];
          const fieldName = 'village';
          const villageResponse = await getStateBlockDistrictList({
            controllingfieldfk,
            fieldName,
          });
          const transformedVillageData = villageResponse?.result?.values?.map(
            (item: any) => ({
              id: item?.value,
              name: item?.label,
            })
          );
          setVillages(transformedVillageData);
          if (transformedVillageData?.length > 0) {
            setSelectedVillages([transformedVillageData[0].id]);
            onSelectionChange([transformedVillageData[0].id]);
          }
        } else {
          const getCentersObject = {
            limit: 0,
            offset: 0,
            filters: {
              type: 'BATCH',
              status: ['active'],
              parentId: [parentId],
            },
          };
          const r = await getCenterList(getCentersObject);
          const transformedcenterData = r?.result?.results?.cohortDetails?.map(
            (item: any) => ({
              id: item?.cohortId,
              name: item?.name,
            })
          );
          setVillages(transformedcenterData);
          if (transformedcenterData?.length > 0 && isReassign) {
            const cohortIds = typeof selectedCohortId === 'string' ? [selectedCohortId] : selectedCohortId;
            setSelectedVillages(cohortIds);
            onSelectionChange(cohortIds);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    getVillageList();
  }, [parentId]);
  const handleToggle = (villageId: number) => {
    setSelectedVillages((prev) => {
      const newSelection = prev.includes(villageId)
        ? prev.filter((id) => id !== villageId)
        : [...prev, villageId];
      onSelectionChange(newSelection);
      return newSelection;
    });
  };
  const handleBack = () => {
    // setSelectedVillages([]);
    // onSelectionChange([]);
    onBack();
  };
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mt={2}
        sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 1 }}
      >
        <SearchIcon color="disabled" />
        <TextField
          variant="standard"
          placeholder={
            role === FormContextType.TEACHER
              ? t('FACILITATOR.SEARCH_BATCHES')
              : 'Search Village..'
          }
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </Box>
      <Paper
        sx={{ maxHeight: '31vh', overflowY: 'auto', p: 2, borderRadius: '8px', display : 'flex', gap: "15px", flexWrap: 'wrap' }}
      >
        {villages?.map((village: any) => {
          const isSelected = selectedVillages.includes(village.id);
          return (
            <Box key={village.id}>
              <Box
                onClick={() => handleToggle(village.id)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? '#FFC107' : '#FFF',
                  color: isSelected ? '#1E1B16' : '#4D4639',
                  border: '1px solid #DADADA',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  padding: '5px 15px',
                  gap: '8px',
                  fontSize: '14px',
                }}
              >
                <Box>{village.name}</Box>
                <Checkbox
                  checked={isSelected}
                  sx={{
                    color: isSelected ? '#000' : '#999',
                    '&.Mui-checked': {
                      color: '#000',
                    },
                    p: 0,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};
export default CohortSelections;

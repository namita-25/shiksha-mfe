import { modalStyles } from '../../../styles/modalStyles';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { cohortHierarchy, Role } from 'mfes/youthNet/src/utils/app.constant';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

type CenterType = '' | 'regular' | 'remote';

interface FilterModalProps {
  open: boolean;
  handleClose: () => void;
  centers: string[];
  selectedCenters: string[];
  setSelectedCenters: (centers: string[]) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  centerType: CenterType;
  setCenterType: (type: CenterType) => void;
  onApply: () => void;
  sortingContent: any,
  clearFilters?: () => void;

}

const FilterModalCenter: React.FC<FilterModalProps> = ({
  open,
  handleClose,
  centers,
  selectedCenters,
  setSelectedCenters,
  sortOrder,
  setSortOrder,
  centerType,
  setCenterType,
  onApply,
  sortingContent,
  clearFilters

}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const theme = useTheme<any>();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleCenterToggle = (center: string) => {
    if (selectedCenters?.includes(center)) {
      setSelectedCenters(selectedCenters?.filter((c) => c !== center));
    } else {
      setSelectedCenters([...selectedCenters, center]);
    }
  };

  const filteredCenters = centers?.filter((center) =>
    center?.toLowerCase().includes(searchInput?.toLowerCase())
  );

  // const clearFilters = () => {
  //   setSortOrder('');
  //   setCenterType('');
  //   onApply();
  // };

  const handleApplyClick = () => {
    onApply();
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={modalStyles} padding={2}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography
              color={theme?.palette?.text?.primary}
              variant="h3"
              mt={2}
            >
              {t('COMMON.FILTERS')}
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: '#4D4639' }}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2, mx: -2 }} />
          <Typography fontSize="12px" variant="subtitle1">
           {t('COMMON.NAMES')}
         </Typography>
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="asc"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.A_TO_Z')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="desc"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.Z_TO_A')}
            />
          </RadioGroup>
         {sortingContent=== cohortHierarchy.VILLAGE && ( 
          <>
          
          <Typography fontSize="12px" variant="subtitle1">
            {t('YOUTHNET_DASHBOARD.NEW_REGISTRATION')}
          </Typography>
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="new-registration-today-high-to-low"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.HIGHT-TO_LOW')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="new-registration-today-low-to-high"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.LOW_TO_HIGH')}
            />
          </RadioGroup>
          <Typography fontSize="12px" variant="subtitle1">
            {t('YOUTHNET_DASHBOARD.TOTAL_COUNT_YOUTH')}
          </Typography>
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="totalcount-high-to-low"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.HIGHT-TO_LOW')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="totalcount-low-to-high"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.LOW_TO_HIGH')}
            />
          </RadioGroup>
          </>
         )
          }
          {
           sortingContent=== Role.LEARNER && (
            <>
                <Typography fontSize="12px" variant="subtitle1">
            {t('YOUTHNET_PROFILE.AGE')}
          </Typography>
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="age-high-to-low"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.HIGHT-TO_LOW')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="age-low-to-high"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('COMMON.LOW_TO_HIGH')}
            />
          </RadioGroup>
          <Typography fontSize="12px" variant="subtitle1">
            {t('YOUTHNET_DASHBOARD.YOUTH_JOINERS')}
          </Typography>
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="new-joiner-first"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('YOUTHNET_DASHBOARD.NEW_JOINER_FIRST')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="old-joiner-first"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('YOUTHNET_DASHBOARD.OLD_JOINER_FIRST')}
            />
          </RadioGroup>
            </>
           )
          }
          {/* <Typography fontSize="12px" variant="subtitle1" mt={2} mb={1}>
            {t('CENTERS.CENTER_TYPE')}
          </Typography>
          <RadioGroup
            value={centerType}
            onChange={(e) => setCenterType(e.target.value as CenterType)}
          >
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="regular"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('CENTERS.REGULAR')}
            />
            <FormControlLabel
              sx={{ justifyContent: 'space-between' }}
              value="remote"
              control={
                <Radio
                  sx={{
                    color: '#4D4639',
                    '&.Mui-checked': {
                      color: '#4D4639',
                    },
                  }}
                />
              }
              className="modal_label"
              labelPlacement="start"
              label={t('CENTERS.REMOTE')}
            />
          </RadioGroup> */}
          <Divider sx={{ mt: 2, mx: -2 }} />
          <Box
            sx={{
              display: 'flex',
              gap: 1,
               mt: 2, 
            }}
          >
            <Button
              variant="outlined"
              fullWidth
             
              onClick={clearFilters}
            >
              {t('COMMON.CLEAR_ALL')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={handleApplyClick}
             
            >
              {t('COMMON.APPLY')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default FilterModalCenter;

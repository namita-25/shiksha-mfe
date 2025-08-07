import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useTranslation, FilterForm } from '@shared-lib';
import { useColorInversion } from '@learner/context/ColorInversionContext';

const FilterComponent: React.FC<{
  filterState: any;
  filterFramework?: any;
  staticFilter?: Record<string, object>;
  handleFilterChange: (newFilterState: any) => void;
  onlyFields?: string[];
  isOpenColapsed?: boolean | any[];
  _config?: any;
}> = ({
  filterState,
  staticFilter,
  filterFramework,
  handleFilterChange,
  onlyFields,
  isOpenColapsed,
  _config,
}) => {
  const { t } = useTranslation();
  const [filterCount, setFilterCount] = useState<any>();
  const theme = useTheme();
  const { isColorInverted } = useColorInversion();

  const checkboxStyle = useMemo(
    () => ({
      color: isColorInverted ? '#fff' : '#1F1B13',
      '&.Mui-checked': {
        color: isColorInverted ? '#fff' : '#1F1B13',
      },
    }),
    [isColorInverted]
  );

  useEffect(() => {
    setFilterCount(
      Object?.keys(filterState.filters ?? {}).filter((e) => {
        const filterValue = filterState.filters[e];
        return (
          !['limit', ...Object.keys(staticFilter ?? {})].includes(e) &&
          !(Array.isArray(filterValue) && filterValue.length === 0)
        );
      }).length
    );
  }, [filterState, staticFilter]);

  const memoizedFilterForm = useMemo(
    () => (
      <FilterForm
        _config={{
          _filterBody: _config?._filterBody,
          _checkbox: {
            sx: checkboxStyle,
          },
        }}
        onApply={(newFilterState: any) => {
          setFilterCount(
            Object?.keys(newFilterState ?? {}).filter(
              (e) => e?.toString() != 'limit'
            ).length
          );
          handleFilterChange(newFilterState);
        }}
        onlyFields={onlyFields}
        isOpenColapsed={isOpenColapsed}
        filterFramework={filterFramework}
        orginalFormData={filterState?.filters ?? {}}
        staticFilter={staticFilter}
      />
    ),
    [
      handleFilterChange,
      filterFramework,
      isOpenColapsed,
      staticFilter,
      onlyFields,
      filterState,
      _config,
      checkboxStyle,
    ]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        ...(_config?._filterBox?.sx ?? {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #D0C5B4',
          pb: 2,
          ...(_config?._filterText?.sx ?? {}),
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 500,
          }}
        >
          {t('LEARNER_APP.COURSE.FILTER_BY')}{' '}
          {filterCount > 0 && `(${filterCount})`}
        </Typography>
        {filterCount > 0 && (
          <Button
            variant="text"
            sx={{
              color: theme.palette.secondary.main,
            }}
            onClick={() => {
              setFilterCount(0);
              handleFilterChange({});
            }}
          >
            {t('LEARNER_APP.COURSE.CLEAR_FILTER')}
          </Button>
        )}
      </Box>
      {memoizedFilterForm}
    </Box>
  );
};

export default React.memo(FilterComponent);

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useTranslation, FilterForm } from '@shared-lib';
import { useColorInversion } from '../../context/ColorInversionContext';
import { logEvent } from '@learner/utils/googleAnalytics';

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
  let cleanedUrl = '';
if (typeof window !== 'undefined') {
  const windowUrl = window.location.pathname;
  cleanedUrl = windowUrl;
}
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

  // Store previous filter state for comparison
  const prevFilterState = useRef<any>({});

  // Helper to compare arrays
  const arraysEqual = (a: any[], b: any[]) =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

  // Helper to check if value changed
  const hasChanged = (key: string, newVal: any) => {
    const prevVal = prevFilterState.current[key];
    if (Array.isArray(newVal)) return !arraysEqual(prevVal, newVal);
    return prevVal !== newVal;
  };

  const memoizedFilterForm = useMemo(
    () => (
      <FilterForm
        _config={{
          t: t,
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
          console.log('FilterComponent: onApply', newFilterState);

          // Only log if value changed
          if (newFilterState?.se_domains && hasChanged('se_domains', newFilterState.se_domains)) {
            logEvent({
              action: 'filter-selection-by-domain:' + newFilterState.se_domains.join(','),
              category: cleanedUrl ,
              label: 'Selection of domain',
            });
          }
          if (newFilterState?.se_subDomains && hasChanged('se_subDomains', newFilterState.se_subDomains)) {
            logEvent({
              action: 'filter-selection-by-category:' + newFilterState.se_subDomains.join(','),
              category: cleanedUrl,
              label: 'Selection of category',
            });
          }
          if (newFilterState?.se_subjects && hasChanged('se_subjects', newFilterState.se_subjects)) {
            logEvent({
              action: 'filter-selection-by-subject:' + newFilterState.se_subjects.join(','),
              category: cleanedUrl ,
              label: 'Selection of subject',
            });
          }
          if (newFilterState?.targetAgeGroup && hasChanged('targetAgeGroup', newFilterState.targetAgeGroup)) {
            logEvent({
              action: 'filter-selection-by-age-group:' + newFilterState.targetAgeGroup.join(','),
              category: cleanedUrl ,
              label: 'Selection of age group',
            });
          }
          if (newFilterState?.primaryUser && hasChanged('primaryUser', newFilterState.primaryUser)) {
            logEvent({
              action: 'filter-selection-by-primary-user:' + newFilterState.primaryUser.join(','),
              category: cleanedUrl,
              label: 'Selection of primary user',
            });
          }
          if (newFilterState?.contentLanguage && hasChanged('contentLanguage', newFilterState.contentLanguage)) {
            logEvent({
              action: 'filter-selection-by-content-language:' + newFilterState.contentLanguage.join(',').toString(),
              category: cleanedUrl,
              label: 'Selection of content language',
            });
          }

          // Update previous filter state
          prevFilterState.current = { ...newFilterState };

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

//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type Batch = {
  cohortId: string;
  name: string;
};

type Cohort = {
  cohortId: string;
  name: string;
  childData: Batch[];
};

type SelectedData = {
  cohortId: string;
  name: string;
  childData: Batch[];
};

const CohortBatchSelector: React.FC<> = ({
  data,
  prefillSelection = [],
  onFinish,
  t,
  onCloseNextForm,
}) => {
  const [step, setStep] = useState<'cohort' | 'batch'>('cohort');
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [selectedMap, setSelectedMap] = useState<Record<string, Set<string>>>(
    {}
  );

  // Prefill setup
  useEffect(() => {
    const initialMap: Record<string, Set<string>> = {};
    prefillSelection.forEach((cohort) => {
      initialMap[cohort.cohortId] = new Set(
        cohort.childData.map((child) => child.cohortId)
      );
    });
    setSelectedMap(initialMap);
  }, [prefillSelection]);

  const handleCohortClick = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setStep('batch');
  };

  const toggleBatch = (batchId: string) => {
    if (!selectedCohort) return;
    const cohortId = selectedCohort.cohortId;
    const currentSet = selectedMap[cohortId] || new Set();
    const updatedSet = new Set(currentSet);

    if (updatedSet.has(batchId)) {
      updatedSet.delete(batchId);
    } else {
      updatedSet.add(batchId);
    }

    setSelectedMap({
      ...selectedMap,
      [cohortId]: updatedSet,
    });
  };

  const toggleSelectAll = () => {
    if (!selectedCohort) return;
    const cohortId = selectedCohort.cohortId;
    const allIds = selectedCohort.childData.map((b) => b.cohortId);
    const currentSet = selectedMap[cohortId] || new Set();

    const newSet =
      currentSet.size === allIds.length ? new Set() : new Set(allIds);

    setSelectedMap({
      ...selectedMap,
      [cohortId]: newSet,
    });
  };

  const getSelectedCount = (cohort: Cohort) =>
    selectedMap[cohort.cohortId]?.size || 0;

  const handleBack = () => {
    setSelectedCohort(null);
    setStep('cohort');
  };

  const handleFinish = () => {
    const finalData: SelectedData[] = data
      .map((cohort) => {
        const selectedBatches = selectedMap[cohort.cohortId];
        if (!selectedBatches || selectedBatches.size === 0) return null;
        const selectedChildren = cohort.childData.filter((batch) =>
          selectedBatches.has(batch.cohortId)
        );
        return {
          cohortId: cohort.cohortId,
          name: cohort.name,
          childData: selectedChildren,
        };
      })
      .filter(Boolean) as SelectedData[];

    onFinish(finalData);
  };

  const handleBackPress = () => {
    const finalData: SelectedData[] = data
      .map((cohort) => {
        const selectedBatches = selectedMap[cohort.cohortId];
        if (!selectedBatches || selectedBatches.size === 0) return null;
        const selectedChildren = cohort.childData.filter((batch) =>
          selectedBatches.has(batch.cohortId)
        );
        return {
          cohortId: cohort.cohortId,
          name: cohort.name,
          childData: selectedChildren,
        };
      })
      .filter(Boolean) as SelectedData[];

    onCloseNextForm(finalData);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {step === 'cohort' ? (
        <>
          <Box flex={1} overflow="auto">
            <Typography variant="h2" mb={1} ml={1}>
              Select Center
            </Typography>
            <Box>
              {data?.map((cohort: any) => (
                <Box
                  key={cohort.cohortId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  padding={'10px'}
                  borderRadius={2}
                  border="1px solid #D0C5B4"
                  sx={{
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    marginBottom: 2,
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                  onClick={() => handleCohortClick(cohort)}
                >
                  <Box>
                    <Box
                      sx={{
                        color: 'rgb(31, 27, 19)',
                        fontWeight: 400,
                        fontSize: '16px',
                      }}
                    >
                      {cohort.name}
                    </Box>
                    <Box
                      sx={{
                        color: 'rgb(99, 94, 87)',
                        fontWeight: 400,
                        fontSize: '16px',
                      }}
                    >
                      {getSelectedCount(cohort)} selected
                    </Box>
                  </Box>
                  <IconButton>
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            {/* <List>
              {data.map((cohort) => (
                <ListItem
                  button
                  key={cohort.cohortId}
                  onClick={() => handleCohortClick(cohort)}
                >
                  <ListItemText primary={cohort.name} />
                  <ListItemSecondaryAction>
                    <Typography color="textSecondary">
                      {getSelectedCount(cohort)} selected
                    </Typography>
                    <ArrowForwardIcon />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List> */}
          </Box>
          <Box
            position="sticky"
            bottom={0}
            bgcolor="#fff"
            p={2}
            borderTop="1px solid #eee"
            display="flex"
          >
            <IconButton onClick={handleBackPress}>
              <ArrowBackIcon />
              <Typography variant="h2" ml={1}>
                {t('MENTOR.BACK_TO_FORM')}
              </Typography>
            </IconButton>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFinish}
              disabled={Object.values(selectedMap).every(
                (set) => set.size === 0
              )}
            >
              {t('MENTOR.FINISH_ASSIGN')}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box
            position="sticky"
            top={0}
            zIndex={10}
            bgcolor="#fff"
            px={2}
            py={1}
            borderBottom="1px solid #eee"
            display="flex"
            alignItems="center"
          >
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
              <Typography variant="h2" ml={1}>
                Select Batches for: {selectedCohort?.name}
              </Typography>
            </IconButton>
          </Box>
          <Box flex={1} overflow="auto">
            <List>
              <ListItem button onClick={toggleSelectAll}>
                <Checkbox
                  checked={selectedCohort?.childData.every((b) =>
                    selectedMap[selectedCohort.cohortId]?.has(b.cohortId)
                  )}
                />
                <ListItemText primary="Select All" />
              </ListItem>
              <Divider />
              {selectedCohort?.childData.map((batch) => (
                <ListItem
                  button
                  key={batch.cohortId}
                  onClick={() => toggleBatch(batch.cohortId)}
                >
                  <Checkbox
                    checked={
                      selectedMap[selectedCohort.cohortId]?.has(
                        batch.cohortId
                      ) || false
                    }
                  />
                  <ListItemText primary={batch.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CohortBatchSelector;

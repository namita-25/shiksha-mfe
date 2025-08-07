// @ts-nocheck
// CohortBatchSelector.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [savedSelections, setSavedSelections] = useState<
    Record<string, Set<string>>
  >({});
  const [tempSelectedMap, setTempSelectedMap] = useState<
    Record<string, Set<string>>
  >({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Prefill setup
  useEffect(() => {
    const initialMap: Record<string, Set<string>> = {};
    const initialSavedMap: Record<string, Set<string>> = {};
    prefillSelection.forEach((cohort) => {
      initialMap[cohort.cohortId] = new Set(
        cohort.childData.map((child) => child.cohortId)
      );
      initialSavedMap[cohort.cohortId] = new Set(
        cohort.childData.map((child) => child.cohortId)
      );
    });
    setSelectedMap(initialMap);
    setSavedSelections(initialSavedMap);
    setTempSelectedMap(initialMap);
  }, [prefillSelection]);

  const handleCohortClick = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setStep('batch');
    // Initialize temp map with current saved selections when entering batch selection
    setTempSelectedMap({ ...savedSelections });
  };

  const toggleBatch = (batchId: string) => {
    if (!selectedCohort) return;
    const cohortId = selectedCohort.cohortId;
    const currentSet = tempSelectedMap[cohortId] || new Set();
    const updatedSet = new Set(currentSet);

    if (updatedSet.has(batchId)) {
      updatedSet.delete(batchId);
    } else {
      updatedSet.add(batchId);
    }

    setTempSelectedMap({
      ...tempSelectedMap,
      [cohortId]: updatedSet,
    });
  };

  const toggleSelectAll = () => {
    if (!selectedCohort) return;
    const cohortId = selectedCohort.cohortId;
    const allIds = selectedCohort.childData.map((b) => b.cohortId);
    const currentSet = tempSelectedMap[cohortId] || new Set();

    const newSet =
      currentSet.size === allIds.length ? new Set() : new Set(allIds);

    setTempSelectedMap({
      ...tempSelectedMap,
      [cohortId]: newSet,
    });
  };

  const getSelectedCount = (cohort: Cohort) =>
    savedSelections[cohort.cohortId]?.size || 0;

  const handleSaveSelection = () => {
    setSavedSelections(tempSelectedMap);
    setSelectedMap(tempSelectedMap);
    setStep('cohort');
  };

  const hasUnsavedChanges = () => {
    if (!selectedCohort) return false;
    const cohortId = selectedCohort.cohortId;
    const savedSet = savedSelections[cohortId] || new Set();
    const tempSet = tempSelectedMap[cohortId] || new Set();

    if (savedSet.size !== tempSet.size) return true;

    for (const id of savedSet) {
      if (!tempSet.has(id)) return true;
    }
    for (const id of tempSet) {
      if (!savedSet.has(id)) return true;
    }
    return false;
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setPendingAction(() => () => {
        setTempSelectedMap(savedSelections);
        setSelectedCohort(null);
        setStep('cohort');
      });
      setShowConfirmDialog(true);
    } else {
      setSelectedCohort(null);
      setStep('cohort');
    }
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

  const handleConfirmDialogClose = (confirmed: boolean) => {
    setShowConfirmDialog(false);
    if (confirmed && pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleFinish = () => {
    const finalData: SelectedData[] = data
      .map((cohort) => {
        const selectedBatches = savedSelections[cohort.cohortId];
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

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {step === 'cohort' ? (
        <>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}
            onClick={handleBackPress}
            cursor="pointer"
          >
            <ArrowBackIcon />
            <Typography variant="h2">{t('MENTOR.BACK_TO_FORM')}</Typography>
          </Box>
          <Box flex={1} overflow="auto">
            <Typography variant="h2" mb={1}>
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
            borderTop="1px solid #eee"
            display="flex"
            padding="16px  0 0 0"
            width={'100%'}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleFinish}
              disabled={Object.values(selectedMap).every(
                (set) => set.size === 0
              )}
              sx={{
                width: '100%',
              }}
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
            pt={1}
            borderBottom="1px solid #eee"
            display="flex"
            alignItems="center"
          >
            {/* <IconButton onClick={handleBack}> */}
            {/* <ArrowBackIcon /> */}
            <Typography variant="h2" ml={1}>
              Select Batches for {selectedCohort?.name} (
              {tempSelectedMap[selectedCohort?.cohortId]?.size || 0} selected)
            </Typography>
            {/* </IconButton> */}
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
                      tempSelectedMap[selectedCohort.cohortId]?.has(
                        batch.cohortId
                      ) || false
                    }
                  />
                  <ListItemText primary={batch.name} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box
            position="sticky"
            bottom={0}
            bgcolor="#fff"
            borderTop="1px solid #eee"
            display="flex"
            padding="16px 0"
            width="100%"
            gap={2}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBack}
              sx={{ width: '50%' }}
            >
              {t('MENTOR.BACK')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveSelection}
              sx={{ width: '50%' }}
            >
              {t('MENTOR.SAVE_SELECTION')}
            </Button>
          </Box>
        </>
      )}

      <Dialog
        open={showConfirmDialog}
        onClose={() => handleConfirmDialogClose(false)}
      >
        {/* <DialogTitle>Unsaved Changes</DialogTitle> */}
        <DialogContent>
          <Typography>
            Are you sure you want to go back without saving?{' '}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConfirmDialogClose(false)}
            color="primary"
          >
            No, cancel
          </Button>
          <Button
            onClick={() => handleConfirmDialogClose(true)}
            color="primary"
            variant="contained"
          >
            Yes, go back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CohortBatchSelector;

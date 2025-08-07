// ConfirmationDialog.tsx
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type ConfirmOptions = {
  title: string;
  message: string;
  yesText: string;
  noText: string;
  onYes: () => void;
};

export const useConfirmationDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [yesText, setYesText] = useState('');
  const [noText, setNoText] = useState('');
  const [onYesCallback, setOnYesCallback] = useState<() => void>(
    () => () => {}
  );

  const openConfirmation = useCallback((options: ConfirmOptions) => {
    setTitle(options.title);
    setMessage(options.message);
    setYesText(options.yesText);
    setNoText(options.noText);
    setOnYesCallback(() => options.onYes);
    setOpen(true);
  }, []);

  const closeConfirmation = useCallback(() => {
    setOpen(false);
  }, []);

  const ConfirmationDialog = (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing on backdrop click or escape key
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          closeConfirmation();
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          p: 3,
          pb: 1,
        }}
      >
        <Typography variant="h1">{title}</Typography>
        <IconButton onClick={closeConfirmation}>
          <CloseIcon sx={{ color: 'black', fontWeight: 'bold', mt: -5 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 3 }}>{message}</Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #eee',
          p: 2,
        }}
      >
        <Button
          onClick={() => {
            onYesCallback();
            closeConfirmation();
          }}
          variant="outlined"
          fullWidth
          sx={{
            fontSize: '15px',
            '&.MuiButton-outlined': {
              borderColor: '#BA1A1A',
              color: '#BA1A1A',
            },
          }}
        >
          {yesText}
        </Button>
        <Button
          onClick={closeConfirmation}
          variant="outlined"
          fullWidth
          sx={{
            fontSize: '15px',
          }}
        >
          {noText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return {
    ConfirmationDialog,
    openConfirmation,
    closeConfirmation,
  };
};

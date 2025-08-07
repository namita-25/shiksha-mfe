// AlertDialog.tsx
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

type AlertOptions = {
  message: string;
  okText: string;
};

export const useAlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [okText, setOkText] = useState('');

  const openAlert = useCallback((options: AlertOptions) => {
    setMessage(options.message);
    setOkText(options.okText);
    setOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setOpen(false);
  }, []);

  const AlertDialog = (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing on backdrop click or escape key
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          closeAlert();
        }
      }}
    >
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
            closeAlert();
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
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return {
    AlertDialog,
    openAlert,
    closeAlert,
  };
};

import React from 'react';
import { Dialog, Box, Typography, Button, Fade } from '@mui/material';

const poppinsFont = {
  fontFamily: 'Poppins',
};

interface ConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: '#fff',
          boxShadow: '0px 8px 32px rgba(31, 27, 19, 0.12)',
          p: 0,
          minWidth: 510,
          maxWidth: 600,
        },
      }}
      transitionDuration={400}
      TransitionComponent={Fade}
      hideBackdrop={false}
    >
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography
          sx={{
            ...poppinsFont,
            fontWeight: 500,
            fontSize: 20,
            color: '#1F1B13',
            mb: 2,
          }}
        >
          Confirm Question Generation
        </Typography>
        <Typography
          sx={{
            ...poppinsFont,
            fontWeight: 400,
            fontSize: 16,
            color: '#635E57',
            mb: 4,
          }}
        >
          Be sure to check all parameters before generating the questions. You
          won't be able to edit the parameters once generation starts
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            width: '100%',
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#FDBE16',
              color: '#1E1B16',
              borderRadius: '100px',
              height: 40,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#E5AB14',
              },
            }}
            onClick={onConfirm}
          >
            Yes, Start
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              height: 40,
              borderRadius: '100px',
              py: 1.5,
              borderColor: '#635E57',
              color: '#635E57',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#1F1B13',
                color: '#1F1B13',
              },
            }}
            onClick={onCancel}
          >
            No, Cancel
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;

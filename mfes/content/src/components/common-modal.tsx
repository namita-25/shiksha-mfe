import React from 'react';
import { Modal, Paper, Box, Divider, Button } from '@mui/material';

interface CommonModalProps {
  open: boolean;
  onClose?: () => void;
  onStartLearning: () => void;
  children: React.ReactNode;
  buttonText: string;
}

const CommonModal: React.FC<CommonModalProps> = ({
  open,
  onClose,
  onStartLearning,
  children,
  buttonText,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="enroll-success-modal"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper
        elevation={3}
        sx={{
          minWidth: 300,
          maxWidth: 460,
          borderRadius: 3,
          p: 0,
          overflow: 'hidden',
        }}
      >
        {children}
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            background: '#fff',
            py: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onStartLearning}
            sx={{
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0.1px',
              textAlign: 'center',
              verticalAlign: 'middle',
            }}
            disableElevation
          >
            {buttonText}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CommonModal;

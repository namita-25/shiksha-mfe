import React, { ReactNode } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Modal,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  submitText?: string;
  handleSubmit?: () => void;
  children?: ReactNode;
}

const CommonModal: React.FC<CommonModalProps> = ({
  isOpen,
  onClose,
  submitText,
  handleSubmit,
  children,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 500,
          borderRadius: 2,
          padding: '10px 0 24px 0',
          outline: 'none',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 1 }}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box px={3}>{children}</Box>
        <Divider />
        <Box pt={3} px={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              bgcolor: '#FFC107',
              color: 'black',
              py: 1.5,
              fontWeight: 'medium',
              '&:hover': {
                bgcolor: '#FFB000',
              },
            }}
          >
            {submitText}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CommonModal;

import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface GenericModalProps {
  open: boolean;
  onClose: () => void;
  onClickPrimary: () => void;
  title: string;
  children?: React.ReactNode;
  checked?: boolean;
  primary?: string;
  secondary: string;
  reason?: any;
  centerPrimary?: any;
  isFromMarkAsVoluteer?: boolean;
}

const ConfirmationPopup: React.FC<GenericModalProps> = ({
  open,
  onClose,
  title,
  children,
  checked,
  primary,
  secondary,
  reason,
  centerPrimary,
  onClickPrimary,
  isFromMarkAsVoluteer,
}) => {
  const theme = useTheme<any>();
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          // p: 3,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
          }}
          display="flex"
          justifyContent="space-between"
          alignItems="start"
        >
          <Typography id="modal-title">{title}</Typography>
          <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Divider />
        {children && (
          <>
            <Box sx={{ p: 2 }}>{children}</Box>
            <Divider />
          </>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            p: 2,
          }}
        >
          {secondary && (
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                color: theme.palette.warning[300],
                fontSize: '14px',
                fontWeight: '500',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                mt: 2,
              }}
              className="one-line-text"
              variant="outlined"
            >
              {secondary}
            </Button>
          )}
          {checked && (
            <Button
              variant="contained"
              fullWidth
              disabled={isFromMarkAsVoluteer ? !checked : !checked || !reason}
              onClick={() => {
                if (onClickPrimary) onClickPrimary();
                if (onClose) onClose();
              }}
              color="primary"
              sx={{
                padding: theme.spacing(1),
                fontWeight: '500',
                mt: 2,
              }}
            >
              {primary}
            </Button>
          )}
          {centerPrimary && (
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={() => {
                if (onClickPrimary) onClickPrimary();
                if (onClose) onClose();
              }}
              sx={{
                padding: theme.spacing(1),
                fontWeight: '500',
                mt: 2,
              }}
            >
              {centerPrimary}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationPopup;

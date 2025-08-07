import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import {
  Box,
  Button,
  Divider,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode } from 'react';

interface SimpleModalProps {
  secondaryActionHandler?: () => void;
  primaryActionHandler?: () => void;
  secondaryText?: string;
  primaryText?: string;
  showFooter?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  modalTitle: string;
  isFullwidth?: boolean;
  id?: any;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  open,
  onClose,
  primaryText,
  secondaryText,
  showFooter = true,
  primaryActionHandler,
  secondaryActionHandler,
  footer,
  children,
  modalTitle,
  isFullwidth = false,
  id = '',
}) => {
  const theme = useTheme<any>();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const modalStyle = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '92%',
    maxWidth: '450px',
    maxHeight: '80vh',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: '8px',
    boxShadow:
      'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 5px 8px 0px, rgba(0, 0, 0, 0.12) 0px 1px 14px 0px',
  };

  const titleStyle = {
    position: 'sticky' as const,
    top: '0',
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    zIndex: 9999,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: theme.spacing(2),
  };

  const footerStyle = {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" sx={titleStyle}>
          <Typography
            variant="h2"
            sx={{ color: theme.palette.warning.A200 }}
            component="h2"
          >
            {modalTitle}
          </Typography>
          <CloseSharpIcon
            sx={{ cursor: 'pointer' }}
            onClick={onClose}
            aria-label="Close"
          />
        </Box>
        <Divider />
        <Box sx={contentStyle}>{children}</Box>
        <Divider />
        {showFooter &&
          (footer ? (
            <Box sx={footerStyle}>{footer}</Box> // Render the custom footer content if provided
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={footerStyle}
              gap={'10px'}
            >
              {primaryText && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    '&.Mui-disabled': {
                      backgroundColor: theme?.palette?.primary?.main,
                    },
                    padding: theme.spacing(1),
                    fontWeight: '500',
                    width: '100%',
                  }}
                  onClick={primaryActionHandler}
                  form={id}
                  type="submit"
                >
                  {primaryText}
                </Button>
              )}
              {secondaryText && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    '&.Mui-disabled': {
                      backgroundColor: theme?.palette?.primary?.main,
                    },
                    minWidth: '84px',
                    height: '2.5rem',
                    padding: theme.spacing(1),
                    fontWeight: '500',
                    width: '100%',
                  }}
                  onClick={secondaryActionHandler}
                >
                  {secondaryText}
                </Button>
              )}
            </Box>
          ))}
      </Box>
    </Modal>
  );
};

export default SimpleModal;

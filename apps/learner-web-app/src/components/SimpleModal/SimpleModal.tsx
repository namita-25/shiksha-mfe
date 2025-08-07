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

import CloseSharpIcon from '@mui/icons-material/CloseSharp';
// import { useTheme } from '@mui/material/styles';
import { modalStyles } from '@forget-password/styles/modalStyles';
// import { modalStyles } from '@forget-password/styles/modalStyles';
// import { modalStyles } from '../styles/modalStyles';

interface SimpleModalProps {
  secondaryActionHandler?: () => void;
  primaryActionHandler?: () => void;
  secondaryText?: string;
  primaryText?: string;
  showFooter?: boolean;
  children?: ReactNode;
  open: boolean;
  onClose: () => void;
  modalTitle?: string;
  handleNext?: any;
  id?: string;
  footerText?: string;
}
const SimpleModal: React.FC<SimpleModalProps> = ({
  open,
  onClose,
  primaryText,
  secondaryText,
  showFooter = true,
  primaryActionHandler,
  secondaryActionHandler,
  children,
  modalTitle,
  handleNext,
  id = '',
  footerText,
}) => {
  const theme = useTheme<any>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const titleStyle = {
    backgroundColor: theme.palette.warning['A400'],
    padding: theme.spacing(2),
    zIndex: 1,
    borderRadius: '12px 12px 0 0',
  };

  const footerStyle = {
    padding: '8px 16px',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: isMobile ? 'center' : 'flex-end',
    zIndex: 1,
    borderRadius: '0 0 12px 12px',
    backgroundColor: theme.palette.warning['A400'],
  };

  const contentStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '16px',
    maxHeight: '60vh',
  };

  const buttonStyle = {
    width: isMobile ? '100%' : '100%',
    margin: isMobile ? '8px 0' : '10px',
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box sx={modalStyles}>
        {/* Header */}
        {modalTitle && (
          <>
            <Box
              display={'flex'}
              justifyContent={'space-between'}
              sx={titleStyle}
            >
              <Typography
                variant="h5"
                sx={{ color: theme.palette.warning['A200'] }}
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
          </>
        )}

        {/* Scrollable Content */}
        <Box sx={contentStyle}>{children}</Box>

        <Divider />

        {/* Footer */}
        {showFooter && (
          <>
            {footerText && (
              <Box>
                <Typography
                  variant="h2"
                  component="h2"
                  fontWeight={600}
                  // fontSize="16px"
                  textAlign="center"
                  mt="10px"
                >
                  {footerText}
                </Typography>
              </Box>
            )}
            <Box sx={footerStyle}>
              {secondaryText && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={secondaryActionHandler}
                  className="one-line-text"
                  sx={{
                    ...buttonStyle,
                    display: '-webkit-box !important',
                  }}
                >
                  {secondaryText}
                </Button>
              )}
              {primaryText && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={buttonStyle}
                  onClick={primaryActionHandler || handleNext}
                  className="one-line-text"
                  form={id}
                  type="submit"
                >
                  {primaryText}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default SimpleModal;

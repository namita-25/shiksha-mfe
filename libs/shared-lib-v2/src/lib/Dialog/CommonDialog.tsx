import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface CommonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  disableCloseOnBackdropClick?: boolean;
}

export const CommonDialog: React.FC<CommonDialogProps> = ({
  isOpen,
  onClose,
  header,
  children,
  actions,
  disableCloseOnBackdropClick = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={disableCloseOnBackdropClick ? undefined : onClose}
      aria-labelledby="common-dialog-title"
      aria-describedby="common-dialog-description"
    >
      {header && <DialogTitle id="common-dialog-title">{header}</DialogTitle>}
      {children && <DialogContent>{children}</DialogContent>}
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

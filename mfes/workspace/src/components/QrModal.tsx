'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef } from 'react';

interface QrModalProps {
  open: boolean;
  onClose: () => void;
  qrValue: string;
}

const QrModal: React.FC<QrModalProps> = ({ open, onClose, qrValue }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        QR Code
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        ref={containerRef}
        sx={{ display: 'flex', justifyContent: 'center', p: 4 }}
      >
        <QRCodeCanvas
          value={qrValue}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownload} variant="contained">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrModal;

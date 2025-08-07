import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BlockIcon from '@mui/icons-material/Block';
import { useSpeechContext } from '../context/SpeechContext';

/**
 * A component that displays a visual indicator when text-to-speech is active
 * and navigation is paused
 */
const SpeechNavigationIndicator: React.FC = () => {
  const { isSpeechEnabled } = useSpeechContext();

  if (!isSpeechEnabled) return null;

  return (
    <Fade in={isSpeechEnabled}>
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          gap: 1.5,
        }}
      >
        <VolumeUpIcon color="primary" />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Text-to-Speech Active
        </Typography>
        <BlockIcon sx={{ fontSize: '1rem', color: 'error.main', ml: 0.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Navigation Paused
        </Typography>
      </Box>
    </Fade>
  );
};

export default SpeechNavigationIndicator;

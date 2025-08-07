import React, { useState, useEffect } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { Tooltip, Button } from '@mui/material';
import type { TooltipProps } from '@mui/material';
import useDisableClicks from '../../hooks/useDisableClicks';
import { useSpeechContext } from '../context/SpeechContext';

interface SpeechAwareTooltipProps {
  children: ReactElement;
  title?: string;
  placement?: TooltipProps['placement'];
  // Any other props we want to pass to the Tooltip component
  [key: string]: any;
}

/**
 * A wrapper component that automatically adds speech-aware tooltips to clickable elements.
 * It shows a standard message when speech is active, and falls back to the provided title when not.
 * Also provides a button to enable speech when hovering over content.
 */
const SpeechAwareTooltip: React.FC<SpeechAwareTooltipProps> = ({
  children,
  title = '',
  placement = 'bottom',
  ...props
}) => {
  const { isSpeechActive } = useDisableClicks();
  const { isSpeechEnabled, enableSpeech } = useSpeechContext();
  const [isHovering, setIsHovering] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    const isSynthesisSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.getVoices().length > 0;

    setIsSpeechSupported(isSynthesisSupported);

    // Try to load voices if they're not available yet
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        setIsSpeechSupported(window.speechSynthesis.getVoices().length > 0);
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

      // Cleanup
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleEnableSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    enableSpeech();
  };

  let tooltipTitle: ReactNode = title;

  if (isSpeechActive) {
    tooltipTitle = 'Navigation is paused while text-to-speech is active';
  } else if (!isSpeechEnabled && isSpeechSupported) {
    tooltipTitle = (
      <Button
        onClick={handleEnableSpeech}
        size="small"
        variant="contained"
        color="primary"
        data-speech-control="true"
        sx={{
          bgcolor: '#FDBE16',
          color: '#1F1B13',
          '&:hover': { bgcolor: '#e9a416' },
          fontSize: '12px',
          py: 0.5,
        }}
      >
        Enable text to speech
      </Button>
    );
  }

  // If there's no title and speech is not active, or speech is not supported
  // don't wrap in a Tooltip at all
  if (
    (!tooltipTitle && !isSpeechEnabled && !isHovering) ||
    !isSpeechSupported
  ) {
    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
    );
  }

  return (
    <Tooltip
      title={tooltipTitle}
      placement={placement}
      {...props}
      onOpen={handleMouseEnter}
      onClose={handleMouseLeave}
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default SpeechAwareTooltip;

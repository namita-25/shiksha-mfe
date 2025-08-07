import React, { useState, useEffect } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import useSpeech from '../../hooks/useSpeech';
import { useSpeechContext } from '../context/SpeechContext';

interface SpeakableTextProps {
  children: ReactNode;
  text?: string; // Optional explicit text to speak (falls back to children if text is rendered as string)
  className?: string;
  style?: React.CSSProperties;
  cursor?: boolean;
}

/**
 * A component that makes its content speakable when clicked
 * Enhanced for cross-browser compatibility
 */
const SpeakableText: React.FC<SpeakableTextProps> = ({
  children,
  text,
  className,
  style,
  cursor,
}) => {
  const { speak, stop, isSupported, usingFallback } = useSpeech();
  const { isSpeechEnabled } = useSpeechContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Handle speaking state with browser compatibility checks
  useEffect(() => {
    if (!isSupported || usingFallback) return;

    const handleSpeakStart = () => setIsSpeaking(true);
    const handleSpeakEnd = () => setIsSpeaking(false);

    try {
      window.speechSynthesis.addEventListener('start', handleSpeakStart);
      window.speechSynthesis.addEventListener('end', handleSpeakEnd);
      window.speechSynthesis.addEventListener('pause', handleSpeakEnd);
      window.speechSynthesis.addEventListener('cancel', handleSpeakEnd);

      return () => {
        window.speechSynthesis.removeEventListener('start', handleSpeakStart);
        window.speechSynthesis.removeEventListener('end', handleSpeakEnd);
        window.speechSynthesis.removeEventListener('pause', handleSpeakEnd);
        window.speechSynthesis.removeEventListener('cancel', handleSpeakEnd);
      };
    } catch (e) {
      console.warn('Could not attach speech event listeners:', e);
      return undefined;
    }
  }, [isSupported, usingFallback]);

  const handleClick = (e: MouseEvent) => {
    // If speech is not enabled, do nothing and allow event propagation
    if (!isSpeechEnabled) return;

    // Prevent the default action and stop propagation
    // to prevent links and click events from firing
    e.preventDefault();
    e.stopPropagation();

    // If currently speaking, stop
    if (isSpeaking) {
      stop();
      return;
    }

    // If explicit text is provided, use it
    // Otherwise, try to use children if it's a string
    const textToSpeak = text || (typeof children === 'string' ? children : '');

    if (textToSpeak) {
      const succeeded = speak(textToSpeak);
      // For fallback mode or when using browsers without speech events
      if (usingFallback && succeeded) {
        setIsSpeaking(true);
        // Simulate speaking for approximately 3-5 seconds based on text length
        const speakingDuration = Math.min(3000 + textToSpeak.length * 50, 7000);
        setTimeout(() => {
          setIsSpeaking(false);
        }, speakingDuration);
      }
    }
  };

  // Mouse event handlers for hover effect
  const handleMouseEnter = () => {
    if (isSpeechEnabled && isSupported) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Apply speaking styles based on browser capability
  const speakableStyle: React.CSSProperties = {
    cursor: isSupported && isSpeechEnabled ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...(isSpeaking
      ? {
          color: '#4CAF50',
          textDecoration: 'underline',
        }
      : isHovering && isSpeechEnabled
      ? {
          textDecoration: 'underline',
          borderBottom: '1px dashed #666',
        }
      : {}),
    ...style,
  };

  // Add a title based on browser compatibility
  const getTitle = (): object => {
    if (!isSupported) {
      return {};
    } else if (usingFallback) {
      return {};
    } else if (!isSpeechEnabled) {
      return {};
    } else {
      return {
        title: isSpeaking
          ? 'Click to stop speaking'
          : 'Click to hear this text',
      };
    }
  };

  return (
    <span
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...speakableStyle,
        cursor: cursor ? 'pointer' : 'inherit',
      }}
      {...getTitle()}
      data-speakable="true"
    >
      {children}
      {isSpeechEnabled && isSpeaking && (
        <span style={{ marginLeft: '5px', display: 'inline-block' }}>🔊</span>
      )}
    </span>
  );
};

export default SpeakableText;

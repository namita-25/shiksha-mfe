import type { MouseEvent } from 'react';
import { useSpeechContext } from '../lib/context/SpeechContext';
import { useEffect } from 'react';

/**
 * A custom hook that provides a global click interceptor when text-to-speech is enabled
 * and helpers for individual components to handle clicks
 * @returns Methods to handle clicks and speech-active state
 */
const useDisableClicks = () => {
  const { isSpeechEnabled } = useSpeechContext();

  // Set up a global click interceptor when speech is active
  useEffect(() => {
    if (!isSpeechEnabled) return; // Only add listener when speech is enabled

    const handleGlobalClick = (e: MouseEvent | any) => {
      // Check if the target is a link, button, or has an onClick handler
      // We use 'any' type here because the DOM event doesn't match React's MouseEvent exactly
      const target = e.target as HTMLElement;
      
      // Find the closest clickable element (could be a parent of the target)
      const clickableElement = target.closest('a, button, [role="button"], [href], [onclick], [tabindex="0"]');
      
      // Enhanced detection for clickable elements
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.hasAttribute('href') ||
        target.getAttribute('role') === 'button' ||
        target.onclick ||
        target.hasAttribute('tabindex') ||
        clickableElement !== null;
      
      // Don't block clicks on the speech toggle or SpeakableText components
      const isSpeechControl = 
        target.closest('[data-speech-control="true"]') || // For SpeechToggle
        target.closest('[data-speakable="true"]');        // For SpeakableText
      
      if (isClickable && !isSpeechControl) {
        // Prevent default behavior (prevents navigation)
        e.preventDefault();
        // Stop propagation (prevents other click handlers)
        e.stopPropagation();
        // Return false for good measure (old-school way to prevent default)
        return false;
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleGlobalClick, true); // Capture phase
    
    // Also intercept touchend events for mobile
    document.addEventListener('touchend', handleGlobalClick, true);
    
    // Also prevent keydown events for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Enter and Space key presses (used for navigation/clicking)
      if ((e.key === 'Enter' || e.key === ' ')) {
        const target = e.target as HTMLElement;
        const isSpeechControl = target && (
          target.closest('[data-speech-control="true"]') || 
          target.closest('[data-speakable="true"]')
        );
        
        if (!isSpeechControl) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('touchend', handleGlobalClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isSpeechEnabled]);

  /**
   * Prevents the default action and stops propagation for a click event
   * when text-to-speech is enabled
   * @param e - The mouse event to handle
   * @returns boolean - Whether the event was prevented
   */
  const preventClickWhenSpeechEnabled = (e: MouseEvent): boolean => {
    if (isSpeechEnabled) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    return false;
  };

  /**
   * Higher-order function to wrap click handlers and prevent them from firing
   * when text-to-speech is enabled
   * @param handler - The original click handler function
   * @returns A function that conditionally calls the original handler
   */
  const conditionalClickHandler = (
    handler: ((e: MouseEvent) => void) | undefined
  ) => {
    return (e: MouseEvent) => {
      if (isSpeechEnabled) {
        e.preventDefault();
        e.stopPropagation();
      } else if (handler) {
        handler(e);
      }
    };
  };

  return {
    preventClickWhenSpeechEnabled,
    conditionalClickHandler,
    isSpeechActive: isSpeechEnabled
  };
};

export default useDisableClicks; 
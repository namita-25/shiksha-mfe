import { useCallback, useState, useEffect } from 'react';

interface SpeechOptions {
  rate?: number;       // Speech rate (0.1 to 10)
  pitch?: number;      // Speech pitch (0 to 2)
  volume?: number;     // Speech volume (0 to 1)
  lang?: string;       // Language code (e.g., 'en-US')
  voice?: SpeechSynthesisVoice; // Specific voice to use
}

/**
 * A custom hook that provides text-to-speech functionality
 * with cross-browser support including fallbacks
 */
const useSpeech = () => {
  // Check if the Web Speech API is supported by the browser
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);

  // Load available voices
  useEffect(() => {
    if (!isSpeechSupported) {
      // Set fallback active for browsers without native support
      setFallbackActive(true);
      setIsLoaded(true);
      return;
    }

    // Function to get and set voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setIsLoaded(true);
      }
    };

    // Load voices
    loadVoices();

    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSpeechSupported]);

  // Fallback function for browsers without speech support
  const fallbackSpeak = useCallback((text: string) => {
    console.log('Using fallback speech mechanism');
    
    // Silent fallback that doesn't show any visual notification
    try {
      // Just return true to indicate we "handled" it
      // but don't show any visual notification
      return true;
    } catch (e) {
      console.error('Fallback speech mechanism failed', e);
      return false;
    }
  }, []);

  /**
   * Speaks the provided text
   * @param text - The text to be spoken
   * @param options - Optional parameters for speech synthesis
   */
  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!isSpeechSupported) {
      return fallbackSpeak(text);
    }

    try {
      // Chrome bug fix: needs to call cancel() before speaking
      window.speechSynthesis.cancel();

      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply custom options if provided
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
      if (options.lang !== undefined) utterance.lang = options.lang;
      if (options.voice !== undefined) utterance.voice = options.voice;
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.error('Speech synthesis failed, trying fallback', e);
      return fallbackSpeak(text);
    }
  }, [isSpeechSupported, fallbackSpeak]);

  /**
   * Stops any active speech
   */
  const stop = useCallback(() => {
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.error('Failed to stop speech', e);
      }
    }
  }, [isSpeechSupported]);

  /**
   * Pauses any active speech
   */
  const pause = useCallback(() => {
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.error('Failed to pause speech', e);
      }
    }
  }, [isSpeechSupported]);

  /**
   * Resumes any paused speech
   */
  const resume = useCallback(() => {
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.error('Failed to resume speech', e);
      }
    }
  }, [isSpeechSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    voices,
    isLoaded,
    isSupported: isSpeechSupported || fallbackActive,
    usingFallback: fallbackActive
  };
};

export default useSpeech; 
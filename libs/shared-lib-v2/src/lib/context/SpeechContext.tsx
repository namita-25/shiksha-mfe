import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SpeechContextType {
  isSpeechEnabled: boolean;
  toggleSpeechEnabled: () => void;
  enableSpeech: () => void;
  disableSpeech: () => void;
}

const defaultContext: SpeechContextType = {
  isSpeechEnabled: false,
  toggleSpeechEnabled: () => {},
  enableSpeech: () => {},
  disableSpeech: () => {},
};

const SpeechContext = createContext<SpeechContextType>(defaultContext);

export const useSpeechContext = () => useContext(SpeechContext);

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  // Load initial state from localStorage
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isSpeechEnabled');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSpeechEnabled', JSON.stringify(isSpeechEnabled));
    }
  }, [isSpeechEnabled]);

  const toggleSpeechEnabled = () => {
    setIsSpeechEnabled((prev: boolean) => !prev);
  };

  const enableSpeech = () => {
    setIsSpeechEnabled(true);
  };

  const disableSpeech = () => {
    // Cancel any ongoing speech when disabling
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeechEnabled(false);
  };

  return (
    <SpeechContext.Provider
      value={{
        isSpeechEnabled,
        toggleSpeechEnabled,
        enableSpeech,
        disableSpeech,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export default SpeechContext;

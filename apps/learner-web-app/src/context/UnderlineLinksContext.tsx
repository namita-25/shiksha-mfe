import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

// Define the context value type
type UnderlineLinksContextType = {
  isUnderlineLinksEnabled: boolean;
  toggleUnderlineLinks: () => void;
  enableUnderlineLinks: () => void;
  disableUnderlineLinks: () => void;
};

// Create the context with default values
const UnderlineLinksContext = createContext<UnderlineLinksContextType>({
  isUnderlineLinksEnabled: false,
  toggleUnderlineLinks: () => {},
  enableUnderlineLinks: () => {},
  disableUnderlineLinks: () => {},
});

// Custom hook to use the context
export const useUnderlineLinks = () => {
  const context = useContext(UnderlineLinksContext);
  if (!context) {
    throw new Error(
      'useUnderlineLinks must be used within an UnderlineLinksProvider'
    );
  }
  return context;
};

// Provider component props
type UnderlineLinksProviderProps = {
  children: ReactNode;
};

// Provider component
export const UnderlineLinksProvider: React.FC<UnderlineLinksProviderProps> = ({
  children,
}) => {
  // Load initial state from localStorage
  const [isUnderlineLinksEnabled, setIsUnderlineLinksEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isUnderlineLinksEnabled');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'isUnderlineLinksEnabled',
        JSON.stringify(isUnderlineLinksEnabled)
      );
    }
  }, [isUnderlineLinksEnabled]);

  // Update CSS variable when underline links state changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--underline-links-enabled',
        isUnderlineLinksEnabled ? '1' : '0'
      );

      // Add or remove a class to the body for easier CSS targeting
      if (isUnderlineLinksEnabled) {
        document.body.classList.add('underline-links-enabled');
      } else {
        document.body.classList.remove('underline-links-enabled');
      }
    }
  }, [isUnderlineLinksEnabled]);

  const toggleUnderlineLinks = () => {
    setIsUnderlineLinksEnabled((prev: boolean) => !prev);
  };

  const enableUnderlineLinks = () => {
    setIsUnderlineLinksEnabled(true);
  };

  const disableUnderlineLinks = () => {
    setIsUnderlineLinksEnabled(false);
  };

  return (
    <UnderlineLinksContext.Provider
      value={{
        isUnderlineLinksEnabled,
        toggleUnderlineLinks,
        enableUnderlineLinks,
        disableUnderlineLinks,
      }}
    >
      {children}
    </UnderlineLinksContext.Provider>
  );
};

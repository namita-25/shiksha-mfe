import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface ColorInversionContextType {
  isColorInverted: boolean;
  toggleColorInversion: () => void;
}

const ColorInversionContext = createContext<
  ColorInversionContextType | undefined
>(undefined);

export const useColorInversion = (): ColorInversionContextType => {
  const context = useContext(ColorInversionContext);
  if (!context) {
    throw new Error(
      'useColorInversion must be used within a ColorInversionProvider'
    );
  }
  return context;
};

// Function to apply color inversion immediately from localStorage
// This runs before React hydration to prevent flash of unstyled content
export const applyColorInversionFromStorage = () => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('isColorInverted');
    if (savedState !== null) {
      const isInverted = JSON.parse(savedState);
      const root = document.documentElement;

      if (isInverted) {
        root.style.filter = 'invert(1) hue-rotate(180deg)';

        // Add the style for images/videos
        const existingStyle = document.getElementById('color-inversion-style');
        if (!existingStyle) {
          const style = document.createElement('style');
          style.id = 'color-inversion-style';
          style.textContent = `
            img, video, iframe, svg, canvas, embed, object {
              filter: invert(1) hue-rotate(180deg) !important;
            }
            [data-no-invert] {
              filter: invert(1) hue-rotate(180deg) !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }
  }
};

interface ColorInversionProviderProps {
  children: ReactNode;
}

export const ColorInversionProvider: React.FC<ColorInversionProviderProps> = ({
  children,
}) => {
  const [isColorInverted, setIsColorInverted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isColorInverted');
      if (savedState !== null) {
        const parsedState = JSON.parse(savedState);
        setIsColorInverted(parsedState);
      }
      setIsInitialized(true);
    }
  }, []);

  // Apply color inversion styles when state changes and after initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      const root = document.documentElement;

      if (isColorInverted) {
        // Apply CSS filter to invert colors
        root.style.filter = 'invert(1) hue-rotate(180deg)';

        // Remove any existing styles to avoid duplicates
        const existingStyle = document.getElementById('color-inversion-style');
        const existingInitialStyle = document.getElementById(
          'color-inversion-style-initial'
        );

        if (existingStyle) {
          existingStyle.remove();
        }
        if (existingInitialStyle) {
          existingInitialStyle.remove();
        }

        // Invert images and videos back to normal
        const style = document.createElement('style');
        style.id = 'color-inversion-style';
        style.textContent = `
          img, video, iframe, svg, canvas, embed, object {
            filter: invert(1) hue-rotate(180deg) !important;
          }
          [data-no-invert], [data-no-invert] * {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        // Remove color inversion
        root.style.filter = '';
        const existingStyle = document.getElementById('color-inversion-style');
        const existingInitialStyle = document.getElementById(
          'color-inversion-style-initial'
        );

        if (existingStyle) {
          existingStyle.remove();
        }
        if (existingInitialStyle) {
          existingInitialStyle.remove();
        }
      }
    }
  }, [isColorInverted, isInitialized]);

  const toggleColorInversion = () => {
    const newState = !isColorInverted;
    setIsColorInverted(newState);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('isColorInverted', JSON.stringify(newState));
    }
  };

  const value = {
    isColorInverted,
    toggleColorInversion,
  };

  return (
    <ColorInversionContext.Provider value={value}>
      {children}
    </ColorInversionContext.Provider>
  );
};

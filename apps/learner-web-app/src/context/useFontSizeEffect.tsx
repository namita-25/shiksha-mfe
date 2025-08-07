import { useEffect } from 'react';
import { useFontSize } from './FontSizeContext';

export const useFontSizeEffect = () => {
  const { fontSize } = useFontSize();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-size-scale',
      fontSize.toString()
    );
  }, [fontSize]);
};

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initGA, logPageView } from '../../utils/googleAnalytics';

declare global {
  interface Window {
    GA_INITIALIZED?: boolean;
  }
}

const GoogleAnalyticsTracker = () => {
  const pathname = usePathname();
 
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      if (typeof window !== 'undefined') {     
         let windowUrl = window.location.pathname;
    let cleanedUrl = windowUrl.replace(/^\//, '');
    console.log('Cleaned URL:', cleanedUrl);
      if(cleanedUrl.startsWith('themantic')) {
        console.log('Initializing GA for Themantic');
        initGA(`${process.env.NEXT_PUBLIC_MEASUREMENT_ID_THEMATIC}`);
      }
      else
      initGA(`${process.env.NEXT_PUBLIC_MEASUREMENT_ID_POS}`);
      window.GA_INITIALIZED = true;
    }
  }
    logPageView(pathname);
  
  }, [pathname]);

  return null;
};

export default GoogleAnalyticsTracker;

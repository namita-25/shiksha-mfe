import React from 'react';

import List from '@learner/components/themantic/content/List';
import GoogleAnalyticsTracker from '@learner/components/GoogleAnalyticsTracker/GoogleAnalyticsTracker';
const page = () => {
  return <>
   <GoogleAnalyticsTracker />
  
  <List />;
  </>
};

export default page;

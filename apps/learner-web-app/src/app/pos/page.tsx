// pages/content-details/[identifier].tsx

import React from 'react';
import dynamic from 'next/dynamic';

const title = 'Pratham Open School Home';
const description = `Pratham Open School offers free, downloadable videos, games, reading material and stories in 15 languages for ages 1 to 18+, designed to support self-led learning and group learning through activities and projects.`;

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: `/images/home-page-banner.png`,
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
};

const Home = dynamic(() => import('@learner/components/pos/Home'), {
  ssr: false,
});
const App = () => {
  return <Home />;
};

export default App;

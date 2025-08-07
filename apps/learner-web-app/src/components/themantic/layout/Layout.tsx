import React from 'react';
import Footer from '../footer/Footer';
import Header from '../header/Header';

function Layout({ children, sx }: { children: React.ReactNode; sx?: any }) {
  return (
    <div style={sx}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default Layout;

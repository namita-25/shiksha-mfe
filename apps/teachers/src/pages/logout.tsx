import dynamic from 'next/dynamic';
import React from 'react';
const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL;

const Logout = dynamic(() => import('@logout'), {
  ssr: false,
});

const logout = () => {
  const handleLogoutSuccess = (response: string) => {

    if (window.parent && response === 'loggedOut' && loginUrl) {
      window.parent.location.href = loginUrl;
    }
  };

  return <Logout onLogoutSuccess={handleLogoutSuccess} />;
};

export default logout;

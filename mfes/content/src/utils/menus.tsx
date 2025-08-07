import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from 'react';

export const ProfileMenu = ({ router }: { router: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleMenuClick = (item: any, hardRedirect?: any) => {
    if (hardRedirect && item != '') {
      window.location.href = item;
    } else if (item != '') {
      router?.push(item);
    }
    setAnchorEl(null);
  };

  const handleAccountClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem('accToken');
    localStorage.removeItem('refToken');
    let LOGIN = process.env.NEXT_PUBLIC_LOGIN;
    //@ts-ignore
    window.location.href = LOGIN;
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, []);

  return {
    profileIcon: [
      {
        icon: <AccountCircleIcon />,
        ariaLabel: 'Account',
        onLogoutClick: (e: any) => handleAccountClick(e),
        anchorEl: anchorEl,
      },
    ],
    actionIcons: [
      {
        icon: <AccountCircleIcon />,
        ariaLabel: 'Profile',
        onOptionClick: () => handleMenuClick('/mfe_registration/profile', true),
      },
      {
        icon: <ContentCopyIcon />,
        ariaLabel: 'Content',
        onOptionClick: () => handleMenuClick('/content'),
      },
      {
        icon: <CardMembershipIcon />,
        ariaLabel: 'My Courses',
        onOptionClick: () => handleMenuClick('/certificates'),
      },
      ...(isAuthenticated
        ? [
            {
              icon: <LogoutIcon />,
              ariaLabel: 'Logout',
              onOptionClick: handleLogout,
            },
          ]
        : []),
    ],
  };
};

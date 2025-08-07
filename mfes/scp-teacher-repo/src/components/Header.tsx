'use client';

import { UpdateDeviceNotification } from '@/services/NotificationService';
import { Telemetry } from '@/utils/app.constant';
import { logEvent } from '@/utils/googleAnalytics';
import { telemetryFactory } from '@/utils/telemetry';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Box, Button, Divider, Menu, Stack, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import logoLight from '../../public/images/logo-light.png';
import menuIcon from '../assets/images/menuIcon.svg';
import { useDirection } from '../hooks/useDirection';
import useStore from '../store/store';
import ConfirmationModal from './ConfirmationModal';
import StyledMenu from './StyledMenu';
import { TENANT_DATA } from '../../app.config';
import {
  firstLetterInUpperCase,
  getInitials,
  getUserFullName,
} from '@/utils/Helper';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface HeaderProps {
  toggleDrawer?: (newOpen: boolean) => () => void;
  openDrawer?: boolean;
}

// Dynamic import for MenuDrawer to avoid SSR issues
const MenuDrawer = dynamic(() => import('./MenuDrawer'), {
  ssr: false,
});

const Header: React.FC<HeaderProps> = ({ toggleDrawer, openDrawer }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const pathname = usePathname();
  const theme = useTheme<any>();
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;

  const [userId, setUserId] = useState<string>('');
  const [userRole, setuserRole] = useState<string>('');
  const [userName, setuserName] = useState<string>('');

  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [language, setLanguage] = useState<string>(selectedLanguage);
  const [darkMode, setDarkMode] = useState<string | null>(null);
  const { isRTL } = useDirection();
  const [adminInfo, setAdminInfo] = React.useState<any>();

  // Retrieve stored userId and language
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUserId = localStorage.getItem('userId') as string;
      const storedLanguage = localStorage.getItem('preferredLanguage');
      const storedDarkMode = localStorage.getItem('mui-mode');
      const storedRole = localStorage.getItem('role');
      const storedUserName = localStorage.getItem('userName');

      if (storedUserId) setUserId(storedUserId);
      if (storedLanguage) setSelectedLanguage(storedLanguage);
      if (storedDarkMode) setDarkMode(storedDarkMode);
      if (storedRole) setuserRole(storedRole);
      if (storedUserName) setuserName(storedUserName);
    }
  }, []);

  const handleProfileClick = () => {
    const tenant = localStorage.getItem('tenantName');
    if (pathname !== `/user-profile/${userId}`) {
      if (tenant?.toLowerCase() === TENANT_DATA.YOUTHNET?.toLowerCase()) {
        router.push(`/youthboard/user-profile/${userId}`);
      } else if (
        tenant?.toLowerCase() ===
        TENANT_DATA.SECOND_CHANCE_PROGRAM?.toLowerCase()
      ) {
        router.push(`/user-profile/${userId}`);
      }
      logEvent({
        action: 'my-profile-clicked-header',
        category: 'Dashboard',
        label: 'Profile Clicked',
      });
    }
  };

  const handleLogoutClick = async () => {
    router.replace('/logout');
    logEvent({
      action: 'logout-clicked-header',
      category: 'Dashboard',
      label: 'Logout Clicked',
    });

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenantid =
      typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
    const deviceID =
      typeof window !== 'undefined' ? localStorage.getItem('deviceID') : null;

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split('/')[0];
    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'logout-user',

        type: Telemetry.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
    if (deviceID) {
      try {
        const tenantId = tenantid;

        const headers = {
          tenantId,
          Authorization: `Bearer ${token}`,
        };

        await UpdateDeviceNotification(
          { deviceId: deviceID, action: 'remove' },
          userId,
          headers
        );
      } catch (updateError) {
        console.error('Error updating device notification:', updateError);
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleDrawer = (newOpen: boolean) => () => {
    setOpenMenu(newOpen);
  };

  // Check if the user has seen the tutorial
  const hasSeenTutorial =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('hasSeenTutorial') === 'true';

  const getMessage = () => {
    if (modalOpen) return t('COMMON.SURE_LOGOUT');
    return '';
  };

  const handleCloseModel = () => {
    setModalOpen(false);
  };

  const logoutOpen = () => {
    handleClose();
    setModalOpen(true);
  };
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const admin = localStorage.getItem('userData');
      if (admin && admin !== 'undefined')
        setAdminInfo(JSON?.parse(admin) || {});
    }
  }, []);
  return (
    <>
      <Box
        sx={{
          height: '64px',
        }}
      >
        <Box
          className="w-md-100 ps-md-relative"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '@media (max-width: 500px)': {
              position: hasSeenTutorial ? 'fixed' : 'relative',
            },
            top: '0px',
            zIndex: '999',
            width: '100%',
            bgcolor: theme.palette.warning['A400'],
          }}
        >
          <Stack
            width={'100%'}
            direction="row"
            justifyContent={'space-between'}
            alignItems={'center'}
            height="64px"
            boxShadow={
              darkMode === 'dark'
                ? '0px 1px 3px 0px #ffffff1a'
                : '0px 1px 3px 0px #0000004D'
            }
            className={isRTL ? '' : 'pl-md-20'}
          >
            <Box
              onClick={() => {
                if (openDrawer) {
                  if (toggleDrawer) {
                    toggleDrawer(true)();
                  }
                } else {
                  handleToggleDrawer(true)();
                }
              }}
              mt={'0.5rem'}
              className="display-md-none"
              paddingLeft={'20px'}
              sx={{ marginRight: isRTL ? '20px' : '0px' }}
            >
              <Image
                height={12}
                width={18}
                src={menuIcon}
                alt="menu"
                style={{ cursor: 'pointer' }}
              />
            </Box>

            <Image
              height={40}
              width={44}
              src={logoLight}
              alt="logo"
              onClick={() => isActiveYear && router.push('/dashboard')}
              style={{ marginRight: isRTL ? '20px' : '0px', cursor: 'pointer' }}
            />

            <Box
              onClick={handleClick}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                marginLeft: isRTL ? '16px' : '0px',
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : 'false'}
              paddingRight={'20px'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={'column'}
              mt={'0.5rem'}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  // ml: 1,
                  // '@media (max-width: 600px)': {
                  //   display: 'none',
                  // },
                }}
              >
                <AccountCircleIcon />

                <Typography
                  variant="body1"
                  fontWeight="400"
                  sx={{
                    ml: 1,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('COMMON.HI', {
                    name: firstLetterInUpperCase(userName ?? ''),
                  })}
                </Typography>
                {/* 
            <FeatherIcon icon="chevron-down" size="20" /> */}
              </Box>
            </Box>

            <StyledMenu
              id="profile-menu"
              MenuListProps={{
                'aria-labelledby': 'profile-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {/* {pathname !== `/user-profile/${userId}` && (
                <MenuItem
                  onClick={handleProfileClick}
                  disableRipple
                  sx={{ 'letter-spacing': 'normal' }}
                >
                  <PersonOutlineOutlinedIcon />
                  {t('PROFILE.MY_PROFILE')}
                </MenuItem>
              )}
              <MenuItem
                onClick={logoutOpen}
                disableRipple
                sx={{
                  'letter-spacing': 'normal',
                  color: theme.palette.warning['300'],
                }}
              >
                <LogoutOutlinedIcon
                  sx={{ color: theme.palette.warning['300'] }}
                />
                {t('COMMON.LOGOUT')}
              </MenuItem> */}
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                  border: 'none',
                  paddingLeft: '0px !important',
                  paddingRight: '0px !important',
                  '@media (max-width: 600px)': {
                    minWidth: '0px !important',
                  },
                }}
                // sx={{
                //   paddingTop: '0px',
                //   //backgroundColor: "#F8EFE7",
                // }}
                PaperProps={{
                  sx: {
                    // width: "500px",
                    minWidth: '320px',
                    borderRadius: '12px',
                  },
                }}
                MenuListProps={{
                  sx: {
                    paddingTop: '50px !important',
                    paddingBottom: '0px !important',
                  },
                }}
              >
                {/* <Box
                        sx={{ backgroundColor: "#F8EFE7", height: "56px", width: "100%" }}
                      ></Box> */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '-25px',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#78590C',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="white"
                      sx={{ fontWeight: 'bold', fontSize: '18px' }}
                    >
                      {getInitials(getUserFullName())}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    // marginTop:"10px",
                    // borderRadius: "10px",
                    backgroundColor: 'white',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      marginBottom: '15px',
                      marginTop: '10px',
                      textAlign: 'center',
                      px: '20px',
                      fontSize: '16px',
                    }}
                  >
                    {getUserFullName()}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      marginBottom: '20px',
                      textAlign: 'center',
                      px: '20px',
                      color: '#7C766F',
                      fontSize: '14px',
                    }}
                  >
                    {userRole}
                  </Typography>

                  <Divider sx={{ color: '#D0C5B4' }} />
                  <Box
                    sx={{
                      px: '20px',
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '@media (max-width: 434px)': {
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={handleProfileClick}
                      sx={{
                        fontSize: '16px',
                        backgroundColor: 'white',
                        border: '0.6px solid #1E1B16',
                        my: '20px',
                        width: '408px',
                        '@media (max-width: 434px)': { width: '100%' },
                      }}
                      // endIcon={<EditIcon />}
                    >
                      {t('PROFILE.MY_PROFILE')}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={logoutOpen}
                      sx={{
                        fontSize: '16px',
                        backgroundColor: '#FDBE16',
                        border: '0.6px solid #1E1B16',
                        my: '20px',
                        '@media (max-width: 434px)': { my: '0px', mb: '20px' },
                      }}
                      //   endIcon={<LogoutIcon />}
                    >
                      {t('COMMON.LOGOUT')}
                    </Button>
                  </Box>
                </Box>
              </Menu>
            </StyledMenu>
          </Stack>
        </Box>

        <ConfirmationModal
          message={getMessage()}
          handleAction={handleLogoutClick}
          buttonNames={{
            primary: t('COMMON.LOGOUT'),
            secondary: t('COMMON.CANCEL'),
          }}
          handleCloseModal={handleCloseModel}
          modalOpen={modalOpen}
        />

        <MenuDrawer
          toggleDrawer={openDrawer ? toggleDrawer : handleToggleDrawer}
          open={openDrawer ? openDrawer : openMenu}
          language={language}
          setLanguage={setLanguage}
        />
      </Box>
      <Box sx={{ marginTop: '10px' }}></Box>
    </>
  );
};

export default Header;

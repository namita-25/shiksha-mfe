import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import HubIcon from '@mui/icons-material/Hub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  isMobileSidebarOpen,
  onSidebarClose,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  // Default open menu is 'people'
  const [expandedMenu, setExpandedMenu] = useState<'people' | 'learning'>('people');

  // Keep expandedMenu in sync with current route
  useEffect(() => {
    const path = router.pathname;
    if (
      path.startsWith('/content') ||
      path.startsWith('/course') ||
      path.startsWith('/learning-paths')
    ) {
      setExpandedMenu('learning');
    } else if (
      path.startsWith('/user') ||
      path.startsWith('/cohort') ||
      path.startsWith('/group') ||
      path === '/' ||
      path === '/dashboard'
    ) {
      setExpandedMenu('people');
    }
  }, [router.pathname]);

  // When opening People: show down arrow, select first menu Users, open that page, close Learning
  const handleTogglePeople = () => {
    setExpandedMenu('people');
    router.push('/users');
    if (!lgUp && onSidebarClose) {
      onSidebarClose();
    }
  };

  // When opening Learning: show down arrow, select first menu Courses, open that page, close People
  const handleToggleLearning = () => {
    setExpandedMenu('learning');
    router.push('/content/courses');
    if (!lgUp && onSidebarClose) {
      onSidebarClose();
    }
  };

  // Active state calculations
  const isUsersActive =
    router.pathname === '/users' ||
    router.pathname === '/' ||
    router.pathname === '/dashboard' ||
    router.pathname.startsWith('/users');

  const isGroupsActive =
    router.pathname.startsWith('/cohort') || router.pathname.startsWith('/group');

  const isCoursesActive =
    router.pathname.startsWith('/content/courses') || router.pathname.startsWith('/course');

  const isContentActive =
    router.pathname === '/content' || router.pathname.startsWith('/content/library');

  const isPathsActive =
    router.pathname.startsWith('/learning-paths') ||
    router.pathname.startsWith('/content/learning-paths');

  const sidebarContent = (
    <Box
      sx={{
        width: 260,
        height: '100%',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        {/*
          ==========================================================
          Dashboard menu commented out for now as requested:
          ----------------------------------------------------------
          <ListItemButton
            selected={router.pathname === '/dashboard'}
            onClick={() => router.push('/dashboard')}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              py: 1,
              px: 1.5,
              color: 'text.primary',
              '&.Mui-selected': {
                color: 'primary.main',
                backgroundColor: 'primary.100',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }} />
          </ListItemButton>
          ==========================================================
        */}

        {/* ==================== 1. PEOPLE (MAIN MENU) ==================== */}
        <Box sx={{ mb: 1 }}>
          <ListItemButton
            onClick={handleTogglePeople}
            selected={expandedMenu === 'people'}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              py: 1,
              px: 1.5,
              color: expandedMenu === 'people' ? 'primary.main' : 'text.primary',
              backgroundColor: expandedMenu === 'people' ? 'primary.100' : 'transparent',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: expandedMenu === 'people' ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.100',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.200',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  color: expandedMenu === 'people' ? 'primary.main' : 'text.secondary',
                }}
              >
                <GroupIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="People"
                primaryTypographyProps={{
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              />
            </Box>
            {expandedMenu === 'people' ? (
              <ArrowDropDownIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            ) : (
              <ArrowRightIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            )}
          </ListItemButton>

          {/* Submenu for People */}
          <Collapse in={expandedMenu === 'people'} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ pt: 0.3, pb: 0.5 }}>
              {/* Users Sub-option (Default Open & Active) */}
              <Link key="users-sub" href="/users" style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isUsersActive}
                  onClick={onSidebarClose}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.8,
                    px: 1.5,
                    pl: 3.5,
                    color: isUsersActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isUsersActive ? 'primary.100' : 'transparent',
                    fontWeight: isUsersActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isUsersActive ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.100',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.200',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isUsersActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Users"
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isUsersActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>

              {/* Groups Sub-option */}
              <Link key="groups-sub" href="/cohorts" style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isGroupsActive}
                  onClick={onSidebarClose}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.8,
                    px: 1.5,
                    pl: 3.5,
                    color: isGroupsActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isGroupsActive ? 'primary.100' : 'transparent',
                    fontWeight: isGroupsActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isGroupsActive ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.100',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.200',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isGroupsActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <HubIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Groups"
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isGroupsActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>
        </Box>

        {/* ==================== 2. LEARNING (MAIN MENU) ==================== */}
        <Box sx={{ mb: 1 }}>
          <ListItemButton
            onClick={handleToggleLearning}
            selected={expandedMenu === 'learning'}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              py: 1,
              px: 1.5,
              color: expandedMenu === 'learning' ? 'primary.main' : 'text.primary',
              backgroundColor: expandedMenu === 'learning' ? 'primary.100' : 'transparent',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: expandedMenu === 'learning' ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.100',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.200',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  color: expandedMenu === 'learning' ? 'primary.main' : 'text.secondary',
                }}
              >
                <MenuBookIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Learning"
                primaryTypographyProps={{
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              />
            </Box>
            {expandedMenu === 'learning' ? (
              <ArrowDropDownIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            ) : (
              <ArrowRightIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            )}
          </ListItemButton>

          {/* Submenu for Learning */}
          <Collapse in={expandedMenu === 'learning'} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ pt: 0.3, pb: 0.5 }}>
              {/* Courses Sub-option */}
              <Link key="courses-sub" href="/content/courses" style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isCoursesActive}
                  onClick={onSidebarClose}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.8,
                    px: 1.5,
                    pl: 3.5,
                    color: isCoursesActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isCoursesActive ? 'primary.100' : 'transparent',
                    fontWeight: isCoursesActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isCoursesActive ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.100',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.200',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isCoursesActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Courses"
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isCoursesActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>

              {/* Content Sub-option */}
              <Link key="content-sub" href="/content" style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isContentActive}
                  onClick={onSidebarClose}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.8,
                    px: 1.5,
                    pl: 3.5,
                    color: isContentActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isContentActive ? 'primary.100' : 'transparent',
                    fontWeight: isContentActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isContentActive ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.100',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.200',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isContentActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <FolderSpecialIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Content"
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isContentActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>

              {/* Learning Paths Sub-option */}
              <Link key="paths-sub" href="/learning-paths" style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isPathsActive}
                  onClick={onSidebarClose}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.8,
                    px: 1.5,
                    pl: 3.5,
                    color: isPathsActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isPathsActive ? 'primary.100' : 'transparent',
                    fontWeight: isPathsActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isPathsActive ? 'primary.200' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.100',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.200',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isPathsActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <AltRouteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Learning paths"
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isPathsActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>
        </Box>

        {/* ==================== 3. LATER ITEMS ==================== */}
        {/* Notifications [Later] */}
        <ListItemButton
          disabled
          sx={{
            borderRadius: '8px',
            mb: 0.5,
            py: 0.8,
            px: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'default !important',
            opacity: '0.85 !important',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              primaryTypographyProps={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary' }}
            />
          </Box>
          <Chip
            label="Later"
            size="small"
            sx={{
              height: 18,
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'warning.light',
              color: 'warning.dark',
            }}
          />
        </ListItemButton>

        {/* Insights [Later] */}
        <ListItemButton
          disabled
          sx={{
            borderRadius: '8px',
            mb: 0.5,
            py: 0.8,
            px: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'default !important',
            opacity: '0.85 !important',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <AssessmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Insights"
              primaryTypographyProps={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary' }}
            />
          </Box>
          <Chip
            label="Later"
            size="small"
            sx={{
              height: 18,
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'warning.light',
              color: 'warning.dark',
            }}
          />
        </ListItemButton>

        {/* Access [Later] */}
        <ListItemButton
          disabled
          sx={{
            borderRadius: '8px',
            mb: 0.5,
            py: 0.8,
            px: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'default !important',
            opacity: '0.85 !important',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Access"
              primaryTypographyProps={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary' }}
            />
          </Box>
          <Chip
            label="Later"
            size="small"
            sx={{
              height: 18,
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'warning.light',
              color: 'warning.dark',
            }}
          />
        </ListItemButton>

        {/*
          ==========================================================
          Other menus from earlier commented out as requested:
          - Review Queue
          - Learning Paths
          - Reports & Analytics
          - Security / RBAC
          ==========================================================
        */}
      </Box>

      {/* Tenant Footer Information */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'secondary.100' }}>
        <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 600, color: 'secondary.main' }}>
          Swadhaar FinAccess Portal
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '10px', color: 'text.secondary' }}>
          Tenant: swadhaar-channel
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Persistent Drawer */}
      {lgUp ? (
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="persistent"
          PaperProps={{
            sx: {
              width: 260,
              border: 'none',
              top: '64px',
              height: 'calc(100vh - 64px)',
              zIndex: 1100,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        /* Mobile Temporary Drawer */
        <Drawer
          anchor="left"
          open={isMobileSidebarOpen}
          onClose={onSidebarClose}
          variant="temporary"
          PaperProps={{
            sx: {
              width: 260,
              zIndex: 1300,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;



import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import LogoIcon from '../logo/LogoIcon';
import Buynow from './Buynow';
// import Menuitems from './MenuItems';
import { getFilteredMenuItems } from './MenuItems';

//menu config dynamic
import { MENU_CONFIG } from '../../../config/menuConfig';
import Link from 'next/link';

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: any) => {
  //menu config dynamic
  const storedRole = localStorage.getItem('roleName');
  const storedProgram = localStorage.getItem('program');
  // const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  if (!storedRole && !storedProgram) return null;

  const [open, setOpen] = useState<number | null>(null);
  const filteredMenuItems = getFilteredMenuItems();

  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme: any) => theme?.breakpoints?.up('lg'));

  const [openMenus, setOpenMenus] = useState({});
  const router = useRouter();

  const handleToggle = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getActiveStyle = (link) =>
    router.pathname === link
      ? { backgroundColor: '#FDBF34', color: 'black', borderRadius: '100px' }
      : {};

  // const menuItems = Object.entries(MENU_CONFIG[storedProgram] || {}).filter(
  //   ([_, item]) => item.roles.includes(storedRole)
  // );
  const menuItems = useMemo(() => {
    return Object.entries(MENU_CONFIG[storedProgram] || {}).filter(
      ([_, item]) => item.roles.includes(storedRole)
    );
  }, [storedProgram, storedRole]);

  // console.log('menuItems', JSON.stringify(menuItems));

  const SidebarContent = (
    <Box
      p={2}
      // minHeight="100%"
      bgcolor="#F8EFDA"
      sx={{
        background: 'linear-gradient(to bottom, white, #F8EFDA)',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <LogoIcon />
      </Box>

      <Box mt={2}>
        <List component="nav">
          {menuItems.map(([key, item]) => {
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            const isAllowed = item.roles.includes(storedRole);

            if (!isAllowed) return null;

            return (
              <div key={key}>
                <ListItemButton
                  onClick={() => {
                    if (hasSubMenu) {
                      handleToggle(key);
                    } else {
                      router.push(item.link);
                      onSidebarClose();
                    }
                  }}
                  style={getActiveStyle(item.link)}
                >
                  <ListItemIcon sx={{ minWidth: '40px' }}>
                    <Image
                      src={item.icon}
                      alt={t(item.title)}
                      width={20}
                      height={20}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t(item.title)} />
                  {hasSubMenu ? (
                    openMenus[key] ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )
                  ) : null}
                </ListItemButton>

                {hasSubMenu && (
                  <Collapse in={openMenus[key]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu
                        .filter((sub) => sub.roles.includes(storedRole))
                        .map((sub) => (
                          <ListItemButton
                            key={sub.link}
                            sx={{ pl: 7 }}
                            onClick={() => {
                              router.push(sub.link);
                              onSidebarClose();
                            }}
                            style={getActiveStyle(sub.link)}
                          >
                            <ListItemText primary={t(sub.title)} />
                          </ListItemButton>
                        ))}
                    </List>
                  </Collapse>
                )}
              </div>
            );
          })}
        </List>
      </Box>
      <Buynow />
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        variant="persistent"
        PaperProps={{
          sx: {
            width: '284px',
            border: '0 !important',
            boxShadow: '0px 7px 30px 0px rgb(113 122 131 / 11%)',
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      PaperProps={{
        sx: {
          width: '284px',
          border: '0 !important',
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool,
  onSidebarClose: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default Sidebar;

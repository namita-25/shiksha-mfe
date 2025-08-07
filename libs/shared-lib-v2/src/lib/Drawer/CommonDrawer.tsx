'use client';
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { withoutQueryString } from '../Header/TopAppBar';

export interface DrawerItemProp {
  title: React.ReactNode;
  icon?: React.ReactNode;
  to?: string | ((event: React.MouseEvent<HTMLAnchorElement>) => void);
  child?: DrawerItemProp[];
  isActive?: boolean;
}

interface CommonDrawerProps {
  open: boolean;
  onDrawerClose: () => void;
  items: DrawerItemProp[];
  topElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
}

export const CommonDrawer: React.FC<CommonDrawerProps> = ({
  open,
  onDrawerClose,
  items,
  topElement,
  bottomElement,
}) => {
  const theme = useTheme();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  const toggleKey = (key: string) => {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigation = (
    to: string | ((event: React.MouseEvent<HTMLAnchorElement>) => void),
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    onDrawerClose();
    if (typeof to === 'string') {
      window.location.href = to;
    } else {
      to(e);
    }
  };

  const renderList = (items: DrawerItemProp[], parentKey = '', level = 0) => {
    return items.map((item, index) => {
      const key = `${parentKey}-${index}`;
      const hasChildren = !!item.child?.length;

      return (
        <Box
          key={key}
          sx={{
            bgcolor:
              typeof item.isActive === 'string' &&
              item.isActive === withoutQueryString()
                ? `${theme.palette.primary.main}`
                : level > 0
                ? '#F1F2F2'
                : 'inherit',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pr: 1,
              borderBottom:
                typeof item.isActive === 'boolean'
                  ? item.isActive
                    ? `3px solid ${theme.palette.primary.main}`
                    : 'inherit'
                  : item?.isActive === withoutQueryString()
                  ? `3px solid ${theme.palette.primary.main}`
                  : 'inherit',
            }}
          >
            <ListItemButton
              component="div"
              onClick={(e) => {
                if (item.to) {
                  const anchorEvent =
                    e as unknown as React.MouseEvent<HTMLAnchorElement>;
                  handleNavigation(item.to, anchorEvent);
                }
              }}
              sx={{ pl: 2 + level * 2 }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.title} />
            </ListItemButton>
            {hasChildren && (
              <IconButton onClick={() => toggleKey(key)} size="small">
                {openKeys[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
          {hasChildren && (
            <Collapse in={openKeys[key]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.child && renderList(item.child, key, level + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <Drawer anchor="left" open={open} onClose={onDrawerClose}>
      <Box sx={{ width: 280, padding: '16px' }}>
        {topElement && <Box mb={2}>{topElement}</Box>}
        <List>{renderList(items)}</List>
        {bottomElement && <Box mt={2}>{bottomElement}</Box>}
      </Box>
    </Drawer>
  );
};

import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
interface DrawerItem {
  text: string;
  icon?: React.ReactNode;
  to: string;
}
export interface DrawerItemProp {
  title: React.ReactNode;
  icon?: React.ReactNode;
  to: string | ((event: React.MouseEvent<HTMLAnchorElement>) => void);
}
interface CommonDrawerProps {
  open: boolean;
  onDrawerClose: () => void;
  items: DrawerItem[];
  onItemClick: (to: string) => void;
}

export const CommonDrawer: React.FC<CommonDrawerProps> = ({
  open,
  onDrawerClose,
  items,
  onItemClick,
}) => {
  return (
    <Drawer anchor="left" open={open} onClose={onDrawerClose}>
      <List>
        {items.map((item, index) => (
          <ListItemButton key={item.text} onClick={() => onItemClick(item.to)}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

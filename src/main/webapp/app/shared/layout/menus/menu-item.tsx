import React from 'react';
import { MenuItem as MuiMenuItem, ListItemIcon, ListItemText, ListItem, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import * as RouterDOM from 'react-router-dom';

const { Link } = RouterDOM;
export interface IMenuItem {
  children: React.ReactNode;
  icon: SvgIconComponent;
  to?: string;
  id?: string;
  'data-cy'?: string;
  mobile?: boolean;
  onClick?: () => void;
}

const MenuItem = (props: IMenuItem) => {
  const { to, icon: IconComponent, id, children, mobile = false, onClick } = props;

  const theme = useTheme();
  const handleClick = () => {
    onClick?.();
  };

  if (mobile) {
    return (
      <ListItem component={Link} to={to} id={id} data-cy={props['data-cy']} onClick={handleClick}>
        <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 36 }}>
          <IconComponent fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={children} />
      </ListItem>
    );
  }

  return (
    <MuiMenuItem
      component={Link}
      to={to}
      id={id}
      data-cy={props['data-cy']}
      onClick={handleClick}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 36 }}>
        <IconComponent fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={children} />
    </MuiMenuItem>
  );
};

export default MenuItem;

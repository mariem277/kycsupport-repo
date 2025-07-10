import React, { useState } from 'react';
import { Button, Menu, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

interface NavDropdownProps {
  icon: SvgIconComponent;
  name: string;
  id?: string;
  'data-cy'?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  mobile?: boolean;
}

export const NavDropdown = (props: NavDropdownProps) => {
  const { icon: IconComponent, name, id, children, style, mobile = false } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (mobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (mobile) {
    return (
      <>
        <ListItem
          onClick={handleClick}
          id={id}
          data-cy={props['data-cy']}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.dark',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <IconComponent />
          </ListItemIcon>
          <ListItemText primary={name} />
          {mobileOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={mobileOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, {
                    mobile: true,
                    onClick: () => setMobileOpen(false),
                  })
                : child,
            )}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<IconComponent />}
        id={id}
        data-cy={props['data-cy']}
        sx={{
          flexDirection: 'column',
          gap: 0.5,
          px: 2,
          py: 1,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {name}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            ...style,
            mt: 1,
            boxShadow: '0 8px 32px rgba(128, 0, 128, 0.15)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
            {name}
          </Typography>
        </Box>
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                onClick: handleClose,
              })
            : child,
        )}
      </Menu>
    </>
  );
};

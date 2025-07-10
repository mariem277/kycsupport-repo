import React from 'react';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon } from '@mui/icons-material';
import * as RouterDOM from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar';
import { EntitiesMenu } from '../menus/entities';
import { AdminMenu } from '../menus/admin';
import { AccountMenu } from '../menus/account';

const VERSION = '1.0.0';
const { Link, useNavigate } = RouterDOM;
export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

const Header = (props: IHeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Kycsupport
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {VERSION?.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`}
        </Typography>
      </Box>
      <List>
        <ListItem
          component={Link}
          to="/"
          onClick={() => setMobileOpen(false)}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: 'primary.dark',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
      </List>

      {props.isAuthenticated && <EntitiesMenu mobile />}
      {props.isAuthenticated && props.isAdmin && <AdminMenu showOpenAPI={props.isOpenAPIEnabled} mobile />}
      <AccountMenu isAuthenticated={props.isAuthenticated} mobile />
    </Box>
  );

  return (
    <>
      <LoadingBar className="loading-bar" />
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          background: '#fff',
          backdropFilter: 'blur(10px)',
          paddingRight: '5%',
          color: theme.palette.primary.main,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component={Link}
            to="/"
            sx={{
              paddingLeft: '5%',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Avatar
              src="content/images/logo-jhipster.png"
              alt="Logo"
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                }}
              >
                Kycsupport
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontSize: '0.7rem',
                }}
              >
                {VERSION?.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`}
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                component={Link}
                to="/"
                color="inherit"
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
                <HomeIcon />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  Home
                </Typography>
              </IconButton>

              {props.isAuthenticated && <EntitiesMenu />}
              {props.isAuthenticated && props.isAdmin && <AdminMenu showOpenAPI={props.isOpenAPIEnabled} />}
              <AccountMenu isAuthenticated={props.isAuthenticated} />
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;

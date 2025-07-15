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
  userName?: string;
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

        {props.isAuthenticated && <EntitiesMenu mobile />}
      </List>
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
          marginBottom: '20px',
          color: theme.palette.primary.main,
        }}
      >
        <Toolbar disableGutters sx={{ height: '40px', paddingRight: '15%', paddingLeft: '15%' }}>
          <Box
            sx={{
              height: '5%',
              width: '100%',
              maxWidth: '1200px',
              mx: 'auto',
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Avatar src="content/images/logo-jhipster.png" alt="Logo" sx={{ width: 30, height: 20, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                KYC-Support
              </Typography>
            </Box>

            {/* Middle: Welcome Message */}
            {props.isAuthenticated && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome, <strong>{props.userName || 'User'}</strong>
              </Typography>
            )}

            <AccountMenu isAuthenticated={props.isAuthenticated} />
          </Box>
        </Toolbar>
        <Toolbar
          disableGutters
          sx={{
            height: '50px',
            paddingRight: '15%',
            paddingLeft: '15%',
            backgroundColor: theme.palette.primary.main,
            color: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1200px',
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
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
              </Box>
            )}

            {isMobile && (
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
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
      <Toolbar />
    </>
  );
};

export default Header;

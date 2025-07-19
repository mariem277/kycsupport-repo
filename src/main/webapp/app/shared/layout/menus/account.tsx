import React from 'react';
import { AccountCircle, Login, Logout } from '@mui/icons-material';
import * as RouterDOM from 'react-router-dom';
import { Button, Avatar } from '@mui/material';
import { getLoginUrl } from 'app/shared/util/url-utils';
import MenuItem from './menu-item';
import { NavDropdown } from './menu-components';
import { MenuItem as MuiMenuItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';

const { useLocation, useNavigate } = RouterDOM;
const accountMenuItemsAuthenticated = () => (
  <MenuItem icon={Logout} to="/logout" data-cy="logout">
    Sign out
  </MenuItem>
);

const AccountMenuItems = () => {
  const navigate = useNavigate();
  const pageLocation = useLocation();
  const theme = useTheme();

  const handleLogin = () => {
    navigate('/sign-in', {
      state: { from: pageLocation },
    });
  };

  const SignInItem = () => (
    <MuiMenuItem
      onClick={handleLogin}
      data-cy="login"
      sx={{
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
        },
      }}
    >
      <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 36 }}>
        <Login fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Sign in" />
    </MuiMenuItem>
  );

  return <SignInItem />;
};

interface AccountMenuProps {
  isAuthenticated: boolean;
  mobile?: boolean;
}

export const AccountMenu = ({ isAuthenticated = false, mobile = false }: AccountMenuProps) => {
  const navigate = useNavigate();
  const pageLocation = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (mobile) {
    return (
      <NavDropdown icon={AccountCircle} name="Account" id="account-menu" data-cy="accountMenu" mobile={mobile}>
        {isAuthenticated ? accountMenuItemsAuthenticated() : <AccountMenuItems />}
      </NavDropdown>
    );
  }

  // For desktop, we'll use a custom avatar button instead of NavDropdown

  return (
    <>
      <NavDropdown icon={AccountCircle} name="Account" id="account-menu" data-cy="accountMenu">
        {isAuthenticated ? accountMenuItemsAuthenticated() : <AccountMenuItems />}
      </NavDropdown>
    </>
  );
};

export default AccountMenu;

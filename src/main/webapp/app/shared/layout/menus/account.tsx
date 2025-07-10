import React from 'react';
import { AccountCircle, Login, Logout } from '@mui/icons-material';
import * as RouterDOM from 'react-router-dom';
import { Button, Avatar } from '@mui/material';
import { getLoginUrl } from 'app/shared/util/url-utils';
import MenuItem from './menu-item';
import { NavDropdown } from './menu-components';

const { useLocation, useNavigate } = RouterDOM;
const accountMenuItemsAuthenticated = () => (
  <MenuItem icon={Logout} to="/logout" data-cy="logout">
    Sign out
  </MenuItem>
);

const AccountMenuItems = () => {
  const navigate = useNavigate();
  const pageLocation = useLocation();

  const handleLogin = () => {
    navigate(getLoginUrl(), {
      state: { from: pageLocation },
    });
  };

  return (
    <MenuItem icon={Login} to="/login" data-cy="login" onClick={handleLogin}>
      Sign in
    </MenuItem>
  );
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

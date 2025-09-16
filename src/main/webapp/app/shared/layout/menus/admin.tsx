import React from 'react';
import { AdminPanelSettings, Speed, Favorite, Settings, Assignment, MenuBook } from '@mui/icons-material';
import MenuItem from './menu-item';
import { NavDropdown } from './menu-components';

const adminMenuItems = () => (
  <>
    <MenuItem icon={Speed} to="/admin/metrics">
      Metrics
    </MenuItem>
    <MenuItem icon={Favorite} to="/admin/health">
      Health
    </MenuItem>
    <MenuItem icon={Settings} to="/admin/configuration">
      Configuration
    </MenuItem>
    <MenuItem icon={Assignment} to="/admin/logs">
      Logs
    </MenuItem>
    <MenuItem icon={Assignment} to="/admin/users">
      Users
    </MenuItem>
    <MenuItem icon={Assignment} to="/admin/dashboard">
      Dashboard
    </MenuItem>
  </>
);

const openAPIItem = () => (
  <MenuItem icon={MenuBook} to="/admin/docs">
    API
  </MenuItem>
);

interface AdminMenuProps {
  showOpenAPI: boolean;
  mobile?: boolean;
}

export const AdminMenu = ({ showOpenAPI, mobile = false }: AdminMenuProps) => (
  <NavDropdown icon={AdminPanelSettings} name="Administration" id="admin-menu" data-cy="adminMenu" mobile={mobile}>
    {adminMenuItems()}
    {showOpenAPI && openAPIItem()}
  </NavDropdown>
);

export default AdminMenu;

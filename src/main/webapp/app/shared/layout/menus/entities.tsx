import React from 'react';
import { Business } from '@mui/icons-material';
import EntitiesMenuItems from 'app/entities/menu';
import { NavDropdown } from './menu-components';

interface EntitiesMenuProps {
  mobile?: boolean;
}

export const EntitiesMenu = ({ mobile = false }: EntitiesMenuProps) => <EntitiesMenuItems />;

import React from 'react';
import { Typography } from '@mui/material';
import { Business, Person, Description, Face, Gavel } from '@mui/icons-material';
import MenuItem from '../shared/layout/menus/menu-item';
import MenuItemEntity from '../shared/layout/menus/MenuItemEntity';
interface EntitiesMenuItemsProps {
  mobile?: boolean;
  onClose?: () => void;
}

const EntitiesMenuItems = ({ mobile = false, onClose }: EntitiesMenuItemsProps) => {
  const handleClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* prettier-ignore */}
      <MenuItemEntity icon={Business} to="/partner" mobile={mobile} onClick={handleClick}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Partner</Typography>
      </MenuItemEntity>
      <MenuItemEntity icon={Person} to="/customer" mobile={mobile} onClick={handleClick}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Customer
        </Typography>
      </MenuItemEntity>
      <MenuItemEntity icon={Description} to="/document" mobile={mobile} onClick={handleClick}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Document
        </Typography>
      </MenuItemEntity>
      <MenuItemEntity icon={Face} to="/face-match" mobile={mobile} onClick={handleClick}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Face Match
        </Typography>
      </MenuItemEntity>
      <MenuItemEntity icon={Gavel} to="/regulation" mobile={mobile} onClick={handleClick}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {' '}
          Regulation
        </Typography>
      </MenuItemEntity>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenuItems;

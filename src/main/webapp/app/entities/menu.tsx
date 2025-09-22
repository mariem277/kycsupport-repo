import React from 'react';
import { Business, Person, Description, Face, Gavel } from '@mui/icons-material';
import MenuItem from '../shared/layout/menus/menu-item';

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
      {/*
      <MenuItem icon={Business} to="/partner" mobile={mobile} onClick={handleClick}>
        Partner
      </MenuItem>
      */}
      <MenuItem icon={Person} to="/customer" mobile={mobile} onClick={handleClick}>
        Customer
      </MenuItem>
      <MenuItem icon={Description} to="/document" mobile={mobile} onClick={handleClick}>
        Document
      </MenuItem>
      <MenuItem icon={Face} to="/face-match" mobile={mobile} onClick={handleClick}>
        Face Match
      </MenuItem>
      <MenuItem icon={Gavel} to="/regulation" mobile={mobile} onClick={handleClick}>
        Regulation
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenuItems;

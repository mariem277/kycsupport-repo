import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/partner">
        Partner
      </MenuItem>
      <MenuItem icon="asterisk" to="/customer">
        Customer
      </MenuItem>
      <MenuItem icon="asterisk" to="/document">
        Document
      </MenuItem>
      <MenuItem icon="asterisk" to="/face-match">
        Face Match
      </MenuItem>
      <MenuItem icon="asterisk" to="/regulation">
        Regulation
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;

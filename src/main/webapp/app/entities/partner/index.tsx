import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Partner from './partner';
import PartnerDetail from './partner-detail';
import PartnerUpdate from './partner-update';
import PartnerDeleteDialog from './partner-delete-dialog';

const PartnerRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Partner />} />
    <Route path="new" element={<PartnerUpdate />} />
    <Route path=":id">
      <Route index element={<PartnerDetail />} />
      <Route path="edit" element={<PartnerUpdate />} />
      <Route path="delete" element={<PartnerDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default PartnerRoutes;

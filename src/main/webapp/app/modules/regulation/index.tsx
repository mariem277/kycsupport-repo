import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Regulation from './regulation';
import RegulationDetail from './regulation-detail';
import RegulationUpdate from './regulation-update';
import RegulationDeleteDialog from './regulation-delete-dialog';

const RegulationRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Regulation />} />
    <Route path="new" element={<RegulationUpdate />} />
    <Route path=":id">
      <Route index element={<RegulationDetail />} />
      <Route path="edit" element={<RegulationUpdate />} />
      <Route path="delete" element={<RegulationDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default RegulationRoutes;

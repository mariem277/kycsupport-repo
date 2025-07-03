import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import FaceMatch from './face-match';
import FaceMatchDetail from './face-match-detail';
import FaceMatchUpdate from './face-match-update';
import FaceMatchDeleteDialog from './face-match-delete-dialog';

const FaceMatchRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<FaceMatch />} />
    <Route path="new" element={<FaceMatchUpdate />} />
    <Route path=":id">
      <Route index element={<FaceMatchDetail />} />
      <Route path="edit" element={<FaceMatchUpdate />} />
      <Route path="delete" element={<FaceMatchDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default FaceMatchRoutes;

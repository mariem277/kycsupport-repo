import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import { Document } from './document';
import DocumentDetail from './document-detail';
import DocumentDeleteDialog from './document-delete-dialog';

const DocumentRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Document />} />
    <Route path=":id">
      <Route index element={<DocumentDetail />} />
      <Route path="delete" element={<DocumentDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default DocumentRoutes;

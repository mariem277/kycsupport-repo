import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Partner from './partner';
import Customer from './customer';
import Document from './document';
import FaceMatch from './face-match';
import Regulation from './regulation';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="partner/*" element={<Partner />} />
        <Route path="customer/*" element={<Customer />} />
        <Route path="document/*" element={<Document />} />
        <Route path="face-match/*" element={<FaceMatch />} />
        <Route path="regulation/*" element={<Regulation />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};

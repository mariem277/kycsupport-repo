import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import { Customer } from './customer';
import CustomerDetail from './customer-detail';
import CustomerUpdate from './customer-update';
import CustomerDeleteDialog from './customer-delete-dialog';

const CustomerRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Customer />} />

    <Route path=":id">
      <Route index element={<CustomerDetail />} />
      <Route path="delete" element={<CustomerDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default CustomerRoutes;

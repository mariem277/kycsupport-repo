import React from 'react';

import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import { Customer } from 'app/modules/customer/customer';
import CustomerDetail from 'app/modules/customer/customer-detail';
import CustomerDeleteDialog from 'app/modules/customer/customer-delete-dialog';
import Users from 'app/modules/administration/users/Users';

const AdministrationRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<Users />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default AdministrationRoutes;

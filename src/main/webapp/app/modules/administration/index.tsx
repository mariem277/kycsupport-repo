import React from 'react';

import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import Logs from './logs/logs';
import Health from './health/health';
import Metrics from './metrics/metrics';
import Configuration from './configuration/configuration';
import Docs from './docs/docs';
import Users from './users/Users';
import Dashboard from './dashboard/Dashboard';
const AdministrationRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route path="health" element={<Health />} />
      <Route path="metrics" element={<Metrics />} />
      <Route path="configuration" element={<Configuration />} />
      <Route path="logs" element={<Logs />} />
      <Route path="docs" element={<Docs />} />
      <Route path="users" element={<Users />} />
      <Route path="dashboard" element={<Dashboard />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default AdministrationRoutes;

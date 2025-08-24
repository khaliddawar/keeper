import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import DashboardThoughtStream from './pages/dashboard-thought-stream';
import AuthenticationPage from './pages/authentication-login-register';
import SettingsAndProfile from './pages/settings-and-profile';
import ThoughtOrganization from './pages/thought-organization';
import TaskManagement from './pages/task-management';
import SearchAndDiscovery from './pages/search-and-discovery';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AuthenticationPage />} />
        <Route path="/dashboard-thought-stream" element={<DashboardThoughtStream />} />
        <Route path="/authentication-login-register" element={<AuthenticationPage />} />
        <Route path="/settings-and-profile" element={<SettingsAndProfile />} />
        <Route path="/thought-organization" element={<ThoughtOrganization />} />
        <Route path="/task-management" element={<TaskManagement />} />
        <Route path="/search-and-discovery" element={<SearchAndDiscovery />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

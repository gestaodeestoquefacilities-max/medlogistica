import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppStore } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Couriers from './pages/Couriers';
import Analytics from './pages/Analytics';
import RequestDetails from './pages/RequestDetails';
import NewRequest from './pages/NewRequest';
import PublicTracking from './pages/PublicTracking';
import Login from './pages/Login';

// Wrapper for protected routes
const PrivateRoutes = () => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/tracking/:code" element={<PublicTracking />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="couriers" element={<Couriers />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="requests/new" element={<NewRequest />} />
              <Route path="requests/:id" element={<RequestDetails />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
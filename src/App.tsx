import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Cars from './pages/Cars';
import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import ValuationRequests from './pages/ValuationRequests';
import Inspections from './pages/Inspections';
import InspectionDetail from './pages/InspectionDetail';
import InspectionReport from './pages/InspectionReport';
import Layout from './components/Layout';
import CallCenterLogin from './pages/CallCenterLogin';
import CallCenter from './pages/CallCenter';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin-only route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/inspections" replace />;
  }
  
  return <>{children}</>;
};


// Call Center route component
const CallCenterRoute = ({ children }: { children: React.ReactNode }) => {
  const callCenterUser = localStorage.getItem('call_center_user');
  
  if (!callCenterUser) {
    return <Navigate to="/call-center-login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/call-center-login" element={<CallCenterLogin />} />
          
          {/* Call Center Routes - Standalone */}
          <Route path="/call-center" element={
            <CallCenterRoute>
              <CallCenter />
            </CallCenterRoute>
          } />
          

          
          {/* Mobile Inspection Route - Standalone */}
          <Route path="/inspection-report/:id" element={
            <ProtectedRoute>
              <InspectionReport />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
            <Route path="cars" element={
              <AdminRoute>
                <Cars />
              </AdminRoute>
            } />
            <Route path="appointments" element={
              <AdminRoute>
                <Appointments />
              </AdminRoute>
            } />
            <Route path="appointments/:id" element={
              <AdminRoute>
                <AppointmentDetail />
              </AdminRoute>
            } />
            <Route path="valuations" element={
              <AdminRoute>
                <ValuationRequests />
              </AdminRoute>
            } />
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspections/:id" element={<InspectionDetail />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
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
import Layout from './components/Layout';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="cars" element={<Cars />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/:id" element={<AppointmentDetail />} />
            <Route path="valuations" element={<ValuationRequests />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
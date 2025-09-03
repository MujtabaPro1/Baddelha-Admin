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
import CallCenter from './pages/CallCenter';
import MakeModel from './pages/MakeModel';
import Inspectors from './pages/Inspectors';
import RolesPermission from './pages/roles-permission/roles';
import MyInspections from './pages/Inspector-Inspections';
import SupervisorInspections from './pages/Supervisor-Inspections';
import CustomerCheckIn from './pages/customer-checkin';
import EditRolePage from './pages/roles-permission/edit';
import CreateRolePage from './pages/roles-permission/create';
import CarsDetails from './pages/CarsDetails';
import BranchTiming from './pages/BranchTiming';
import TradeInDealerships from './pages/TradeInDealerships';
import TradeInDealershipDetail from './pages/TradeInDealershipDetail';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Commented out since we're not using user check currently
  // const { user } = useAuth();
  
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return <>{children}</>;
};

// Admin-only route component
const AdminRoute = ({ children}: { children: React.ReactNode }) => {
  const { user } = useAuth();

  console.log(user,window.location.pathname);
  
  if(window.location.pathname.includes("/roles-permission/update")){
    return <>{children}</>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if(user.role == 'supervisor'){
    return <Navigate to="/supervisor-inspections" replace />;
  }
  
  if (user.role == 'inspector') {
    return <Navigate to="/my-inspections" replace />;
  }

  if(user.role == 'qa'){
    return <Navigate to="/inspections" replace />;
  }

  if(user.role == 'sale'){
    return <Navigate to="/cars" replace />;
  }

  if(user.role == 'call-center'){
    return <Navigate to="/call-center" replace />;
  }

  

  
  return <>{children}</>;
};


// Call Center route component
const CallCenterRoute = ({ children }: { children: React.ReactNode }) => {
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

       
          {/* Call Center Routes - Standalone */}
          <Route path="/call-center" element={
            <CallCenterRoute>
              <CallCenter />
            </CallCenterRoute>
          } />
          


          


                      

          
          {/* Inspection Report Route moved inside Layout */}
          
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
            <Route path="make-and-model" element={
              <AdminRoute>
                <MakeModel />
              </AdminRoute>
            } />


      

            <Route path="inspections" element={<Inspections />} />
            <Route path="cars" element={<Cars/>}/>
            <Route path="cars/details/:id" element={<CarsDetails/>}/>
            <Route path="supervisor-inspections" element={<SupervisorInspections />} />
            <Route path="my-inspections" element={<MyInspections />} />
            <Route path="inspections/:id" element={<InspectionDetail />} />
            <Route path="inspectors" element={<Inspectors />} />
            <Route path="inspection-report/:id" element={<InspectionReport />} />
            <Route path="customer-checkin/:id" element={<CustomerCheckIn />} />

            <Route path="roles-permission" element={
                                <AdminRoute>
                                  <RolesPermission />
                                </AdminRoute>
                              } />

            <Route path="branch-timing" element={
                                <AdminRoute>
                                  <BranchTiming />
                                </AdminRoute>
                              } />

            <Route path="tradein-dealerships" element={
                                <AdminRoute>
                                  <TradeInDealerships />
                                </AdminRoute>
                              } />

            <Route path="tradein-dealerships/:id" element={
                                <AdminRoute>
                                  <TradeInDealershipDetail />
                                </AdminRoute>
                              } />


          <Route path="roles-permission/create" element={
                              <AdminRoute>
                                <CreateRolePage />
                              </AdminRoute>
                            } />



<Route path="roles-permission/update/:id" element={
                              <AdminRoute>
                                <EditRolePage />
                              </AdminRoute>
                            } />


          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
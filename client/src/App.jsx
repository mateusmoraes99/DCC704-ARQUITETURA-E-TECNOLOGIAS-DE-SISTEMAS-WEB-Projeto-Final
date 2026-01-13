import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Importar páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import AppointmentsLabs from './pages/Appointments_Labs';
import Profile from './pages/Profile';

// Importar páginas de Labs
import LabsHome from './pages/LabsHome';
import LabProfile from './pages/LabProfile';
import CreateLab from './pages/CreateLab';
import MyLabDashboard from './pages/MyLabDashboard';
import LabAdminDashboard from './pages/LabAdminDashboard';
import LabAdminSettings from './pages/LabAdminSettings';
import LabAdminEquipment from './pages/LabAdminEquipment';
import LabAdminBlockedDates from './pages/LabAdminBlockedDates';
import MyLabAppointments from './pages/MyLabAppointments';

// Rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas públicas de Labs */}
      <Route path="/labs" element={<LabsHome />} />
      <Route path="/lab/:id" element={<LabProfile />} />

      {/* Rotas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/services" element={
        <ProtectedRoute>
          <Services />
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute>
          <AppointmentsLabs />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Rotas protegidas de Labs - Lab Admin */}
      <Route path="/create-lab" element={
        <ProtectedRoute>
          <CreateLab />
        </ProtectedRoute>
      } />

      <Route path="/my-lab" element={
        <ProtectedRoute>
          <MyLabDashboard />
        </ProtectedRoute>
      } />

      <Route path="/lab-admin/:labId" element={
        <ProtectedRoute>
          <LabAdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/lab-admin/:labId/settings" element={
        <ProtectedRoute>
          <LabAdminSettings />
        </ProtectedRoute>
      } />

      <Route path="/lab-admin/:labId/equipment" element={
        <ProtectedRoute>
          <LabAdminEquipment />
        </ProtectedRoute>
      } />

      <Route path="/lab-admin/:labId/blocked-dates" element={
        <ProtectedRoute>
          <LabAdminBlockedDates />
        </ProtectedRoute>
      } />

      {/* Rotas protegidas de Agendamentos de Labs */}
      <Route path="/my-lab-appointments" element={
        <ProtectedRoute>
          <MyLabAppointments />
        </ProtectedRoute>
      } />

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
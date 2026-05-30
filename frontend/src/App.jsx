import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { RoutesView } from './pages/RoutesView';
import { PDVAdmin } from './pages/PDVAdmin';
import { ReportsView } from './pages/ReportsView';
import { Login } from './pages/Login';
import { MobileReponedor } from './pages/MobileReponedor';
import { StaffAdmin } from './pages/StaffAdmin';
import { Settings } from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  // Componente para proteger las rutas
  const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    const location = useLocation();

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
  };
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/mobile" element={<MobileReponedor />} />
        
        {/* Rutas Privadas (Requieren Layout con Sidebar) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesView />} />
          <Route path="/pdvs" element={<PDVAdmin />} />
          <Route path="/staff" element={<StaffAdmin />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

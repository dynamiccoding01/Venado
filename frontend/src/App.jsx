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
import { CatalogsView } from './pages/CatalogsView';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  // Componente para proteger las rutas (Autenticación básica)
  const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    const location = useLocation();

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
  };

  // Componente para proteger rutas por Rol (RBAC)
  const RoleRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    let userRole = null;
    
    if (userStr) {
      const parsed = JSON.parse(userStr);
      // Extraemos id_rol, soportando tanto la estructura antigua (user.id_rol) como la nueva (user.usuario.id_rol)
      userRole = parsed.usuario?.id_rol || parsed.id_rol; 
    }

    if (!allowedRoles.includes(userRole)) {
      // Si no tiene permiso, lo mandamos al dashboard
      return <Navigate to="/" replace />;
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
          <Route path="/reports" element={<ReportsView />} />
          
          {/* Rutas exclusivas para Administradores (id_rol = 1) */}
          <Route path="/staff" element={
            <RoleRoute allowedRoles={[1]}>
              <StaffAdmin />
            </RoleRoute>
          } />
          <Route path="/catalogs" element={
            <RoleRoute allowedRoles={[1]}>
              <CatalogsView />
            </RoleRoute>
          } />
          <Route path="/settings" element={
            <RoleRoute allowedRoles={[1]}>
              <Settings />
            </RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

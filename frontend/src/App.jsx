import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { RoutesView } from './pages/RoutesView';
import { PDVAdmin } from './pages/PDVAdmin';
import { ReportsView } from './pages/ReportsView';
import { Login } from './pages/Login';
import { MobileReponedor } from './pages/MobileReponedor';
import { StaffAdmin } from './pages/StaffAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/mobile" element={<MobileReponedor />} />
        
        {/* Rutas Privadas (Requieren Layout con Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesView />} />
          <Route path="/pdvs" element={<PDVAdmin />} />
          <Route path="/staff" element={<StaffAdmin />} />
          <Route path="/reports" element={<ReportsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import { MainLayout } from './components/layout/MainLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Auth Pages
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';

// App Pages
import { Dashboard } from './pages/Dashboard.jsx';
import { Billing } from './pages/Billing.jsx';
import { Inventory } from './pages/Inventory.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Invoices } from './pages/Invoices.jsx';
import { Settings } from './pages/Settings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
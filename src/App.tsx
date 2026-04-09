import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';

// Substitua pelos seus imports reais conforme a nova estrutura
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Customers } from './pages/Customers';
import { Inventory } from './pages/Inventory';
import { Finance } from './pages/Finance';
import { Professionals } from './pages/Professionals';
import { Marketing } from './pages/Marketing';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LandingPage onEnterPortal={() => window.location.href = '/login'} />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas */}
      <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="finance" element={<Finance />} />
        <Route path="professionals" element={<Professionals />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      
      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
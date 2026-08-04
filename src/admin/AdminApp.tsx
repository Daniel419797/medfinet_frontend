import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import VaccinationOversight from './pages/VaccinationOversight';
import VaccineManagement from './pages/VaccineManagement';
import AnalyticsReports from './pages/AnalyticsReports';
import APIManagement from './pages/APIManagement';

function AdminApp() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="vaccinations" element={<VaccinationOversight />} />
      <Route path="vaccines" element={<VaccineManagement />} />
      <Route path="analytics" element={<AnalyticsReports />} />
      <Route path="api" element={<APIManagement />} />
      <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold text-neutral-900 dark:text-white">System Settings</h1><p className="text-neutral-600 dark:text-neutral-300">Settings panel coming soon...</p></div>} />
    </Routes>
  );
}

export default AdminApp;
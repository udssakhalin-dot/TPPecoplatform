/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { RegistryPage } from './pages/RegistryPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfileEditPage } from './pages/dashboard/ProfileEditPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { B2BRequestsPage } from './pages/B2BRequestsPage';
import { CreateB2BRequestPage } from './pages/dashboard/CreateB2BRequestPage';
import { MyB2BRequestsPage } from './pages/dashboard/MyB2BRequestsPage';
import { B2BRequestDetailsPage } from './pages/B2BRequestDetailsPage';
import { VEDServicesPage } from './pages/VEDServicesPage';
import { CreateVEDRequestPage } from './pages/dashboard/CreateVEDRequestPage';
import { MyVEDRequestsPage } from './pages/dashboard/MyVEDRequestsPage';
import { SupportMeasuresPage } from './pages/SupportMeasuresPage';
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminSupportMeasuresPage } from './pages/admin/AdminSupportMeasuresPage';
import { NewsDetailsPage } from './pages/NewsDetailsPage';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="news/:id" element={<NewsDetailsPage />} />
            <Route path="registry" element={<RegistryPage />} />
            <Route path="companies/:id" element={<CompanyDetailsPage />} />
            <Route path="b2b" element={<B2BRequestsPage />} />
            <Route path="b2b/:id" element={<B2BRequestDetailsPage />} />
            <Route path="ved" element={<VEDServicesPage />} />
            <Route path="support" element={<SupportMeasuresPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<PlaceholderPage title="Страница не найдена" />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfileEditPage />} />
              <Route path="b2b" element={<MyB2BRequestsPage />} />
              <Route path="b2b/new" element={<CreateB2BRequestPage />} />
              <Route path="ved" element={<MyVEDRequestsPage />} />
              <Route path="ved/new" element={<CreateVEDRequestPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="support" element={<AdminSupportMeasuresPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';

// Pages
import { HomePage } from './pages/public/HomePage';
import { JobsPage } from './pages/public/JobsPage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { CompaniesPage } from './pages/public/CompaniesPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { ApplicationsPage } from './pages/dashboard/ApplicationsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { ResumePage } from './pages/dashboard/ResumePage';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Routes>
              {/* Standalone Authentication Layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public Pages with Nav & Footer */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <HomePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/jobs"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <JobsPage defaultInternship={false} />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/internships"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <JobsPage defaultInternship={true} />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <JobDetailsPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/companies"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <CompaniesPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Job Seeker Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <Navbar />
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="resume" element={<ResumePage />} />
                <Route path="applications" element={<ApplicationsPage />} />
              </Route>

              {/* Recruiter Dashboard */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <Navbar />
                    <RecruiterDashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Navbar />
                    <AdminDashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

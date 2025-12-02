import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './components/common/ConfirmDialog';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SearchPage } from './pages/Search/SearchPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { UsersPage } from './pages/Users/UsersPage';
import { DevicesPage } from './pages/Devices/DevicesPage';
import { FacilitiesPage } from './pages/Facilities/FacilitiesPage';
import { Layout } from './components/layout/Layout';
import { VaccinesPage } from './pages/Vaccines/VaccinesPage';
import { PatientsPage } from './pages/Patients/PatientsPage';
import { PatientDetailPage } from './pages/Patients/PatientDetailPage';
import { SettingsPage } from './pages/Settings/SettingsPage';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route path="/patients" element={<PatientsPage />} />
                          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                          <Route path="/vaccines" element={<VaccinesPage />} />
                          <Route path="/records" element={<SearchPage />} />
                          <Route path="/facilities" element={<FacilitiesPage />} />
                          <Route path="/staff" element={<UsersPage />} />
                          <Route path="/devices" element={<DevicesPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
      
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

export default App;
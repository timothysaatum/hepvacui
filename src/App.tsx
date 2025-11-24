import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './components/common/ConfirmDialog';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UsersPage } from './pages/Users/UsersPage';
import { DevicesPage } from './pages/Devices/DevicesPage';
import { FacilitiesPage } from './pages/Facilities/FacilitiesPage';
import { Layout } from './components/layout/Layout';
import { VaccinesPage } from './pages/Vaccines/VaccinesPage';
import { PatientsPage } from './pages/Patients/PatientsPage';
import { PatientDetailPage } from './pages/Patients/PatientDetailPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
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
                          <Route path="/dashboard" element={<DashboardPlaceholder />} />
                          <Route path="/patients" element={<PatientsPage />} />
                          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                          <Route path="/vaccinations" element={<VaccinationsPlaceholder />} />
                          <Route path="/vaccines" element={<VaccinesPage />} />
                          <Route path="/payments" element={<PaymentsPlaceholder />} />
                          <Route path="/facilities" element={<FacilitiesPage />} />
                          <Route path="/staff" element={<UsersPage />} />
                          <Route path="/devices" element={<DevicesPage />} />
                          <Route path="/settings" element={<SettingsPlaceholder />} />
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
      
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

// Placeholder components
const DashboardPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    <p className="text-gray-600">Dashboard analytics and overview coming soon...</p>
  </div>
);

const PatientsPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Patients</h2>
    <p className="text-gray-600">Patient management system coming soon...</p>
  </div>
);

const VaccinationsPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Vaccinations</h2>
    <p className="text-gray-600">Vaccination records coming soon...</p>
  </div>
);

const VaccinesPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Vaccines</h2>
    <p className="text-gray-600">Vaccine inventory management coming soon...</p>
  </div>
);

const PaymentsPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Payments</h2>
    <p className="text-gray-600">Payment tracking coming soon...</p>
  </div>
);

const SettingsPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8">
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p className="text-gray-600">Application settings coming soon...</p>
  </div>
);

export default App;
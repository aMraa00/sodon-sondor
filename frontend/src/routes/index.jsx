import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Suspense, lazy } from 'react';
import { PageLoader } from '@/components/common/Loader';
import AppShell from '@/components/layout/AppShell';
import Home from '@/pages/public/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Forgot from '@/pages/auth/Forgot';
import ResetPw from '@/pages/auth/ResetPassword';

// Lazy: deploy дараа кэш + chunk hash унахад "Failed to fetch dynamic import" гарч болзошгүй — нийтлэг (login) хуудсыг main-д оруулсан

const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers        = lazy(() => import('@/pages/admin/Users'));
const AdminDoctors      = lazy(() => import('@/pages/admin/Doctors'));
const AdminPatients     = lazy(() => import('@/pages/admin/Patients'));
const AdminServices     = lazy(() => import('@/pages/admin/Services'));
const AdminReports      = lazy(() => import('@/pages/admin/Reports'));
const AdminAppointments = lazy(() => import('@/pages/admin/Appointments'));

const DoctorDashboard   = lazy(() => import('@/pages/doctor/Dashboard'));
const DoctorAppointments= lazy(() => import('@/pages/doctor/Appointments'));
const DoctorPatients    = lazy(() => import('@/pages/doctor/Patients'));
const DoctorPatientDetail= lazy(() => import('@/pages/doctor/PatientDetail'));
const DoctorDiagnosis   = lazy(() => import('@/pages/doctor/Diagnosis'));

const ReceptionDashboard= lazy(() => import('@/pages/reception/Dashboard'));
const ReceptionAppointments= lazy(() => import('@/pages/reception/Appointments'));
const ReceptionPatients = lazy(() => import('@/pages/reception/Patients'));
const ReceptionPayments = lazy(() => import('@/pages/reception/Payments'));

const PatientDashboard  = lazy(() => import('@/pages/patient/Dashboard'));
const PatientAppointments= lazy(() => import('@/pages/patient/Appointments'));
const PatientHistory    = lazy(() => import('@/pages/patient/History'));
const BookAppointment   = lazy(() => import('@/pages/patient/BookAppointment'));

const Profile   = lazy(() => import('@/pages/Profile'));
const NotFound  = lazy(() => import('@/pages/NotFound'));

function PrivateRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return children;
}

function AuthRedirect({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    const redirectMap = { admin: '/admin', doctor: '/doctor', receptionist: '/reception', patient: '/patient' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login"    element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
          <Route path="/forgot"   element={<Forgot />} />
          <Route path="/reset-password/:token" element={<ResetPw />} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/users"        element={<PrivateRoute><RoleRoute roles={['admin']}><AdminUsers /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/doctors"      element={<PrivateRoute><RoleRoute roles={['admin']}><AdminDoctors /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/patients"     element={<PrivateRoute><RoleRoute roles={['admin']}><AdminPatients /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/services"     element={<PrivateRoute><RoleRoute roles={['admin']}><AdminServices /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/reports"      element={<PrivateRoute><RoleRoute roles={['admin']}><AdminReports /></RoleRoute></PrivateRoute>} />
          <Route path="/admin/appointments" element={<PrivateRoute><RoleRoute roles={['admin']}><AdminAppointments /></RoleRoute></PrivateRoute>} />

          {/* Doctor */}
          <Route path="/doctor"                   element={<PrivateRoute><RoleRoute roles={['doctor']}><DoctorDashboard /></RoleRoute></PrivateRoute>} />
          <Route path="/doctor/appointments"      element={<PrivateRoute><RoleRoute roles={['doctor']}><DoctorAppointments /></RoleRoute></PrivateRoute>} />
          <Route path="/doctor/patients"          element={<PrivateRoute><RoleRoute roles={['doctor']}><DoctorPatients /></RoleRoute></PrivateRoute>} />
          <Route path="/doctor/patients/:id"      element={<PrivateRoute><RoleRoute roles={['doctor']}><DoctorPatientDetail /></RoleRoute></PrivateRoute>} />
          <Route path="/doctor/diagnosis"         element={<PrivateRoute><RoleRoute roles={['doctor']}><DoctorDiagnosis /></RoleRoute></PrivateRoute>} />

          {/* Reception */}
          <Route path="/reception"              element={<PrivateRoute><RoleRoute roles={['receptionist']}><ReceptionDashboard /></RoleRoute></PrivateRoute>} />
          <Route path="/reception/appointments" element={<PrivateRoute><RoleRoute roles={['receptionist']}><ReceptionAppointments /></RoleRoute></PrivateRoute>} />
          <Route path="/reception/patients"     element={<PrivateRoute><RoleRoute roles={['receptionist']}><ReceptionPatients /></RoleRoute></PrivateRoute>} />
          <Route path="/reception/payments"     element={<PrivateRoute><RoleRoute roles={['receptionist']}><ReceptionPayments /></RoleRoute></PrivateRoute>} />

          {/* Patient */}
          <Route path="/patient"              element={<PrivateRoute><RoleRoute roles={['patient']}><PatientDashboard /></RoleRoute></PrivateRoute>} />
          <Route path="/patient/appointments" element={<PrivateRoute><RoleRoute roles={['patient']}><PatientAppointments /></RoleRoute></PrivateRoute>} />
          <Route path="/patient/history"      element={<PrivateRoute><RoleRoute roles={['patient']}><PatientHistory /></RoleRoute></PrivateRoute>} />
          <Route path="/book"                 element={<PrivateRoute><RoleRoute roles={['patient']}><BookAppointment /></RoleRoute></PrivateRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

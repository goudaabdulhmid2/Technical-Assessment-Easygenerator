import { Navigate, Route, Routes } from 'react-router';
import { GuestRoute, ProtectedRoute } from './auth/RouteGuards';
import { ApplicationPage } from './pages/ApplicationPage';
import { SigninPage } from './pages/SigninPage';
import { SignupPage } from './pages/SignupPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/signin" element={<GuestRoute><SigninPage /></GuestRoute>} />
      <Route path="/app" element={<ProtectedRoute><ApplicationPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

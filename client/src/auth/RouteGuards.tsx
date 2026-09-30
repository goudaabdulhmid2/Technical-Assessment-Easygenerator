import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PageState } from '../components/PageState';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, refresh } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageState label="Checking your session…" />;
  if (status === 'error') {
    return <PageState label="We couldn’t check your session." actionLabel="Try again" onAction={() => void refresh()} loading={false} />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <PageState label="Checking your session…" />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from || '/app'} replace />;
  }
  return children;
}

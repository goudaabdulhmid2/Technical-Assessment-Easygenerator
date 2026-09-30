import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { GuestRoute, ProtectedRoute } from './RouteGuards';

const authState = vi.hoisted(() => ({ status: 'unauthenticated' as string, refresh: vi.fn() }));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ status: authState.status, refresh: authState.refresh }),
}));

afterEach(() => {
  cleanup();
  authState.status = 'unauthenticated';
});

function renderProtectedPath(status: string) {
  authState.status = status;
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <Routes>
        <Route path="/app" element={<ProtectedRoute><h1>Private workspace</h1></ProtectedRoute>} />
        <Route path="/signin" element={<h1>Sign in</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('route guards', () => {
  it('does not reveal the protected page while the session is checking', () => {
    renderProtectedPath('checking');
    expect(screen.getByText('Checking your session…')).toBeInTheDocument();
    expect(screen.queryByText('Private workspace')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated visitors away from the protected page', () => {
    renderProtectedPath('unauthenticated');
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders protected content for authenticated visitors', () => {
    renderProtectedPath('authenticated');
    expect(screen.getByRole('heading', { name: 'Private workspace' })).toBeInTheDocument();
  });

  it('redirects authenticated visitors away from guest-only pages', () => {
    authState.status = 'authenticated';
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<GuestRoute><h1>Create account</h1></GuestRoute>} />
          <Route path="/app" element={<h1>Application</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Application' })).toBeInTheDocument();
  });
});

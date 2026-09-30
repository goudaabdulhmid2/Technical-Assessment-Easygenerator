import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ApiError } from '../api/client';
import { authApi } from '../api/auth.api';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, GuestRoute } from './RouteGuards';
import { SigninPage } from '../pages/SigninPage';
import { SignupPage } from '../pages/SignupPage';
import { ApplicationPage } from '../pages/ApplicationPage';
import type { User } from '../types/auth';

vi.mock('../api/auth.api', () => ({
  authApi: {
    currentUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

const demoUser: User = { id: 'u-1', name: 'Alex Morgan', email: 'alex@example.com' };

function renderAuthApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<GuestRoute><SigninPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/app" element={<ProtectedRoute><ApplicationPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authApi.currentUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
  vi.mocked(authApi.signIn).mockResolvedValue(demoUser);
  vi.mocked(authApi.signUp).mockResolvedValue(demoUser);
  vi.mocked(authApi.signOut).mockResolvedValue(undefined);
});

afterEach(cleanup);

describe('authentication flow', () => {
  it('signs in and opens the protected application page', async () => {
    const user = userEvent.setup();
    renderAuthApp('/signin');

    await user.type(await screen.findByLabelText('Email address'), demoUser.email);
    await user.type(screen.getByLabelText('Password'), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: 'Welcome to the application.' })).toBeInTheDocument();
    expect(screen.getAllByText(demoUser.email)).toHaveLength(2);
  });

  it('registers an account and gives a clear next step', async () => {
    const user = userEvent.setup();
    renderAuthApp('/signup');

    await user.type(await screen.findByLabelText('Full name'), demoUser.name);
    await user.type(screen.getByLabelText('Email address'), demoUser.email);
    await user.type(screen.getByLabelText('Password'), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('heading', { name: 'Sign in to your space' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Your account is ready. Sign in to continue.');
  });

  it('clears auth state after logout and returns to signin', async () => {
    vi.mocked(authApi.currentUser).mockResolvedValue(demoUser);
    const user = userEvent.setup();
    renderAuthApp('/app');

    expect(await screen.findByRole('heading', { name: 'Welcome to the application.' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Sign in to your space' })).toBeInTheDocument();
    await waitFor(() => expect(authApi.signOut).toHaveBeenCalledOnce());
  });

  it('clears local auth state when the logout request fails', async () => {
    vi.mocked(authApi.currentUser).mockResolvedValue(demoUser);
    vi.mocked(authApi.signOut).mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    renderAuthApp('/app');

    await screen.findByRole('heading', { name: 'Welcome to the application.' });
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Sign in to your space' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('server could not confirm logout');
  });
});

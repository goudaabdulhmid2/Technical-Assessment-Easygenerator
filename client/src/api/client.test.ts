import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('includes browser credentials so the HttpOnly auth cookie is sent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { id: 'u-1' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/auth/me');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/auth\/me$/),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('maps duplicate email to a helpful message and keeps field validation errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'Enter a valid email address.' }],
    }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/auth/signup', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 400,
      fieldErrors: { email: 'Enter a valid email address.' },
    });

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Email is already registered' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }));
    await expect(apiRequest('/auth/signup', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 409,
      message: 'An account with this email already exists. Try signing in instead.',
    } satisfies Partial<ApiError>);
  });
});

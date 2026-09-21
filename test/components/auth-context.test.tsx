import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { setCsrfToken } from '@/lib/api';

const authUser = {
  id: '9de722cb-8d7d-4b05-8566-8a69b2053035',
  email: 'admin@example.com',
  name: 'Admin Test',
  avatarUrl: null,
  role: { id: 'role-id', code: 'HEAD', name: 'Jefe' },
  permissions: ['dashboard.read'],
};

function StateProbe() {
  const { status, user, sessionExpired } = useAuth();
  return <div>{status}|{user?.email ?? 'none'}|{String(sessionExpired)}</div>;
}

beforeEach(() => {
  setCsrfToken(null);
  vi.unstubAllGlobals();
});

describe('AuthProvider', () => {
  it('restores an existing cookie session and obtains CSRF state', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ data: { user: authUser } }))
      .mockResolvedValueOnce(Response.json({ data: { csrfToken: 'csrf-restored' } }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AuthProvider><StateProbe /></AuthProvider>);

    expect(await screen.findByText('authenticated|admin@example.com|false')).toBeVisible();
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/v1/auth/me', expect.objectContaining({
      credentials: 'include',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/auth/csrf', expect.any(Object));
  });

  it('moves to an expired-session state when the API reports unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    render(<AuthProvider><StateProbe /></AuthProvider>);
    expect(await screen.findByText('unauthenticated|none|false')).toBeVisible();

    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    await waitFor(() => expect(screen.getByText('unauthenticated|none|true')).toBeVisible());
  });
});

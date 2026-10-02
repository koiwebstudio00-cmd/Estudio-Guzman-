import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { setCsrfToken } from '@/lib/api';

const user = {
  id: 'user-profile',
  email: 'perfil@example.com',
  name: 'Usuario Perfil',
  avatarUrl: null,
  role: { id: 'role-1', code: 'LAWYER', name: 'Abogado/a' },
  permissions: ['dashboard.read', 'cases.read', 'contacts.read'],
};

beforeEach(() => {
  setCsrfToken(null);
  window.history.pushState({}, '', '/perfil');
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), window.location.origin);
    if (url.pathname.endsWith('/auth/me')) return Response.json({ data: { user } });
    if (url.pathname.endsWith('/auth/csrf')) return Response.json({ data: { csrfToken: 'csrf-profile' } });
    return new Response('{}', { status: 404 });
  }));
});

describe('Profile', () => {
  it('shows the authenticated user account and role permissions', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Usuario Perfil' })).toBeVisible();
    expect(screen.getAllByText('perfil@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Abogado/a').length).toBeGreaterThan(0);
    expect(screen.getByText('Ver contactos')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Avatar 1' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Koi Studio' })).toBeVisible();
  });
});

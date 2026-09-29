import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { setCsrfToken } from '@/lib/api';

const permissions = ['dashboard.read', 'users.read', 'users.manage', 'roles.read', 'roles.manage'];
const role = {
  id: '52d73225-91f5-47f0-98e7-6d6820f72693', code: 'HEAD', name: 'Jefe', description: null,
  isSystem: true, userCount: 1,
  permissions: permissions.map((code, index) => ({ id: `permission-${index}`, code, description: code })),
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
const user = {
  id: '9de722cb-8d7d-4b05-8566-8a69b2053035', email: 'admin@example.com', name: 'Admin Test',
  avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  role: { id: role.id, code: role.code, name: role.name }, permissions,
};

beforeEach(() => {
  setCsrfToken(null);
  window.history.pushState({}, '', '/equipo');
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/auth/me')) return Response.json({ data: { user } });
    if (url.endsWith('/auth/csrf')) return Response.json({ data: { csrfToken: 'csrf-team' } });
    if (url.endsWith('/users')) return Response.json({ data: [user] });
    if (url.endsWith('/roles')) return Response.json({ data: [role] });
    return new Response('{}', { status: 404 });
  }));
});

describe('Team', () => {
  it('loads real users and roles and exposes administration only with permissions', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Equipo' })).toBeVisible();
    expect(screen.getByText('admin@example.com')).toBeVisible();
    expect(screen.getByRole('button', { name: /Agregar integrante/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Crear rol/ })).toBeVisible();
  });

  it('allows an administrator to generate a secure initial password', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: /Agregar integrante/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Generar contraseña segura' }));
    const password = screen.getByLabelText('Contraseña inicial') as HTMLInputElement;
    expect(password.value).toHaveLength(20);
  });
});

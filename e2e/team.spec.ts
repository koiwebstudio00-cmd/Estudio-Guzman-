import { expect, test } from '@playwright/test';

test('loads the real team contract and creates an invited user', async ({ page }) => {
  const permissions = ['dashboard.read', 'users.read', 'users.manage', 'roles.read', 'roles.manage'];
  const role = {
    id: '52d73225-91f5-47f0-98e7-6d6820f72693', code: 'HEAD', name: 'Jefe', description: null,
    isSystem: true, userCount: 1,
    permissions: permissions.map((code, index) => ({ id: `permission-${index}`, code, description: code })),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  const admin = {
    id: '9de722cb-8d7d-4b05-8566-8a69b2053035', email: 'admin@example.com', name: 'Admin Test',
    avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    role: { id: role.id, code: role.code, name: role.name }, permissions,
  };

  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ json: { data: { user: admin } } });
    if (path.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-team' } } });
    if (path.endsWith('/roles')) return route.fulfill({ json: { data: [role] } });
    if (path.endsWith('/users') && route.request().method() === 'GET') return route.fulfill({ json: { data: [admin] } });
    if (path.endsWith('/users') && route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { email: string; name: string; roleId: string };
      return route.fulfill({ status: 201, json: { data: { ...admin, id: 'new-user-id', email: body.email, name: body.name, role: { id: role.id, code: role.code, name: role.name } } } });
    }
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/equipo');
  await expect(page.getByRole('heading', { name: 'Equipo' })).toBeVisible();
  await page.getByRole('button', { name: /Agregar integrante/ }).click();
  await page.getByLabel('Nombre').fill('Nueva Integrante');
  await page.getByLabel('Email').fill('nueva@example.com');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByText('nueva@example.com')).toBeVisible();
});

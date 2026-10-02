import { expect, test } from '@playwright/test';

test('updates the own profile and changes the password using the current credential', async ({ page }) => {
  let profileBody: Record<string, unknown> | null = null;
  let passwordBody: Record<string, unknown> | null = null;
  const user = {
    id: '9de722cb-8d7d-4b05-8566-8a69b2053035',
    version: 1,
    email: 'admin@example.com',
    name: 'Admin Test',
    avatarUrl: null,
    role: { id: '52d73225-91f5-47f0-98e7-6d6820f72693', code: 'HEAD', name: 'Jefe' },
    permissions: ['dashboard.read'],
  };

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/auth/me') && route.request().method() === 'GET') return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/me') && route.request().method() === 'PATCH') {
      profileBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({ json: { data: { user: { ...user, ...profileBody, version: 2 } } } });
    }
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-profile' } } });
    if (url.pathname.endsWith('/auth/change-password')) {
      passwordBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({ status: 204, body: '' });
    }
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/perfil');
  await page.getByLabel('Nombre').fill('Administración Guzmán');
  await page.getByLabel('Email').first().fill('perfil@example.com');
  await page.getByRole('button', { name: 'Guardar datos' }).click();
  await expect(page.getByRole('heading', { name: 'Administración Guzmán' })).toBeVisible();
  expect(profileBody).toMatchObject({ version: 1, name: 'Administración Guzmán', email: 'perfil@example.com' });

  await page.getByLabel('Contraseña actual').fill('ClaveSegura123');
  await page.getByLabel('Nueva contraseña', { exact: true }).fill('NuevaClaveSegura456');
  await page.getByLabel('Repetir nueva contraseña').fill('NuevaClaveSegura456');
  await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(passwordBody).toEqual({ currentPassword: 'ClaveSegura123', newPassword: 'NuevaClaveSegura456' });
});

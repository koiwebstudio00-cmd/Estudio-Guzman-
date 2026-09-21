import { expect, test } from '@playwright/test';

const user = {
  id: '9de722cb-8d7d-4b05-8566-8a69b2053035',
  email: 'admin@example.com',
  name: 'Admin Test',
  avatarUrl: null,
  role: { id: 'role-id', code: 'HEAD', name: 'Jefe' },
  permissions: ['dashboard.read'],
};

test('logs in, restores the session after refresh and logs out', async ({ page }) => {
  let authenticated = false;

  await page.route('**/api/v1/dashboard', (route) => route.fulfill({ json: { data: { range: { from: null, to: null }, kpis: { activeCases: 0, openTasks: 0, overdueTasks: 0, dueToday: 0, activeClients: 0 }, myTasks: [], activity: [] } } }));
  await page.route('**/api/v1/notifications', (route) => route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } }));

  await page.route('**/api/v1/auth/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/login')) {
      authenticated = true;
      await route.fulfill({ json: { data: { user, csrfToken: 'csrf-e2e' } } });
      return;
    }
    if (url.pathname.endsWith('/logout')) {
      authenticated = false;
      await route.fulfill({ status: 204 });
      return;
    }
    if (url.pathname.endsWith('/me') && authenticated) {
      await route.fulfill({ json: { data: { user } } });
      return;
    }
    if (url.pathname.endsWith('/csrf') && authenticated) {
      await route.fulfill({ json: { data: { csrfToken: 'csrf-e2e' } } });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: 'application/problem+json',
      json: { title: 'UNAUTHORIZED', status: 401, detail: 'Sesión inválida o vencida.' },
    });
  });

  await page.goto('/');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Contraseña').fill('ClaveSegura123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByText('Juicios activos', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Bienvenido\/a, Admin Test/)).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ingresar a la plataforma' })).toBeVisible();
});

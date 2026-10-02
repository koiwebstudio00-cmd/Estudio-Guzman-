import { expect, test } from '@playwright/test';

const actorAvatarUrl = 'https://i.postimg.cc/brBnVNx5/koi-logo.webp';

const user = {
  id: 'user-1', email: 'admin@example.com', name: 'Administrador', avatarUrl: null, status: 'ACTIVE', version: 1,
  lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'ADMIN', name: 'Administrador' },
  permissions: ['dashboard.read', 'audit.read'],
};

test('filters and paginates the complete activity log', async ({ page }) => {
  const searches: string[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-activity' } } });
    if (url.pathname.endsWith('/audit-logs')) {
      searches.push(url.search);
      const cursor = url.searchParams.get('cursor');
      return route.fulfill({ json: cursor ? {
        data: [{ id: '1', action: 'AUTH_LOGIN_SUCCEEDED', entityType: 'Session', entityId: 'session-1', before: null, after: null, metadata: null, requestId: null, ipAddress: null, userAgent: null, createdAt: '2026-09-19T11:00:00.000Z', actor: { id: 'user-1', name: 'Administrador', email: 'admin@example.com', avatarUrl: actorAvatarUrl } }],
        meta: { nextCursor: null },
      } : {
        data: [{ id: '2', action: 'CASE_CREATED', entityType: 'LegalCase', entityId: 'case-1', before: null, after: { status: 'ACTIVE' }, metadata: null, requestId: 'request-1', ipAddress: '127.0.0.1', userAgent: 'Browser', createdAt: '2026-09-20T12:00:00.000Z', actor: { id: 'user-1', name: 'Administrador', email: 'admin@example.com', avatarUrl: actorAvatarUrl } }],
        meta: { nextCursor: '1' },
      } });
    }
    if (url.pathname.endsWith('/dashboard')) return route.fulfill({ json: { data: { range: { from: null, to: null }, kpis: { activeCases: 0, openTasks: 0, overdueTasks: 0, dueToday: 0, activeClients: 0 }, myTasks: [], activity: [] } } });
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/actividad');
  await expect(page.getByRole('heading', { name: 'Actividad' })).toBeVisible();
  await expect(page.getByText('creó un expediente')).toBeVisible();
  await expect(page.locator(`img[src="${actorAvatarUrl}"]`)).toBeVisible();

  await page.getByLabel('Tipo de actividad').selectOption('Task');
  await page.getByLabel('Actividad desde').fill('2026-09-01');
  await page.getByLabel('Actividad hasta').fill('2026-09-30');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect.poll(() => searches.at(-1)).toContain('entityType=Task');
  await expect.poll(() => searches.at(-1)).toContain('from=2026-09-01');
  await expect.poll(() => searches.at(-1)).toContain('to=2026-09-30');

  await page.getByRole('button', { name: 'Cargar más movimientos' }).click();
  await expect(page.getByText('inició sesión')).toBeVisible();
  await expect.poll(() => searches.at(-1)).toContain('cursor=1');
});

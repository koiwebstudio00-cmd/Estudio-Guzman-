import { expect, test } from '@playwright/test';

const permissions = ['dashboard.read', 'cases.read', 'contacts.read', 'actions.read', 'users.read', 'roles.read', 'team_metrics.read'];
const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
const role = { id: 'role-1', code: 'HEAD', name: 'Jefe', description: null, isSystem: true, userCount: 1, permissions: permissions.map((code) => ({ id: code, code, description: code })), createdAt: '', updatedAt: '' };
const actorAvatarUrl = 'https://i.postimg.cc/brBnVNx5/koi-logo.webp';
const dashboardTasks = Array.from({ length: 18 }, (_, index) => ({
  id: `task-${index + 1}`,
  title: index === 0 ? 'Revisar demanda' : `Tarea ${index + 1}`,
  status: 'PENDING',
  priority: 'HIGH',
  dueDate: '2026-09-20T00:00:00.000Z',
  version: 1,
  legalCase: { id: 'case-1', caseNumber: '55/2026', title: 'Sucesión Núñez' },
}));
const dashboardActivity = Array.from({ length: 14 }, (_, index) => ({
  id: `activity-${index + 1}`,
  action: 'CASE_CREATED',
  entityType: 'LegalCase',
  entityId: `case-${index + 1}`,
  createdAt: '2026-09-19T12:00:00.000Z',
  actor: { id: 'user-1', name: 'Admin', avatarUrl: actorAvatarUrl },
}));

test('shows database KPIs, navigates global search and filters team metrics', async ({ page }) => {
  let requestedRange = '';
  await page.route('**/api/v1/**', async (route) => { const url = new URL(route.request().url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-dashboard' } } });
    if (url.pathname.endsWith('/dashboard')) return route.fulfill({ json: { data: { range: { from: null, to: null }, kpis: { activeCases: 7, openTasks: 5, overdueTasks: 2, dueToday: 1, activeClients: 12 }, myTasks: dashboardTasks, activity: dashboardActivity } } });
    if (url.pathname.endsWith('/search')) return route.fulfill({ json: { data: [{ type: 'CASE', id: 'case-1', title: 'Sucesión Núñez', subtitle: '55/2026', path: '/juicios/case-1', at: '2026-09-19T12:00:00.000Z' }] } });
    if (url.pathname.endsWith('/users')) return route.fulfill({ json: { data: [user] } });
    if (url.pathname.endsWith('/roles')) return route.fulfill({ json: { data: [role] } });
    if (url.pathname.endsWith('/team/metrics')) { requestedRange = url.search; return route.fulfill({ json: { data: [{ userId: 'user-1', name: 'Admin', assigned: 5, completed: 3, overdue: 2, primaryCases: 4 }], meta: { from: url.searchParams.get('from'), to: url.searchParams.get('to') } } }); }
    if (url.pathname.endsWith('/catalogs')) return route.fulfill({ json: { data: { contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [], caseTypes: [], caseStatuses: [], participantRoles: [], partySides: [], actionTypes: [] } } });
    if (url.pathname.endsWith('/cases/case-1/subcases')) return route.fulfill({ json: { data: [] } });
    if (url.pathname.endsWith('/cases/case-1/timeline')) return route.fulfill({ json: { data: [], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/cases/case-1')) return route.fulfill({ json: { data: { id: 'case-1', caseNumber: '55/2026', title: 'Sucesión Núñez', type: 'OTHER', status: 'ACTIVE', startDate: '2026-01-01T00:00:00.000Z', closedOn: null, archivedOn: null, version: 1, createdAt: '', updatedAt: '', court: null, managementOffice: null, participants: [], team: [], statusHistory: [], summary: { subCases: 0, actions: 0, tasks: 1, notes: 0, documents: 0 } } } });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/');
  await expect(page.getByText('7', { exact: true })).toBeVisible();
  await expect(page.getByText('Revisar demanda')).toBeVisible();
  await expect(page.getByText(/creó un expediente/).first()).toBeVisible();
  await expect(page.locator(`img[src="${actorAvatarUrl}"]`).first()).toBeVisible();
  const tasksContent = page.getByLabel('Lista de mis tareas');
  const activityContent = page.getByLabel('Lista de actividad reciente');
  await expect(tasksContent).toHaveCSS('overflow-y', 'auto');
  await expect(activityContent).toHaveCSS('overflow-y', 'auto');
  await expect(tasksContent.locator('..')).toHaveCSS('height', '450px');
  await expect(activityContent.locator('..')).toHaveCSS('height', '450px');
  await expect.poll(() => tasksContent.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect.poll(() => activityContent.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await page.getByLabel('Búsqueda global').fill('sucesion nunez'); await expect(page.getByText('Sucesión Núñez').last()).toBeVisible(); await page.getByText('Sucesión Núñez').last().click(); await expect(page.getByRole('heading', { name: 'Sucesión Núñez' })).toBeVisible();
  await page.goto('/equipo'); await expect(page.getByRole('heading', { name: 'Métricas del equipo' })).toBeVisible(); await expect(page.getByRole('cell', { name: '3' })).toBeVisible(); await page.getByLabel('Métricas desde').fill('2026-09-01'); await expect.poll(() => requestedRange).toContain('from=2026-09-01');
});

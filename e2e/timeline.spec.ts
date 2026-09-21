import { expect, test } from '@playwright/test';

test('registers an action and refreshes the unified case timeline', async ({ page }) => {
  const permissions = ['cases.read', 'catalogs.read', 'actions.create', 'subcases.manage'];
  const user = {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin',
    avatarUrl: null,
    status: 'ACTIVE',
    version: 1,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    role: { id: 'role-1', code: 'HEAD', name: 'Jefe' },
    permissions,
  };
  const legalCase = {
    id: 'case-1',
    caseNumber: '123/2026',
    title: 'Pérez c/ Empresa',
    type: 'LABOR',
    status: 'ACTIVE',
    startDate: '2026-01-10T00:00:00.000Z',
    closedOn: null,
    archivedOn: null,
    version: 1,
    createdAt: '',
    updatedAt: '',
    court: null,
    managementOffice: null,
    participants: [],
    team: [{ id: 'team-1', role: 'PRIMARY', assignedAt: '', unassignedAt: null, user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' } }],
    statusHistory: [],
    summary: { subCases: 0, actions: 0, tasks: 0, notes: 0, documents: 0 },
  };
  const catalogs = {
    contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [],
    caseTypes: [{ value: 'LABOR', label: 'Laboral' }],
    caseStatuses: [{ value: 'ACTIVE', label: 'Activo' }],
    participantRoles: [], partySides: [],
    actionTypes: [{ value: 'FILING', label: 'Presentación' }],
    subCaseTypes: [], subCaseStatuses: [],
  };
  let actionCreated = false;

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-timeline' } } });
    if (url.pathname.endsWith('/catalogs')) return route.fulfill({ json: { data: catalogs } });
    if (url.pathname.endsWith('/cases/case-1/subcases')) return route.fulfill({ json: { data: [] } });
    if (url.pathname.endsWith('/cases/case-1/actions') && request.method() === 'POST') {
      actionCreated = true;
      return route.fulfill({ status: 201, json: { data: { id: 'action-1', ...request.postDataJSON() } } });
    }
    if (url.pathname.endsWith('/cases/case-1/timeline')) {
      return route.fulfill({
        json: {
          data: actionCreated ? [{ id: 'action-1', kind: 'ACTION', at: '2026-05-01T13:00:00.000Z', title: 'Demanda presentada', detail: 'Presentación', actor: { id: 'user-1', name: 'Admin' }, data: {} }] : [],
          meta: { nextCursor: null },
        },
      });
    }
    if (url.pathname.endsWith('/cases/case-1')) return route.fulfill({ json: { data: legalCase } });
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/juicios/case-1');
  await expect(page.getByRole('heading', { name: 'Pérez c/ Empresa' })).toBeVisible();
  await expect(page.getByText('Todavía no hay eventos para este filtro.')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva actuación' }).click();
  await page.getByLabel('Título').fill('Demanda presentada');
  await page.getByLabel('Tipo').selectOption('FILING');
  await page.getByLabel('Fecha y hora').fill('2026-05-01T10:00');
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByText('Demanda presentada')).toBeVisible();
  await expect(page.getByText('Admin · Presentación')).toBeVisible();
});

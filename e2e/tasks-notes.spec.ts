import { expect, test } from '@playwright/test';

const permissions = ['tasks.read', 'tasks.create', 'tasks.update', 'tasks.change_status', 'tasks.assign', 'cases.read', 'catalogs.read', 'notes.read', 'notes.create'];
const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
const teamUser = { ...user, permissions, role: user.role };
const legalCase = { id: 'case-1', caseNumber: '123/2026', title: 'Pérez c/ Empresa', type: 'LABOR', status: 'ACTIVE', startDate: '2026-01-10T00:00:00.000Z', closedOn: null, archivedOn: null, version: 1, createdAt: '', updatedAt: '', court: null, managementOffice: null, participants: [], team: [], statusHistory: [], summary: { subCases: 0, actions: 0, tasks: 1, notes: 0, documents: 0 } };
const taskRecord = (status = 'PENDING', version = 1) => ({ id: 'task-1', title: 'Revisar demanda', description: 'Controlar documentación', status, priority: 'HIGH', dueDate: '2026-09-25T00:00:00.000Z', completedAt: null, version, createdAt: '', updatedAt: '', case: { id: 'case-1', title: legalCase.title, caseNumber: legalCase.caseNumber, status: 'ACTIVE' }, subCase: null, createdBy: { id: 'user-1', name: 'Admin' }, assignees: [{ id: 'user-1', name: 'Admin', email: 'admin@example.com' }], assignments: [], history: [{ id: 'history-1', fromStatus: null, toStatus: status, reason: null, changedAt: '', changedBy: { id: 'user-1', name: 'Admin' } }], comments: [], documentCount: 0 });

test('rolls back an optimistic Kanban move on a stale version and then persists it', async ({ page }) => {
  let failTransition = true; let status = 'PENDING'; let version = 1;
  await page.route('**/api/v1/**', async (route) => { const request = route.request(); const url = new URL(request.url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-tasks' } } });
    if (url.pathname.endsWith('/users')) return route.fulfill({ json: { data: [teamUser] } });
    if (url.pathname.endsWith('/cases')) return route.fulfill({ json: { data: [legalCase], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/tasks') && request.method() === 'GET') return route.fulfill({ json: { data: [taskRecord(status, version)], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/tasks/task-1/status-transitions')) { if (failTransition) { failTransition = false; return route.fulfill({ status: 409, json: { type: 'conflict', title: 'Conflicto', status: 409, detail: 'La tarea fue modificada por otra operación.' } }); } status = 'IN_PROGRESS'; version += 1; return route.fulfill({ json: { data: taskRecord(status, version) } }); }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/tareas');
  const card = page.getByText('Revisar demanda');
  await expect(card).toBeVisible();
  await card.dragTo(page.getByRole('region', { name: 'En progreso' }));
  await expect(page.getByRole('region', { name: 'Pendientes' }).getByText('Revisar demanda')).toBeVisible();
  await expect(page.getByText('La tarea fue modificada por otra operación.')).toBeVisible();
  await page.getByText('Revisar demanda').dragTo(page.getByRole('region', { name: 'En progreso' }));
  await expect(page.getByRole('region', { name: 'En progreso' }).getByText('Revisar demanda')).toBeVisible();
  await page.getByRole('button', { name: 'Vista lista' }).click();
  await expect(page.getByRole('cell', { name: 'Revisar demanda' })).toBeVisible();
});

test('adds a case note from its immutable notes tab', async ({ page }) => {
  let notes: Array<Record<string, unknown>> = [];
  await page.route('**/api/v1/**', async (route) => { const request = route.request(); const url = new URL(request.url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-notes' } } });
    if (url.pathname.endsWith('/catalogs')) return route.fulfill({ json: { data: { contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [], caseTypes: [], caseStatuses: [], participantRoles: [], partySides: [], actionTypes: [] } } });
    if (url.pathname.endsWith('/cases/case-1/subcases')) return route.fulfill({ json: { data: [] } });
    if (url.pathname.endsWith('/cases/case-1/timeline')) return route.fulfill({ json: { data: [], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/cases/case-1')) return route.fulfill({ json: { data: legalCase } });
    if (url.pathname.endsWith('/notes') && request.method() === 'GET') return route.fulfill({ json: { data: notes, meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/notes') && request.method() === 'POST') { const body = request.postDataJSON(); const note = { id: 'note-1', content: body.content, version: 1, caseId: 'case-1', subCaseId: null, contactId: null, author: { id: 'user-1', name: 'Admin' }, createdAt: '2026-09-19T12:00:00.000Z', updatedAt: '2026-09-19T12:00:00.000Z' }; notes = [note]; return route.fulfill({ status: 201, json: { data: note } }); }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/juicios/case-1'); await page.getByRole('tab', { name: 'Notas' }).click(); await expect(page.getByText('Todavía no hay notas internas.')).toBeVisible(); await page.getByLabel('Nueva nota interna').fill('Cliente llamó y confirmó audiencia.'); await page.getByRole('button', { name: 'Agregar nota' }).click(); await expect(page.getByText('Cliente llamó y confirmó audiencia.')).toBeVisible(); await expect(page.getByText(/^Admin ·/)).toBeVisible();
});

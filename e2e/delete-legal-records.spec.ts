import { expect, test } from '@playwright/test';

test('deletes an empty case, an empty subcase and an action with confirmation', async ({ page }) => {
  const permissions = ['cases.read', 'cases.delete', 'cases.archive', 'catalogs.read', 'subcases.manage', 'actions.read', 'actions.delete', 'documents.read'];
  const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
  const legalCase = { id: 'case-1', caseNumber: '123/2026', title: 'Pérez c/ Empresa', type: 'LABOR', status: 'ACTIVE', startDate: '2026-01-10T00:00:00.000Z', closedOn: null, archivedOn: null, version: 1, createdAt: '', updatedAt: '', courtName: null, managementOfficeName: null, participants: [], team: [], statusHistory: [], summary: { subCases: 0, actions: 0, tasks: 0, notes: 0, documents: 0 } };
  const subCase = { id: 'subcase-1', caseId: 'case-1', type: 'EVIDENCE', title: 'Pericia contable', description: null, status: 'ACTIVE', openedOn: '2026-05-01T00:00:00.000Z', closedOn: null, version: 1, summary: { actions: 0, tasks: 0, notes: 0, documents: 0 } };
  const action = { id: 'action-1', caseId: 'case-1', subCase: { id: 'subcase-1', title: 'Pericia contable', status: 'ACTIVE' }, title: 'Informe del perito', type: 'FILING', documentAt: '2026-05-10T15:00:00.000Z', presentationAt: null, description: null, version: 1, uploadedBy: { id: 'user-1', name: 'Admin' }, documentCount: 0 };
  const catalogs = { contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [], caseTypes: [{ value: 'LABOR', label: 'Laboral' }], caseStatuses: [{ value: 'ACTIVE', label: 'Activo' }], participantRoles: [], partySides: [], actionTypes: [{ value: 'FILING', label: 'Presentación' }], subCaseTypes: [], subCaseStatuses: [{ value: 'ACTIVE', label: 'Activo' }] };
  const deleted = { case: false, subCase: false, action: false };

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (path.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-delete' } } });
    if (path.endsWith('/catalogs')) return route.fulfill({ json: { data: catalogs } });
    if (path.endsWith('/cases/case-1') && request.method() === 'DELETE') { deleted.case = true; return route.fulfill({ status: 204 }); }
    if (path.endsWith('/cases/case-1')) return route.fulfill({ json: { data: legalCase } });
    if (path.endsWith('/cases/case-1/subcases')) return route.fulfill({ json: { data: [] } });
    if (path.endsWith('/cases/case-1/timeline')) return route.fulfill({ json: { data: [], meta: { nextCursor: null } } });
    if (path.endsWith('/subcases/subcase-1') && request.method() === 'DELETE') { deleted.subCase = true; return route.fulfill({ status: 204 }); }
    if (path.endsWith('/subcases/subcase-1')) return route.fulfill({ json: { data: subCase } });
    if (path.endsWith('/cases/case-1/actions')) return route.fulfill({ json: { data: [], meta: { nextCursor: null } } });
    if (path.endsWith('/actions/action-1') && request.method() === 'DELETE') {
      expect(request.postDataJSON()).toEqual({ reason: 'Carga duplicada' });
      deleted.action = true;
      return route.fulfill({ status: 204 });
    }
    if (path.endsWith('/actions/action-1')) return route.fulfill({ json: { data: action } });
    if (path.endsWith('/documents')) return route.fulfill({ json: { data: [], meta: { nextCursor: null } } });
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/juicios/case-1');
  await page.getByRole('button', { name: 'Eliminar juicio' }).click();
  await expect(page.getByText('Sólo se puede eliminar un alta errónea')).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar juicio' }).last().click();
  await expect.poll(() => deleted.case).toBe(true);
  await expect(page).toHaveURL(/\/juicios$/);

  await page.goto('/juicios/case-1/cuadernos/subcase-1');
  await page.getByRole('button', { name: 'Eliminar cuaderno' }).click();
  await page.getByRole('button', { name: 'Eliminar cuaderno' }).last().click();
  await expect.poll(() => deleted.subCase).toBe(true);
  await expect(page).toHaveURL(/\/juicios\/case-1$/);

  await page.goto('/juicios/case-1/cuadernos/subcase-1/actuaciones/action-1');
  await page.getByRole('button', { name: 'Eliminar actuación' }).click();
  const confirmDelete = page.getByRole('button', { name: 'Eliminar actuación' }).last();
  await expect(confirmDelete).toBeDisabled();
  await page.getByLabel('Motivo').fill('Carga duplicada');
  await confirmDelete.click();
  await expect.poll(() => deleted.action).toBe(true);
  await expect(page).toHaveURL(/\/juicios\/case-1\/cuadernos\/subcase-1$/);
});

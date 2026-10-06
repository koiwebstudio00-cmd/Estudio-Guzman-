import { expect, test } from '@playwright/test';

test('manages a subcase, edits its action and attaches a document', async ({ page }) => {
  const permissions = ['cases.read', 'cases.update', 'catalogs.read', 'subcases.manage', 'actions.read', 'actions.create', 'actions.update', 'documents.read', 'documents.create'];
  const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
  const legalCase = { id: 'case-1', caseNumber: '123/2026', title: 'Pérez c/ Empresa', type: 'LABOR', status: 'ACTIVE', startDate: '2026-01-10T00:00:00.000Z', closedOn: null, archivedOn: null, version: 1, createdAt: '', updatedAt: '', court: null, managementOffice: null, participants: [], team: [], statusHistory: [], summary: { subCases: 1, actions: 0, tasks: 0, notes: 0, documents: 0 } };
  let subCase = { id: 'subcase-1', caseId: 'case-1', type: 'EVIDENCE' as const, title: 'Pericia contable', description: 'Documentación de la pericia.', status: 'ACTIVE' as 'ACTIVE' | 'RESOLVED' | 'CLOSED', openedOn: '2026-05-01T00:00:00.000Z', closedOn: null as string | null, version: 1, summary: { actions: 0, tasks: 0, notes: 0, documents: 0 } };
  const catalogs = { contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [], caseTypes: [{ value: 'LABOR', label: 'Laboral' }], caseStatuses: [{ value: 'ACTIVE', label: 'Activo' }], participantRoles: [], partySides: [], actionTypes: [{ value: 'FILING', label: 'Presentación' }], subCaseTypes: [], subCaseStatuses: [{ value: 'ACTIVE', label: 'Activo' }] };
  let action = { id: 'action-1', caseId: 'case-1', subCase: { id: 'subcase-1', title: 'Pericia contable', status: 'ACTIVE' }, title: 'Informe del perito', type: 'FILING', documentAt: '2026-05-10T15:00:00.000Z', presentationAt: null, description: 'Se agrega el informe.', version: 1, uploadedBy: { id: 'user-1', name: 'Admin' }, documentCount: 0 };
  let actionCreated = false;
  let documentUploaded = false;
  const documentRecord = { id: 'document-1', title: 'Informe firmado', category: 'EVIDENCE', description: null, caseId: 'case-1', subCaseId: 'subcase-1', actionId: 'action-1', taskId: null, noteId: null, version: 1, createdAt: '', updatedAt: '', createdBy: { id: 'user-1', name: 'Admin' }, versions: [{ id: 'version-1', versionNumber: 1, originalName: 'informe.pdf', mimeType: 'application/pdf', sizeBytes: 64, sha256: 'a'.repeat(64), scanStatus: 'SKIPPED', scannedAt: '', createdAt: '', createdBy: { id: 'user-1', name: 'Admin' } }], latestVersion: null };

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-subcase' } } });
    if (url.pathname.endsWith('/catalogs')) return route.fulfill({ json: { data: catalogs } });
    if (url.pathname.endsWith('/cases/case-1')) return route.fulfill({ json: { data: legalCase } });
    if (url.pathname.endsWith('/subcases/subcase-1') && request.method() === 'GET') return route.fulfill({ json: { data: subCase } });
    if (url.pathname.endsWith('/subcases/subcase-1/status-transitions') && request.method() === 'POST') {
      const body = request.postDataJSON() as { toStatus: 'ACTIVE' | 'RESOLVED' | 'CLOSED' };
      subCase = { ...subCase, status: body.toStatus, closedOn: body.toStatus === 'CLOSED' ? '2026-05-12T12:00:00.000Z' : null, version: subCase.version + 1 };
      return route.fulfill({ json: { data: subCase } });
    }
    if (url.pathname.endsWith('/subcases/subcase-1') && request.method() === 'PATCH') {
      const body = request.postDataJSON() as { title: string; description: string | null };
      subCase = { ...subCase, ...body, version: subCase.version + 1 };
      return route.fulfill({ json: { data: subCase } });
    }
    if (url.pathname.endsWith('/cases/case-1/actions') && request.method() === 'GET') return route.fulfill({ json: { data: actionCreated ? [action] : [], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/cases/case-1/actions') && request.method() === 'POST') {
      expect(request.postDataJSON()).toMatchObject({ subCaseId: 'subcase-1', title: 'Informe del perito' });
      actionCreated = true;
      return route.fulfill({ status: 201, json: { data: action } });
    }
    if (url.pathname.endsWith('/actions/action-1') && request.method() === 'PATCH') {
      const body = request.postDataJSON() as { title: string; type: string; documentAt: string; description: string | null };
      action = { ...action, ...body, version: action.version + 1 };
      return route.fulfill({ json: { data: action } });
    }
    if (url.pathname.endsWith('/actions/action-1')) return route.fulfill({ json: { data: action } });
    if (url.pathname.endsWith('/documents') && request.method() === 'GET') return route.fulfill({ json: { data: documentUploaded ? [documentRecord] : [], meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/documents') && request.method() === 'POST') {
      documentUploaded = true;
      return route.fulfill({ status: 201, json: { data: documentRecord } });
    }
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/juicios/case-1/cuadernos/subcase-1');
  await expect(page.getByRole('heading', { name: 'Pericia contable' })).toBeVisible();
  await page.getByRole('button', { name: 'Editar cuaderno' }).click();
  await page.getByLabel('Título').fill('Pericia contable actualizada');
  await page.getByLabel('Descripción').fill('Información corregida del cuaderno.');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pericia contable actualizada' })).toBeVisible();
  await page.getByRole('button', { name: 'Cargar primera actuación' }).click();
  await page.getByLabel('Título').fill('Informe del perito');
  await page.getByLabel('Tipo').selectOption('FILING');
  await page.getByLabel('Fecha').fill('2026-05-10');
  await page.getByLabel('Descripción').fill('Se agrega el informe.');
  await page.getByRole('button', { name: 'Registrar' }).click();

  await expect(page).toHaveURL(/actuaciones\/action-1$/);
  await expect(page.getByRole('heading', { name: 'Informe del perito' })).toBeVisible();
  await expect(page.getByText('Se agrega el informe.')).toBeVisible();
  await page.getByRole('button', { name: 'Editar actuación' }).click();
  await page.getByLabel('Título').fill('Informe del perito corregido');
  await page.getByLabel('Descripción').fill('Se corrige la información del informe.');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('heading', { name: 'Informe del perito corregido' })).toBeVisible();
  await expect(page.getByText('Se corrige la información del informe.')).toBeVisible();
  await page.getByRole('button', { name: 'Adjuntar PDF' }).click();
  await page.getByLabel('Título').fill('Informe firmado');
  await page.getByLabel('Archivo').setInputFiles({ name: 'informe.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
  await page.getByRole('button', { name: 'Subir', exact: true }).click();
  await expect(page.getByText('v1 · informe.pdf')).toBeVisible();
  await page.getByRole('link', { name: 'Volver a cuaderno' }).click();
  await page.getByRole('button', { name: 'Cambiar estado' }).click();
  await page.getByLabel('Nuevo estado').selectOption('CLOSED');
  await page.getByLabel('Motivo').fill('Finalizó la producción de esta prueba.');
  await page.getByRole('button', { name: 'Confirmar cambio' }).click();
  await expect(page.getByText('El cuaderno está cerrado. Reabrilo para volver a editar información o agregar actuaciones y documentos.')).toBeVisible();
});

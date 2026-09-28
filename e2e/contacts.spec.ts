import { expect, test } from '@playwright/test';

test('searches contacts and creates one using the API contract', async ({ page }) => {
  const permissions = ['contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete', 'catalogs.read'];
  const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
  const catalogs = { contactKinds: [{ value: 'PERSON', label: 'Persona' }, { value: 'ORGANIZATION', label: 'Organización' }], contactCategories: [{ value: 'CLIENT', label: 'Cliente' }], contactChannels: [], addressTypes: [] };
  let contacts = [{ id: 'contact-1', kind: 'PERSON', displayName: 'Ana Pérez', firstName: 'Ana', lastName: 'Pérez', legalName: null, documentNumber: '12345678', taxId: null, notes: null, version: 1, categories: ['CLIENT'], channels: [{ id: 'phone-1', type: 'PHONE', label: null, value: '+54 381 555-1000', isPrimary: true, sortOrder: 0 }], addresses: [], relations: { cases: 0, representations: 0 } }];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { data: { user } } });
    if (url.pathname.endsWith('/auth/csrf')) return route.fulfill({ json: { data: { csrfToken: 'csrf-contacts' } } });
    if (url.pathname.endsWith('/catalogs')) return route.fulfill({ json: { data: catalogs } });
    if (url.pathname.endsWith('/contacts') && request.method() === 'GET') return route.fulfill({ json: { data: contacts, meta: { nextCursor: null } } });
    if (url.pathname.endsWith('/contacts') && request.method() === 'POST') { const body = request.postDataJSON() as { firstName: string; lastName: string }; const created = { ...contacts[0], id: 'contact-2', displayName: `${body.firstName} ${body.lastName}`, firstName: body.firstName, lastName: body.lastName }; contacts = [created, ...contacts]; return route.fulfill({ status: 201, json: { data: created } }); }
    if (url.pathname.endsWith('/contacts/contact-1/channels/phone-1') && request.method() === 'PATCH') { const body = request.postDataJSON() as { value: string }; contacts[0] = { ...contacts[0]!, channels: contacts[0]!.channels.map((channel) => channel.id === 'phone-1' ? { ...channel, value: body.value } : channel) }; return route.fulfill({ json: { data: contacts[0]!.channels[0] } }); }
    if (url.pathname.endsWith('/contacts/contact-1') && request.method() === 'PATCH') { const body = request.postDataJSON() as Record<string, unknown>; contacts[0] = { ...contacts[0]!, ...body, version: contacts[0]!.version + 1 }; return route.fulfill({ json: { data: contacts[0] } }); }
    if (url.pathname.endsWith('/contacts/contact-1') && request.method() === 'GET') return route.fulfill({ json: { data: contacts[0] } });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/contactos');
  await expect(page.getByRole('button', { name: 'Ana Pérez' })).toBeVisible();
  await page.getByRole('button', { name: 'Ana Pérez' }).click();
  await page.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Teléfono').fill('+54 381 555-2000');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('PHONE: +54 381 555-2000 · principal')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Nuevo contacto/ }).click();
  await page.getByLabel('Nombre').fill('Juan'); await page.getByLabel('Apellido').fill('Ruiz');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('heading', { name: 'Juan Ruiz' })).toBeVisible();
});

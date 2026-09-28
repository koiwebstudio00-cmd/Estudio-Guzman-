import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { setCsrfToken } from '@/lib/api';

const permissions = ['dashboard.read', 'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete', 'catalogs.read'];
const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
const catalogs = { contactKinds: [{ value: 'PERSON', label: 'Persona' }, { value: 'ORGANIZATION', label: 'Organización' }], contactCategories: [{ value: 'CLIENT', label: 'Cliente' }], contactChannels: [], addressTypes: [] };
const contact = { id: 'contact-1', kind: 'PERSON', displayName: 'Ana Pérez', firstName: 'Ana', lastName: 'Pérez', legalName: null, documentNumber: '12345678', taxId: null, notes: null, version: 1, categories: ['CLIENT'], channels: [{ id: 'channel-1', type: 'EMAIL', label: null, value: 'ana@example.com', isPrimary: true, sortOrder: 0 }, { id: 'channel-2', type: 'PHONE', label: null, value: '+54 381 555-1000', isPrimary: true, sortOrder: 1 }], addresses: [], relations: { cases: 2, representations: 0 } };

beforeEach(() => {
  setCsrfToken(null); window.history.pushState({}, '', '/contactos');
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin); const method = init?.method ?? 'GET';
    if (url.pathname.endsWith('/auth/me')) return Response.json({ data: { user } });
    if (url.pathname.endsWith('/auth/csrf')) return Response.json({ data: { csrfToken: 'csrf-contacts' } });
    if (url.pathname.endsWith('/catalogs')) return Response.json({ data: catalogs });
    if (url.pathname.endsWith('/contacts') && method === 'GET') return Response.json({ data: [contact], meta: { nextCursor: null } });
    if (url.pathname.endsWith('/contacts') && method === 'POST') return Response.json({ data: { ...contact, id: 'contact-2', displayName: 'Juan Ruiz', firstName: 'Juan', lastName: 'Ruiz', relations: { cases: 0, representations: 0 } } }, { status: 201 });
    if (url.pathname.endsWith('/contacts/contact-1')) return Response.json({ data: contact });
    return new Response('{}', { status: 404 });
  }));
});

describe('Contacts', () => {
  it('loads the API directory and opens its real detail', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Contactos' })).toBeVisible();
    await userEvent.click(await screen.findByRole('button', { name: 'Ana Pérez' }));
    expect(await screen.findByText('EMAIL: ana@example.com · principal')).toBeVisible();
    expect(screen.getAllByText('2')).toHaveLength(2);
  });

  it('creates a person through the backend contract', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: /Nuevo contacto/ }));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Juan');
    await userEvent.type(screen.getByLabelText('Apellido'), 'Ruiz');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByRole('heading', { name: 'Juan Ruiz' })).toBeVisible();
  });

  it('shows the existing phone number when editing a contact', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ana Pérez' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+54 381 555-1000');
  });
});

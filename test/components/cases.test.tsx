import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { setCsrfToken } from '@/lib/api';

const permissions = ['cases.read', 'cases.create', 'cases.update', 'cases.change_status', 'catalogs.read'];
const user = { id: 'user-1', email: 'admin@example.com', name: 'Admin', avatarUrl: null, status: 'ACTIVE', version: 1, lastLoginAt: null, createdAt: '', updatedAt: '', role: { id: 'role-1', code: 'HEAD', name: 'Jefe' }, permissions };
const catalogs = { contactKinds: [], contactCategories: [], contactChannels: [], addressTypes: [], caseTypes: [{ value: 'LABOR', label: 'Laboral' }], caseStatuses: [{ value: 'ACTIVE', label: 'Activo' }, { value: 'SUSPENDED', label: 'Suspendido' }, { value: 'CLOSED', label: 'Cerrado' }], participantRoles: [{ value: 'CLAIMANT', label: 'Actor/a' }], partySides: [{ value: 'OUR_SIDE', label: 'Nuestra parte' }] };
const legalCase = { id: 'case-1', caseNumber: '123/2026', title: 'Pérez c/ Empresa', type: 'LABOR', status: 'ACTIVE', startDate: '2026-01-10T00:00:00.000Z', closedOn: null, archivedOn: null, version: 1, createdAt: '', updatedAt: '', court: { id: 'court-1', name: 'Juzgado I' }, managementOffice: null, participants: [{ id: 'participant-1', role: 'CLAIMANT', side: 'OUR_SIDE', isClient: true, label: null, notes: null, sortOrder: 0, activeFrom: null, activeUntil: null, contact: { id: 'contact-1', kind: 'PERSON', displayName: 'Ana Pérez' }, representations: [] }], team: [{ id: 'team-1', role: 'PRIMARY', assignedAt: '', unassignedAt: null, user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' } }], statusHistory: [{ id: 'history-1', fromStatus: null, toStatus: 'ACTIVE', reason: null, changedAt: '2026-01-10T00:00:00.000Z', changedBy: { id: 'user-1', name: 'Admin' } }], summary: { subCases: 0, actions: 0, tasks: 0, notes: 0, documents: 0 } };

beforeEach(() => { setCsrfToken(null); window.history.pushState({}, '', '/juicios'); vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => { const url = new URL(String(input), window.location.origin); if (url.pathname.endsWith('/auth/me')) return Response.json({ data: { user } }); if (url.pathname.endsWith('/auth/csrf')) return Response.json({ data: { csrfToken: 'csrf-cases' } }); if (url.pathname.endsWith('/catalogs')) return Response.json({ data: catalogs }); if (url.pathname.endsWith('/users')) return Response.json({ data: [user] }); if (url.pathname.endsWith('/cases/case-1/subcases')) return Response.json({ data: [] }); if (url.pathname.endsWith('/cases/case-1/timeline')) return Response.json({ data: [], meta: { nextCursor: null } }); if (url.pathname.endsWith('/cases/case-1')) return Response.json({ data: legalCase }); if (url.pathname.endsWith('/cases')) return Response.json({ data: [legalCase], meta: { nextCursor: null } }); return new Response('{}', { status: 404 }); })); });

describe('Cases', () => {
  it('loads the real list and navigates to a detail with multiple-domain data', async () => { render(<App />); expect(await screen.findByText('Pérez c/ Empresa')).toBeVisible(); expect(screen.getByText('Ana Pérez')).toBeVisible(); await userEvent.click(screen.getByRole('button', { name: 'Abrir 123/2026' })); expect(await screen.findByRole('heading', { name: 'Pérez c/ Empresa' })).toBeVisible(); expect(screen.getByText('Responsable')).toBeVisible(); await userEvent.click(screen.getByRole('tab', { name: 'Partes y equipo' })); expect(screen.getAllByText('Responsable')).toHaveLength(2); expect(screen.getAllByText('Admin').length).toBeGreaterThan(0); });

  it('offers searchable courts and the associated management offices in a new case', async () => {
    window.history.pushState({}, '', '/juicios/nuevo');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Nuevo juicio' })).toBeVisible();
    const court = screen.getByLabelText('Juzgado');
    const office = screen.getByLabelText('OFICINA DE GESTION ASOCIADA') as HTMLSelectElement;
    expect(court).toHaveAttribute('name', 'courtName');
    expect(court).toHaveAttribute('list', 'court-options');
    expect(document.querySelectorAll('#court-options option')).toHaveLength(52);
    expect(office).toHaveAttribute('name', 'managementOfficeName');
    expect(Array.from(office.options, ({ value }) => value)).toEqual(['', '1', '2', '3', '4', '5']);
  });
});

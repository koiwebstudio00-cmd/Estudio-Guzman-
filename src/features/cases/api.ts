import { apiRequest } from '../../lib/api';
import type { CreateCaseInput, Court, LegalCase, Office, CaseStatus } from './types';

export const getCases = (filters: { q?: string; status?: string; type?: string; responsibleId?: string; courtId?: string; cursor?: string; limit?: number } = {}) => { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return apiRequest<{ data: LegalCase[]; meta: { nextCursor: string | null } }>(`/cases?${params}`); };
export const getCase = async (id: string) => (await apiRequest<{ data: LegalCase }>(`/cases/${id}`)).data;
export const createCase = async (input: CreateCaseInput) => (await apiRequest<{ data: LegalCase }>('/cases', { method: 'POST', body: JSON.stringify(input) })).data;
export const updateCase = async (id: string, input: { version: number; title?: string; caseNumber?: string; type?: string; startDate?: string; courtId?: string | null; managementOfficeId?: string | null; courtName?: string | null; managementOfficeName?: string | null }) => (await apiRequest<{ data: LegalCase }>(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
export const deleteCase = (id: string) => apiRequest<void>(`/cases/${id}`, { method: 'DELETE' });
export const transitionCase = async (id: string, input: { version: number; toStatus: CaseStatus; reason?: string; openTaskStrategy?: 'KEEP' }) => (await apiRequest<{ data: LegalCase }>(`/cases/${id}/status-transitions`, { method: 'POST', body: JSON.stringify(input) })).data;
export const getCourts = async () => (await apiRequest<{ data: Court[] }>('/courts?active=true')).data;
export const getOffices = async () => (await apiRequest<{ data: Office[] }>('/management-offices?active=true')).data;

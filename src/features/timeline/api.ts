import { apiRequest } from '../../lib/api'; import type { CaseAction, SubCase, TimelineItem } from './types';
export const getSubCases = async (caseId: string) => (await apiRequest<{ data: SubCase[] }>(`/cases/${caseId}/subcases`)).data;
export const getSubCase = async (subCaseId: string, signal?: AbortSignal) => (await apiRequest<{ data: SubCase }>(`/subcases/${subCaseId}`, { signal })).data;
export const createSubCase = async (caseId: string, input: { type: 'EVIDENCE' | 'INCIDENT'; title: string; description?: string }) => (await apiRequest<{ data: SubCase }>(`/cases/${caseId}/subcases`, { method: 'POST', body: JSON.stringify(input) })).data;
export const transitionSubCase = async (subCaseId: string, input: { version: number; toStatus: 'ACTIVE' | 'RESOLVED' | 'CLOSED'; reason?: string }) => (await apiRequest<{ data: SubCase }>(`/subcases/${subCaseId}/status-transitions`, { method: 'POST', body: JSON.stringify(input) })).data;
export const createAction = async (caseId: string, input: { subCaseId?: string | null; title: string; type: string; documentAt: string; presentationAt?: string | null; description?: string }) => (await apiRequest<{ data: CaseAction }>(`/cases/${caseId}/actions`, { method: 'POST', body: JSON.stringify(input) })).data;
export const getActions = async (caseId: string, options: { subCaseId?: string; signal?: AbortSignal } = {}) => {
  const query = new URLSearchParams({ limit: '100' });
  if (options.subCaseId) query.set('subCaseId', options.subCaseId);
  return (await apiRequest<{ data: CaseAction[]; meta: { nextCursor: string | null } }>(`/cases/${caseId}/actions?${query}`, { signal: options.signal })).data;
};
export const getAction = async (actionId: string, signal?: AbortSignal) => (await apiRequest<{ data: CaseAction }>(`/actions/${actionId}`, { signal })).data;
export const getTimeline = (caseId: string, cursor?: string) => apiRequest<{ data: TimelineItem[]; meta: { nextCursor: string | null } }>(`/cases/${caseId}/timeline?limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);

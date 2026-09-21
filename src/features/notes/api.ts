import { apiRequest } from '../../lib/api';
import type { Note } from './types';
export const getNotes = (context: { caseId?: string; subCaseId?: string; contactId?: string; cursor?: string }) => { const params = new URLSearchParams(context); return apiRequest<{ data: Note[]; meta: { nextCursor: string | null } }>(`/notes?${params}`); };
export const createNote = async (input: { content: string; caseId?: string; subCaseId?: string; contactId?: string }) => (await apiRequest<{ data: Note }>('/notes', { method: 'POST', body: JSON.stringify(input) })).data;

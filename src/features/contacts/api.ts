import { apiRequest } from '../../lib/api';
import type { Catalogs, Contact, ContactInput } from './types';

export interface ContactPage { data: Contact[]; meta: { nextCursor: string | null } }

export const getCatalogs = async () => (await apiRequest<{ data: Catalogs }>('/catalogs')).data;
export const getContacts = (filters: { q?: string; kind?: string; category?: string; cursor?: string; limit?: number } = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return apiRequest<ContactPage>(`/contacts?${params.toString()}`);
};
export const getContact = async (contactId: string) => (await apiRequest<{ data: Contact }>(`/contacts/${contactId}`)).data;
export const createContact = async (input: ContactInput) => (await apiRequest<{ data: Contact }>('/contacts', { method: 'POST', body: JSON.stringify(input) })).data;
export const updateContact = async (contactId: string, input: Partial<Omit<ContactInput, 'kind' | 'channels' | 'addresses'>> & { version: number }) => (await apiRequest<{ data: Contact }>(`/contacts/${contactId}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
export const deleteContact = (contactId: string) => apiRequest<void>(`/contacts/${contactId}`, { method: 'DELETE' });

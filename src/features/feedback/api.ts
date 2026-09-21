import { apiRequest } from '../../lib/api';
export interface Feedback { id: string; message: string; status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'; resolution: string | null; createdAt: string; resolvedAt: string | null; submittedBy: { id: string; name: string } | null; resolvedBy: { id: string; name: string } | null }
export const createFeedback = async (message: string) => (await apiRequest<{ data: Feedback }>('/feedback', { method: 'POST', body: JSON.stringify({ message }) })).data;
export const getFeedback = async (status = '') => (await apiRequest<{ data: Feedback[] }>(`/feedback${status ? `?status=${status}` : ''}`)).data;
export const updateFeedback = async (id: string, input: { status: Feedback['status']; resolution?: string }) => (await apiRequest<{ data: Feedback }>(`/feedback/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data;

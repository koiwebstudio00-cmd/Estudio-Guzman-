import { apiRequest } from '../../lib/api';
import type { Task, TaskPriority, TaskStatus } from './types';

export const getTasks = (filters: { status?: TaskStatus; priority?: TaskPriority; assigneeId?: string; caseId?: string; cursor?: string; limit?: number } = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return apiRequest<{ data: Task[]; meta: { nextCursor: string | null } }>(`/tasks?${params}`);
};
export const createTask = async (input: { title: string; description?: string; priority: TaskPriority; dueDate?: string; caseId?: string; assigneeIds: string[] }) =>
  (await apiRequest<{ data: Task }>('/tasks', { method: 'POST', body: JSON.stringify(input) })).data;
export const transitionTask = async (id: string, input: { version: number; toStatus: TaskStatus; reason?: string }) =>
  (await apiRequest<{ data: Task }>(`/tasks/${id}/status-transitions`, { method: 'POST', body: JSON.stringify(input) })).data;
export const assignTask = async (id: string, userIds: string[]) =>
  (await apiRequest<{ data: Task }>(`/tasks/${id}/assignments`, { method: 'POST', body: JSON.stringify({ userIds }) })).data;
export const addTaskComment = async (id: string, content: string) =>
  (await apiRequest<{ data: TaskCommentResponse }>(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) })).data;
type TaskCommentResponse = Task['comments'][number];

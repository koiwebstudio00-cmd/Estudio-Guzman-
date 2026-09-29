import { apiRequest } from '../../lib/api'; import type { Notification, NotificationPreference } from './types';

export interface NotificationFilters { unread?: boolean; cursor?: string; limit?: number }
export interface NotificationPage { data: Notification[]; meta: { nextCursor: string | null; unreadCount: number } }

export const getNotifications = (filters: NotificationFilters = {}) => {
  const query = new URLSearchParams();
  if (filters.unread !== undefined) query.set('unread', String(filters.unread));
  if (filters.cursor) query.set('cursor', filters.cursor);
  if (filters.limit) query.set('limit', String(filters.limit));
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<NotificationPage>(`/notifications${suffix}`);
};
export const readNotification = (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: 'POST' });
export const readAllNotifications = () => apiRequest<void>('/notifications/read-all', { method: 'POST' });
export const getNotificationPreferences = async () => (await apiRequest<{ data: NotificationPreference }>('/notification-preferences')).data;
export const saveNotificationPreferences = async (input: Partial<NotificationPreference>) => (await apiRequest<{ data: NotificationPreference }>('/notification-preferences', { method: 'PATCH', body: JSON.stringify(input) })).data;

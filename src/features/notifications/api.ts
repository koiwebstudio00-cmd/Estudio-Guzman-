import { apiRequest } from '../../lib/api'; import type { Notification, NotificationPreference } from './types';
export const getNotifications = (unread?: boolean) => apiRequest<{ data: Notification[]; meta: { nextCursor: string | null; unreadCount: number } }>(`/notifications${unread === undefined ? '' : `?unread=${unread}`}`);
export const readNotification = (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: 'POST' });
export const readAllNotifications = () => apiRequest<void>('/notifications/read-all', { method: 'POST' });
export const getNotificationPreferences = async () => (await apiRequest<{ data: NotificationPreference }>('/notification-preferences')).data;
export const saveNotificationPreferences = async (input: Partial<NotificationPreference>) => (await apiRequest<{ data: NotificationPreference }>('/notification-preferences', { method: 'PATCH', body: JSON.stringify(input) })).data;

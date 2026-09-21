export interface Notification { id: string; type: string; title: string; body: string | null; entityType: string | null; entityId: string | null; readAt: string | null; createdAt: string }
export interface NotificationPreference { taskAssigned: boolean; taskDueSoon: boolean; taskOverdue: boolean; caseStatusChanged: boolean; emailEnabled: boolean; dueSoonLeadDays: number }

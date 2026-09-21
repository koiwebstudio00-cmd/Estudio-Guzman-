import { apiRequest } from '../../lib/api';
import type { AuditFilters, AuditPage } from './types';

export function getAuditLogs(filters: AuditFilters = {}, cursor?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.entityType) params.set('entityType', filters.entityType);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '25');
  return apiRequest<AuditPage>(`/audit-logs?${params.toString()}`, { signal });
}

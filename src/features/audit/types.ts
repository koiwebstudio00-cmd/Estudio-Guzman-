export type AuditJson = null | boolean | number | string | AuditJson[] | { [key: string]: AuditJson };

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: AuditJson | null;
  after: AuditJson | null;
  metadata: AuditJson | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; avatarUrl: string | null } | null;
}

export interface AuditFilters {
  entityType?: string;
  from?: string;
  to?: string;
}

export interface AuditPage {
  data: AuditLog[];
  meta: { nextCursor: string | null };
}

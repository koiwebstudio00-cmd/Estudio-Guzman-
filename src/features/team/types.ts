export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export interface TeamUser {
  id: string; email: string; name: string; avatarUrl: string | null; status: UserStatus;
  version: number; lastLoginAt: string | null; createdAt: string; updatedAt: string;
  role: { id: string; code: string; name: string }; permissions: string[];
}
export interface RolePermission { id: string; code: string; description: string | null; }
export interface TeamRole {
  id: string; code: string; name: string; description: string | null; isSystem: boolean;
  userCount: number; permissions: RolePermission[]; createdAt: string; updatedAt: string;
}

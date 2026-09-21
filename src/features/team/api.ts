import { apiRequest } from '../../lib/api';
import type { TeamRole, TeamUser, UserStatus } from './types';

export const getUsers = async () => (await apiRequest<{ data: TeamUser[] }>('/users')).data;
export const getRoles = async () => (await apiRequest<{ data: TeamRole[] }>('/roles')).data;
export const createUser = async (input: { email: string; name: string; roleId: string }) =>
  (await apiRequest<{ data: TeamUser }>('/users', { method: 'POST', body: JSON.stringify(input) })).data;
export const updateUser = async (userId: string, input: { version: number; name?: string; roleId?: string; status?: UserStatus }) =>
  (await apiRequest<{ data: TeamUser }>(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
export const createRole = async (input: { code: string; name: string; description?: string; permissionCodes: string[] }) =>
  (await apiRequest<{ data: TeamRole }>('/roles', { method: 'POST', body: JSON.stringify(input) })).data;
export const updateRole = async (roleId: string, input: { name: string; description: string | null }) =>
  (await apiRequest<{ data: TeamRole }>(`/roles/${roleId}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
export const updateRolePermissions = async (roleId: string, permissionCodes: string[]) =>
  (await apiRequest<{ data: TeamRole }>(`/roles/${roleId}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissionCodes }) })).data;

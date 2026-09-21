import { apiRequest } from '../../lib/api';
import type { DashboardData, SearchResult, TeamMetric } from './types';
export const getDashboard = async () => (await apiRequest<{ data: DashboardData }>('/dashboard')).data;
export const getTeamMetrics = (from: string, to: string) => apiRequest<{ data: TeamMetric[]; meta: { from: string; to: string } }>(`/team/metrics?from=${from}&to=${to}`);
export const globalSearch = async (query: string) => (await apiRequest<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}&limit=12`)).data;

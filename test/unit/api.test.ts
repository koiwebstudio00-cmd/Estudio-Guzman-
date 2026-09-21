import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem, apiRequest, setCsrfToken } from '@/lib/api';

beforeEach(() => {
  setCsrfToken(null);
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('sends credentials and the in-memory CSRF token on mutations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    setCsrfToken('csrf-test');

    await apiRequest<void>('/auth/logout', { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('x-csrf-token')).toBe('csrf-test');
  });

  it('maps problem details and notifies when an authenticated request becomes unauthorized', async () => {
    const problem = {
      type: 'https://example.test/unauthorized',
      title: 'UNAUTHORIZED',
      status: 401,
      detail: 'Sesión inválida o vencida.',
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(problem), {
      status: 401,
      headers: { 'content-type': 'application/problem+json' },
    })));
    const listener = vi.fn();
    window.addEventListener('auth:unauthorized', listener);

    await expect(apiRequest('/auth/me')).rejects.toEqual(expect.any(ApiProblem));
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('auth:unauthorized', listener);
  });
});

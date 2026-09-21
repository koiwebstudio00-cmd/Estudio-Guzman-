export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  requestId?: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiProblem extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
    this.name = 'ApiProblem';
  }

  get status() {
    return this.problem.status;
  }
}

interface RequestOptions extends RequestInit {
  notifyUnauthorized?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
let csrfToken: string | null = null;

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
export const getCsrfToken = () => csrfToken;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { notifyUnauthorized = true, ...init } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    headers.set('x-csrf-token', csrfToken);
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const fallback: ProblemDetails = {
      type: 'about:blank',
      title: 'Error HTTP',
      status: response.status,
      detail: 'No se pudo completar la solicitud.',
    };
    const problem = await response.json().catch(() => fallback) as ProblemDetails;
    if (response.status === 401 && notifyUnauthorized) {
      setCsrfToken(null);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new ApiProblem(problem);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

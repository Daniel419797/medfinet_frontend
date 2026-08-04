export type MedfinetRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  organizationId?: string;
  purpose?: string;
  authenticated?: boolean;
  headers?: Record<string, string>;
};

export class MedfinetApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'MedfinetApiError';
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  code?: string;
  message?: string;
};

function apiBaseUrl() {
  const configured = import.meta.env.VITE_MEDFINET_API_URL?.trim();
  if (!configured) {
    throw new Error('VITE_MEDFINET_API_URL is required for Medfinet operations');
  }
  return configured.replace(/\/$/, '');
}

function storage() {
  const candidates = [
    typeof globalThis !== 'undefined' ? (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage : undefined,
    typeof window !== 'undefined' ? window.localStorage : undefined,
  ];
  return candidates.find((candidate) => candidate && typeof candidate.getItem === 'function' && typeof candidate.setItem === 'function' && typeof candidate.removeItem === 'function') || null;
}

export async function medfinetRequest<T>(
  path: string,
  options: MedfinetRequestOptions = {}
): Promise<T> {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (options.authenticated !== false) {
    const token = storage()?.getItem('medfinet_auth_token') || null;
    if (!token) {
      throw new Error('Your secure session has expired. Sign in again.');
    }
    headers.set('authorization', `Bearer ${token}`);
  }
  if (options.organizationId) {
    headers.set('x-organization-id', options.organizationId);
  }
  headers.set('x-access-purpose', options.purpose || 'medfinet-operation');
  Object.entries(options.headers || {}).forEach(([name, value]) => {
    headers.set(name, value);
  });
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: options.method || 'GET',
    headers,
    signal: controller.signal,
    cache: 'no-store',
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  }).finally(() => window.clearTimeout(timeout));
  const payload = await response.json().catch(() => ({
    success: false,
    code: 'INVALID_API_RESPONSE',
    message: 'The server returned an unreadable response',
  })) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    if (response.status === 401) {
      storage()?.removeItem('medfinet_auth_token');
    }
    throw new MedfinetApiError(
      payload.message || payload.code || 'Medfinet operation failed',
      response.status,
      payload.code || 'MEDFINET_REQUEST_FAILED',
      response.headers.get('x-request-id') || undefined,
    );
  }
  return payload.data;
}

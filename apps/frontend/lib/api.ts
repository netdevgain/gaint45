export const apiBasePath = '/api';

interface ApiFetchOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
}

function createApiUrl(path: string, query?: ApiFetchOptions['query']): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${apiBasePath}${normalized}`, 'http://localhost');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return `${url.pathname}${url.search}`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(createApiUrl(path, options.query), {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson
    ? ((await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        [key: string]: unknown;
      })
    : ({} as { success?: boolean; message?: string; [key: string]: unknown });

  if (!response.ok || payload.success === false) {
    throw new Error(String(payload.message || 'Request failed'));
  }

  return payload as T;
}

export function apiPath(path: string, query?: ApiFetchOptions['query']): string {
  return createApiUrl(path, query);
}

export function withLocalePath(locale: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

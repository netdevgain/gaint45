import { headers } from 'next/headers';

interface ServerApiOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  init?: Omit<RequestInit, 'cache'>;
  revalidate?: number;
}

function buildPath(path: string, query?: ServerApiOptions['query']): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`/api${normalized}`, 'http://localhost');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return `${url.pathname}${url.search}`;
}

function getOriginFromHeaders(requestHeaders: Headers): string {
  const host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').host;

  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

export async function serverApiFetch<T>(
  path: string,
  options: ServerApiOptions = {}
): Promise<T> {
  const requestHeaders = await headers();
  const origin = getOriginFromHeaders(requestHeaders as unknown as Headers);
  const cookie = requestHeaders.get('cookie');

  const response = await fetch(`${origin}${buildPath(path, options.query)}`, {
    ...options.init,
    headers: {
      ...(options.init?.headers ?? {}),
      ...(cookie ? { cookie } : {})
    },
    cache: 'no-store',
    next: options.revalidate ? { revalidate: options.revalidate } : undefined
  });

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
  };

  if (!response.ok || payload.success === false) {
    throw new Error(String(payload.message || 'Server request failed'));
  }

  return payload as T;
}

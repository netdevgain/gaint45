import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'transfer-encoding'
]);

function getTargetUrl(request: NextRequest, path: string[]): URL {
  const base = (process.env.INTERNAL_API_BASE_URL ?? 'http://backend:4000/api').replace(/\/$/, '');
  const joined = path.join('/');
  const target = new URL(joined ? `${base}/${joined}` : base);
  target.search = request.nextUrl.search;
  return target;
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const target = getTargetUrl(request, path ?? []);

  const upstreamHeaders = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => upstreamHeaders.delete(header));

  const method = request.method.toUpperCase();
  const init: RequestInit & { duplex?: 'half' } = {
    method,
    headers: upstreamHeaders,
    redirect: 'manual',
    cache: 'no-store'
  };

  if (!['GET', 'HEAD'].includes(method)) {
    init.body = request.body;
    init.duplex = 'half';
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(target.toString(), init);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 502 }
    );
  }

  const headers = new Headers(upstreamResponse.headers);

  const setCookieAccessor = upstreamResponse.headers as unknown as {
    getSetCookie?: () => string[];
  };

  if (typeof setCookieAccessor.getSetCookie === 'function') {
    const setCookies = setCookieAccessor.getSetCookie();
    if (setCookies.length > 0) {
      headers.delete('set-cookie');
      setCookies.forEach((cookie) => headers.append('set-cookie', cookie));
    }
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS, handler as HEAD };

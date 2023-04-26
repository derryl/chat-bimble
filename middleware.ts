import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  const PASSWORD = process.env.CFP_PASSWORD;
  // const USERNAME = process.env.CFP_USERNAME; // ignoring for now

  if (!PASSWORD) {
    console.warn('No password found. Skipping basic auth.');
    return NextResponse.next();
  }

  if (!authHeader) {
    console.error('[401] Unauthorized: Missing Authorization header');
    return new Response('Unauthorized: Missing Authorization header', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const [scheme, credentials] = authHeader.split(' ');

  if (scheme.toLowerCase() !== 'basic' || !credentials) {
    console.error('[401] Unauthorized: Invalid Authorization header format');
    return new Response('Unauthorized: Invalid Authorization header format', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const [username, password] = atob(credentials).split(':');

  if (password !== PASSWORD) {
    console.error('[401] Unauthorized: Invalid Credentials');
    return new Response('Unauthorized: Invalid Credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  console.info('[skip] User is authorized with correct credentials');
  // return NextResponse.next();
}

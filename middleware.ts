import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  const PASSWORD = process.env.CFP_PASSWORD;
  // const USERNAME = process.env.CFP_USERNAME; // ignoring for now

  if (!PASSWORD) {
    return NextResponse.next();
  }

  if (!authHeader) {
    return new Response('Unauthorized: Missing Authorization header', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const [scheme, credentials] = authHeader.split(' ');

  if (scheme.toLowerCase() !== 'basic' || !credentials) {
    return new Response('Unauthorized: Invalid Authorization header format', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const [username, password] = atob(credentials).split(':');

  if (password !== PASSWORD) {
    return new Response('Unauthorized: Invalid Credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

import { NextRequest, NextResponse } from 'next/server';

export const config = { runtime: 'experimental-edge' };

const PASSWORD = process.env.CFP_PASSWORD;

export function middleware(req: NextRequest) {
  console.log('middleware start');

  const basicAuth = req.headers.get('authorization');
  const USERNAME = 'admin';

  if (basicAuth) {
    console.log('got authorization header', basicAuth);
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

    console.log({ user, USERNAME, pwd, PASSWORD });
    if (user === USERNAME && pwd === PASSWORD) {
      return NextResponse.next();
    }

    console.log('credentials incorrect');
  }

  console.log('sending 401 challenge');

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

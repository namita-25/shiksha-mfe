import { NextResponse } from 'next/server';

export function middleware(request: { nextUrl: { clone: () => any } }) {
  const url = request.nextUrl.clone();

  if (url.pathname.startsWith('/scp-teacher-repo')) {
    url.hostname = 'localhost';
    url.port = '4102';
    return NextResponse.rewrite(url);
  }

  if (url.pathname.startsWith('/youthnet')) {
    url.hostname = 'localhost';
    url.port = '4103';
    return NextResponse.rewrite(url);
  }
  if (url.pathname.startsWith('/sbplayer')) {
    url.hostname = 'localhost';
    url.port = '4107';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

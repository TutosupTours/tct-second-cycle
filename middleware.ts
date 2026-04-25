import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /admin, /student)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/logout'];
  const isPublicPath = publicPaths.includes(path);

  // If it's a public path, continue
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if user is authenticated by checking for session cookie or header
  const session = request.cookies.get('session')?.value;

  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // For protected paths, you could add role-based checks here
  // For example, check if the user has the required role for admin paths
  if (path.startsWith('/admin') && !session.includes('role:admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
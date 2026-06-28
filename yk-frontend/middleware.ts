import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add routes that should be protected
  const protectedRoutes = ['/dashboard', '/categories', '/review', '/grammar', '/structures', '/test', '/radicals', '/languages'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute) {
    // In middleware, we can't easily check localStorage. 
    // Usually, we use cookies for auth to work well with SSR/middleware.
    // For this simple implementation using localStorage via Zustand, we let the client side handle redirects 
    // or we check a cookie if we set one. Since we don't use cookies yet, we'll let client components protect themselves
    // or just return next() here and implement a withAuth HOC or client layout check.
    
    // As a placeholder, we pass through. 
    // A better way is storing token in cookies when logging in.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

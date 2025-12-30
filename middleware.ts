import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection
 * Note: Firebase Auth is primarily client-side, so actual authentication
 * is handled by the AuthGuard component. This middleware can be extended
 * to verify Firebase ID tokens server-side if needed.
 */
export function middleware(request: NextRequest) {
  // Add any server-side logic here if needed
  // For now, client-side AuthGuard handles authentication
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
     * - public files
     */
    "/dashboard/:path*",
  ],
};

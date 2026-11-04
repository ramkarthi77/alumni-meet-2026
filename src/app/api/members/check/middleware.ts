import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NOTE: /api/members (POST) is the PUBLIC registration endpoint — NOT protected here.
// Auth for GET /api/members and all /api/members/[phoneNumber] is handled
// inside the route handlers via requireAuth().

// Wrap withAuth so that API routes get a JSON 401 instead of a redirect to the login page.
// Page routes (/organizer/dashboard, /organizer/members) still redirect normally.
const authMiddleware = withAuth({
  pages: { signIn: '/organizer/login' },
})

export default function middleware(req: NextRequest, event: Parameters<typeof authMiddleware>[1]) {
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')

  if (isApiRoute) {
    // Public API routes — no auth required
    const publicApiRoutes = ['/api/members/check']
    if (publicApiRoutes.some(p => req.nextUrl.pathname.startsWith(p))) {
      return NextResponse.next()
    }

    // Check for NextAuth session token — if missing, return 401 JSON immediately.
    const token =
      req.cookies.get('next-auth.session-token')?.value ??
      req.cookies.get('__Secure-next-auth.session-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in as an organizer.' },
        { status: 401 }
      )
    }
  }

  // For page routes (and authenticated API requests), defer to withAuth as normal.
  return (authMiddleware as (req: NextRequest, event: unknown) => ReturnType<typeof NextResponse.json>)(req, event)
}

export const config = {
  matcher: [
    '/organizer/dashboard/:path*',
    '/organizer/members/:path*',
    '/api/dashboard/:path*',
    '/api/export/:path*',
    // Individual member routes (PATCH, DELETE, GET by phone) — auth in handler too,
    // but middleware adds a second layer for organizer-only paths.
    '/api/members/:phoneNumber+',
  ],
}

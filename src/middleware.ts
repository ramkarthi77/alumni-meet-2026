import { withAuth } from 'next-auth/middleware'

// NOTE: /api/members (POST) is the PUBLIC registration endpoint — NOT protected here.
// Auth for GET /api/members and all /api/members/[phoneNumber] is handled
// inside the route handlers via requireAuth().
export default withAuth({
  pages: { signIn: '/organizer/login' },
})

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

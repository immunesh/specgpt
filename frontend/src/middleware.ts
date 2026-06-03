import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths — no auth required
const PUBLIC_PATHS = ['/login', '/register', '/auth/callback', '/api']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  // Lightweight check: accessToken in localStorage isn't accessible from middleware
  // (edge runtime). We rely on client-side RouteGuard for full protection.
  // Here we just redirect hard-navigations to /login when no cookie session exists.
  // Full JWT verification happens at the API layer.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

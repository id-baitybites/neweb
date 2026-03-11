import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'

// Tenant slug map for path resolution (loaded once at edge)
// In production this would be a KV store / edge config for perf
const resolveSlugFromPath = (pathname: string): string | null => {
    // If path is /baitybites/about, we want "baitybites"
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
        // Skip reserved routes from being treated as slugs
        const reserved = ['admin', 'super-admin', 'api', 'login', 'register', '_next', 'profile', 'cart', 'checkout'];
        if (!reserved.includes(segments[0])) {
            return segments[0];
        }
    }
    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') || 'localhost'

    // ── Tenant Resolution ─────────────────────────────────────────────────────
    // We inject the resolved slug as a header so layout.tsx can pick it up.
    // Full DB lookup happens in resolveTenant() in lib/tenant.ts (server side).
    const pathSlug = resolveSlugFromPath(pathname)
    const requestHeaders = new Headers(request.headers)

    // Pass the original pathname through headers so resolveTenant can parse it too
    requestHeaders.set('x-forwarded-path', pathname)

    if (pathSlug) {
        requestHeaders.set('x-tenant-slug', pathSlug)
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } })

    // ── Auth Guard ────────────────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value

    // Protect Admin routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL(`/login?returnUrl=${pathname}`, request.url))
        }
        try {
            const secret = new TextEncoder().encode(JWT_SECRET)
            const { payload } = await jwtVerify(token, secret)
            const role = payload.role as string
            if (role !== 'OWNER' && role !== 'STAFF' && role !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Protect Super-Admin
    if (pathname.startsWith('/super-admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        try {
            const secret = new TextEncoder().encode(JWT_SECRET)
            const { payload } = await jwtVerify(token, secret)
            if (payload.role !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*', '/super-admin/:path*', '/profile/:path*'],
}

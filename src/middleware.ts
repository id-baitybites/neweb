import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'

// Tenant slug map for subdomain resolution (loaded once at edge)
// In production this would be a KV store / edge config for perf
const resolveSlugFromHost = (host: string): string | null => {
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        return subdomain
    }
    return null
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') || 'localhost'

    // ── Tenant Resolution ─────────────────────────────────────────────────────
    // We inject the resolved slug as a header so layout.tsx can pick it up.
    // Full DB lookup happens in resolveTenant() in lib/tenant.ts (server side).
    const slug = resolveSlugFromHost(host)
    const requestHeaders = new Headers(request.headers)
    if (slug) {
        requestHeaders.set('x-tenant-slug', slug)
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

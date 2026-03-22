import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'baitybites-super-secret-key-2024'

// Tenant slug map for path resolution
const resolveSlugFromPath = (pathname: string): string | null => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
        const reserved = ['admin', 'super-admin', 'api', 'login', 'register', '_next', 'profile', 'cart', 'checkout'];
        if (!reserved.includes(segments[0])) {
            return segments[0];
        }
    }
    return null;
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Ignore static assets and API routes (except those we want to protect)
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.') // likely a file
    ) {
        return NextResponse.next()
    }

    console.log(`[Proxy] Checking path: ${pathname}`)
    
    const isAdmin = pathname.startsWith('/admin')
    const isSuperAdmin = pathname.startsWith('/super-admin')
    const isProfile = pathname.startsWith('/profile')
    const isProtected = isAdmin || isSuperAdmin || isProfile
    
    // ── Tenant Resolution ─────────────────────────────────────────────────────
    const pathSlug = resolveSlugFromPath(pathname)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-forwarded-path', pathname)
    if (pathSlug) {
        requestHeaders.set('x-tenant-slug', pathSlug)
    }

    // ── Auth Guard ────────────────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value

    if (isProtected) {
        if (!token) {
            console.warn(`[Proxy] No token for protected path: ${pathname}. Redirecting to /login`)
            const url = new URL('/login', request.url)
            url.searchParams.set('returnUrl', pathname)
            return NextResponse.redirect(url)
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET)
            const { payload } = await jwtVerify(token, secret)
            const role = payload.role as string
            
            console.log(`[Proxy] Authenticated: ${payload.email} (${role}) for ${pathname}`)

            if (isSuperAdmin) {
                if (role !== 'SUPER_ADMIN') {
                    console.warn(`[Proxy] Role ${role} denied for super-admin area.`)
                    return NextResponse.redirect(new URL('/', request.url))
                }
            }

            if (isAdmin) {
                if (role !== 'OWNER' && role !== 'STAFF' && role !== 'SUPER_ADMIN') {
                    console.warn(`[Proxy] Role ${role} denied for admin area.`)
                    return NextResponse.redirect(new URL('/', request.url))
                }
            }
        } catch (error: any) {
            console.error(`[Proxy] JWT verification failed for ${pathname}:`, error.message)
            const url = new URL('/login', request.url)
            url.searchParams.set('reason', 'invalid_session')
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}

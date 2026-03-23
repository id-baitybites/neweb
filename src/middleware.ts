import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'bitespace-super-secret-key-2024'

const RESERVED_PATHS = ['admin', 'super-admin', 'api', 'login', 'register', '_next', 'profile', 'cart', 'checkout', 'favicon.ico', 'product', 'products', 'order', 'about'];

const resolveSlugFromPath = (pathname: string): string | null => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && !RESERVED_PATHS.includes(segments[0])) {
        return segments[0];
    }
    return null;
}

export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const pathSlug = resolveSlugFromPath(pathname)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-forwarded-path', pathname)

    let normalizedPath = pathname;
    if (pathSlug) {
        requestHeaders.set('x-tenant-slug', pathSlug)
        // Rewrite /slug/path to /path while keeping header
        normalizedPath = pathname.replace(`/${pathSlug}`, '') || '/'
    }

    const isAdmin = normalizedPath.startsWith('/admin')
    const isSuperAdmin = normalizedPath.startsWith('/super-admin')
    const isProfile = normalizedPath.startsWith('/profile')
    const isProtected = isAdmin || isSuperAdmin || isProfile
    
    const token = request.cookies.get('token')?.value

    if (isProtected) {
        if (!token) {
            const url = new URL('/login', request.url)
            url.searchParams.set('returnUrl', pathname)
            return NextResponse.redirect(url)
        }
        try {
            const secret = new TextEncoder().encode(JWT_SECRET)
            const { payload } = await jwtVerify(token, secret)
            const role = payload.role as string
            if (isSuperAdmin && role !== 'SUPER_ADMIN') return NextResponse.redirect(new URL('/', request.url))
            if (isAdmin && !['OWNER', 'STAFF', 'SUPER_ADMIN'].includes(role)) return NextResponse.redirect(new URL('/', request.url))
        } catch (error) {
            const url = new URL('/login', request.url)
            url.searchParams.set('reason', 'invalid_session')
            return NextResponse.redirect(url)
        }
    }

    // If pathSlug was present, perform a rewrite to show the root app logic
    if (pathSlug) {
        return NextResponse.rewrite(new URL(`${normalizedPath}${search}`, request.url), {
            request: { headers: requestHeaders }
        })
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    })
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

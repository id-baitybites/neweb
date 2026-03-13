import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export interface TenantTheme {
    primary: string
    secondary: string
    accent: string
    background: string
    font: string
}

export interface TenantConfig {
    currency: string
    timezone: string
    language: string
    deliveryFee: number
    minPreOrderDays: number
}

export interface TenantData {
    id: string
    slug: string
    name: string
    logoUrl: string | null
    faviconUrl: string | null
    theme: TenantTheme
    config: TenantConfig
}

const DEFAULT_THEME: TenantTheme = {
    primary: '#FF69B4',
    secondary: '#8B4513',
    accent: '#FFB6C1',
    background: '#FFF5F7',
    font: 'Inter',
}

const DEFAULT_CONFIG: TenantConfig = {
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    language: 'id',
    deliveryFee: 25000,
    minPreOrderDays: 1,
}

/**
 * Resolve tenant from the current request.
 * Priority: custom domain → subdomain → path prefix → default
 */
export async function resolveTenant(): Promise<TenantData | null> {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || ''
    const tenantIdHeader = headersList.get('x-tenant-id')
    const tenantSlugHeader = headersList.get('x-tenant-slug')

    // 1. Middleware already resolved via header (fastest path)
    if (tenantIdHeader) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantIdHeader, isActive: true },
        })
        if (tenant) return normalizeTenant(tenant)
    }

    // 2. Custom domain match
    const domain = host.split(':')[0]
    const byDomain = await prisma.tenant.findFirst({
        where: { domain, isActive: true },
    })
    if (byDomain) return normalizeTenant(byDomain)

    // 3. Path SLUG match (e.g., "bitespace.netlify.app/bakery" -> "bakery")
    if (tenantSlugHeader) {
        const byPathSlug = await prisma.tenant.findFirst({
            where: { slug: tenantSlugHeader, isActive: true },
        })
        if (byPathSlug) return normalizeTenant(byPathSlug)
    }

    const subdomain = domain.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        const bySlug = await prisma.tenant.findFirst({
            where: { slug: subdomain, isActive: true },
        })
        if (bySlug) return normalizeTenant(bySlug)
    }

    // 4. Fallback: first active tenant (dev/single-tenant mode)
    // Prevent fallback on the main platform domain so the multi-tenant landing page shows up.
    const isPlatformDomain = domain === 'bitespace.netlify.app' || domain === 'localhost:7277' || domain === 'localhost'
    if (!isPlatformDomain) {
        const fallback = await prisma.tenant.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        })
        if (fallback) return normalizeTenant(fallback)
    }

    return null
}

function normalizeTenant(tenant: any): TenantData {
    return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        logoUrl: tenant.logoUrl,
        faviconUrl: tenant.faviconUrl,
        theme: { ...DEFAULT_THEME, ...(tenant.theme as object) },
        config: { ...DEFAULT_CONFIG, ...(tenant.config as object) },
    }
}

/**
 * Generate CSS variable injection string from tenant theme.
 */
export function buildThemeCSS(theme: TenantTheme): string {
    return `:root {
  --color-primary: ${theme.primary};
  --color-secondary: ${theme.secondary};
  --color-accent: ${theme.accent};
  --color-background: ${theme.background};
  --font-family: '${theme.font}', -apple-system, sans-serif;
}`
}

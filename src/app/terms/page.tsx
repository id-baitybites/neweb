import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import { getLocale } from '@/i18n'
import { headers } from 'next/headers'
import styles from '@/styles/modules/Legal.module.scss'
import { TenantLegal } from '@/components/support/TenantLegal'
import { PlatformLegal } from '@/components/support/PlatformLegal'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const tenant = await resolveTenant()
    return {
        title: tenant 
            ? `Terms of Service | ${tenant.name}` 
            : `SaaS Terms of Service | Bitespace Platform`
    }
}

export default async function TermsOfServicePage() {
    const tenant = await resolveTenant()
    const locale = await getLocale()
    const isIndo = locale === 'id'

    const primaryColor = tenant?.theme?.primary || '#4f46e5'
    const dynamicStyles = { '--primary-color': primaryColor } as React.CSSProperties

    let tenantPath = ''
    if (tenant) {
        const h = await headers()
        const host = (h.get('x-forwarded-host') || h.get('host') || '').split(':')[0]
        const isOnCustomDomain = !!(tenant.domain && host === tenant.domain)
        tenantPath = isOnCustomDomain ? '' : `/${tenant.slug}`
    }

    return (
        <div className={styles.legalWrapper} style={dynamicStyles}>
            {tenant ? (
                <TenantLegal tenant={tenant} isIndo={isIndo} type="terms" primaryColor={primaryColor} tenantPath={tenantPath} />
            ) : (
                <PlatformLegal isIndo={isIndo} type="terms" />
            )}
        </div>
    )
}

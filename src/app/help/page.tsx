import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'
import { getDictionary } from '@/i18n'
import { headers } from 'next/headers'
import styles from '@/styles/modules/Help.module.scss'
import { TenantHelp } from '@/components/support/TenantHelp'
import { PlatformHelp } from '@/components/support/PlatformHelp'

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary()
    const tenant = await resolveTenant()
    const t = dict.help
    return {
        title: tenant 
            ? t.title.replace('{name}', tenant.name) 
            : `Merchant Support Center | Bitespace`,
        description: t.subtitle,
    }
}

export default async function HelpCenterPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const isIndo = dict.locale === 'id'

    const primaryColor = tenant?.theme?.primary || '#4f46e5'
    const dynamicStyles = {
        '--primary-color': primaryColor,
        '--primary-color-15': `${primaryColor}15`,
        '--primary-color-20': `${primaryColor}20`
    } as React.CSSProperties

    let tenantPath = ''
    if (tenant) {
        const h = await headers()
        const host = (h.get('x-forwarded-host') || h.get('host') || '').split(':')[0]
        const isOnCustomDomain = !!(tenant.domain && host === tenant.domain)
        tenantPath = isOnCustomDomain ? '' : `/${tenant.slug}`
    }

    return (
        <div className={styles.helpWrapper} style={dynamicStyles}>
            <div className={`${styles.blob} ${styles.blob1}`} />
            <div className={`${styles.blob} ${styles.blob2}`} />

            {tenant ? (
                <TenantHelp tenant={tenant} dict={dict} tenantPath={tenantPath} />
            ) : (
                <PlatformHelp dict={dict} />
            )}

            <footer className={styles.helpFooter}>
                &copy; {new Date().getFullYear()} {tenant?.name || 'Bitespace Platform'}. {isIndo ? 'Seluruh hak cipta dilindungi.' : 'All rights reserved.'}
            </footer>
        </div>
    )
}

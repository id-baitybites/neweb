import React from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Utensils,
    Package,
    BarChart,
    Settings,
    LogOut,
    ArrowLeft,
    Bell,
    ShoppingCart,
    ClipboardList,
    Receipt
} from 'lucide-react'
import styles from '@/styles/modules/Admin.module.scss'
import { getCurrentUser } from '@/actions/auth'
import { resolveTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/i18n'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    const dict = await getDictionary()
    const { admin: t } = dict

    const tenant = await resolveTenant()
    const prefix = tenant ? `/${tenant.slug}` : ''

    if (!user) {
        redirect(`${prefix}/login`)
    }

    if (user.role === 'SUPER_ADMIN' && !tenant) {
        redirect('/super-admin')
    }

    if (user.role !== 'OWNER' && user.role !== 'STAFF' && user.role !== 'SUPER_ADMIN') {
        redirect(prefix || '/')
    }

    console.log(`[AdminLayout] Debug: UserTenantID=${user.tenantId}, ResolvedTenantID=${tenant?.id}, PathPrefix=${prefix}`)

    // CRITICAL: Prevent tenant cross-contamination !
    if (tenant && user.role !== 'SUPER_ADMIN' && user.tenantId !== tenant.id) {
        console.warn(`[AdminLayout] ACCESS DENIED: User belongs to ${user.tenantId} but requested admin for ${tenant.id}`)
        redirect('/')
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>BITESPACE</div>

                <nav className={styles.nav}>
                    <Link href={`${prefix}/admin`}><LayoutDashboard size={20} /> {t.sidebar.dashboard}</Link>
                    <Link href={`${prefix}/admin/products`}><ShoppingCart size={20} /> {t.sidebar.products}</Link>
                    <Link href={`${prefix}/admin/orders`}><ClipboardList size={20} /> {t.sidebar.orders}</Link>
                    <Link href={`${prefix}/admin/pos`}><Receipt size={20} /> {t.sidebar.pos}</Link>
                    <Link href={`${prefix}/admin/kitchen`}><Utensils size={20} /> {t.sidebar.kitchen}</Link>
                    <Link href={`${prefix}/admin/inventory`}><Package size={20} /> {t.sidebar.inventory}</Link>
                    <Link href={`${prefix}/admin/reports`}><BarChart size={20} /> {t.sidebar.reports}</Link>
                    <Link href={`${prefix}/admin/settings`}><Settings size={20} /> {t.sidebar.settings}</Link>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <Link href={`${prefix}/`}><ArrowLeft size={20} /> {t.sidebar.site_home}</Link>
                    </div>
                </nav>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h2>{t.header.admin_dash}</h2>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button style={{ color: '#888' }}><Bell size={20} /></button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontWeight: 600 }}>{user.email}</span>
                            <div style={{ width: 40, height: 40, background: '#FFB6C1', borderRadius: '50%', textAlign: 'center', lineHeight: '40px', fontWeight: 'bold', color: 'white' }}>
                                {user.email[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <section className={styles.content}>
                    {children}
                </section>
            </main>
        </div>
    )
}

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

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    console.log('[AdminLayout] User:', user?.email, 'Role:', user?.role)

    if (!user) {
        redirect('/login')
    }

    if (user.role === 'SUPER_ADMIN') {
        redirect('/super-admin')
    }

    if (user.role !== 'OWNER' && user.role !== 'STAFF') {
        console.warn('[AdminLayout] Access denied, redirecting...')
        redirect('/')
    }

    const tenant = await resolveTenant()
    const prefix = tenant ? `/${tenant.slug}` : ''

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>BITESPACE</div>

                <nav className={styles.nav}>
                    <Link href={`${prefix}/admin`}><LayoutDashboard size={20} /> Dashboard</Link>
                    <Link href={`${prefix}/admin/products`}><ShoppingCart size={20} /> Products</Link>
                    <Link href={`${prefix}/admin/orders`}><ClipboardList size={20} /> Orders</Link>
                    <Link href={`${prefix}/admin/pos`}><Receipt size={20} /> Cashier / POS</Link>
                    <Link href={`${prefix}/admin/kitchen`}><Utensils size={20} /> Kitchen Display</Link>
                    <Link href={`${prefix}/admin/inventory`}><Package size={20} /> Inventory</Link>
                    <Link href={`${prefix}/admin/reports`}><BarChart size={20} /> Reports</Link>
                    <Link href={`${prefix}/admin/settings`}><Settings size={20} /> Settings</Link>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <Link href={`${prefix}/`}><ArrowLeft size={20} /> Site Home</Link>
                    </div>
                </nav>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h2>Admin Dashboard</h2>
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

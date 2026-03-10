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
    ShoppingCart
} from 'lucide-react'
import styles from '@/styles/modules/Admin.module.scss'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'OWNER' && user.role !== 'STAFF')) {
        redirect('/login')
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>BAITYBITES</div>

                <nav className={styles.nav}>
                    <Link href="/admin"><LayoutDashboard size={20} /> Dashboard</Link>
                    <Link href="/admin/pos"><ShoppingCart size={20} /> Cashier / POS</Link>
                    <Link href="/admin/kitchen"><Utensils size={20} /> Kitchen Display</Link>
                    <Link href="/admin/inventory"><Package size={20} /> Inventory</Link>
                    <Link href="/admin/reports"><BarChart size={20} /> Reports</Link>
                    <Link href="/admin/settings"><Settings size={20} /> Settings</Link>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <Link href="/"><ArrowLeft size={20} /> Site Home</Link>
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

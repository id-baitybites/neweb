import React from 'react'
import { prisma } from '@/lib/prisma'
import styles from '@/styles/modules/Admin.module.scss'
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Order } from '@prisma/client'
import { resolveTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/i18n'
import { getCurrentUser } from '@/actions/auth'
import { getSafeCurrency } from '@/lib/config'

export default async function AdminDashboardPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const { admin: t } = dict
    const user = await getCurrentUser()

    if (!user || (user.role !== 'OWNER' && user.role !== 'STAFF' && user.role !== 'SUPER_ADMIN')) {
        redirect('/')
    }
    
    if (!tenant) {
        console.warn('[AdminDashboardPage] No tenant context, redirecting to home...')
        redirect('/')
    }

    const productsCount = await prisma.product.count({
        where: { tenantId: tenant.id }
    })
    
    const ordersCount = await prisma.order.count({
        where: { tenantId: tenant.id }
    })
    
    const inventoryCount = await prisma.inventory.count({
        where: { tenantId: tenant.id }
    })

    // Calculate total revenue for this tenant
    const orders = await prisma.order.findMany({
        where: { 
            tenantId: tenant.id,
            status: 'READY' 
        }
    })
    const revenue = orders.reduce((acc: number, order: Order) => acc + (order.total || 0), 0)

    const safeCurrency = getSafeCurrency(tenant.config.currency)

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(tenant.config.language === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: safeCurrency,
            minimumFractionDigits: 0,
        }).format(val)
    }

    const recentOrders = await prisma.order.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    return (
        <div className={styles.adminPage}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_revenue}</div>
                    <div className={styles.value}>
                        <div className={`${styles.iconBox} ${styles.statActive}`}>
                            <DollarSign size={24} />
                        </div>
                        {formatCurrency(revenue)}
                    </div>
                    <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
                        {t.revenue_week}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_orders}</div>
                    <div className={styles.value}>
                        <div className={`${styles.iconBox} ${styles.statTotal}`}>
                            <ShoppingCart size={24} />
                        </div>
                        {ordersCount}
                    </div>
                    <div style={{ color: '#3b82f6', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
                        {t.new_orders.replace('{count}', recentOrders.length.toString())}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_products}</div>
                    <div className={styles.value}>
                        <div className={`${styles.iconBox} ${styles.statToday}`}>
                            <TrendingUp size={24} />
                        </div>
                        {productsCount}
                    </div>
                    <div style={{ color: '#8b5cf6', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
                        {t.your_menu}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.inventory_items}</div>
                    <div className={styles.value}>
                        <div className={`${styles.iconBox} ${styles.statInactive}`}>
                            <Package size={24} />
                        </div>
                        {inventoryCount}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
                        {t.monitor_stock}
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>{t.recent_orders}</h3>
                </div>
                
                <div style={{ padding: '1rem' }}>
                    {recentOrders.length === 0 ? (
                        <p style={{ color: '#64748b', padding: '1rem' }}>{t.no_orders}</p>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tanggal</th>
                                        <th>Status</th>
                                        <th className={styles.alignRight}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{order.id.slice(-6).toUpperCase()}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`${styles.badge} ${
                                                    order.status === 'READY' ? styles.statusActive : styles.companyBadge
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className={`${styles.alignRight} ${styles.valueSmall}`} style={{ fontWeight: 800, color: '#4F46E5' }}>
                                                {formatCurrency(order.total || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

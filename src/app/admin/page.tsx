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
        <div>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_revenue}</div>
                    <div className={styles.value}><DollarSign size={20} style={{ color: '#4CAF50' }} /> {formatCurrency(revenue)}</div>
                    <div style={{ color: '#4CAF50', fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.revenue_week}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_orders}</div>
                    <div className={styles.value}><ShoppingCart size={20} style={{ color: '#2196F3' }} /> {ordersCount}</div>
                    <div style={{ color: '#2196F3', fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.new_orders.replace('{count}', recentOrders.length.toString())}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.total_products}</div>
                    <div className={styles.value}><TrendingUp size={20} style={{ color: '#9C27B0' }} /> {productsCount}</div>
                    <div style={{ color: '#9C27B0', fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.your_menu}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>{t.inventory_items}</div>
                    <div className={styles.value}><Package size={20} style={{ color: '#FF9800' }} /> {inventoryCount}</div>
                    <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.monitor_stock}</div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800 }}>{t.recent_orders}</h3>
                
                {recentOrders.length === 0 ? (
                    <p style={{ color: '#888' }}>{t.no_orders}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentOrders.map(order => (
                            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>#{order.id.slice(-6)}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: '#4F46E5' }}>{formatCurrency(order.total || 0)}</div>
                                    <div style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#F1F5F9', borderRadius: '4px', display: 'inline-block' }}>{order.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

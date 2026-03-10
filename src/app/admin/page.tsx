import React from 'react'
import { prisma } from '@/lib/prisma'
import styles from '@/styles/modules/Admin.module.scss'
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Order } from '@prisma/client'

export default async function AdminDashboardPage() {
    const productsCount = await prisma.product.count()
    const ordersCount = await prisma.order.count()
    const inventoryCount = await prisma.inventory.count()

    // Calculate total revenue
    const orders = await prisma.order.findMany({
        where: { status: 'READY' }
    })
    const revenue = orders.reduce((acc: number, order: Order) => acc + (order.total || 0), 0)

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val)
    }

    return (
        <div>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.label}>Total Pendapatan (Ready)</div>
                    <div className={styles.value}><DollarSign size={20} style={{ color: '#4CAF50' }} /> {formatCurrency(revenue)}</div>
                    <div style={{ color: '#4CAF50', fontSize: '0.8rem', marginTop: '0.5rem' }}>+12% dari minggu lalu</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>Total Pesanan</div>
                    <div className={styles.value}><ShoppingCart size={20} style={{ color: '#2196F3' }} /> {ordersCount}</div>
                    <div style={{ color: '#2196F3', fontSize: '0.8rem', marginTop: '0.5rem' }}>Ada 5 pesanan baru</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>Total Produk</div>
                    <div className={styles.value}><TrendingUp size={20} style={{ color: '#9C27B0' }} /> {productsCount}</div>
                    <div style={{ color: '#9C27B0', fontSize: '0.8rem', marginTop: '0.5rem' }}>+2 produk baru</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.label}>Item Inventori</div>
                    <div className={styles.value}><Package size={20} style={{ color: '#FF9800' }} /> {inventoryCount}</div>
                    <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '0.5rem' }}>3 item perlu restok</div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Pesanan Terbaru</h3>
                {/* Placeholder for table */}
                <p style={{ color: '#888' }}>Data pesanan baru akan muncul di sini secara real-time.</p>
            </div>
        </div>
    )
}

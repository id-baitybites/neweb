'use client'

import React, { useState, useEffect } from 'react'
import { getAdminOrders, updateOrderStatus } from '@/actions/order'
import styles from '@/styles/modules/Admin.module.scss'
import { 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    ChefHat, 
    Truck, 
    Package, 
    User, 
    Phone, 
    MapPin, 
    Calendar,
    Receipt,
    ExternalLink,
    MoreVertical,
    Check
} from 'lucide-react'
import { toast } from 'sonner'
import { OrderStatus } from '@prisma/client'

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        const result = await getAdminOrders()
        if (result.success && result.orders) {
            setOrders(result.orders)
        } else if (!result.success) {
            toast.error('Failed to load orders: ' + result.error)
        }
        setLoading(false)
    }

    const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
        setUpdatingId(orderId)
        const result = await updateOrderStatus(orderId, nextStatus)
        if (result.success) {
            toast.success(`Order status updated to ${nextStatus}`)
            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o))
        } else {
            toast.error('Failed to update: ' + result.error)
        }
        setUpdatingId(null)
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val)
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (order.customerName || order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'ALL' || order.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return <Clock size={14} />
            case 'PROCESSING': return <ChefHat size={14} />
            case 'READY': return <CheckCircle2 size={14} />
            case 'SHIPPED': return <Truck size={14} />
            case 'COMPLETED': return <Check size={14} />
            case 'CANCELLED': return <Package size={14} />
            default: return <Package size={14} />
        }
    }

    const getNextStatus = (current: OrderStatus): OrderStatus | null => {
        switch (current) {
            case 'PENDING': return 'PROCESSING'
            case 'PROCESSING': return 'READY'
            case 'READY': return 'SHIPPED'
            case 'SHIPPED': return 'COMPLETED'
            default: return null
        }
    }

    const getNextButtonText = (current: OrderStatus) => {
        switch (current) {
            case 'PENDING': return 'Mulai Proses'
            case 'PROCESSING': return 'Pesanan Siap'
            case 'READY': return 'Kirim Pesanan'
            case 'SHIPPED': return 'Selesaikan'
            default: return ''
        }
    }

    if (loading && orders.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>Loading Orders...</div>
    }

    return (
        <div className={styles.ordersPage}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Manajemen Pesanan</h1>
                    <p style={{ color: '#888', margin: 0 }}>Kelola alur kerja pesanan dari masuk hingga sampai ke pelanggan.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input 
                            placeholder="Cari Order ID atau Pelanggan..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', border: '1px solid #eee', width: '300px' }}
                        />
                    </div>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #eee', background: 'white', color: '#444', fontWeight: 600 }}
                    >
                        <option value="ALL">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="PROCESSING">Diproses</option>
                        <option value="READY">Siap</option>
                        <option value="SHIPPED">Dikirim</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="CANCELLED">Dibatalkan</option>
                    </select>
                </div>
            </div>

            <div className={styles.orderGrid}>
                {filteredOrders.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '20px', color: '#888' }}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>Tidak ada pesanan yang ditemukan matches kriteria filter.</p>
                    </div>
                ) : filteredOrders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.idBlock}>
                                <span className={styles.idLabel}>Order ID</span>
                                <span className={styles.idValue}>#{order.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className={`${styles.statusBadge} ${order.status.toLowerCase()}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </div>
                        </div>

                        <div className={styles.customerSection}>
                            <span className={styles.name}>{order.customerName || order.user?.name || 'Guest Customer'}</span>
                            <div className={styles.details}>
                                <div className={styles.detailItem}><Phone size={14} /> {order.customerPhone || 'No phone'}</div>
                                <div className={styles.detailItem}><Calendar size={14} /> {order.customerDate || 'Not set'}</div>
                                {order.method === 'DELIVERY' && (
                                    <div className={styles.detailItem}><MapPin size={14} /> {order.delivery?.address || order.customerEmail || 'No address'}</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.itemsSection}>
                            {order.orderItems.map((item: any) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <span><span className={styles.qty}>{item.quantity}x</span> {item.product.name}</span>
                                    <span className={styles.price}>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cardFooter}>
                            <div className={styles.totalLabel}>Total Bayar</div>
                            <div className={styles.totalValue}>{formatCurrency(order.total)}</div>
                        </div>

                        <div className={styles.cardActions}>
                            {getNextStatus(order.status) && (
                                <button 
                                    className={`${styles.actionBtn} ${styles.primary}`}
                                    onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                                    disabled={updatingId === order.id}
                                    style={{ gridColumn: 'span 2' }}
                                >
                                    {updatingId === order.id ? 'Mengubah...' : getNextButtonText(order.status)}
                                </button>
                            )}
                            <button className={`${styles.actionBtn} ${styles.outline}`}>
                                <Receipt size={16} /> Invoice
                            </button>
                            <button className={`${styles.actionBtn} ${styles.outline}`}>
                                <ExternalLink size={16} /> Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

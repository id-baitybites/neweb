'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAdminCustomerDetails } from '@/actions/customer'
import { toast } from 'sonner'
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    ShoppingBag, 
    CreditCard,
    ChevronDown,
    Package
} from 'lucide-react'
import styles from '@/styles/modules/Admin.module.scss'

export default function AdminCustomerDetailsClient() {
    const { id } = useParams() as any
    const router = useRouter()
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            if (!id) return
            const result = await getAdminCustomerDetails(id as string)
            if (result.success) {
                setCustomer(result.customer)
            } else {
                toast.error(result.error)
                router.push('../customers')
            }
            setLoading(false)
        }
        fetch()
    }, [id])

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Memuat profil pelanggan...</p>
            </div>
        )
    }

    if (!customer) return null

    const ltv = customer.orders.reduce((acc: number, o: any) => acc + (o.status === 'COMPLETED' ? o.total : 0), 0)

    return (
        <div className={styles.adminPage}>
            <div style={{ marginBottom: '1.5rem' }}>
                <button 
                    onClick={() => router.back()} 
                    className={styles.actionBtn} 
                    style={{ background: 'none', border: 'none', color: '#666', fontWeight: 600, padding: 0 }}
                >
                    <ArrowLeft size={18} /> Kembali ke Daftar Pelanggan
                </button>
            </div>

            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Profil Pelanggan</h1>
                    <p>Detail riwayat belanja dan informasi kontak {customer.name}.</p>
                </div>
            </div>

            <div className={styles.detailedStats} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statTotal}`}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Total Pesanan</span>
                        <strong>{customer.orders.length}</strong>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statToday}`}>
                        <CreditCard size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Lifetime Value (LTV)</span>
                        <strong>Rp {ltv.toLocaleString()}</strong>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left: Profile Info */}
                <div className={styles.tableCard} style={{ height: 'fit-content', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div className={styles.avatar} style={{ width: 80, height: 80, margin: '0 auto 1rem', fontSize: '2rem', borderRadius: '20px' }}>
                                {customer.image ? <img src={customer.image} alt={customer.name} /> : customer.name?.[0] || customer.email[0]}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{customer.name}</h2>
                            <p style={{ color: '#64748b' }}>{customer.role}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Mail size={18} style={{ color: '#94a3b8' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>EMAIL</span>
                                    <p style={{ fontWeight: 600 }}>{customer.email}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Phone size={18} style={{ color: '#94a3b8' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>WHATSAPP</span>
                                    <p style={{ fontWeight: 600 }}>{customer.profile?.phone || '-'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                <MapPin size={18} style={{ color: '#94a3b8', marginTop: '2px' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ALAMAT</span>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer.profile?.addressLine || '-'}</p>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{customer.profile?.city}, {customer.profile?.province}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Calendar size={18} style={{ color: '#94a3b8' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>BERGABUNG SEJAK</span>
                                    <p style={{ fontWeight: 600 }}>{new Date(customer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order History */}
                <div className={styles.tableCard} style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Riwayat Pesanan</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {customer.orders.length > 0 ? customer.orders.map((order: any) => (
                            <div key={order.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 800 }}>#{order.id.slice(-6).toUpperCase()}</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                padding: '0.2rem 0.5rem', 
                                                borderRadius: '4px', 
                                                background: order.status === 'COMPLETED' ? '#ecfdf5' : '#fef3c7',
                                                color: order.status === 'COMPLETED' ? '#065f46' : '#92400e',
                                                fontWeight: 700
                                            }}>{order.status}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL</span>
                                        <strong style={{ fontSize: '1.1rem' }}>Rp {order.total.toLocaleString()}</strong>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '1rem' }}>
                                    {order.orderItems.map((item: any) => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 700, color: '#f687b3' }}>{item.quantity}x</span>
                                                <span>{item.product?.name}</span>
                                            </div>
                                            <span style={{ color: '#64748b' }}>Rp {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                <p>Belum ada pesanan terdaftar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

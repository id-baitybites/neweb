'use client'

import React, { useState, useEffect } from 'react'
import { getAdminCustomers } from '@/actions/customer'
import { toast } from 'sonner'
import { 
    Users, 
    Search, 
    Mail, 
    Phone, 
    Calendar, 
    ShoppingBag, 
    DollarSign,
    ExternalLink,
    Filter,
    User as UserIcon,
    ArrowUpDown
} from 'lucide-react'
import styles from '@/styles/modules/Admin.module.scss'

export default function CustomersClient() {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const result = await getAdminCustomers()
            if (result.success) {
                setCustomers(result.customers || [])
            } else {
                toast.error(result.error)
            }
            setLoading(false)
        }
        fetch()
    }, [])

    const filtered = customers.filter(c => 
        (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (c.email.toLowerCase()).includes(search.toLowerCase()) ||
        (c.profile?.phone || '').includes(search)
    )

    const calculateLTV = (orders: any[]) => {
        return orders.reduce((acc, o) => acc + (o.status === 'COMPLETED' ? o.total : 0), 0)
    }

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Memuat data pelanggan...</p>
            </div>
        )
    }

    return (
        <div className={styles.adminPage}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Data Pelanggan</h1>
                    <p>Kelola dan analisis data pelanggan Anda.</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <Users size={20} className={styles.statIcon} />
                        <div>
                            <span>Total Pelanggan</span>
                            <strong>{customers.length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actionsBar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama, email, atau telepon..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.filters}>
                    <button className={styles.btnOutline}>
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Pelanggan</th>
                            <th>Kontak</th>
                            <th>Bergabung</th>
                            <th>Total Pesanan</th>
                            <th className={styles.alignRight}>Total Belanja (LTV)</th>
                            <th className={styles.alignRight}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div className={styles.customerInfo}>
                                        <div className={styles.avatar}>
                                            {c.image ? <img src={c.image} alt={c.name} /> : <UserIcon size={20} />}
                                        </div>
                                        <div>
                                            <div className={styles.customerName}>{c.name || 'Pelanggan Baru'}</div>
                                            <div className={styles.customerId}>ID: {c.id.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.contacts}>
                                        <div className={styles.contactItem}>
                                            <Mail size={14} /> {c.email}
                                        </div>
                                        {c.profile?.phone && (
                                            <div className={styles.contactItem}>
                                                <Phone size={14} /> {c.profile.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.joinDate}>
                                        <Calendar size={14} /> {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.orderCount}>
                                        <ShoppingBag size={14} /> {c.orders.length} pesanan
                                    </div>
                                </td>
                                <td className={styles.alignRight}>
                                    <div className={styles.ltv}>
                                        Rp {calculateLTV(c.orders).toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td className={styles.alignRight}>
                                    <button className={styles.btnIcon} title="Lihat Detail">
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyTable}>
                                    <Users size={48} />
                                    <p>Tidak ada pelanggan yang ditemukan.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

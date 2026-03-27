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
    User as UserIcon,
    Filter,
    Plus,
    Download,
    MoreVertical,
    RefreshCw,
    UserCheck,
    UserMinus,
    LogIn,
    Share2,
    Clock
} from 'lucide-react'
import styles from '@/styles/modules/Admin.module.scss'

export default function CustomersClient() {
    const [customers, setCustomers] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchData = async () => {
        setLoading(true)
        const result = await getAdminCustomers()
        if (result.success) {
            setCustomers(result.customers || [])
            setStats(result.stats)
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filtered = customers.filter(c => 
        (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (c.email.toLowerCase()).includes(search.toLowerCase()) ||
        (c.profile?.phone || '').includes(search)
    )

    const isOnline = (lastLogin: string | null) => {
        if (!lastLogin) return false
        const last = new Date(lastLogin).getTime()
        const now = new Date().getTime()
        return (now - last) < 5 * 60 * 1000 // 5 minutes
    }

    if (loading && !customers.length) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Memuat data pelanggan...</p>
            </div>
        )
    }

    return (
        <div className={styles.adminPage}>
            {/* Header Area */}
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Pelanggan</h1>
                    <p>Kelola data dan interaksi pelanggan Anda secara personal.</p>
                </div>
                <div className={styles.actionGroup} style={{display: 'flex', gap: '0.75rem'}}>
                    <button className={`${styles.actionBtn} ${styles.outline}`}>
                        <Download size={18} /> Import Customers
                    </button>
                    <button className={`${styles.actionBtn} ${styles.primary}`}>
                        <Plus size={18} /> New Customer
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className={styles.detailedStats}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statTotal}`}>
                        <Users size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Total Customers</span>
                        <strong>{stats?.total || 0}</strong>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statActive}`}>
                        <UserCheck size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Active Customers</span>
                        <strong>{stats?.active || 0}</strong>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statInactive}`}>
                        <UserMinus size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Inactive Customers</span>
                        <strong>{stats?.inactive || 0}</strong>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.statToday}`}>
                        <LogIn size={24} />
                    </div>
                    <div className={styles.info}>
                        <span>Contacts Log In Today</span>
                        <strong>{stats?.loggedInToday || 0}</strong>
                    </div>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <button className={`${styles.actionBtn} ${styles.outline}`}>
                        <Download size={18} /> Export
                    </button>
                    <button className={`${styles.actionBtn} ${styles.outline}`}>
                        Bulk Actions
                    </button>
                    <button className={`${styles.actionBtn} ${styles.outline}`} onClick={fetchData} title="Refresh">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className={styles.toolbarRight}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Search Customer..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className={`${styles.actionBtn} ${styles.outline}`}>
                        <Filter size={18} /> Filter
                    </button>
                    <button className={`${styles.actionBtn} ${styles.outline}`}>
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Customer Grid */}
            <div className={styles.customerGrid}>
                {filtered.map((customer) => (
                    <div key={customer.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.profile}>
                                <div className={styles.avatarContainer}>
                                    <div className={styles.avatar}>
                                        {customer.image ? (
                                            <img src={customer.image} alt={customer.name || ''} />
                                        ) : (
                                            <span>{(customer.name?.[0] || customer.email[0]).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className={`${styles.statusIndicator} ${isOnline(customer.lastLogin) ? styles.online : ''}`} />
                                </div>
                                <div className={styles.nameBlock}>
                                    <h3>{customer.name || 'Anonymous User'}</h3>
                                    <p>{customer.profile?.address?.split(',').pop()?.trim() || 'Global User'}</p>
                                </div>
                            </div>
                            <button className={styles.moreBtn}>
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.detailGroup}>
                                <span>Mobile</span>
                                <p>{customer.profile?.phone || 'Not Provided'}</p>
                            </div>
                            <div className={styles.detailGroup}>
                                <span>Email</span>
                                <p>{customer.email}</p>
                            </div>
                            <div className={styles.detailGroup}>
                                <span>Joined</span>
                                <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={styles.detailGroup}>
                                <span>ID</span>
                                <p>{customer.id.substring(customer.id.length - 6).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <div className={`${styles.badge} ${customer.isActive ? styles.statusActive : styles.statusInactive}`}>
                                {customer.isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div className={`${styles.badge} ${styles.companyBadge}`}>
                                Customer
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>
                        <Users size={64} style={{margin: '0 auto 1.5rem', opacity: 0.2}} />
                        <p>No customers found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

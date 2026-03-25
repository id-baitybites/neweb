'use client'

import React, { useState } from 'react'
import { updateCustomerProfile, logout } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    User, Mail, Phone, MapPin, Calendar, FileText, Package,
    Edit3, Save, X, ShoppingBag, LogOut, ChevronRight, Sparkles, Clock,
    Camera, Heart, CreditCard, AlertCircle
} from 'lucide-react'
import { getSafeCurrency } from '@/lib/config'
import { TenantData } from '@/lib/tenant'

interface ProfileClientProps {
    user: any
    prefix?: string
    dict: any
    tenant: TenantData | null
}

export default function ProfileClient({ user, prefix = '', dict, tenant }: ProfileClientProps) {
    const t = dict.profile
    const router = useRouter()
    const searchParams = useSearchParams()
    const isCompletionStep = searchParams?.get('step') === 'complete'
    
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>(isCompletionStep ? 'profile' : 'orders')
    const [editing, setEditing] = useState(isCompletionStep)
    const [saving, setSaving] = useState(false)

    const profile = user.profile

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        const formData = new FormData(e.currentTarget)
        const result = await updateCustomerProfile(formData)
        if (result.success) {
            toast.success(dict.auth?.toast_profile_success || 'Profile updated successfully!')
            setEditing(false)
            router.refresh()
        } else {
            toast.error(result.error)
        }
        setSaving(false)
    }

    const handleLogout = async () => {
        await logout()
        router.push(prefix || '/')
        router.refresh()
    }

    const formatPrice = (val: number) =>
        new Intl.NumberFormat(dict.locale === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: getSafeCurrency(tenant?.config.currency), minimumFractionDigits: 0 }).format(val)

    const statusColors: Record<string, { bg: string; color: string }> = {
        PENDING: { bg: '#fff7ed', color: '#f97316' },
        PROCESSING: { bg: '#eff6ff', color: '#3b82f6' },
        READY: { bg: '#f0fdf4', color: '#22c55e' },
        SHIPPED: { bg: '#faf5ff', color: '#a855f7' },
        COMPLETED: { bg: '#ecfdf5', color: '#059669' },
        CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
    }

    const initials = user.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : user.email[0].toUpperCase()

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff5f9 0%, #fafafa 60%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Hero Header Card */}
                <div style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #8B4513 100%)', borderRadius: '24px', padding: '2.5rem', marginBottom: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                    <div style={{ position: 'absolute', right: 40, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0, overflow: 'hidden' }}>
                            {user.image ? (
                                <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : initials}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ opacity: 0.75, fontSize: '0.85rem', marginBottom: '4px' }}>{dict.locale === 'id' ? 'Selamat datang,' : 'Welcome,'}</p>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 4px' }}>{user.name || (dict.locale === 'id' ? 'Member Baru' : 'New Member')}</h1>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: 0 }}>{user.email}</p>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                            <LogOut size={16} /> {dict.locale === 'id' ? 'Keluar' : 'Logout'}
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', position: 'relative' }}>
                        {[
                            { label: dict.locale === 'id' ? 'Total Pesanan' : 'Total Orders', value: user.orders.length },
                            { label: dict.locale === 'id' ? 'Selesai' : 'Completed', value: user.orders.filter((o: any) => o.status === 'COMPLETED').length },
                            { label: dict.locale === 'id' ? 'Aktif' : 'Active', value: user.orders.filter((o: any) => ['PENDING','PROCESSING','READY','SHIPPED'].includes(o.status)).length },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '0.8rem 1.2rem', borderRadius: '12px', backdropFilter: 'blur(10px)', textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stat.value}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', padding: '0.5rem', borderRadius: '14px', border: '1px solid #f0f0f0' }}>
                    {[
                        { id: 'orders', label: t.tabs.orders, icon: <ShoppingBag size={16} /> },
                        { id: 'profile', label: t.tabs.overview, icon: <User size={16} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF69B4, #e55da0)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#888',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255,105,180,0.3)' : 'none',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Orders */}
                {activeTab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user.orders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '20px', padding: '4rem', textAlign: 'center', color: '#888' }}>
                                <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p style={{ marginBottom: '1rem' }}>{t.orders.no_orders}</p>
                                <Link href={prefix || '/'} style={{ background: '#FF69B4', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                                    {dict.locale === 'id' ? 'Mulai Belanja' : 'Start Shopping'}
                                </Link>
                            </div>
                        ) : user.orders.map((order: any) => {
                            const sc = statusColors[order.status] || { bg: '#f5f5f5', color: '#888' }
                            return (
                                <div key={order.id} style={{ background: 'white', borderRadius: '18px', padding: '1.5rem 2rem', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={22} color={sc.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '2px' }}>
                                                Order #{order.id.slice(-8).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <Clock size={12} />
                                                {new Date(order.createdAt).toLocaleDateString(dict.locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#888' }}>
                                                {order.orderItems.length} {dict.locale === 'id' ? 'produk' : 'items'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1a1a1a' }}>{formatPrice(order.total)}</div>
                                        <div style={{ display: 'inline-block', marginTop: '4px', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontSize: '0.75rem', fontWeight: 700 }}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <Link href={`${prefix}/order/status?id=${order.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF69B4', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                                        {dict.locale === 'id' ? 'Detail' : 'Details'} <ChevronRight size={16} />
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Tab: Profile */}
                {activeTab === 'profile' && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                {isCompletionStep && (
                                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', color: '#92400e' }}>
                                        <AlertCircle size={20} />
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{dict.locale === 'id' ? 'Lengkapi Profil Anda' : 'Complete Your Profile'}</div>
                                            <div style={{ fontSize: '0.85rem' }}>{dict.locale === 'id' ? 'Silakan lengkapi detail pengiriman untuk mempermudah transaksi berikutnya.' : 'Please complete your shipping details to simplify future transactions.'}</div>
                                        </div>
                                    </div>
                                )}
                                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0 0 4px' }}>{t.info.title}</h3>
                                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>{dict.locale === 'id' ? 'Informasi ini digunakan untuk mempercepat proses checkout.' : 'This information is used to speed up the checkout process.'}</p>
                            </div>
                            {!editing && (
                                <button onClick={() => setEditing(true)} style={{ background: '#fff5fb', border: '1px solid #FFB6C1', color: '#FF69B4', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Edit3 size={16} /> {dict.locale === 'id' ? 'Edit Profil' : 'Edit Profile'}
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleSave}>
                                {/* Image Upload */}
                                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#fff9fb', padding: '1.5rem', borderRadius: '16px', border: '1px dashed #FFB6C1' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        {user.image ? <img src={user.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="#aaa" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>{dict.locale === 'id' ? 'Foto Profil' : 'Profile Picture'}</h4>
                                        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#888' }}>{dict.locale === 'id' ? 'Format JPG, PNG atau WebP (Maks 5MB)' : 'JPG, PNG or WebP format (Max 5MB)'}</p>
                                        <input type="file" name="image" accept="image/*" style={{ fontSize: '0.85rem' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    {[
                                        { label: t.info.name, name: 'name', defaultValue: user.name || '', type: 'text', icon: <User size={16} />, colSpan: 2 },
                                        { label: t.info.phone, name: 'phone', defaultValue: profile?.phone || '', type: 'tel', icon: <Phone size={16} /> },
                                        { label: dict.locale === 'id' ? 'Jenis Kelamin' : 'Gender', name: 'gender', defaultValue: profile?.gender || '', type: 'select', options: [{ label: dict.locale === 'id' ? 'Laki-laki' : 'Male', value: 'L' }, { label: dict.locale === 'id' ? 'Perempuan' : 'Female', value: 'P' }], icon: <Heart size={16} /> },
                                        { label: t.info.birth, name: 'dateOfBirth', defaultValue: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '', type: 'date', icon: <Calendar size={16} /> },
                                        { label: dict.locale === 'id' ? 'Alamat (Jalan, No.)' : 'Address (Street, No.)', name: 'addressLine', defaultValue: profile?.addressLine || '', type: 'text', icon: <MapPin size={16} />, colSpan: 2 },
                                        { label: dict.locale === 'id' ? 'Kota' : 'City', name: 'city', defaultValue: profile?.city || '', type: 'text', icon: <MapPin size={16} /> },
                                        { label: dict.locale === 'id' ? 'Provinsi' : 'Province', name: 'province', defaultValue: profile?.province || '', type: 'text', icon: <MapPin size={16} /> },
                                        { label: dict.locale === 'id' ? 'Kode Pos' : 'Postal Code', name: 'postalCode', defaultValue: profile?.postalCode || '', type: 'text', icon: <MapPin size={16} /> },
                                        { label: dict.locale === 'id' ? 'Metode Pembayaran Pilihan' : 'Preferred Payment Method', name: 'preferredPayment', defaultValue: profile?.preferredPayment || 'QRIS', type: 'select', options: [{ label: 'QRIS (Otomatis)', value: 'QRIS' }, { label: dict.locale === 'id' ? 'Bank Transfer (Manual)' : 'Bank Transfer (Manual)', value: 'BANK_TRANSFER' }], icon: <CreditCard size={16} />, colSpan: 2 },
                                    ].map(field => (
                                        <div key={field.name} style={{ gridColumn: (field as any).colSpan === 2 ? 'span 2' : 'span 1' }}>
                                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#555' }}>{field.label}</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }}>{field.icon}</span>
                                                {field.type === 'select' ? (
                                                    <select name={field.name} defaultValue={field.defaultValue} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.6rem', border: '2px solid #f0f0f0', borderRadius: '10px', fontSize: '0.95rem', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'none' }}>
                                                        <option value="">{dict.locale === 'id' ? 'Pilih...' : 'Select...'}</option>
                                                        {field.options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                ) : (
                                                    <input name={field.name} type={field.type} defaultValue={field.defaultValue} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.6rem', border: '2px solid #f0f0f0', borderRadius: '10px', fontSize: '0.95rem', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#555' }}>{dict.locale === 'id' ? 'Catatan Pesanan (Alergi, preferensi, dll.)' : 'Order Notes (Allergies, preferences, etc.)'}</label>
                                        <div style={{ position: 'relative' }}>
                                            <FileText size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#aaa' }} />
                                            <textarea name="notes" defaultValue={profile?.notes || ''} rows={3} placeholder={dict.locale === 'id' ? "Contoh: Alergi kacang, tidak suka terlalu manis..." : "Example: Nut allergy, don't like it too sweet..."} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.6rem', border: '2px solid #f0f0f0', borderRadius: '10px', fontSize: '0.95rem', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '0.9rem', border: '1px solid #ddd', borderRadius: '12px', background: 'white', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#888' }}>
                                        <X size={18} /> {dict.locale === 'id' ? 'Batal' : 'Cancel'}
                                    </button>
                                    <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.9rem', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #FF69B4, #e55da0)', color: 'white', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 18px rgba(255,105,180,0.3)' }}>
                                        <Save size={18} /> {saving ? t.info.saving : t.info.save}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {[
                                    { label: t.info.name, value: user.name, icon: <User size={16} /> },
                                    { label: t.info.email, value: user.email, icon: <Mail size={16} /> },
                                    { label: t.info.phone, value: profile?.phone || '—', icon: <Phone size={16} /> },
                                    { label: dict.locale === 'id' ? 'Jenis Kelamin' : 'Gender', value: profile?.gender === 'L' ? (dict.locale === 'id' ? 'Laki-laki' : 'Male') : profile?.gender === 'P' ? (dict.locale === 'id' ? 'Perempuan' : 'Female') : '—', icon: <Heart size={16} /> },
                                    { label: t.info.birth, value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString(dict.locale === 'id' ? 'id-ID' : 'en-US', { day:'numeric', month:'long', year:'numeric' }) : '—', icon: <Calendar size={16} /> },
                                    { label: t.info.address, value: profile?.addressLine ? [profile.addressLine, profile.city, profile.province, profile.postalCode].filter(Boolean).join(', ') : '—', icon: <MapPin size={16} />, colSpan: 2 },
                                    { label: dict.locale === 'id' ? 'Metode Pembayaran Pilihan' : 'Preferred Payment Method', value: profile?.preferredPayment === 'BANK_TRANSFER' ? (dict.locale === 'id' ? 'Bank Transfer' : 'Bank Transfer') : 'QRIS', icon: <CreditCard size={16} />, colSpan: 2 },
                                    { label: dict.locale === 'id' ? 'Catatan Pesanan' : 'Order Notes', value: profile?.notes || '—', icon: <FileText size={16} />, colSpan: 2 },
                                ].map((item, i) => (
                                    <div key={i} style={{ gridColumn: (item as any).colSpan === 2 ? 'span 2' : 'span 1', padding: '1rem 1.25rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                                            {item.icon} {item.label}
                                        </div>
                                        <div style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

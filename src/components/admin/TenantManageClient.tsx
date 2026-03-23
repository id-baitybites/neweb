'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTenantAction, deleteTenantAction } from '@/actions/tenant'
import { toast } from 'sonner'
import { 
    Save, 
    Trash2, 
    ExternalLink, 
    ShieldCheck, 
    Package, 
    ShoppingCart, 
    Users, 
    ExternalLinkIcon,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Building2,
    Layers,
    Globe
} from 'lucide-react'

interface TenantManageClientProps {
    tenant: any
}

export default function TenantManageClient({ tenant }: TenantManageClientProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isActive, setIsActive] = useState(tenant.isActive)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        formData.append('isActive', isActive.toString())

        const result = await updateTenantAction(tenant.id, formData)
        if (result.success) {
            toast.success(result.message)
            router.refresh()
        } else {
            toast.error(result.error)
        }
        setIsSaving(false)
    }

    const handleDelete = async () => {
        if (!window.confirm(`PERINGATAN: Anda akan menghapus merchant ${tenant.name} secara permanen. Semua produk, pesanan, dan data lainnya akan hilang. Lanjutkan?`)) {
            return
        }

        setIsDeleting(true)
        const result = await deleteTenantAction(tenant.id)
        if (result.success) {
            toast.success(result.message)
            router.push('/super-admin')
        } else {
            toast.error(result.error)
            setIsDeleting(false)
        }
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Status & Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={statCardStyle}>
                        <Package size={20} color="#FF69B4" />
                        <div>
                            <div style={statValStyle}>{tenant._count.products}</div>
                            <div style={statLabelStyle}>Total Produk</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <ShoppingCart size={20} color="#4CAF50" />
                        <div>
                            <div style={statValStyle}>{tenant._count.orders}</div>
                            <div style={statLabelStyle}>Total Pesanan</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <Users size={20} color="#2196F3" />
                        <div>
                            <div style={statValStyle}>{tenant._count.users}</div>
                            <div style={statLabelStyle}>Total Team</div>
                        </div>
                    </div>
                </div>

                {/* Configuration Form */}
                <form onSubmit={handleSubmit} style={formBoxStyle}>
                    <div style={{ borderBottom: '1px solid #2a2a2a', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Konfigurasi Merchant</h2>
                        <span style={{ fontSize: '0.8rem', color: '#555' }}>ID: {tenant.id}</span>
                    </div>

                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={gridRowStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}><Building2 size={16} /> Nama Store</label>
                                <input name="name" type="text" defaultValue={tenant.name} required style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}><ShieldCheck size={16} /> Slug (Bospace Path)</label>
                                <input name="slug" type="text" defaultValue={tenant.slug} required style={inputStyle} />
                            </div>
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}><Globe size={16} /> Custom Domain (Optional)</label>
                            <input name="domain" type="text" defaultValue={tenant.domain || ''} placeholder="e.g. store.myshop.com" style={inputStyle} />
                        </div>

                        <div style={gridRowStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}><Layers size={16} /> Subscription Plan</label>
                                <select name="plan" defaultValue={tenant.plan} style={inputStyle}>
                                    <option value="FREE">FREE</option>
                                    <option value="STARTER">STARTER</option>
                                    <option value="PRO">PRO</option>
                                    <option value="ENTERPRISE">ENTERPRISE</option>
                                </select>
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Status Operasional</label>
                                <div 
                                    onClick={() => setIsActive(!isActive)}
                                    style={{
                                        ...toggleStyle,
                                        background: isActive ? '#1b5e20' : '#311111',
                                        borderColor: isActive ? '#4CAF50' : '#F44336'
                                    }}
                                >
                                    {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                    <span>{isActive ? 'Merchant Aktif' : 'Merchant Ditangguhkan'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{
                                    background: '#FF69B4',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem 2rem',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    boxShadow: '0 8px 20px rgba(255,105,180,0.35)'
                                }}
                            >
                                {isSaving ? 'Menyimpan...' : <><Save size={20} /> Simpan Perubahan</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Navigation Section */}
                <div style={sideBoxStyle}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <a 
                            href={`https://${tenant.domain || `${tenant.slug}.bitespace.netlify.app`}`} 
                            target="_blank" 
                            style={actionLinkStyle}
                        >
                            <div style={{ flex: 1, display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <ExternalLink size={18} /> Visit Storefront
                            </div>
                            <ExternalLinkIcon size={14} />
                        </a>
                        <a 
                            href={`/${tenant.slug}/admin`} 
                            target="_blank" 
                            style={actionLinkStyle}
                        >
                            <div style={{ flex: 1, display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <Building2 size={18} /> Visit Merchant Admin
                            </div>
                            <ExternalLinkIcon size={14} />
                        </a>
                    </div>
                </div>

                {/* Danger Zone */}
                <div style={{ ...sideBoxStyle, borderColor: '#311111', background: '#0a0a0a' }}>
                    <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <AlertTriangle size={18} />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Danger Zone</h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                        Tindakan ini permanen. Semua data store, pesanan, dan staff akan dihapus selamanya dari platform.
                    </p>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{
                            width: '100%',
                            background: '#311111',
                            color: '#ef4444',
                            border: '1px solid #7f1d1d',
                            padding: '0.9rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isDeleting ? 'Deleting...' : <><Trash2 size={18} /> Hapus Merchant</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// STYLES
const statCardStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
}

const statValStyle: React.CSSProperties = { fontSize: '1.8rem', fontWeight: 800, color: 'white' }
const statLabelStyle: React.CSSProperties = { fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }

const formBoxStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '20px',
    overflow: 'hidden'
}

const sideBoxStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '20px',
    padding: '1.5rem'
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    padding: '0.9rem',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
}

const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#888',
    marginBottom: '0.6rem'
}

const groupStyle: React.CSSProperties = { flex: 1 }
const gridRowStyle: React.CSSProperties = { display: 'flex', gap: '1.5rem' }

const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.8rem 1.25rem',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
    transition: 'all 0.2s'
}

const actionLinkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'background 0.2s, color 0.2s'
}

import React from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, Plus, Settings, Users, Package } from 'lucide-react'
import { PLATFORM_CONFIG } from '@/lib/config'
import { getDictionary } from '@/i18n'

export default async function SuperAdminPage() {
    const user = await getCurrentUser()
    const dict = await getDictionary()
    const t = dict.admin.super_admin

    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/')
    }

    const [tenants, usersCount] = await Promise.all([
        prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.user.count(),
    ])

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                            🏪 {PLATFORM_CONFIG.name} {t.title}
                        </h1>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>{t.desc}</p>
                    </div>
                    <Link
                        href="/super-admin/tenants/new"
                        style={{ background: '#FF69B4', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    >
                        <Plus size={18} /> {t.new_tenant}
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: t.stats.total_tenants, value: tenants.length, icon: <Building2 size={24} />, color: '#FF69B4' },
                        { label: t.stats.active_tenants, value: tenants.filter(t => t.isActive).length, icon: <Package size={24} />, color: '#4CAF50' },
                        { label: t.stats.total_users, value: usersCount, icon: <Users size={24} />, color: '#2196F3' },
                    ].map((stat) => (
                        <div key={stat.label} style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2a2a' }}>
                            <div style={{ color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stat.value}</div>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tenants Table */}
                <div style={{ background: '#1a1a1a', borderRadius: '15px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #2a2a2a' }}>
                        <h2 style={{ color: 'white' }}>{t.table.title}</h2>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#222' }}>
                                {[t.table.name, t.table.slug, t.table.domain, t.table.plan, t.table.status, t.table.actions].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                                    <td style={{ padding: '1rem 1.5rem', color: 'white', fontWeight: 600 }}>{tenant.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#FF69B4', fontFamily: 'monospace' }}>{tenant.slug}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#888' }}>{tenant.domain ?? '—'}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ background: '#2a2a2a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', color: '#aaa' }}>{tenant.plan}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ background: tenant.isActive ? '#1b5e20' : '#311111', color: tenant.isActive ? '#4CAF50' : '#F44336', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                            {tenant.isActive ? t.table.active : t.table.suspended}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <Link href={`/super-admin/tenants/${tenant.id}`} style={{ color: '#888', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                            <Settings size={14} /> {t.table.manage}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {tenants.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>
                                        {t.table.no_tenants} <Link href="/super-admin/tenants/new" style={{ color: '#FF69B4' }}>{t.table.create_first}</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

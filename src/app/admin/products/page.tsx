import React from 'react'
import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { Plus, Edit, Trash2, Tag, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import styles from '@/styles/modules/Admin.module.scss'

export default async function AdminProductsPage() {
    const tenant = await resolveTenant()
    if (!tenant) return <div>No tenant resolved</div>

    const products = await prisma.product.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className={styles.productsPage}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Daftar Produk</h1>
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>Kelola daftar menu dan ketersediaan produk Anda.</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: tenant.theme.primary, color: 'white', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600 }}>
                    <Plus size={18} /> Tambah Produk Baru
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem 2rem' }}>Produk</th>
                            <th style={{ padding: '1.2rem 2rem' }}>Kategori</th>
                            <th style={{ padding: '1.2rem 2rem' }}>Harga</th>
                            <th style={{ padding: '1.2rem 2rem' }}>Stok</th>
                            <th style={{ padding: '1.2rem 2rem' }}>Status</th>
                            <th style={{ padding: '1.2rem 2rem' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                    <Tag size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <span style={{ fontSize: '0.85rem', background: '#eef2ff', color: '#4f46e5', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                        {p.category || 'General'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 2rem', fontWeight: 600 }}>
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                                </td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <span style={{ color: p.stock <= 5 ? '#ef4444' : 'inherit', fontWeight: p.stock <= 5 ? 600 : 400 }}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem 2rem' }}>
                                    {p.isActive ? (
                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                            <Eye size={14} /> Aktif
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                            <EyeOff size={14} /> Draft
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Link href={`/admin/products/${p.id}`} style={{ color: '#2563eb' }}><Edit size={18} /></Link>
                                        <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Tag size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>Belum ada produk. Mulai dengan membuat produk pertama Anda!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

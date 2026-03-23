import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProductForm from '../../../../components/admin/ProductForm'

export default async function NewProductPage() {
    const tenant = await resolveTenant()
    if (!tenant) return <div>Tenant not resolved</div>

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href={`/${tenant.slug}/admin/products`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Kembali ke daftar produk
                </Link>
                <h1>Tambah Produk Baru</h1>
                <p style={{ color: '#888' }}>Isi formulir di bawah ini untuk menampilkan produk baru di toko Anda.</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <ProductForm tenant={tenant} />
            </div>
        </div>
    )
}

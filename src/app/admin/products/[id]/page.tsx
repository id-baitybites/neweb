import React from 'react'
import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductForm from '../../../../components/admin/ProductForm'

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const tenant = await resolveTenant()
    if (!tenant) return <div>Tenant not resolved</div>

    const product = await prisma.product.findUnique({
        where: { id, tenantId: tenant.id }
    })

    if (!product) {
        notFound()
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Kembali ke daftar produk
                </Link>
                <h1>Edit Produk: {product.name}</h1>
                <p style={{ color: '#888' }}>Perbarui detail produk Anda di bawah ini.</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <ProductForm tenant={tenant} product={product} />
            </div>
        </div>
    )
}

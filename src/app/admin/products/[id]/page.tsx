import React from 'react'
import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductForm from '../../../../components/admin/ProductForm'
import { getDictionary } from '@/i18n'

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.admin.product_form

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
                <Link href={`/${tenant.slug}/admin/products`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> {t.back}
                </Link>
                <h1>{t.edit_title}: {product.name}</h1>
                <p style={{ color: '#888' }}>{t.desc_hint}</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <ProductForm tenant={tenant} product={product} dict={dict} />
            </div>
        </div>
    )
}

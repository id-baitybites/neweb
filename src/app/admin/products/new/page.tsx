import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProductForm from '../../../../components/admin/ProductForm'
import { getDictionary } from '@/i18n'

export default async function NewProductPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.admin.product_form

    if (!tenant) return <div>Tenant not resolved</div>

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href={`/${tenant.slug}/admin/products`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> {t.back}
                </Link>
                <h1>{t.add_title}</h1>
                <p style={{ color: '#888' }}>{t.desc_hint}</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <ProductForm tenant={tenant} dict={dict} />
            </div>
        </div>
    )
}

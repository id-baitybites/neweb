import React from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { resolveTenant } from '@/lib/tenant'
import { getDictionary } from '@/i18n'

export default async function OrderSuccessPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.order_success
    const prefix = tenant ? `/${tenant.slug}` : ''

    return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <CheckCircle size={80} color="#4CAF50" style={{ marginBottom: '2rem' }} />
            <h1 style={{ marginBottom: '1rem' }}>{t.title}</h1>
            <p style={{ color: '#888', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                {t.desc}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href={`${prefix}/`} className="btn-primary">
                    {t.back_home}
                </Link>
                <Link href={`${prefix}/profile`} style={{ padding: '0.8rem 1.5rem', border: '1px solid #ddd', borderRadius: '12px', color: '#666', fontWeight: 700, textDecoration: 'none' }}>
                    {t.view_history}
                </Link>
            </div>
        </div>
    )
}

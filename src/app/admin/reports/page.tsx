import React from 'react'
import { SalesChart, CategoryPie } from '@/components/admin/ReportCharts'
import { getDictionary } from '@/i18n'
import { resolveTenant } from '@/lib/tenant'
import { getSafeCurrency } from '@/lib/config'

export default async function ReportsPage() {
    const dict = await getDictionary()
    const tenant = await resolveTenant()
    const r = dict.admin.reports

    if (!tenant) return <div>No active store found</div>

    const formatPrice = (price: number) => {
        const currencyCode = getSafeCurrency(tenant.config?.currency || 'IDR')
        return new Intl.NumberFormat(tenant.config?.language || 'id-ID', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div>
            <h1>{r.title}</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>{r.desc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{r.sales_trend}</h3>
                    <div style={{ height: '300px' }}>
                        <SalesChart dict={dict} />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{r.product_dist}</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <CategoryPie dict={dict} />
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{r.margin_summary}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{r.net_revenue}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4CAF50' }}>{formatPrice(35400000)}</div>
                    </div>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{r.cogs}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#F44336' }}>{formatPrice(12800000)}</div>
                    </div>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{r.profit_margin}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FF69B4' }}>63.8%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

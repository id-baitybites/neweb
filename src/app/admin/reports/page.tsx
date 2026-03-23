import React from 'react'
import { SalesChart, CategoryPie } from '@/components/admin/ReportCharts'
import styles from '@/styles/modules/Admin.module.scss'

export default function ReportsPage() {
    return (
        <div>
            <h1>Laporan Penjualan</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Analisis performa bisnis Bitespace.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Tren Penjualan Mingguan</h3>
                    <div style={{ height: '300px' }}>
                        <SalesChart />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Distribusi Produk</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <CategoryPie />
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Ringkasan Margin Profit</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Revenue Bersih</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4CAF50' }}>Rp 35.400.000</div>
                    </div>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Biaya Bahan (COGS)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#F44336' }}>Rp 12.800.000</div>
                    </div>
                    <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Profit Margin</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FF69B4' }}>63.8%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

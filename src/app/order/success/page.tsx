'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle, ShoppingBag } from 'lucide-react'

export default function OrderSuccessPage() {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <CheckCircle size={80} color="#4CAF50" style={{ marginBottom: '2rem' }} />
            <h1 style={{ marginBottom: '1rem' }}>Pesanan Berhasil!</h1>
            <p style={{ color: '#888', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Terima kasih telah memesan. Dapur kami telah menerima pesanan Anda dan akan segera memprosesnya.
                Anda akan menerima notifikasi via email/WhatsApp saat pesanan siap.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/" className="btn-primary">
                    Kembali ke Beranda
                </Link>
                <Link href="/profile" style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    Lihat Riwayat Pesanan
                </Link>
            </div>
        </div>
    )
}

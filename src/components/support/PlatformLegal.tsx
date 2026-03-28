import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Scale, Database, Gavel, BarChart, Server } from 'lucide-react'
import styles from '@/styles/modules/Legal.module.scss'

interface PlatformLegalProps {
    isIndo: boolean
    type: 'terms' | 'privacy'
}

export function PlatformLegal({ isIndo, type }: PlatformLegalProps) {
    if (type === 'privacy') {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} /> {isIndo ? 'Kembali ke Beranda' : 'Back to Home'}
                </Link>

                <div className={styles.header}>
                    <div className={styles.icon} style={{ background: '#6366f1' }}>
                        <Database size={32} />
                    </div>
                    <h1>{isIndo ? 'Kebijakan Privasi Bitespace Platform' : 'Bitespace Platform Privacy Policy'}</h1>
                    <p>{isIndo ? 'Privasi data merchant & keamanan sistem' : 'Merchant data privacy & system security'}</p>
                </div>

                <div className={styles.card}>
                    <section>
                        <h2>1. {isIndo ? 'Data Merchant' : 'Merchant Data'}</h2>
                        <p>{isIndo ? 'Kami mengumpulkan data bisnis Anda untuk keperluan validasi, penagihan, dan manajemen infrastruktur toko online.' : 'We collect your business data for validation, billing, and online store infrastructure management.'}</p>
                    </section>
                    <section>
                        <h2>2. {isIndo ? 'Pihak Ketiga' : 'Third Party Integrations'}</h2>
                        <p>{isIndo ? 'Kami menggunakan layanan pihak ketiga seperti Midtrans untuk pembayaran dan Cloudinary untuk gambar dengan keamanan tingkat tinggi.' : 'We use third-party services like Midtrans for payments and Cloudinary for images with high-level security.'}</p>
                    </section>
                    <div className={styles.footerActions}>
                        <p>{isIndo ? 'Pertanyaan hukum platform?' : 'Platform legal questions?'} {isIndo ? 'Email tim legal kami di' : 'Email our legal team at'}{' '}
                           <a href="mailto:legal@bitespace.id" style={{ color: '#6366f1' }}>legal@bitespace.id</a>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={18} /> {isIndo ? 'Kembali ke Beranda' : 'Back to Home'}
            </Link>

            <div className={styles.header}>
                <div className={styles.icon} style={{ background: '#6d28d9' }}>
                    <Gavel size={32} />
                </div>
                <h1>{isIndo ? 'Syarat Ketentuan Bitespace Platform' : 'Bitespace Platform Terms of Service'}</h1>
                <p>{isIndo ? 'Perjanjian penggunaan SaaS bagi Merchant' : 'Merchant SaaS Agreement Terms'}</p>
            </div>

            <div className={styles.card}>
                <section>
                    <h2><Server size={20} /> {isIndo ? 'Ketentuan Hosting & uptime' : 'Hosting & Uptime SLA'}</h2>
                    <p>{isIndo ? 'Kami menjamin ketersediaan layanan 99.9% untuk infrastruktur platform kami. Pemeliharaan rutin akan diberitahukan sebelumnya melalui dashboard admin.' : 'We guarantee 99.9% service availability for our platform infrastructure. Routine maintenance will be notified in advance via the admin dashboard.'}</p>
                </section>
                <section>
                    <h2><BarChart size={20} /> {isIndo ? 'Biaya Berlangganan' : 'Subscription Fees'}</h2>
                    <p>{isIndo ? 'Biaya berlangganan dan biaya transaksi (jika ada) akan dikenakan sesuai paket yang Anda pilih saat mendaftar. Kegagalan pembayaran dapat menyebabkan penghentian sementara akses admin.' : 'Subscription fees and transaction fees (if any) will be charged according to the plan you chosen during registration. Payment failure may lead to temporary admin access suspension.'}</p>
                </section>
                <div className={styles.footerActions}>
                    <p>{isIndo ? 'Butuh bantuan akun admin?' : 'Need admin account support?'} {isIndo ? 'Kunjungi Pusat Bantuan Bitespace.' : 'Visit Bitespace Help Center.'}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                         <Link href="/help" style={{ color: '#6366f1', fontWeight: 700 }}>Bitespace Support Center</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

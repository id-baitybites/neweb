import React from 'react'
import Link from 'next/link'
import { Search, Rocket, BarChart2, Shield, Settings, ArrowRight, MessageCircle, HelpCircle, Code, Globe, UserPlus } from 'lucide-react'
import styles from '@/styles/modules/Help.module.scss'

export function PlatformHelp({ dict }: { dict: any }) {
    const isIndo = dict.locale === 'id'
    
    const platformCategories = [
        { icon: <Rocket size={24} />, label: isIndo ? 'Memulai' : 'Getting Started', color: '#6366f1' },
        { icon: <Settings size={24} />, label: isIndo ? 'Manajemen Toko' : 'Store Management', color: '#10b981' },
        { icon: <Shield size={24} />, label: isIndo ? 'Keamanan & Akun' : 'Security & Account', color: '#f59e0b' },
        { icon: <BarChart2 size={24} />, label: isIndo ? 'Laporan & Analitik' : 'Reports & Analytics', color: '#8b5cf6' },
        { icon: <Code size={24} />, label: isIndo ? 'Developer API' : 'Developer API', color: '#0ea5e9' },
        { icon: <Globe size={24} />, label: isIndo ? 'Domain Kustom' : 'Custom Domains', color: '#ec4899' },
    ]

    const platformFaqs = [
        {
            q: isIndo ? 'Bagaimana cara menambahkan domain kustom?' : 'How do I add a custom domain?',
            a: isIndo ? 'Buka Pengaturan Admin > Domain. Masukkan nama domain Anda dan ikuti langkah-langkah verifikasi DNS yang disediakan.' : 'Go to Admin Settings > Domains. Enter your domain name and follow the provided DNS verification steps.'
        },
        {
            q: isIndo ? 'Apakah Bitespace memiliki biaya transaksi?' : 'Does Bitespace have transaction fees?',
            a: isIndo ? 'Biaya transaksi tergantung pada paket langganan Anda. Paket Pro dan Enterprise memiliki biaya transaksi yang lebih rendah.' : 'Transaction fees depend on your subscription plan. Pro and Enterprise plans offer lower transaction fees.'
        },
        {
            q: isIndo ? 'Bagaimana cara mengintegrasikan pembayaran Midtrans?' : 'How do I integrate Midtrans payments?',
            a: isIndo ? 'Anda hanya perlu memasukkan Client Key dan Server Key Midtrans Anda di Pengaturan Admin > Pembayaran.' : 'Simply enter your Midtrans Client Key and Server Key in Admin Settings > Payments.'
        }
    ]

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.chip}>{isIndo ? 'Pusat Bantuan Merchant' : 'Merchant Support Center'}</div>
                <h1>{isIndo ? 'Bangun Bisnis Anda di Bitespace' : 'Build Your Business on Bitespace'}</h1>
                <p>{isIndo ? 'Temukan panduan lengkap untuk memaksimalkan potensi toko online Anda.' : 'Find complete guides to maximize your online store potential.'}</p>
                
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input type="text" placeholder={isIndo ? 'Cari panduan admin...' : 'Search admin guides...'} />
                    <button type="button">{isIndo ? 'Cari' : 'Search'}</button>
                </div>
            </header>

            <div className={styles.categories} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {platformCategories.map((cat, i) => (
                    <div key={i} className={styles.catCard} style={{ padding: '2rem 1.5rem' }}>
                        <div className={styles.icon} style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                        <h3 style={{ fontSize: '1rem' }}>{cat.label}</h3>
                    </div>
                ))}
            </div>

            <div className={styles.faqSection}>
                <h2>{isIndo ? 'Pertanyaan Populer Merchant' : 'Popular Merchant FAQs'}</h2>
                <div className={styles.faqList}>
                    {platformFaqs.map((faq, i) => (
                        <div key={i} className={styles.faqItem}>
                            <h4>{faq.q}</h4>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <section className={styles.cta}>
                <div className={styles.ctaBlob} />
                <h2>{isIndo ? 'Butuh bantuan teknis?' : 'Need technical support?'}</h2>
                <p>{isIndo ? 'Tim developer kami siap membantu integrasi dan masalah teknis Anda.' : 'Our developer team is ready to help with your integrations and technical issues.'}</p>
                <div className={styles.actions}>
                    <a href="mailto:support@bitespace.id" className={`${styles.btn} ${styles.email}`}>
                        <HelpCircle size={20} /> {isIndo ? 'Email BITESPACE Support' : 'Email BITESPACE Support'}
                    </a>
                    <Link href="/onboarding" className={`${styles.btn} ${styles.whatsapp}`} style={{ background: '#6366f1' }}>
                        <UserPlus size={20} /> {isIndo ? 'Daftar Merchant Baru' : 'Register New Merchant'}
                    </Link>
                </div>
            </section>
        </div>
    )
}

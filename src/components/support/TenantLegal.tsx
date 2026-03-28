import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import styles from '@/styles/modules/Legal.module.scss'

interface TenantLegalProps {
    tenant: any
    isIndo: boolean
    type: 'terms' | 'privacy'
    primaryColor: string
    tenantPath: string  // '' on custom domain, '/{slug}' on shared domain
}

export function TenantLegal({ tenant, isIndo, type, primaryColor, tenantPath }: TenantLegalProps) {
    const backHref = `${tenantPath}/`

    if (type === 'privacy') {
        return (
            <div className={styles.container}>
                <Link href={backHref} className={styles.backLink}>
                    <ArrowLeft size={18} /> {isIndo ? 'Kembali ke Beranda' : 'Back to Home'}
                </Link>

                <div className={styles.header}>
                    <div className={styles.icon} style={{ background: primaryColor }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1>{isIndo ? `Kebijakan Privasi ${tenant.name}` : `${tenant.name} Privacy Policy`}</h1>
                    <p>{isIndo ? 'Terakhir diperbarui' : 'Last updated'}: {new Date().toLocaleDateString(isIndo ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className={styles.card}>
                    <section>
                        <h2>1. {isIndo ? 'Data Pelanggan' : 'Customer Data'}</h2>
                        <p>
                            {isIndo 
                                ? `Sebagai pelanggan ${tenant.name}, kami mengumpulkan data Anda (nama, email, nomor telepon, dan alamat pengiriman) semata-mata untuk memproses pesanan dan pengiriman dengan aman.`
                                : `As a customer of ${tenant.name}, we collect your data (name, email, phone number, and shipping address) solely to process orders and shipments securely.`}
                        </p>
                    </section>
                    <section>
                        <h2>2. {isIndo ? 'Keamanan Pembayaran' : 'Payment Security'}</h2>
                        <p>
                            {isIndo
                                ? 'Pembayaran Anda diproses melalui sistem yang aman dan terenkripsi. Kami tidak pernah menyimpan detail kartu atau informasi login perbankan Anda.'
                                : 'Your payment is processed through a secure, encrypted system. We never store your card details or banking login information.'}
                        </p>
                    </section>
                    <section>
                        <h2>3. {isIndo ? 'Hak Anda' : 'Your Rights'}</h2>
                        <p>
                            {isIndo
                                ? 'Anda dapat meminta penghapusan data Anda kapan saja dengan menghubungi kami melalui email atau WhatsApp.'
                                : 'You may request the deletion of your data at any time by contacting us via email or WhatsApp.'}
                        </p>
                    </section>
                    <div className={styles.footerActions}>
                        <p>
                            {isIndo ? 'Pertanyaan tentang data Anda?' : 'Questions about your data?'}{' '}
                            {isIndo ? 'Hubungi admin kami di' : 'Contact our admin at'}{' '}
                            {tenant?.theme?.contact?.email ? (
                                <a href={`mailto:${tenant.theme.contact.email}`} style={{ color: primaryColor }}>
                                    {tenant.theme.contact.email}
                                </a>
                            ) : (
                                <span style={{ color: '#94a3b8' }}>{isIndo ? '(email belum diatur)' : '(email not set)'}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // type === 'terms'
    return (
        <div className={styles.container}>
            <Link href={backHref} className={styles.backLink}>
                <ArrowLeft size={18} /> {isIndo ? 'Kembali ke Beranda' : 'Back to Home'}
            </Link>

            <div className={styles.header}>
                <div className={styles.icon} style={{ background: primaryColor }}>
                    <Scale size={32} />
                </div>
                <h1>{isIndo ? `Syarat & Ketentuan ${tenant.name}` : `${tenant.name} Terms & Conditions`}</h1>
                <p>{isIndo ? 'Aturan belanja dan layanan kami' : 'Our shopping rules & services'}</p>
            </div>

            <div className={styles.card}>
                <section>
                    <h2>1. {isIndo ? 'Penerimaan Ketentuan' : 'Acceptance of Terms'}</h2>
                    <p>
                        {isIndo
                            ? `Dengan melakukan pemesanan di ${tenant.name}, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.`
                            : `By placing an order at ${tenant.name}, you agree to be bound by these Terms and Conditions.`}
                    </p>
                </section>
                <section>
                    <h2>2. <Truck size={18} style={{ display: 'inline', marginRight: '0.4rem' }} />{isIndo ? 'Kebijakan Pengiriman' : 'Shipping Policy'}</h2>
                    <p>
                        {isIndo
                            ? `Pesanan akan diproses setelah konfirmasi pembayaran diterima. Biaya pengiriman berlaku sesuai zona area yang ditetapkan oleh ${tenant.name}.`
                            : `Orders are processed after payment confirmation is received. Shipping fees apply per the delivery zones set by ${tenant.name}.`}
                    </p>
                </section>
                <section>
                    <h2>3. <RotateCcw size={18} style={{ display: 'inline', marginRight: '0.4rem' }} />{isIndo ? 'Pembatalan & Pengembalian' : 'Cancellations & Returns'}</h2>
                    <p>
                        {isIndo
                            ? 'Pesanan yang sudah diproses tidak dapat dibatalkan. Jika produk yang diterima rusak atau tidak sesuai, harap lampirkan dokumentasi foto/video untuk klaim penggantian dalam 24 jam sejak produk diterima.'
                            : 'Orders that have been processed cannot be cancelled. If the product received is damaged or incorrect, please provide photo/video documentation for a replacement claim within 24 hours of receiving the product.'}
                    </p>
                </section>
                <div className={styles.footerActions}>
                    <p>{isIndo ? 'Butuh bantuan pesanan?' : 'Need order help?'}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {tenant?.theme?.socialLinks?.whatsapp && (
                            <a href={`https://wa.me/${tenant.theme.socialLinks.whatsapp}`} style={{ color: '#25D366', fontWeight: 700 }}>
                                WhatsApp {tenant.name}
                            </a>
                        )}
                        {tenant?.theme?.contact?.email && (
                            <a href={`mailto:${tenant.theme.contact.email}`} style={{ color: primaryColor, fontWeight: 700 }}>
                                Email {tenant.name}
                            </a>
                        )}
                        <Link href={`${tenantPath}/help`} style={{ color: primaryColor, fontWeight: 700 }}>
                            {isIndo ? 'Pusat Bantuan' : 'Help Center'} →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

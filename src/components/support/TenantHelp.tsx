import React from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Truck, UserCheck, Briefcase, ArrowRight, MessageCircle, HelpCircle } from 'lucide-react'
import styles from '@/styles/modules/Help.module.scss'

export function TenantHelp({ tenant, dict, tenantPath }: { tenant: any, dict: any, tenantPath: string }) {
    const t = dict.help
    const isIndo = dict.locale === 'id'
    const primaryColor = tenant?.theme?.primary || '#4f46e5'
    
    const categories = [
        { icon: <ShoppingBag size={28} />, label: t.categories.order, color: '#4f46e5' },
        { icon: <Truck size={28} />, label: t.categories.delivery, color: '#10b981' },
        { icon: <UserCheck size={28} />, label: t.categories.account, color: '#f59e0b' },
        { icon: <Briefcase size={28} />, label: t.categories.business, color: '#8b5cf6' },
    ]

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.chip}>{isIndo ? 'Pusat Bantuan Pelanggan' : 'Customer Support'}</div>
                <h1>{isIndo ? 'Ada yang bisa kami bantu?' : 'How can we help you today?'}</h1>
                <p>{isIndo ? `Temukan semua informasi yang Anda butuhkan untuk pengalaman terbaik di ${tenant.name}.` : `Find all the information you need for the best experience at ${tenant.name}.`}</p>
                
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input type="text" placeholder={t.search_placeholder} />
                    <button type="button">{isIndo ? 'Cari' : 'Search'}</button>
                </div>
            </header>

            <div className={styles.categories}>
                {categories.map((cat, i) => (
                    <div key={i} className={styles.catCard}>
                        <div className={styles.icon} style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                        <h3>{cat.label}</h3>
                    </div>
                ))}
            </div>

            <div className={styles.faqSection}>
                <h2>{isIndo ? 'Pertanyaan Sering Diajukan' : 'Frequently Asked Questions'}</h2>
                <div className={styles.faqList}>
                    {tenant?.theme?.faq1_q && (
                        <div className={styles.faqItem}>
                            <h4>{tenant.theme.faq1_q}</h4>
                            <p>{tenant.theme.faq1_a}</p>
                        </div>
                    )}
                    {t.faqs.map((faq: any, i: number) => (
                        <div key={i} className={styles.faqItem}>
                            <h4>{faq.q}</h4>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <section className={styles.cta}>
                <div className={styles.ctaBlob} />
                <h2>{isIndo ? 'Masih butuh bantuan?' : 'Still need help?'}</h2>
                <p>{isIndo ? `Tim kami di ${tenant.name} siap membantu Anda.` : `Our team at ${tenant.name} is here to assist you.`}</p>
                <div className={styles.actions}>
                    <a href={tenant?.theme?.contact?.email ? `mailto:${tenant.theme.contact.email}` : '#'} className={`${styles.btn} ${styles.email}`}>
                        <HelpCircle size={20} /> {isIndo ? 'Email Dukungan' : 'Email Support'}
                    </a>
                    <a href={tenant?.theme?.socialLinks?.whatsapp ? `https://wa.me/${tenant.theme.socialLinks.whatsapp}` : '#'} className={`${styles.btn} ${styles.whatsapp}`}>
                        <MessageCircle size={20} /> {isIndo ? 'WhatsApp Store' : 'WhatsApp Store'}
                    </a>
                </div>
            </section>
        </div>
    )
}

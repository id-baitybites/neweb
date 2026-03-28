import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { Check, Zap, Shield, Building2, Star } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary } from '@/i18n'
import styles from '@/styles/modules/Pricing.module.scss'

export const metadata: Metadata = {
    title: 'Pricing | Bitespace SaaS Platform',
    description: 'Pilih paket yang tepat untuk pertumbuhan bisnis Anda.',
}

export default async function PricingPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.pricing

    if (tenant) {
        redirect('/')
    }

    const plans: any[] = [
        {
            ...t.plans.free,
            icon: <Zap size={40} color="#4F46E5" />,
            color: '#4F46E5',
            accent: 'rgba(79, 70, 229, 0.05)'
        },
        {
            ...t.plans.starter,
            popular: true,
            icon: <Star size={40} color="#FF69B4" />,
            color: '#FF69B4',
            accent: 'rgba(255, 105, 180, 0.05)'
        },
        {
            ...t.plans.pro,
            icon: <Shield size={40} color="#0EA5E9" />,
            color: '#0EA5E9',
            accent: 'rgba(14, 165, 233, 0.05)'
        },
        {
            ...t.plans.enterprise,
            icon: <Building2 size={40} color="#1E293B" />,
            color: '#1E293B',
            accent: 'rgba(30, 41, 59, 0.05)'
        }
    ]

    return (
        <div className={styles.pricingWrap}>
            <div className={styles.pricingContainer}>
                {/* Header */}
                <div className={styles.pricingHeader}>
                    <h1>
                        {t.title_main} <span>{t.title_highlight}</span>
                    </h1>
                    <p>{t.subtitle}</p>
                </div>

                {/* Pricing Grid */}
                <div className={styles.pricingGrid}>
                    {plans.map((p) => (
                        <div 
                            key={p.name} 
                            className={`${styles.pricingCard} ${p.popular ? styles.popular : ''}`}
                            style={{ 
                                '--plan-color': p.color,
                                '--plan-accent': p.accent
                            } as React.CSSProperties}
                        >
                            {p.popular && (
                                <div className={styles.popularBadge}>
                                    {t.popular_badge}
                                </div>
                            )}

                            <div>
                                <div className={styles.iconBox}>
                                    {p.icon}
                                </div>
                                <h2>{p.name}</h2>
                                <div className={styles.priceArea}>
                                    <span className={styles.price}>{p.price}</span>
                                    {p.period && <span className={styles.period}>{p.period}</span>}
                                </div>
                                <p className={styles.description}>
                                    {p.desc}
                                </p>
                            </div>

                            <ul className={styles.featuresList}>
                                {p.features.map((f: string, i: number) => (
                                    <li key={i}>
                                        <div className={styles.checkIcon}><Check size={18} /></div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link 
                                href={`/onboarding?plan=${p.name.toLowerCase()}`} 
                                className={styles.planBtn}
                            >
                                {p.btn}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className={styles.pricingFooter}>
                    {t.custom_ask} <Link href="/contact">{t.discuss}</Link>
                </div>
            </div>
        </div>
    )
}

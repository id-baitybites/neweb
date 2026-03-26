import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { Check, Zap, Shield, Building2, Star } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary } from '@/i18n'

export const metadata: Metadata = {
    title: 'Pricing | Bitespace SaaS Platform',
    description: 'Pilih paket yang tepat untuk pertumbuhan bisnis Anda.',
}

export default async function PricingPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.pricing

    if (tenant) {
        // Redirect if someone tries to access platform pricing from a storefront
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
        <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '6rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        {t.title_main} <span style={{ color: '#4F46E5' }}>{t.title_highlight}</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748B', maxWidth: '700px', margin: '0 auto' }}>
                        {t.subtitle}
                    </p>
                </div>

                {/* Pricing Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                    {plans.map((p) => (
                        <div 
                            key={p.name} 
                            style={{ 
                                background: 'white', 
                                border: p.popular ? `2px solid ${p.color}` : '1px solid #E2E8F0', 
                                borderRadius: '24px', 
                                padding: '2.5rem', 
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                boxShadow: p.popular ? '0 20px 40px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.02)'
                            }}
                        >
                            {p.popular && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-15px', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    background: p.color, 
                                    color: 'white', 
                                    padding: '4px 20px', 
                                    borderRadius: '50px', 
                                    fontSize: '0.85rem', 
                                    fontWeight: 800,
                                    letterSpacing: '0.05em'
                                }}>
                                    {t.popular_badge}
                                </div>
                            )}

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ 
                                    background: p.accent, 
                                    width: '80px', height: '80px', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1.5rem' 
                                }}>
                                    {p.icon}
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#1E293B' }}>{p.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>{p.price}</span>
                                    {p.period && <span style={{ color: '#64748B', fontSize: '1rem' }}>{p.period}</span>}
                                </div>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '1rem', lineHeight: 1.5 }}>
                                    {p.desc}
                                </p>
                            </div>

                            <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {p.features.map((f: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#334155' }}>
                                            <div style={{ color: p.color, flexShrink: 0 }}><Check size={18} /></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link 
                                href={`/onboarding?plan=${p.name.toLowerCase()}`} 
                                style={{ 
                                    display: 'block', 
                                    textAlign: 'center', 
                                    background: p.color, 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    padding: '1.1rem', 
                                    borderRadius: '14px', 
                                    fontWeight: 700, 
                                    fontSize: '1rem',
                                    marginTop: 'auto'
                                }}
                            >
                                {p.btn}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Link or Note */}
                <div style={{ textAlign: 'center', marginTop: '5rem', color: '#64748B', fontSize: '1rem' }}>
                    {t.custom_ask} <Link href="/contact" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>{t.discuss}</Link>
                </div>
            </div>
        </div>
    )
}

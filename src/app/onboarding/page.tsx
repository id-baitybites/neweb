'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerMerchant } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Store, User, Mail, Lock, Globe, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams?.get('plan') || 'FREE'
    
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [newSlug, setNewSlug] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('plan', plan)

        const res = await registerMerchant(formData)
        if (res.success) {
            setNewSlug(res.slug!)
            setStep('success')
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    if (step === 'success') {
        return (
            <div style={pageStyle}>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#22C55E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Store Berhasil Dibuat!</h1>
                    <p style={{ color: '#64748B', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Selamat! Toko online Anda sedang disiapkan. Anda akan diarahkan ke dashboard admin dalam beberapa detik.
                    </p>
                    <Link 
                        href={`/admin`}
                        style={{ ...btnStyle, background: '#0F172A' }}
                    >
                        Buka Dashboard Admin <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', width: 60, height: 60, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Mulai Bisnis Anda</h1>
                    <p style={{ color: '#64748B' }}>Lengkapi data di bawah untuk meluncurkan store Anda.</p>
                    <div style={{ marginTop: '1rem', display: 'inline-block', background: '#F1F5F9', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5' }}>
                        PAKET: {plan.toUpperCase()}
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Store Info */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}><Store size={18} /> Informasi Toko</h2>
                        <div style={gridStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nama Toko</label>
                                <input name="name" type="text" required placeholder="e.g. Kedai Kopi Mantap" style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>URL Toko (Slug)</label>
                                <div style={{ position: 'relative' }}>
                                    <input name="slug" type="text" required placeholder="kedai-kopi" style={{ ...inputStyle, paddingRight: '100px' }} />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#94A3B8' }}>.bitespace</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}><User size={18} /> Akun Pemilik</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nama Lengkap</label>
                                <input name="ownerName" type="text" required placeholder="Nama Anda" style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Email Bisnis</label>
                                <input name="email" type="email" required placeholder="email@bisnis.com" style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Password</label>
                                <input name="password" type="password" required placeholder="Min. 8 karakter" minLength={8} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'Menyiapkan Store...' : 'Luncurkan Toko Saya Sekarang'}
                    </button>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
                        Dengan mendaftar, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi kami.
                    </p>
                </form>
            </div>
        </div>
    )
}

const pageStyle: React.CSSProperties = {
    minHeight: '100vh', padding: '4rem 1rem', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center'
}

const cardStyle: React.CSSProperties = {
    background: 'white', padding: '3.5rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '650px'
}

const sectionStyle: React.CSSProperties = {
    background: '#FDFDFD', border: '1px solid #F1F5F9', borderRadius: '20px', padding: '2rem'
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
}

const gridStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem'
}

const groupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
}

const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', fontWeight: 700, color: '#475569'
}

const inputStyle: React.CSSProperties = {
    padding: '0.85rem 1.1rem', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
}

const btnStyle: React.CSSProperties = {
    background: '#4F46E5', color: 'white', padding: '1.25rem', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem'
}

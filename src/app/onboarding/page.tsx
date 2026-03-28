'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerMerchant } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Store, User, Mail, Lock, Globe, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Briefcase } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams?.get('plan') || 'FREE'
    
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [newSlug, setNewSlug] = useState('')

    // Auto-focus on first input
    useEffect(() => {
        const input = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (input) input.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('plan', plan)

        try {
            const res = await registerMerchant(formData)
            if (res.success) {
                setNewSlug(res.slug!)
                setStep('success')
                toast.success('Pendaftaran berhasil!')
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <div style={pageStyle}>
                <div style={successCardStyle}>
                    <div style={celebrationIconContainer}>
                         <CheckCircle2 size={64} style={{ color: '#22C55E' }} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#0F172A' }}>
                        Siap Memulai! 🔥
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 3rem' }}>
                        Toko <b>{newSlug}</b> Anda telah berhasil dibuat. Silakan masuk ke Dashboard Admin untuk mulai berjualan.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/admin" style={primaryBtnStyle}>
                            Masuk ke Dashboard <ArrowRight size={20} />
                        </Link>
                        <Link href={`/${newSlug}`} style={secondaryBtnStyle}>
                            Lihat Toko Saya
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={badgeContainerStyle}>
                        <div style={badgeStyle}>
                            <Briefcase size={14} /> Paket: {plan.toUpperCase()}
                        </div>
                    </div>
                    
                    <div style={mainIconStyle}>
                        <ShieldCheck size={38} />
                    </div>
                    
                    <h1 style={titleStyle}>Mulai Bisnis Anda</h1>
                    <p style={subtitleStyle}>Hanya Butuh 30 Detik Untuk Meluncurkan Store Anda.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* Step 1: Store Details */}
                    <div style={sectionGroupStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={stepIndicatorStyle}>1</div>
                            <h2 style={sectionTitleStyle}>Informasi Toko</h2>
                        </div>
                        
                        <div style={gridStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nama Toko</label>
                                <div style={inputContainerStyle}>
                                    <Store size={18} style={inputIconStyle} />
                                    <input name="name" type="text" required placeholder="e.g. Kedai Kopi Mantap" style={inputStyle} />
                                </div>
                            </div>
                            
                            <div style={groupStyle}>
                                <label style={labelStyle}>URL Toko (Slug)</label>
                                <div style={inputContainerStyle}>
                                    <Globe size={18} style={inputIconStyle} />
                                    <input name="slug" type="text" required placeholder="kedai-kopi" style={{ ...inputStyle, paddingRight: '100px' }} />
                                    <span style={slugSuffixStyle}>.bitespace</span>
                                </div>
                                <p style={hintStyle}>Gunakan huruf kecil, angka, dan strip saja.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Owner Details */}
                    <div style={sectionGroupStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={stepIndicatorStyle}>2</div>
                            <h2 style={sectionTitleStyle}>Akun Pemilik</h2>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nama Lengkap</label>
                                <div style={inputContainerStyle}>
                                    <User size={18} style={inputIconStyle} />
                                    <input name="ownerName" type="text" required placeholder="Nama Anda" style={inputStyle} />
                                </div>
                            </div>
                            
                            <div style={gridTwoColsStyle}>
                                <div style={groupStyle}>
                                    <label style={labelStyle}>Email Bisnis</label>
                                    <div style={inputContainerStyle}>
                                        <Mail size={18} style={inputIconStyle} />
                                        <input name="email" type="email" required placeholder="email@bisnis.com" style={inputStyle} />
                                    </div>
                                </div>
                                
                                <div style={groupStyle}>
                                    <label style={labelStyle}>Password</label>
                                    <div style={inputContainerStyle}>
                                        <Lock size={18} style={inputIconStyle} />
                                        <input name="password" type="password" required placeholder="Min. 8 karakter" minLength={8} style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div style={{ marginTop: '1rem' }}>
                        <button type="submit" disabled={loading} style={loading ? { ...primaryBtnStyle, opacity: 0.7, cursor: 'not-allowed' } : primaryBtnStyle}>
                            {loading ? (
                                <><div className="spinner" /> Menyiapkan Store...</>
                            ) : (
                                <>Luncurkan Toko Saya Sekarang <ChevronRight size={20} /></>
                            )}
                        </button>
                        
                        <p style={footerTextStyle}>
                            Dengan mendaftar, Anda menyetujui <Link href="/terms" style={linkStyle}>Ketentuan Layanan</Link> & <Link href="/privacy" style={linkStyle}>Kebijakan Privasi</Link> kami.
                        </p>
                    </div>
                </form>
            </div>
            
            {/* Simple Background Decoration */}
            <div style={bgBlob1Style} />
            <div style={bgBlob2Style} />
        </div>
    )
}

// Styling Constants
const pageStyle: React.CSSProperties = {
    minHeight: '100vh', 
    padding: '4rem 1rem', 
    background: '#F8FAFC', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-family, Inter, sans-serif)'
}

const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)', 
    padding: '4rem', 
    borderRadius: '40px', 
    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.1)', 
    width: '100%', 
    maxWidth: '800px',
    position: 'relative',
    zIndex: 10,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.8)'
}

const successCardStyle: React.CSSProperties = {
    ...cardStyle,
    textAlign: 'center',
    maxWidth: '600px',
    padding: '5rem 3rem'
}

const celebrationIconContainer: React.CSSProperties = {
    width: 120, 
    height: 120, 
    borderRadius: '40px', 
    background: 'rgba(34, 197, 94, 0.08)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 2.5rem',
    transform: 'rotate(12deg)'
}

const badgeContainerStyle: React.CSSProperties = {
    marginBottom: '1.5rem', 
    display: 'flex', 
    justifyContent: 'center'
}

const badgeStyle: React.CSSProperties = {
    background: 'rgba(79, 70, 229, 0.08)', 
    padding: '6px 16px', 
    borderRadius: '100px', 
    fontSize: '0.75rem', 
    fontWeight: 800, 
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid rgba(79, 70, 229, 0.1)'
}

const mainIconStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)', 
    color: 'white', 
    width: 72, 
    height: 72, 
    borderRadius: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 2rem',
    boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.4)'
}

const titleStyle: React.CSSProperties = {
    fontSize: '2.75rem', 
    fontWeight: 900, 
    color: '#0F172A', 
    marginBottom: '0.75rem',
    letterSpacing: '-0.02em'
}

const subtitleStyle: React.CSSProperties = {
    color: '#64748B', 
    fontSize: '1.1rem',
    maxWidth: '450px',
    margin: '0 auto'
}

const sectionGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
}

const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem'
}

const stepIndicatorStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '8px',
    background: '#4F46E5',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.15rem', 
    fontWeight: 800, 
    color: '#1E293B', 
    margin: 0
}

const gridStyle: React.CSSProperties = {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '1.5rem'
}

const gridTwoColsStyle: React.CSSProperties = {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '1.5rem'
}

const groupStyle: React.CSSProperties = {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.6rem'
}

const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', 
    fontWeight: 700, 
    color: '#64748B',
    marginLeft: '0.25rem'
}

const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
}

const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '1.25rem',
    color: '#94A3B8'
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 1.25rem 1rem 3.5rem', 
    borderRadius: '16px', 
    border: '1px solid #E2E8F0', 
    outline: 'none', 
    transition: 'all 0.2s ease', 
    fontSize: '1rem',
    color: '#0F172A',
    background: '#FFFFFF',
    boxSizing: 'border-box'
}

const slugSuffixStyle: React.CSSProperties = {
    position: 'absolute', 
    right: '1.25rem', 
    fontSize: '0.9rem', 
    color: '#94A3B8',
    fontWeight: 600
}

const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#94A3B8',
    marginTop: '0.2rem',
    marginLeft: '0.25rem'
}

const primaryBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)', 
    color: 'white', 
    padding: '1.4rem', 
    borderRadius: '20px', 
    border: 'none', 
    fontWeight: 800, 
    fontSize: '1.1rem', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '0.75rem',
    boxShadow: '0 15px 35px -10px rgba(79, 70, 229, 0.5)',
    transition: 'transform 0.2s, box-shadow 0.2s'
}

const secondaryBtnStyle: React.CSSProperties = {
    ...primaryBtnStyle,
    background: 'transparent',
    color: '#4F46E5',
    border: '2px solid #E2E8F0',
    boxShadow: 'none',
    boxSizing: 'border-box'
}

const footerTextStyle: React.CSSProperties = {
    textAlign: 'center', 
    fontSize: '0.9rem', 
    color: '#94A3B8',
    marginTop: '2.5rem',
    lineHeight: 1.6
}

const linkStyle: React.CSSProperties = {
    color: '#4F46E5',
    textDecoration: 'none',
    fontWeight: 600
}

const bgBlob1Style: React.CSSProperties = {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '40vw',
    height: '40vw',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 1
}

const bgBlob2Style: React.CSSProperties = {
    position: 'absolute',
    bottom: '-10%',
    right: '-5%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 1
}

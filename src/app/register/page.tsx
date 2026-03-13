'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ShoppingBag, Star, Sparkles } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const [step, setStep] = useState<'info' | 'done'>('info')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await register(formData)
        if (result.success) {
            setStep('done')
            setTimeout(() => {
                router.push('/profile')
            }, 1800)
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    if (step === 'done') {
        return (
            <div style={pageStyle}>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 3rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF69B4, #FFB6C1)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                        <Star size={36} color="white" fill="white" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Selamat Datang!</h2>
                    <p style={{ color: '#888' }}>Akun Anda berhasil dibuat. Mengarahkan ke profil...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #FF69B4 0%, #8B4513 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(255,105,180,0.35)' }}>
                        <Sparkles size={30} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem', color: '#1a1a1a' }}>Buat Akun</h1>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Daftar gratis dan nikmati kemudahan berbelanja</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>Nama Lengkap</label>
                        <div style={inputWrapStyle}>
                            <User size={16} style={iconStyle} />
                            <input name="name" type="text" required placeholder="Nama Anda" style={inputStyle} />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>Email</label>
                        <div style={inputWrapStyle}>
                            <Mail size={16} style={iconStyle} />
                            <input name="email" type="email" required placeholder="email@contoh.com" style={inputStyle} />
                        </div>
                    </div>

                    {/* Phone */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>Nomor WhatsApp <span style={{ color: '#bbb', fontWeight: 400 }}>(opsional)</span></label>
                        <div style={inputWrapStyle}>
                            <Phone size={16} style={iconStyle} />
                            <input name="phone" type="tel" placeholder="08xxx" style={inputStyle} />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>Password</label>
                        <div style={inputWrapStyle}>
                            <Lock size={16} style={iconStyle} />
                            <input name="password" type={showPw ? 'text' : 'password'} required placeholder="Min. 8 karakter" style={{ ...inputStyle, paddingRight: '3rem' }} minLength={8} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div style={{ background: '#fff9fb', border: '1px solid #ffe0ef', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { icon: <ShoppingBag size={14} />, text: 'Riwayat pesanan tersimpan otomatis' },
                            { icon: <Star size={14} />, text: 'Checkout lebih cepat dengan data tersimpan' },
                            { icon: <Sparkles size={14} />, text: 'Akses promo & penawaran eksklusif member' },
                        ].map((b, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#666', fontSize: '0.85rem' }}>
                                <span style={{ color: '#FF69B4' }}>{b.icon}</span>
                                {b.text}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={submitStyle}
                        onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {loading ? 'Mendaftarkan...' : <><span>Buat Akun Sekarang</span><ArrowRight size={20} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    Sudah punya akun?{' '}
                    <Link href="/login" style={{ color: '#FF69B4', fontWeight: 700, textDecoration: 'none' }}>
                        Masuk di sini
                    </Link>
                </p>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff5f9 0%, #ffeaf5 50%, #f5f0ff 100%)',
    padding: '2rem',
}

const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '3rem',
    borderRadius: '28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '460px',
}

const groupStyle: React.CSSProperties = {
    marginBottom: '1.25rem',
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#333',
}

const inputWrapStyle: React.CSSProperties = {
    position: 'relative',
}

const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.95rem 1rem 0.95rem 2.8rem',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: '#fafafa',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
}

const submitStyle: React.CSSProperties = {
    width: '100%',
    padding: '1.1rem',
    background: 'linear-gradient(135deg, #FF69B4, #e55da0)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 800,
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    boxShadow: '0 8px 20px rgba(255,105,180,0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
}

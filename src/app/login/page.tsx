'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnUrl = searchParams?.get('returnUrl') || '/'
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await login(formData)
        if (result.success) {
            toast.success('Selamat datang kembali!')
            if (result.role === 'OWNER' || result.role === 'STAFF') {
                router.push('/admin')
            } else if (result.role === 'SUPER_ADMIN') {
                router.push('/super-admin')
            } else {
                router.push(returnUrl)
            }
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #FF69B4 0%, #8B4513 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(255,105,180,0.35)' }}>
                        <Sparkles size={30} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem', color: '#1a1a1a' }}>Selamat Datang</h1>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>Email</label>
                        <div style={inputWrapStyle}>
                            <Mail size={16} style={iconStyle} />
                            <input name="email" type="email" required placeholder="email@contoh.com" style={inputStyle} autoComplete="email" />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={groupStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={labelStyle}>Password</label>
                            {/* <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#FF69B4', textDecoration: 'none' }}>Lupa password?</Link> */}
                        </div>
                        <div style={inputWrapStyle}>
                            <Lock size={16} style={iconStyle} />
                            <input name="password" type={showPw ? 'text' : 'password'} required placeholder="••••••••" style={{ ...inputStyle, paddingRight: '3rem' }} autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={submitStyle}
                        onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {loading ? 'Memproses...' : <><span>Masuk</span><ArrowRight size={20} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    Belum punya akun?{' '}
                    <Link href="/register" style={{ color: '#FF69B4', fontWeight: 700, textDecoration: 'none' }}>
                        Daftar Gratis
                    </Link>
                </p>
            </div>
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
    maxWidth: '420px',
}

const groupStyle: React.CSSProperties = { marginBottom: '1.25rem' }

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#333',
    margin: 0,
}

const inputWrapStyle: React.CSSProperties = { position: 'relative', marginTop: '0.5rem' }

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
    marginTop: '1.5rem',
}

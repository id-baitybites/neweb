'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginClient({ dict, returnUrl }: { dict: any; returnUrl: string }) {
    const t = dict.auth
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)

    // Detect if we are on a tenant-prefixed path
    const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : []
    const isTenantPath = pathSegments.length > 0 && !['login', 'register', 'admin', 'profile'].includes(pathSegments[0])
    const tenantSlug = isTenantPath ? pathSegments[0] : null
    const prefix = tenantSlug ? `/${tenantSlug}` : ''

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await login(formData)
        if (result.success) {
            toast.success(t.toast_login_success)
            
            if (result.role === 'OWNER' || result.role === 'STAFF') {
                router.push(`${prefix}/admin`)
            } else if (result.role === 'SUPER_ADMIN') {
                router.push('/super-admin')
            } else {
                router.push(returnUrl || `${prefix}/profile`)
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
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem', color: '#1a1a1a' }}>{t.login_title}</h1>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>{t.login_desc}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={groupStyle}>
                        <label style={labelStyle}>{t.email}</label>
                        <div style={inputWrapStyle}>
                            <Mail size={16} style={iconStyle} />
                            <input name="email" type="email" required placeholder={t.email_placeholder} style={inputStyle} autoComplete="email" />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={groupStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={labelStyle}>{t.password}</label>
                        </div>
                        <div style={inputWrapStyle}>
                            <Lock size={16} style={iconStyle} />
                            <input name="password" type={showPw ? 'text' : 'password'} required placeholder={t.password_placeholder} style={{ ...inputStyle, paddingRight: '3rem' }} autoComplete="current-password" />
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
                        {loading ? t.btn_processing : <><span>{t.btn_login}</span><ArrowRight size={20} /></>}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>{t.or_divider}</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                </div>

                {/* Google Login Button Container */}
                <div id="google-login-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    {t.no_account}{' '}
                    <Link href={`${prefix}/register`} style={{ color: '#FF69B4', fontWeight: 700, textDecoration: 'none' }}>
                        {t.register_free}
                    </Link>
                </p>
            </div>
            
            {/* Google Logic */}
            <GoogleLogic returnUrl={returnUrl} dict={dict} />
        </div>
    )
}

function GoogleLogic({ returnUrl, dict }: { returnUrl: string; dict: any }) {
    const t = dict.auth
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const initGoogle = () => {
            const google = (window as any).google;
            if (google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
                google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: async (response: any) => {
                        const { loginWithGoogle } = await import('@/actions/google-auth');
                        const result = await loginWithGoogle(response.credential);
                        if (result.success) {
                            toast.success(t.toast_google_success)
                            
                            // Fix: Detect if we are on a tenant-prefixed path
                            const pathSegments = window.location.pathname.split('/').filter(Boolean)
                            const isTenantPath = pathSegments.length > 0 && !['login', 'register', 'admin', 'profile'].includes(pathSegments[0])
                            const tenantSlug = isTenantPath ? pathSegments[0] : null
                            const prefix = tenantSlug ? `/${tenantSlug}` : ''

                            if (result.needsProfileCompletion) {
                                router.push(`${prefix}/profile?step=complete`)
                                return
                            }
                            
                            if (result.role === 'OWNER' || result.role === 'STAFF') {
                                router.push(`${prefix}/admin`)
                            } else if (result.role === 'SUPER_ADMIN') {
                                router.push('/super-admin')
                            } else {
                                router.push(returnUrl || `${prefix}/profile`)
                            }
                        } else {
                            toast.error(result.error);
                        }
                    }
                });
                google.accounts.id.renderButton(
                    document.getElementById("google-login-btn"),
                    { theme: "outline", size: "large", width: 340, shape: "pill", text: "continue_with" }
                );
            }
        };

        const checkIntvl = setInterval(() => {
            if ((window as any).google) {
                initGoogle();
                clearInterval(checkIntvl);
            }
        }, 500);

        return () => clearInterval(checkIntvl);
    }, [router, returnUrl, t]);

    return null;
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

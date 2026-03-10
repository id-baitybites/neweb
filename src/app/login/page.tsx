'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/actions/auth'
import styles from '@/styles/modules/Auth.module.scss'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnUrl = searchParams?.get('returnUrl') || '/'
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await login(formData)

        if (result.success) {
            toast.success('Login berhasil!')
            if (result.role === 'OWNER' || result.role === 'STAFF') {
                router.push('/admin')
            } else {
                router.push(returnUrl)
            }
            setTimeout(() => window.location.reload(), 500) // Refresh to update navbar
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1>Selamat Datang</h1>
                <p>Masuk ke akun Baitybites Anda</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input name="email" type="email" required placeholder="email@contoh.com" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input name="password" type="password" required placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>
                </form>

                <div className={styles.switch}>
                    Belum punya akun? <Link href="/register">Daftar Sekarang</Link>
                </div>
            </div>
        </div>
    )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/actions/auth'
import styles from '@/styles/modules/Auth.module.scss'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await register(formData)

        if (result.success) {
            toast.success('Pendaftaran berhasil!')
            router.push('/')
            setTimeout(() => window.location.reload(), 500)
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1>Buat Akun</h1>
                <p>Gabung dengan Baitybites sekarang</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Nama Lengkap</label>
                        <input name="name" type="text" required placeholder="Nama Anda" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input name="email" type="email" required placeholder="email@contoh.com" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input name="password" type="password" required placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>
                </form>

                <div className={styles.switch}>
                    Sudah punya akun? <Link href="/login">Masuk</Link>
                </div>
            </div>
        </div>
    )
}

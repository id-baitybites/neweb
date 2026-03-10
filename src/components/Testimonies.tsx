'use client'

import { useState } from 'react'
import { Star, UserCircle2 } from 'lucide-react'
import styles from '@/styles/modules/Landing.module.scss'
import { submitTestimony } from '@/actions/testimony'
import { toast } from 'sonner'
import Link from 'next/link'

interface TestimonyItem {
    id: string
    content: string
    rating: number
    user: { name: string | null; email: string }
}

interface TestimoniesProps {
    tenantId: string | undefined
    userRole: string | undefined
    testimonies: TestimonyItem[]
}

export default function Testimonies({ tenantId, userRole, testimonies }: TestimoniesProps) {
    const [content, setContent] = useState('')
    const [rating, setRating] = useState(5)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tenantId) {
            toast.error('Gagal memuat tenant.')
            return
        }
        if (!content.trim()) {
            toast.error('Tuliskan testimoni Anda terlebih dahulu.')
            return
        }

        setIsSubmitting(true)
        const result = await submitTestimony(tenantId, content, rating)
        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Testimoni berhasil dikirim dan menunggu persetujuan admin.')
            setContent('')
            setRating(5)
        }
    }

    return (
        <div className={styles.section} id="testimonies">
            <div className={styles.header}>
                <h2>Testimoni Pelanggan</h2>
                <p>Pendapat Jujur Dari Pengguna Setia Kami</p>
            </div>

            <div className={styles.testimonyGrid}>
                {testimonies.length > 0 ? (
                    testimonies.map((item) => (
                        <div key={item.id} className={styles.testimonyCard}>
                            <div className={styles.rating}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < item.rating ? 'currentColor' : 'none'} color={i < item.rating ? 'currentColor' : '#CBD5E1'} />
                                ))}
                            </div>
                            <div className={styles.content}>"{item.content}"</div>
                            <div className={styles.user}>
                                <div className={styles.avatar}>{item.user.name ? item.user.name[0] : item.user.email[0].toUpperCase()}</div>
                                <div className={styles.info}>
                                    <h4>{item.user.name || 'Anonymous User'}</h4>
                                    <span>Verified Customer</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#A0AEC0', padding: '2rem' }}>
                        Belum ada testimoni.
                    </div>
                )}
            </div>

            {tenantId && userRole === 'CUSTOMER' && (
                <form onSubmit={handleSubmit} className={styles.addTestimony}>
                    <h3>Bagikan Pengalaman Anda</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={24}
                                cursor="pointer"
                                fill={star <= rating ? '#F59E0B' : 'transparent'}
                                color={star <= rating ? '#F59E0B' : '#E2E8F0'}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <textarea
                        placeholder="Tulis pendapat atau ulasan Anda di sini..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Testimoni'}
                    </button>
                </form>
            )}

            {tenantId && !userRole && (
                <div className={styles.addTestimony} style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: '#718096' }}>Ingin memberikan penilaian?</p>
                    <Link href="/login" className="btn-primary">Masuk Untuk Review</Link>
                </div>
            )}
        </div>
    )
}

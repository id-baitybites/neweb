import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tentang Kami',
}

export default async function AboutPage() {
    const tenant = await resolveTenant()

    return (
        <div className="container" style={{ padding: '4rem 1rem', minHeight: '60vh', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--color-secondary)' }}>
                Tentang {tenant?.name || 'StoreOS'}
            </h1>

            <div style={{ background: 'white', padding: '3rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {tenant ? (
                    <p style={{ marginBottom: '1rem' }}>
                        Selamat datang di <strong>{tenant.name}</strong>. Kami berkomitmen untuk memberikan layanan dan pengalaman belanja terbaik untuk Anda. Setiap produk yang kami tawarkan dibuat dengan dedikasi tinggi dan standar kualitas terbaik.
                    </p>
                ) : (
                    <p style={{ marginBottom: '1rem' }}>
                        Selamat datang! Platform ini dipersembahkan oleh StoreOS untuk memberikan pengalaman belanja yang mulus dan dapat diandalkan.
                    </p>
                )}
                <p>
                    Terima kasih telah mempercayakan kebutuhan Anda kepada kami. Jangan ragu untuk menghubungi tim kami apabila Anda memiliki pertanyaan atau masukan.
                </p>
            </div>
        </div>
    )
}

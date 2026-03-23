import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tentang Kami | Bitespace',
}

export default async function AboutPage() {
    const tenant = await resolveTenant()

    return (
        <div className="container" style={{ padding: '6rem 1rem', minHeight: '80vh', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span style={{ 
                    color: tenant?.theme?.primary || '#4F46E5', 
                    fontWeight: 700, 
                    display: 'block', 
                    marginBottom: '1rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase' 
                }}>
                    Tentang Kami
                </span>
                <h1 style={{ 
                    fontSize: '3rem', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    margin: 0,
                    lineHeight: 1.2
                }}>
                    Misi Kami di {tenant?.name || 'Bitespace'}
                </h1>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '4rem', 
                borderRadius: '32px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.06)', 
                color: '#475569', 
                lineHeight: 1.8,
                fontSize: '1.1rem'
            }}>
                {tenant ? (
                    <div>
                        <p style={{ marginBottom: '2rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 500 }}>
                            Selamat datang di <strong>{tenant.name}</strong>. Di sini, kami percaya bahwa setiap produk memiliki cerita unik untuk diceritakan.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Kami berdedikasi untuk menghadirkan kualitas terbaik dari setiap racikan dan kreasi yang kami hasilkan. Berdiri sebagai bagian dari ekosistem <strong>Bitespace</strong>, toko kami mengedepankan kemudahan transaksi, kecepatan pelayanan, dan tentu saja kepuasan Anda sebagai pelanggan setia.
                        </p>
                        <div style={{ 
                            padding: '2rem', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            margin: '2rem 0',
                            borderLeft: `6px solid ${tenant.theme.primary || '#4F46E5'}`
                        }}>
                            "Kepuasan pelanggan bukan sekadar tujuan, melainkan standar minimum bagi kebahagiaan kami."
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '2rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 500 }}>
                            <strong>Bitespace</strong> adalah platform SaaS multi-fungsi yang lahir untuk memberdayakan UMKM dan Merchant di seluruh Indonesia.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Kami memahami tantangan mengelola bisnis di era digital. Oleh karena itu, kami membangun infrastruktur yang tangguh, mudah digunakan, dan terintegrasi penuh—mulai dari manajemen produk, sistem inventori, hingga gerbang pembayaran otomatis.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Misi kami adalah membantu para pengusaha fokus pada apa yang mereka cintai: <strong>menciptakan produk luar biasa</strong>. Sementara urusan teknologi, biarkan kami yang menanganinya.
                        </p>
                        <div style={{ 
                            padding: '2rem', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            margin: '2rem 0',
                            borderLeft: '6px solid #4F46E5'
                        }}>
                            Kami percaya bahwa teknologi terbaik adalah teknologi yang mendemokrasikan peluang bagi siapa saja untuk sukses di pasar digital.
                        </div>
                    </div>
                )}
                
                <p style={{ marginTop: '2.5rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                    Terima kasih telah menjadi bagian dari perjalanan kami.
                </p>
            </div>
        </div>
    )
}

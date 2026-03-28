import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'
import { getDictionary } from '@/i18n'
import styles from '@/styles/modules/About.module.scss'
import { Target, Award, Users, Rocket, ArrowRight, ShieldCheck, Heart } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary()
    const tenant = await resolveTenant()
    const t = dict.about
    return {
        title: t.title.replace('{name}', tenant?.name || 'Bitespace'),
    }
}

export default async function AboutPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.about
    const isIndo = dict.locale === 'id'

    const primaryColor = tenant?.theme?.primary || '#4f46e5'

    return (
        <div className={styles.aboutWrapper}>
            {/* Background Decorations */}
            <div className={`${styles.blob} ${styles.blob1}`} style={{ background: primaryColor }} />
            <div className={`${styles.blob} ${styles.blob2}`} />

            <div className={styles.container}>
                {/* Hero Section */}
                <header className={styles.hero}>
                    <div className={styles.chip} style={{ background: `${primaryColor}15`, color: primaryColor }}>
                        {isIndo ? 'Tentang Kami' : 'About Us'}
                    </div>
                    <h1>
                        {isIndo ? 'Misi Kami di' : 'Our Mission at'} <span>{tenant?.name || 'Bitespace'}</span>
                    </h1>
                    <p>
                        {tenant 
                            ? (isIndo ? `Menghadirkan kelezatan dan cerita unik melalui setiap kreasi di ${tenant.name}.` : `Bringing deliciousness and unique stories through every creation at ${tenant.name}.`)
                            : (isIndo ? 'Memberdayakan UMKM Indonesia melalui teknologi e-commerce yang modern dan mudah digunakan.' : 'Empowering Indonesian SMEs through modern and easy-to-use e-commerce technology.')
                        }
                    </p>
                </header>

                {/* Main Content Card */}
                <div className={styles.mainCard}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#111827' }}>
                            {isIndo ? 'Cerita di Balik Layar' : 'The Story Behind'}
                        </h2>
                        
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#374151' }}>
                            {tenant ? (
                                isIndo 
                                    ? `Selamat datang di ${tenant.name}. Di sini, kami percaya bahwa setiap produk memiliki jiwa dan dedikasi tinggi dibalik pembuatannya.`
                                    : `Welcome to ${tenant.name}. Here, we believe that every product has a soul and high dedication behind its creation.`
                            ) : (
                                isIndo
                                    ? 'Bitespace berawal dari mimpi sederhana untuk mendemokrasikan teknologi retail bagi semua pelaku usaha, tanpa hambatan biaya dan teknis.'
                                    : 'Bitespace started from a simple dream to democratize retail technology for all business players, without cost or technical barriers.'
                            )}
                        </p>

                        <div className={styles.quoteSection} style={{ borderLeftColor: primaryColor }}>
                            {tenant ? (
                                isIndo
                                    ? "Kepuasan pelanggan bukan sekadar tujuan, melainkan standar minimum bagi kebahagiaan kami."
                                    : "Customer satisfaction is not just a goal, but the minimum standard for our happiness."
                            ) : (
                                isIndo
                                    ? "Kami percaya bahwa teknologi terbaik adalah teknologi yang mendemokrasikan peluang bagi siapa saja untuk sukses di pasar digital."
                                    : "We believe the best technology is that which democratizes opportunities for anyone to succeed in the digital marketplace."
                            )}
                        </div>

                        <p style={{ color: '#4b5563' }}>
                            {tenant ? t.story_desc : t.mission_desc}
                        </p>
                    </div>
                </div>

                {/* Values Grid */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        {isIndo ? 'Nilai-Nilai Utama' : 'Our Core Values'}
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        {isIndo ? 'Pilar yang menjaga integritas dan kualitas layanan kami.' : 'The pillars that maintain the integrity and quality of our service.'}
                    </p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.valueCard}>
                        <div className={styles.iconBox} style={{ color: primaryColor, background: `${primaryColor}15` }}>
                            <Target size={28} />
                        </div>
                        <h3>{isIndo ? 'Fokus Kualitas' : 'Quality Focus'}</h3>
                        <p>
                            {isIndo 
                                ? 'Setiap detail produk kami periksa dengan teliti untuk memastikan standar terbaik sampai ke tangan Anda.' 
                                : 'Every product detail is carefully inspected to ensure the best standards reach your hands.'}
                        </p>
                    </div>

                    <div className={styles.valueCard}>
                        <div className={styles.iconBox} style={{ color: primaryColor, background: `${primaryColor}15` }}>
                            <Users size={28} />
                        </div>
                        <h3>{isIndo ? 'Komunitas' : 'Community Driven'}</h3>
                        <p>
                            {isIndo 
                                ? 'Kami membangun hubungan yang erat dengan pelanggan dan mitra sebagai satu keluarga besar.' 
                                : 'We build close relationships with customers and partners as one big family.'}
                        </p>
                    </div>

                    <div className={styles.valueCard}>
                        <div className={styles.iconBox} style={{ color: primaryColor, background: `${primaryColor}15` }}>
                            <Award size={28} />
                        </div>
                        <h3>{isIndo ? 'Integritas' : 'Integrity'}</h3>
                        <p>
                            {isIndo 
                                ? 'Transparansi dan kejujuran dalam setiap proses bisnis adalah janji utama kami.' 
                                : 'Transparency and honesty in every business process are our primary promises.'}
                        </p>
                    </div>

                    {!tenant && (
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox} style={{ color: primaryColor, background: `${primaryColor}15` }}>
                                <Rocket size={28} />
                            </div>
                            <h3>{isIndo ? 'Inovasi' : 'Innovation'}</h3>
                            <p>
                                {isIndo 
                                    ? 'Selalu berada di garis depan teknologi untuk memberikan kemudahan bagi merchant kami.' 
                                    : 'Always at the forefront of technology to provide ease of use for our merchants.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <div className={styles.ctaBlob} style={{ background: primaryColor }} />
                    <h2>{isIndo ? 'Bergabung dalam Perjalanan Kami' : 'Join Our Journey'}</h2>
                    <p>
                        {isIndo 
                            ? 'Dapatkan penawaran terbaik dan nikmati pengalaman belanja premium hari ini.' 
                            : 'Get the best offers and enjoy a premium shopping experience today.'}
                    </p>
                    <Link href={tenant ? '/products' : '/onboarding'} className={styles.btn} style={{ background: primaryColor }}>
                        {tenant ? (isIndo ? 'Lihat Produk' : 'View Products') : (isIndo ? 'Mulai Sekarang' : 'Get Started')}
                        <ArrowRight size={20} />
                    </Link>
                </section>

                <footer style={{ marginTop: '5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} {tenant?.name || 'Bitespace'}. {isIndo ? 'Seluruh hak cipta dilindungi.' : 'All rights reserved.'}
                </footer>
            </div>
        </div>
    )
}

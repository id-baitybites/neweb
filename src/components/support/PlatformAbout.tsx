import React from 'react'
import Link from 'next/link'
import { Target, Award, Users, Rocket, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react'
import styles from '@/styles/modules/About.module.scss'

export function PlatformAbout({ isIndo }: { isIndo: boolean }) {
    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.chip}>{isIndo ? 'Mengenal Bitespace' : 'Get to Know Bitespace'}</div>
                <h1>{isIndo ? 'Misi Kami di' : 'Our Mission at'} <span>Bitespace</span></h1>
                <p>{isIndo ? 'Memberdayakan UMKM Indonesia melalui teknologi e-commerce yang modern, efisien dan mudah digunakan.' : 'Empowering Indonesian SMEs through modern, efficient, and easy-to-use e-commerce technology.'}</p>
            </header>

            <div className={styles.mainCard}>
                <div className={styles.cardInner}>
                    <h2>{isIndo ? 'Visi E-Commerce Masa Depan' : 'E-Commerce Vision for the Future'}</h2>
                    <p className={styles.intro}>{isIndo ? 'Bitespace berawal dari mimpi sederhana untuk mendemokrasikan teknologi retail bagi semua pelaku usaha, tanpa hambatan biaya dan teknis.' : 'Bitespace started from a simple dream to democratize retail technology for all business players, without cost or technical barriers.'}</p>
                    <div className={styles.quoteSection}>{isIndo ? "Kami percaya bahwa teknologi terbaik adalah teknologi yang mendemokrasikan peluang bagi siapa saja untuk sukses di pasar digital." : "We believe the best technology is that which democratizes opportunities for anyone to succeed in the digital marketplace."}</div>
                    <p className={styles.storyContent}>{isIndo ? 'Platform kami dirancang untuk skalabilitas, keamanan, dan pengalaman pengguna yang luar biasa. Kami hadir untuk membantu merchant fokus pada produk mereka, sementara kami menangani teknologinya.' : 'Our platform is designed for scalability, security, and an exceptional user experience. We are here to help merchants focus on their products while we handle the technology.'}</p>
                </div>
            </div>

            <div className={styles.valuesHeader}>
                <h2>{isIndo ? 'Pilar Inti Platform' : 'Core Platform Pillars'}</h2>
                <p>{isIndo ? 'Bagaimana kami membangun ekosistem digital yang kokoh.' : 'How we build a robust digital ecosystem.'}</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.valueCard}>
                     <div className={styles.iconBox}><Zap size={28} /></div>
                     <h3>{isIndo ? 'Kecepatan' : 'Performance'}</h3>
                     <p>{isIndo ? 'Infrastruktur dioptimalkan untuk akses super cepat di seluruh Indonesia.' : 'Infrastructure optimized for super-fast access across Indonesia.'}</p>
                </div>
                <div className={styles.valueCard}>
                     <div className={styles.iconBox}><ShieldCheck size={28} /></div>
                     <h3>{isIndo ? 'Keamanan' : 'Security'}</h3>
                     <p>{isIndo ? 'Sistem terisolasi dengan proteksi data merchant yang ketat.' : 'Isolated systems with strict merchant data protection.'}</p>
                </div>
                <div className={styles.valueCard}>
                     <div className={styles.iconBox}><Globe size={28} /></div>
                     <h3>{isIndo ? 'Skalabilitas' : 'Scalability'}</h3>
                     <p>{isIndo ? 'Siap menampung ribuan transaksi sekaligus tanpa hambatan.' : 'Ready to handle thousands of simultaneous transactions without bottlenecks.'}</p>
                </div>
            </div>

            <section className={styles.cta}>
                <div className={styles.ctaBlob} />
                <h2>{isIndo ? 'Siap Memulai Bisnis Digital Anda?' : 'Ready to Start Your Digital Business?'}</h2>
                <p>{isIndo ? 'Bergabunglah dengan ratusan merchant sukses lainnya di Bitespace.' : 'Join hundreds of other successful merchants on Bitespace.'}</p>
                <Link href="/onboarding" className={styles.btn}>
                    {isIndo ? 'Mulai Sekarang' : 'Get Started Now'} <ArrowRight size={20} />
                </Link>
            </section>
        </div>
    )
}

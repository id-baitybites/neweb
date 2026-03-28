import React from 'react'
import Link from 'next/link'
import { Target, Award, Users, ArrowRight } from 'lucide-react'
import styles from '@/styles/modules/About.module.scss'

export function TenantAbout({ tenant, isIndo, dict, tenantPath }: { tenant: any, isIndo: boolean, dict: any, tenantPath: string }) {
    const t = dict.about
    const primaryColor = tenant?.theme?.primary || '#4f46e5'

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.chip}>{isIndo ? 'Mengenal Toko Kami' : 'Get to Know Us'}</div>
                <h1>{isIndo ? 'Misi Kami di' : 'Our Mission at'} <span>{tenant.name}</span></h1>
                <p>{tenant?.theme?.aboutMission || (isIndo ? `Menghadirkan kelezatan dan cerita unik melalui setiap kreasi di ${tenant.name}.` : `Bringing deliciousness and unique stories through every creation at ${tenant.name}.`)}</p>
            </header>

            <div className={styles.mainCard}>
                <div className={styles.cardInner}>
                    <h2>{isIndo ? 'Cerita di Balik Layar' : 'The Story Behind'}</h2>
                    <p className={styles.intro}>{isIndo ? `Selamat datang di ${tenant.name}. Di sini, kami percaya bahwa setiap produk memiliki jiwa dan dedikasi tinggi dibalik pembuatannya.` : `Welcome to ${tenant.name}. Here, we believe that every product has a soul and high dedication behind its creation.`}</p>
                    <div className={styles.quoteSection}>{isIndo ? "Kepuasan pelanggan bukan sekadar tujuan, melainkan standar minimum bagi kebahagiaan kami." : "Customer satisfaction is not just a goal, but the minimum standard for our happiness."}</div>
                    <p className={styles.storyContent}>{tenant?.theme?.aboutStory || t.story_desc}</p>
                </div>
            </div>

            <div className={styles.valuesHeader}>
                <h2>{isIndo ? 'Nilai-Nilai Kami' : 'Our Values'}</h2>
                <p>{isIndo ? 'Pilar yang menjaga kualitas layanan kami.' : 'The pillars that maintain our service quality.'}</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.valueCard}>
                    <div className={styles.iconBox}><Target size={28} /></div>
                    <h3>{isIndo ? 'Kualitas Prima' : 'Top Quality'}</h3>
                    <p>{isIndo ? 'Setiap produk dijamin menggunakan bahan terbaik.' : 'Every product is guaranteed to use the best ingredients.'}</p>
                </div>
                <div className={styles.valueCard}>
                    <div className={styles.iconBox}><Users size={28} /></div>
                    <h3>{isIndo ? 'Pelayanan Ramah' : 'Friendly Service'}</h3>
                    <p>{isIndo ? 'Kami melayani Anda dengan sepenuh hati.' : 'We serve you with all our heart.'}</p>
                </div>
                <div className={styles.valueCard}>
                    <div className={styles.iconBox}><Award size={28} /></div>
                    <h3>{isIndo ? 'Integritas' : 'Integrity'}</h3>
                    <p>{isIndo ? 'Kejujuran dalam setiap transaksi.' : 'Honesty in every transaction.'}</p>
                </div>
            </div>

            <section className={styles.cta}>
                <div className={styles.ctaBlob} />
                <h2>{isIndo ? 'Siap Mencoba Kelezatan Kami?' : 'Ready to Try Our Delights?'}</h2>
                <p>{isIndo ? 'Dapatkan produk favorit Anda hari ini.' : 'Get your favorite products today.'}</p>
                <Link href={`${tenantPath}/products`} className={styles.btn}>
                    {isIndo ? 'Lihat Menu' : 'View Menu'} <ArrowRight size={20} />
                </Link>
            </section>
        </div>
    )
}

import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'
import { getDictionary } from '@/i18n'

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
                    {t.title.replace('{name}', '')}
                </span>
                <h1 style={{ 
                    fontSize: '3rem', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    margin: 0,
                    lineHeight: 1.2
                }}>
                    {t.mission} {dict.locale === 'id' ? 'di' : 'at'} {tenant?.name || 'Bitespace'}
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
                            {dict.locale === 'id' 
                                ? `Selamat datang di ${tenant.name}. Di sini, kami percaya bahwa setiap produk memiliki cerita unik untuk diceritakan.`
                                : `Welcome to ${tenant.name}. Here, we believe that every product has a unique story to tell.`
                            }
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            {t.story_desc}
                        </p>
                        <div style={{ 
                            padding: '2rem', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            margin: '2rem 0',
                            borderLeft: `6px solid ${tenant.theme.primary || '#4F46E5'}`
                        }}>
                            {dict.locale === 'id'
                                ? "Kepuasan pelanggan bukan sekadar tujuan, melainkan standar minimum bagi kebahagiaan kami."
                                : "Customer satisfaction is not just a goal, but the minimum standard for our happiness."
                            }
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '2rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 500 }}>
                            <strong>Bitespace</strong> {dict.locale === 'id' ? 'adalah platform SaaS multi-fungsi yang lahir untuk memberdayakan UMKM dan Merchant di seluruh Indonesia.' : 'is a multi-functional SaaS platform born to empower SMEs and Merchants across Indonesia.'}
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            {t.mission_desc}
                        </p>
                        <div style={{ 
                            padding: '2rem', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            margin: '2rem 0',
                            borderLeft: '6px solid #4F46E5'
                        }}>
                            {dict.locale === 'id'
                                ? "Kami percaya bahwa teknologi terbaik adalah teknologi yang mendemokrasikan peluang bagi siapa saja untuk sukses di pasar digital."
                                : "We believe the best technology is that which democratizes opportunities for anyone to succeed in the digital marketplace."
                            }
                        </div>
                    </div>
                )}
                
                <p style={{ marginTop: '2.5rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                    {dict.locale === 'id' ? 'Terima kasih telah menjadi bagian dari perjalanan kami.' : 'Thank you for being part of our journey.'}
                </p>
            </div>
        </div>
    )
}

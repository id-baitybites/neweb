import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { getCurrentUser } from '@/actions/auth'
import { getDictionary } from '@/i18n'
import pkg from '../../package.json'
import Link from 'next/link'
import { ArrowRight, Search, ShieldCheck, Store, Zap, Smartphone, Globe, Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Testimonies from '@/components/Testimonies'
import styles from '@/styles/modules/Landing.module.scss'
import homeStyles from '@/styles/modules/Home.module.scss'

export default async function Home() {
  const tenant = await resolveTenant()
  const user = await getCurrentUser()
  const dict = await getDictionary()

  if (tenant) {
    // Get top 4 products (favorite products)
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { stock: 'desc' }, // Dummy logic for "favorite"
      take: 4
    })

    // Get approved testimonies
    const testimonies = await prisma.testimony.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })

    return (
      <div style={{ backgroundColor: '#F8F9FA' }}>
        {/* HERO SECTION */}
        <section 
          className={`${styles.hero} ${tenant.theme.heroBgUrl ? styles.hasCustomBg : ''}`} 
          style={tenant.theme.heroBgUrl ? { '--hero-bg': `url(${tenant.theme.heroBgUrl})` } as React.CSSProperties : undefined}
        >
          <div className="container" style={{ position: 'relative', zIndex: 1, textShadow: tenant.theme.heroBgUrl ? '0 2px 10px rgba(0,0,0,0.5)' : undefined, color: tenant.theme.heroBgUrl ? 'white' : undefined }}>
            <div className={styles.chip} style={tenant.theme.heroBgUrl ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' } : undefined}>
              <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
              {dict.tenant.hero_chip.replace('{name}', tenant.name)}
            </div>

            <h1 style={tenant.theme.heroBgUrl ? { color: 'white' } : undefined}>{tenant.theme.heroTitle || dict.tenant.hero_title}</h1>

            <p style={tenant.theme.heroBgUrl ? { color: 'rgba(255,255,255,0.9)' } : undefined}>
              {tenant.theme.heroDesc || dict.tenant.hero_desc.replace('{name}', tenant.name)}
            </p>

            <div className={styles.actions} style={{ justifyContent: 'center' }}>
              <Link href="/products" className={styles.btnSolid}>
                {dict.tenant.btn_order} <ArrowRight size={18} />
              </Link>
              {!user && (
                <Link href="/login" className={styles.btnOutline}>
                  {dict.tenant.btn_start} <Search size={18} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* FAVORITE PRODUCTS */}
        <section className={styles.section}>
          <div className="container" style={{ maxWidth: '1440px' }}>
            <div className={styles.header}>
              <h2>{dict.tenant.top_selections}</h2>
              <p>{dict.tenant.top_selections_desc}</p>
            </div>

            <div className={homeStyles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#A0AEC0' }}>
                <p style={{ marginBottom: '1rem' }}>{dict.tenant.no_products}</p>
              </div>
            )}
          </div>
        </section>

        {/* TESTIMONIES */}
        <section className={`${styles.section} ${styles.alt}`}>
          <div className="container">
            <Testimonies
              tenantId={tenant.id}
              userRole={user?.role}
              testimonies={testimonies}
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer} style={{ borderTop: `4px solid ${tenant.theme.primary}22` }}>
          <div className={styles.container}>
            <div className={styles.brand}>
              <h3 style={{ color: tenant.theme.primary }}>{tenant.name}</h3>
              <p>{tenant.theme.heroDesc || dict.tenant.footer_welcome.replace('{name}', tenant.name)}</p>
              
              {(tenant.theme.socialLinks?.instagram || tenant.theme.socialLinks?.whatsapp || tenant.theme.socialLinks?.tiktok) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  {tenant.theme.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${tenant.theme.socialLinks.instagram}`} target="_blank" style={{ color: '#E1306C' }}><Instagram size={20} /></a>
                  )}
                  {tenant.theme.socialLinks?.whatsapp && (
                    <a href={`https://wa.me/${tenant.theme.socialLinks.whatsapp}`} target="_blank" style={{ color: '#25D366' }}><MessageCircle size={20} /></a>
                  )}
                  {tenant.theme.socialLinks?.facebook && (
                    <a href={`https://facebook.com/${tenant.theme.socialLinks.facebook}`} target="_blank" style={{ color: '#1877F2' }}><Facebook size={20} /></a>
                  )}
                </div>
              )}
            </div>

            <div className={styles.links}>
              <h4>{dict.tenant.company}</h4>
              <ul>
                <li><Link href="/about">{dict.tenant.about_us}</Link></li>
                <li><Link href="/products">{dict.tenant.products}</Link></li>
              </ul>
            </div>

            <div className={styles.links}>
              <h4>{dict.tenant.contact}</h4>
              <ul style={{ color: '#718096', fontSize: '0.9rem' }}>
                {tenant.theme.contact?.email && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Mail size={14} /> {tenant.theme.contact.email}
                  </li>
                )}
                {tenant.theme.contact?.phone && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Phone size={14} /> {tenant.theme.contact.phone}
                  </li>
                )}
                {tenant.theme.contact?.address && (
                  <li style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <MapPin size={14} style={{ marginTop: '0.2rem', flexShrink: 0 }} /> {tenant.theme.contact.address}
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.links}>
              <h4>{dict.tenant.support}</h4>
              <ul>
                <li><a href="#">{dict.tenant.help_center}</a></li>
                <li><a href="#">{dict.tenant.contact_support}</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.bottom}>
            &copy; {new Date().getFullYear()} {tenant.name}. {dict.tenant.all_rights_reserved} 
            <div style={{ opacity: 0.3, fontSize: '0.7rem', marginTop: '0.5rem' }}>Powered by Bitespace v{pkg.version}</div>
          </div>
        </footer>
      </div>
    )
  }

  // PLATFORM LANDING PAGE (NO TENANT)
  const allTenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return (
    <div style={{ backgroundColor: '#F8F9FA' }}>
      <section className={styles.hero} style={{
        paddingBottom: '4rem',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.chip} style={{ border: '1px solid rgba(79, 70, 229, 0.2)', background: 'rgba(79, 70, 229, 0.05)' }}>
            <Globe size={16} style={{ marginRight: '0.5rem', color: '#4F46E5' }} />
            <span style={{ color: '#4F46E5', fontWeight: 600 }}>{dict.platform.hero_chip}</span>
          </div>

          <h1 style={{ color: '#0F172A', fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            {dict.platform.hero_title}
          </h1>

          <p style={{ color: '#334155', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            {dict.platform.hero_desc}
          </p>

          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <Link href="/super-admin" className={styles.btnSolid} style={{ background: '#0F172A', borderColor: '#0F172A', color: 'white' }}>
              {dict.platform.btn_launch} <ArrowRight size={18} />
            </Link>
            <Link href="#features" className={styles.btnOutline} style={{ color: '#0F172A', borderColor: '#CBD5E1', background: 'white' }}>
              {dict.platform.btn_explore}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className={styles.section} style={{ background: 'white' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className={styles.header}>
            <h2>{dict.platform.features_title}</h2>
            <p>{dict.platform.features_desc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#EEF2FF', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#4F46E5' }}>
                <Store size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>{dict.platform.feat1_title}</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>{dict.platform.feat1_desc}</p>
            </div>

            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#F0FDF4', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#16A34A' }}>
                <Zap size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>{dict.platform.feat2_title}</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>{dict.platform.feat2_desc}</p>
            </div>

            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#FFF1F2', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#E11D48' }}>
                <Smartphone size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>{dict.platform.feat3_title}</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>{dict.platform.feat3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE TENANTS SECTION */}
      <section id="merchants" className={styles.section} style={{ background: '#F8F9FA' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className={styles.header}>
            <h2>{dict.platform.merchants_title}</h2>
            <p>{dict.platform.merchants_desc}</p>
          </div>

          {allTenants.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {allTenants.map((t) => (
                <Link
                  key={t.id}
                  href={t.domain ? `https://${t.domain}` : `/${t.slug}`}
                  className={styles.merchantCard}
                >
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: (t.theme as any)?.primary || '#4F46E5', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'
                  }}>
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '0.5rem' }}>{t.name}</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{t.domain || `${t.slug}.bitespace.netlify.app`}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#A0AEC0', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <p style={{ marginBottom: '1rem' }}>{dict.platform.no_merchants}</p>
              <Link href="/super-admin" style={{ color: '#4F46E5', fontWeight: '600' }}>{dict.platform.btn_create_first}</Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer} style={{ background: '#0A0F1E', padding: '4rem 2rem 2rem' }}>
        <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div className={styles.brand} style={{ maxWidth: '300px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Bitespace</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
              {dict.platform.footer_desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4rem' }}>
            <div className={styles.links}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'white' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.8rem' }}><Link href="/super-admin" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{dict.platform.super_admin}</Link></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#features" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{dict.platform.btn_explore}</a></li>
              </ul>
            </div>

            <div className={styles.links}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'white' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.8rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Terms of Service</a></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom} style={{ textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', marginTop: '2rem', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Bitespace Platform. All rights reserved. <span style={{ opacity: 0.5 }}>v{pkg.version}</span>
        </div>
      </footer>
    </div>
  )
}

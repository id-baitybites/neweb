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
  // Determine current locale from i18n cookie
  const locale = dict.locale

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

            <h1 style={tenant.theme.heroBgUrl ? { color: 'white' } : undefined}>
              {locale === 'en'
                ? (tenant.theme.heroTitle_en || tenant.theme.heroTitle || dict.tenant.hero_title)
                : (tenant.theme.heroTitle || dict.tenant.hero_title)}
            </h1>

            <p style={tenant.theme.heroBgUrl ? { color: 'rgba(255,255,255,0.9)' } : undefined}>
              {locale === 'en'
                ? (tenant.theme.heroDesc_en || tenant.theme.heroDesc || dict.tenant.hero_desc.replace('{name}', tenant.name))
                : (tenant.theme.heroDesc || dict.tenant.hero_desc.replace('{name}', tenant.name))}
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
    take: 12
  })

  return (
    <div className={styles.platformWrap}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className={styles.platformHero}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />

        <div className={styles.platformHeroInner}>
          <div className={styles.platformBadge}>
            <span className={styles.dot} />
            {dict.platform.hero_chip}
          </div>

          <h1 className={styles.platformTitle}>
            {dict.platform.hero_title_pre}{' '}
            <span className={styles.gradient}>
              {dict.platform.hero_title_highlight}
            </span>
          </h1>

          <p className={styles.platformDesc}>{dict.platform.hero_desc}</p>

          <div className={styles.platformActions}>
            <Link href="/onboarding" className={styles.btnPrimary}>
              {dict.platform.btn_launch} <ArrowRight size={18} />
            </Link>
            <Link href="#features" className={styles.btnSecondary}>
              {dict.platform.btn_explore}
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{allTenants.length}+</div>
              <div className={styles.statLabel}>Active Stores</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNum}>99%</div>
              <div className={styles.statLabel}>Uptime SLA</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNum}>4</div>
              <div className={styles.statLabel}>Subscription Plans</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className={styles.platformSection}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p className={styles.sectionLabel}>Platform Features</p>
          <h2 className={styles.sectionTitle}>{dict.platform.features_title}</h2>
          <p className={styles.sectionDesc}>{dict.platform.features_desc}</p>

          <div className={styles.featuresGrid}>
            {[
              {
                icon: <Store size={26} />,
                iconBg: 'rgba(99,102,241,0.15)',
                iconColor: '#818cf8',
                title: dict.platform.feat1_title,
                desc: dict.platform.feat1_desc,
              },
              {
                icon: <Zap size={26} />,
                iconBg: 'rgba(20,184,166,0.15)',
                iconColor: '#2dd4bf',
                title: dict.platform.feat2_title,
                desc: dict.platform.feat2_desc,
              },
              {
                icon: <Smartphone size={26} />,
                iconBg: 'rgba(251,113,133,0.15)',
                iconColor: '#fb7185',
                title: dict.platform.feat3_title,
                desc: dict.platform.feat3_desc,
              },
              {
                icon: <Globe size={26} />,
                iconBg: 'rgba(251,191,36,0.15)',
                iconColor: '#fbbf24',
                title: (dict.platform as any).feat4_title || 'Custom Domain & Branding',
                desc: (dict.platform as any).feat4_desc || 'Each tenant gets a unique domain, color palette, custom fonts, and logo — full white-label control.',
              },
              {
                icon: <ShieldCheck size={26} />,
                iconBg: 'rgba(52,211,153,0.15)',
                iconColor: '#34d399',
                title: (dict.platform as any).feat5_title || 'Secure & Isolated',
                desc: (dict.platform as any).feat5_desc || 'Every merchant\'s data is fully isolated. JWT authentication, encrypted passwords, and role-based access control baked in.',
              },
              {
                icon: <ArrowRight size={26} />,
                iconBg: 'rgba(168,85,247,0.15)',
                iconColor: '#c084fc',
                title: (dict.platform as any).feat6_title || 'One-Click Onboarding',
                desc: (dict.platform as any).feat6_desc || 'Merchants can sign up, choose a plan, and launch their storefront in under 3 minutes.',
              },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: f.iconBg, color: f.iconColor }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MERCHANTS ────────────────────────────────────── */}
      <section id="merchants" className={`${styles.platformSection} ${styles.altBg}`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p className={styles.sectionLabel}>Live on Platform</p>
          <h2 className={styles.sectionTitle}>{dict.platform.merchants_title}</h2>
          <p className={styles.sectionDesc}>{dict.platform.merchants_desc}</p>

          {allTenants.length > 0 ? (
            <div className={styles.merchantGrid}>
              {allTenants.map((t) => (
                <Link
                  key={t.id}
                  href={t.domain ? `https://${t.domain}` : `/${t.slug}`}
                  className={styles.merchantCard}
                >
                  <div
                    className={styles.merchantAvatar}
                    style={{ background: `linear-gradient(135deg, ${(t.theme as any)?.primary || '#6366f1'}, ${(t.theme as any)?.accent || '#8b5cf6'})` }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <h3>{t.name}</h3>
                  <p>{t.domain || `/${t.slug}`}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              <p style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>{dict.platform.no_merchants}</p>
              <Link href="/onboarding" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>{dict.platform.btn_create_first}</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className={styles.platformFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logo}>Bitespace</span>
            <p>{dict.platform.footer_desc}</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.col}>
              <h5>Platform</h5>
              <ul>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/onboarding">Get Started</Link></li>
                <li><Link href="/super-admin">{dict.platform.super_admin}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h5>Legal</h5>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} Bitespace Platform. All rights reserved.</span>
          <div className={styles.poweredBy}>
            Built on <span>Next.js</span> · v{pkg.version}
          </div>
        </div>
      </footer>
    </div>
  )
}



import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { getCurrentUser } from '@/actions/auth'
import { getDictionary } from '@/i18n'
import pkg from '../../package.json'
import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowRight, Search, ShieldCheck, Store, Zap, Smartphone, Globe, Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Testimonies from '@/components/Testimonies'
import styles from '@/styles/modules/Landing.module.scss'
import homeStyles from '@/styles/modules/Home.module.scss'
import HeroParallax from '@/components/brand/HeroParallax'

export default async function Home() {
  const tenant = await resolveTenant()
  const user = await getCurrentUser()
  const dict = await getDictionary()
  const locale = dict.locale

  if (tenant) {
    // Determine slug-aware path prefix for tenant links.
    // On a custom domain, bare paths work (domain identifies tenant).
    // On a shared domain (e.g. localhost, bitespace.netlify.app), we must
    // prefix every internal link with /{slug} so the middleware can set
    // the x-tenant-slug header and resolveTenant() works on linked pages.
    const headersList = await headers()
    const host = (headersList.get('x-forwarded-host') || headersList.get('host') || '').split(':')[0]
    const isOnCustomDomain = !!(tenant.domain && host === tenant.domain)
    const tp = isOnCustomDomain ? '' : `/${tenant.slug}` // tenantPath prefix
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { stock: 'desc' },
      take: 4,
      include: { category: true }
    })

    const testimonies = await prisma.testimony.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })

    const dynamicStyles = {
        '--primary-color': tenant.theme.primary,
        '--primary-22': `${tenant.theme.primary}22`
    } as React.CSSProperties

    return (
      <div className={styles.tenantWrapper} style={dynamicStyles}>
        {/* HERO SECTION */}
        <HeroParallax bgUrl={tenant.theme.heroBgUrl}>
          <div className={`${styles.heroInner} container ${tenant.theme.heroBgUrl ? styles.darkText : ''}`}>
            <div className={`${styles.chip} ${tenant.theme.heroBgUrl ? styles.customBg : ''}`}>
              <ShieldCheck size={16} />
              {dict.tenant.hero_chip.replace('{name}', tenant.name)}
            </div>

            <h1>
              {locale === 'en'
                ? (tenant.theme.heroTitle_en || tenant.theme.heroTitle || dict.tenant.hero_title)
                : (tenant.theme.heroTitle || dict.tenant.hero_title)}
            </h1>

            <p>
              {locale === 'en'
                ? (tenant.theme.heroDesc_en || tenant.theme.heroDesc || dict.tenant.hero_desc.replace('{name}', tenant.name))
                : (tenant.theme.heroDesc || dict.tenant.hero_desc.replace('{name}', tenant.name))}
            </p>

            <div className={styles.actions}>
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
        </HeroParallax>

        {/* FAVORITE PRODUCTS */}
        <section className={styles.section}>
          <div className="container" style={{ maxWidth: '1440px' }}>
            <div className={styles.header}>
              <h2>{dict.tenant.top_selections}</h2>
              <p>{dict.tenant.top_selections_desc}</p>
            </div>

            <div className={homeStyles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} dict={dict} tenant={tenant} />
              ))}
            </div>

            {products.length === 0 && (
              <div className={styles.noProducts}>
                <p>{dict.tenant.no_products}</p>
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
        <footer className={styles.footer} style={{ borderTop: `4px solid var(--primary-22)` }}>
          <div className={styles.container}>
            <div className={styles.brand}>
              <h3 style={{ color: 'var(--primary-color)' }}>{tenant.name}</h3>
              <p>{tenant.theme.heroDesc || dict.tenant.footer_welcome.replace('{name}', tenant.name)}</p>
              
              {(tenant.theme.socialLinks?.instagram || tenant.theme.socialLinks?.whatsapp || tenant.theme.socialLinks?.tiktok) && (
                <div className={styles.socialIcons}>
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
                <li><Link href={`${tp}/about`}>{dict.tenant.about_us}</Link></li>
                <li><Link href={`${tp}/products`}>{dict.tenant.products}</Link></li>
              </ul>
            </div>

            <div className={styles.links}>
              <h4>{dict.tenant.contact}</h4>
              <ul className={styles.contactList}>
                {tenant.theme.contact?.email && (
                  <li>
                    <Mail size={14} /> {tenant.theme.contact.email}
                  </li>
                )}
                {tenant.theme.contact?.phone && (
                  <li>
                    <Phone size={14} /> {tenant.theme.contact.phone}
                  </li>
                )}
                {tenant.theme.contact?.address && (
                  <li className={styles.address}>
                    <MapPin size={14} /> {tenant.theme.contact.address}
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.links}>
              <h4>{dict.tenant.support}</h4>
              <ul>
                <li><Link href={`${tp}/terms`}>{dict.tenant.tos}</Link></li>
                <li><Link href={`${tp}/privacy`}>{dict.tenant.privacy}</Link></li>
                <li><Link href={`${tp}/help`}>{dict.tenant.help_center}</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.bottom}>
            &copy; {new Date().getFullYear()} {tenant.name}. {dict.tenant.all_rights_reserved} 
            <div className={styles.poweredBy}>Powered by Bitespace v{pkg.version}</div>
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
      {/* HERO */}
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

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{allTenants.length}+</div>
              <div className={styles.statLabel}>{dict.platform.stats_active}</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNum}>99%</div>
              <div className={styles.statLabel}>{dict.platform.stats_uptime}</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNum}>4</div>
              <div className={styles.statLabel}>{dict.platform.stats_plans}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.platformSection}>
        <div className="container">
          <p className={styles.sectionLabel}>{dict.platform.label_features}</p>
          <h2 className={styles.sectionTitle}>{dict.platform.features_title}</h2>
          <p className={styles.sectionDesc}>{dict.platform.features_desc}</p>

          <div className={styles.featuresGrid}>
            {[
              { icon: <Store size={26} />, iconBg: 'rgba(99,102,241,0.15)', iconColor: '#818cf8', title: dict.platform.feat1_title, desc: dict.platform.feat1_desc },
              { icon: <Zap size={26} />, iconBg: 'rgba(20,184,166,0.15)', iconColor: '#2dd4bf', title: dict.platform.feat2_title, desc: dict.platform.feat2_desc },
              { icon: <Smartphone size={26} />, iconBg: 'rgba(251,113,133,0.15)', iconColor: '#fb7185', title: dict.platform.feat3_title, desc: dict.platform.feat3_desc },
              { icon: <Globe size={26} />, iconBg: 'rgba(251,191,36,0.15)', iconColor: '#fbbf24', title: dict.platform.feat4_title, desc: dict.platform.feat4_desc },
              { icon: <ShieldCheck size={26} />, iconBg: 'rgba(52,211,153,0.15)', iconColor: '#34d399', title: dict.platform.feat5_title, desc: dict.platform.feat5_desc },
              { icon: <ArrowRight size={26} />, iconBg: 'rgba(168,85,247,0.15)', iconColor: '#c084fc', title: dict.platform.feat6_title, desc: dict.platform.feat6_desc },
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

      {/* MERCHANTS */}
      <section id="merchants" className={`${styles.platformSection} ${styles.altBg}`}>
        <div className="container">
          <p className={styles.sectionLabel}>{dict.platform.label_merchants}</p>
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
            <div className={styles.noProducts}>
              <p>{dict.platform.no_merchants}</p>
              <Link href="/onboarding" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>{dict.platform.btn_create_first}</Link>
            </div>
          )}
        </div>
      </section>

      {/* PLATFORM FOOTER */}
      <footer className={styles.platformFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logo}>Bitespace</span>
            <p>{dict.platform.footer_desc}</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.col}>
              <h5>{dict.platform.footer.platform}</h5>
              <ul>
                <li><Link href="/pricing">{dict.platform.footer.pricing}</Link></li>
                <li><Link href="/onboarding">{dict.platform.footer.get_started}</Link></li>
                <li><Link href="/super-admin">{dict.platform.super_admin}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h5>{dict.platform.footer.legal}</h5>
              <ul>
                <li><Link href="/terms">{dict.platform.footer.tos}</Link></li>
                <li><Link href="/privacy">{dict.platform.footer.privacy}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} Bitespace Platform. {dict.platform.footer.all_rights}</span>
          <div className={styles.poweredBy}>
            Built on <span>Next.js</span> · v{pkg.version}
          </div>
        </div>
      </footer>
    </div>
  )
}

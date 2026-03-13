import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { getCurrentUser } from '@/actions/auth'
import Link from 'next/link'
import { ArrowRight, Search, ShieldCheck, Store, Zap, Smartphone, Globe } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Testimonies from '@/components/Testimonies'
import styles from '@/styles/modules/Landing.module.scss'
import homeStyles from '@/styles/modules/Home.module.scss'

export default async function Home() {
  const tenant = await resolveTenant()
  const user = await getCurrentUser()

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
        <section className={styles.hero}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className={styles.chip}>
              <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
              {`Kelezatan Premium dari ${tenant.name}`}
            </div>

            <h1>{`Kue Pilihan Terbaik, Diantar ke Pintu Anda.`}</h1>

            <p>
              {`Nikmati berbagai pilihan kue dan hidangan manis berkualitas premium yang dibuat dengan bahan-bahan terbaik dari ${tenant.name}.`}
            </p>

            <div className={styles.actions} style={{ justifyContent: 'center' }}>
              <Link href="/products" className={styles.btnSolid}>
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              {!user && (
                <Link href="/login" className={styles.btnOutline}>
                  Mulai <Search size={18} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* FAVORITE PRODUCTS */}
        <section className={styles.section}>
          <div className="container" style={{ maxWidth: '1440px' }}>
            <div className={styles.header}>
              <h2>Top Selections</h2>
              <p>Produk pilihan kami yang paling direkomendasikan untuk Anda.</p>
            </div>

            <div className={homeStyles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#A0AEC0' }}>
                <p style={{ marginBottom: '1rem' }}>Belum ada produk unggulan yang tersedia.</p>
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
        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.brand}>
              <h3>{tenant.name}</h3>
              <p>{`Selamat datang di ${tenant.name}, kami siap melayani pesanan Anda setiap saat.`}</p>
            </div>

            <div className={styles.links}>
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/products">Products</Link></li>
                <li><Link href="/#testimonies">Reviews</Link></li>
              </ul>
            </div>

            <div className={styles.links}>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>

            <div className={styles.links}>
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Support</a></li>
                <li><a href="#">Guide</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.bottom}>
            &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
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
      {/* HERO SECTION */}
      <section className={styles.hero} style={{ background: '#0A0F1E', paddingBottom: '4rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.chip} style={{ border: '1px solid rgba(89, 107, 255, 0.4)', background: 'rgba(89, 107, 255, 0.1)' }}>
            <Globe size={16} style={{ marginRight: '0.5rem', color: '#88a0ff' }} />
            <span style={{ color: '#88a0ff' }}>Bitespace Multitenant Platform</span>
          </div>

          <h1 style={{ background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Empower Your Business with Bitespace.
          </h1>

          <p>
            The all-in-one scalable, professional e-commerce platform for bakeries, restaurants, and modern businesses. Manage multiple stores seamlessly from a single dashboard.
          </p>

          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <Link href="/super-admin" className={styles.btnSolid} style={{ background: '#4F46E5', borderColor: '#4F46E5' }}>
              Launch Your Store <ArrowRight size={18} />
            </Link>
            <Link href="#features" className={styles.btnOutline}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className={styles.section} style={{ background: 'white' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className={styles.header}>
            <h2>Why Choose Bitespace?</h2>
            <p>Everything you need to run, scale, and manage your online business effortlessly.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#EEF2FF', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#4F46E5' }}>
                <Store size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>Multi-Tenant Architecture</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Host hundreds of independent stores on a single platform. Each tenant gets their own subdomain, themes, and fully isolated data.</p>
            </div>
            
            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#F0FDF4', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#16A34A' }}>
                <Zap size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>Lightning Fast Performance</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Built on Next.js 15+ and optimized for speed. Ensure your customers enjoy a frictionless shopping experience that boosts conversions.</p>
            </div>

            <div style={{ padding: '2rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#FFF1F2', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#E11D48' }}>
                <Smartphone size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1E293B' }}>Mobile-First & Responsive</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>A beautiful UI designed to work perfectly across all devices, from desktop browsers to native mobile experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE TENANTS SECTION */}
      <section className={styles.section} style={{ background: '#F8F9FA' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className={styles.header}>
            <h2>Discover Our Merchants</h2>
            <p>Explore some of the amazing businesses powered by the Bitespace platform.</p>
          </div>

          {allTenants.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {allTenants.map((t) => (
                <Link 
                  key={t.id} 
                  href={`https://${t.domain || `${t.slug}.bitespace.netlify.app`}`} 
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
              <p style={{ marginBottom: '1rem' }}>No active merchants found on the platform yet.</p>
              <Link href="/super-admin" style={{ color: '#4F46E5', fontWeight: '600' }}>Be the first to create a store! &rarr;</Link>
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
              The premier platform for multitenant e-commerce and store management.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4rem' }}>
            <div className={styles.links}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'white' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.8rem' }}><Link href="/super-admin" style={{ color: 'rgba(255,255,255,0.6)', textDecoration:'none' }}>Super Admin</Link></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#features" style={{ color: 'rgba(255,255,255,0.6)', textDecoration:'none' }}>Features</a></li>
              </ul>
            </div>
            
            <div className={styles.links}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'white' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.8rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration:'none' }}>Terms of Service</a></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration:'none' }}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom} style={{ textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', marginTop: '2rem', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Bitespace Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
